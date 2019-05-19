var mongoose = require('mongoose');
var nms_db = require('../bin/mongo').nms_db;
var config = require('../config/config');

var module_schema = new mongoose.Schema({
    name:{type: String}, 
    version:{type: String}, 
    firmware_size:{type: Number},
    upload_time:{type: Number},
    link:{type: String}, 
    protocol:{type: String},
    config_timetamp:{type: Number}
});

var module_model = nms_db.model(config.mongo.module.table_name, module_schema, config.mongo.module.table_name);

exports.get_module = async () => {
    var result = await module_model.find({}).exec().catch((error) => {
        return {error:error};
    });
    return {data:result};
};

exports.getone_module = async (name) => {
    var result = await module_model.findOne({'name':name}).exec().catch((error) => {
        return {error:error};
    });
    if(result == null){
        return {error:'Do not have this model in database'};
    }
    return {data:result};
};

exports.set_module = async (modules) => {
    var result = await module_model.update(
        {
            'name':modules.name
        },
        {
            $set:{
                'version':modules.version,
                'firmware_size':modules.firmware_size,
                'upload_time':modules.upload_time,
                'link':modules.link
            }
        }).exec().catch((error) => {
            return {error:error};
        });
    return {result:result};
};