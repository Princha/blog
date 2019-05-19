var mongoose = require('mongoose');
var nms_db = require('../bin/mongo').nms_db;
var config = require('../config/config');

var setting_schema = new mongoose.Schema({
    http_url:{type: String}, 
    coap_url:{type: String}, 
    register_interval:{type: Number},
    heartbeat_interval:{type: Number},
    datapush_interval:{type: Number},
    last_modified:{type: Number}
});

var setting_model = nms_db.model(config.mongo.setting.table_name, setting_schema, config.mongo.setting.table_name);

exports.get_setting = async () => {
    var result = await setting_model.findOne({}).exec().catch((error) => {
        return {error:error};
    });
    if(result == null){
        return {error:'can not find setting data in setting table'};
    }
    return {data:result};
}

exports.set_setting = async (setting) => {
    var result = await setting_model.update({},{$set:setting}).exec().catch((error) => {
            return {error:error};
        });
    return {result:result};
}