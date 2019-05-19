var mongoose = require('mongoose');
var niot_db = require('../bin/mongo').niot_db;
var config = require('../config/config');

var product_schema = new mongoose.Schema({
    id: { type: String },
    key: { type: String },
    name: { type: String },
    desc: { type: String },
    model: { type: String},
    setting: {type: Object},
    control: {type: Object}
});

var product_model = niot_db.model(config.mongo.product.table_name, product_schema, config.mongo.product.table_name);

exports.get = async () => {
    var result = await product_model.find().exec().catch((error) => {
        return {error: error};
    });
    return {data:result};
};

exports.get_by_apge = async (params) => {
    page_num = parseInt(params.page_num);
    page_size = parseInt(params.page_size);
    var result = await product_model.find().skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
        return {error: error};
    });
    var count = await product_model.find().count().exec().catch((error) => {
        return {error: error};
    });
    return {data:result, length:count};
};

exports.set_control_by_model = async (model, control) => {
    var model = {'model':model};
    var set = {}
    for(var i in control){
        set['control.' + i] = control[i];
    }
    var update = {
        $set:set
    };
    console.log(update);
    var result = await product_model.update(model, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    console.log(result);
    if(!result.n){
        return {result:false};
    }else{
        return {result:true};
    }
}

exports.set_setting_by_model = async (model, setting) => {
    var model = {'model':model};
    var set = {}
    for(var i in setting){
        set['setting.' + i] = setting[i];
    }
    var update = {
        $set:set
    };
    var result = await product_model.update(model, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    console.log(result);
    if(!result.n){
        return {result:false};
    }else{
        return {result:true};
    }
}

exports.set_control = async (id, control) => {
    var id = {'id':id};
    var update = {
        $set:{
            control:control
        }
    };
    var result = await product_model.update(id, update, {multi:true}).exec().catch((error) => {
        return {error:error};
    });
    console.log(result);
    if(!result.n){
        return {result:false};
    }else{
        return {result:true};
    }
}