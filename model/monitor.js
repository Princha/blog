var mongoose = require('mongoose');
var niot_db = require('../bin/mongo').niot_db;
var config = require('../config/config');

var monitor_schema = new mongoose.Schema({
    id:{type: String},
    ipaddress:{type: String},
    port:{type: Number, default:0},
    target:{type: String, default:""},
    model:{type: String},
    version:{type: String},
    mem_total:{type: Number, default:0},
    mem_used:{type: Number, default:0},
    cpu_usage:{type: Number, default:0},
    uptime:{type: Number, default:0},
    net_type:{type: Number, default:0},
    net_tx:{type: Number, default:0},
    net_rx:{type: Number, default:0},
    timestamp:{type: Number, default:0},
    message:{type: Object}
});

monitor_schema.index({id:1});
monitor_schema.index({ipaddress:1});
monitor_schema.index({port:1});
monitor_schema.index({target:1});
monitor_schema.index({version:1});
monitor_schema.index({mem_total:1});
monitor_schema.index({mem_used:1});
monitor_schema.index({cpu_usage:1});
monitor_schema.index({uptime:1});
monitor_schema.index({net_type:1});
monitor_schema.index({net_tx:1});
monitor_schema.index({net_rx:1});
monitor_schema.index({timestamp:1});

var monitor_model = niot_db.model(config.mongo.monitor.table_name, monitor_schema, config.mongo.monitor.table_name);

exports.monitor_state_count = async (counts) => {
    var query = await monitor_model.find().exec().catch((error) => {
        return {error:error};
    });
    // console.log('srteam find', query);
    return {data:query};
};

exports.monitor_find_page = async (search_text, page_num, page_size, sort_by, sort) => {
    var search = {};
    if(typeof(search_text) == 'string'){
        search.$or = [];
        search.$or.push({"id":{$regex: search_text, $options:'i'}});
        search.$or.push({"ipaddress":{$regex: search_text, $options:'i'}});
        search.$or.push({"target":{$regex: search_text, $options:'i'}});
        search.$or.push({"version":{$regex: search_text, $options:'i'}});
    }
    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    var query = await monitor_model.find(search).sort({[sort_by]: sort}).skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
        return {error: error};
    });
    var count = await monitor_model.find(search).count().exec().catch((error) => {
        return {error: error};
    });
    // console.log(query);
    return {data:query, length:count};
};

exports.monitor_find_target_list = async (target) => {
    var result = await monitor_model.find({'target':target}).exec().catch((error) => {
        return {error:error};
    });
    return {data:result};
}

exports.monitor_findone_by_id = async (id) => {
    var result = await monitor_model.findOne({ id: id }).exec().catch((error) => {
        return {error: error};
    });
    return {data:result};
}

exports.monitor_findone_by_ip = async (ipaddress) => {
    var result = await monitor_model.findOne({ ipaddress: ipaddress }).exec().catch((error) => {
        return {error: error};
    });
    return {data:result};
}

exports.monitor_heartbeat = async (id) => {
    var id = {'id':id};
    var update = {
        $set:{
            'timestamp':Date.now()
        }
    }
    var result = await monitor_model.findOneAndUpdate(id, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(result == null){
        return {error:'This device is not register'};
    }
    return {data:result};
}

exports.monitor_insert = async (item) => {
    var id = {'id':item.id};
    var params = {};
    if(item.ipaddress)params.ipaddress = item.ipaddress;
    if(item.port)params.port = item.port;
    if(item.target)params.target = item.target;
    if(item.model)params.model = item.model;
    if(item.version)params.version = item.version;
    if(item.mem_total)params.mem_total = parseInt(item.mem_total);
    if(item.mem_used)params.mem_used = parseInt(item.mem_used);
    if(item.cpu_usage)params.cpu_usage = parseInt(item.cpu_usage);
    if(item.uptime)params.uptime = parseInt(item.uptime);
    if(item.net_type)params.net_type = parseInt(item.net_type);
    if(item.net_tx)params.net_tx = parseInt(item.net_tx);
    if(item.net_rx)params.net_rx = parseInt(item.net_rx);
    if(item.timestamp)params.timestamp = parseInt(item.timestamp);
    var update = {
        $set:params
    };
    var result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(!result.n){
        // var item = params;
        params.id = item.id;
        result = await monitor_model.create(params).catch((error) => {
            return {error:error};
        });
    }
    // console.log(result);
    return {result:result};
};

exports.monitor_ping = async (id) => {
    var id = {'id':id};
    var update = {
        $set:{
            timestamp:Date.now()
        }
    };
    var result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    console.log(result);
    if(!result.n){
        return {result:false};
    }else{
        return {result:true};
    }
}

exports.monitor_push_message = async (id, message) => {
    // var ip = {'ipaddress':ip};
    var id = {'id':id};
    var update = {
        $set:{
            'message':message
        }
    };
    var result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(result.n){
        return{result:result};
    }else{
        return{error:'Do not update anyone!'};
    }
};

exports.monitor_push_message_by_model = async (model, message) => {
    var model = {model: model};
    var update = {
        $set:{
            'message':message
        }
    };
    var result = await monitor_model.update(model, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    if(result.n){
        return{result:result};
    }else{
        return{error:'Do not update anyone!'};
    }
};

exports.monitor_pop_message = async (id) => {
    // var result = {};
    var message = {};
    // var ip = {'ipaddress':ip};
    var id = {'id':id};
    var result = await monitor_model.findOne(id).exec().catch((error) => {
        return {error:error};
    }); 
    if(result && result.message){
        message = result.message
        var update = {
                $set:{
                    message:undefined
                }
            };
        result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
            return {error:error};
        });
        if(result.error){
            return {message:undefined};
        }else{
            return {message:message};
        } 
    }else{
        return {message:undefined};
    }
};