var mongoose = require('mongoose');
var nms_db = require('../bin/mongo').nms_db;
var config = require('../config/config');

var server_schema = new mongoose.Schema({
    ip:{type: String},
    server:{
        system:{type: String},
        arch:{type: String},
        cpus:{type: Array},
        cpu_usage:{type: Number},
        mem_total:{type: Number},
        mem_used:{type: Number},
        hostname:{type: String},
        loadavg:{type: Array},
        networkInterfaces:{type: Object},
        uptime:{type: Number},
        node_version:{type: String}
    },
    list:{type:Array},
    message:{type:Array},
    timestamp:{type: Number, default:0}
});

server_schema.index({ip:1});

var server_model = nms_db.model(config.mongo.server.table_name, server_schema, config.mongo.server.table_name);

exports.server_find = async () => {
    var query = await server_model.find().exec().catch((error) => {
        return {error: error};
    });
    return query;
};

exports.server_insert = async (item) => {
    var ip = {'ip':item.ip};
    var update = {
        $set:{
            server:item.server,
            list:item.list,
            timestamp:item.timestamp
        }
    };
    var result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(!result.n){
        create = {
            'ip':item.ip || '',
            server:item.server,
            list:item.list,
            timestamp:item.timestamp
        };
        result = await server_model.create(create).catch((error) => {
            return {error:error};
        });
    }
    // console.log(result);
    return {result:result};
};

exports.server_push_message = async (ip, pmid, message) => {
    var ip = {'ip':ip};
    var update = {
        $push:{
            message:{pmid:pmid, message:message}
        }
    };
    var result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(result.n){
        return{result:result};
    }else{
        return{error:'Do not update anyone!'};
    }
};

exports.server_pop_message = async (ip) => {
    var ip = {'ip':ip};
    var result = await server_model.findOne(ip).exec().catch((error) => {
        return {error:error};
    });
    if(result){
        var message = {};
        if(result.message.length > 0){
            for(var i in result.message){
                message[result.message[i].pmid] = result.message[i].message;
            }
            var update = {
                $set:{
                    message:[]
                }
            };
            result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
                return {error:error};
            });
            if(result.error){
                return {error:error};
            }else{
                return {result:0, message:message};
            }
        }else{
            return {result:-1};
        }
        
    }else{
        return {error:'Can not find device by this ip: ' + ip.ip};
    }    
};