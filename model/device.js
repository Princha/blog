var mongoose = require('mongoose');
var niot_db = require('../bin/mongo').niot_db;
var config = require('../config/config');

var device_schema = new mongoose.Schema({
    id: { type: String },
    key: { type: String },
    name: { type: String },
    ip: { type: String },
    desc: { type: String }
});

var device_model = niot_db.model(config.mongo.device.table_name, device_schema, config.mongo.device.table_name);

exports.device_register_check = async (id) => {
    var reg = new RegExp(id, 'i');
    var result = await device_model.findOne({ id: reg }).exec().catch((error) => {
        return {error: error};
    });
    return {data:result};
};