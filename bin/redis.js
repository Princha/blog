var redis = require('redis');
var config = require('../config/config');
var util = require('util');

var client = redis.createClient(config.redis.port, config.redis.ip);

exports.set = function(key, value, callback){
    key = key.toString();
    // value = value.toString();
    value = JSON.stringify(value);
    client.set(key, value, function (err, data) {
        if(err){
            callback(err, null);
        }else{
            callback(null, data);
        }
    });
};

exports.get = function(key, callback){
    key = key.toString();
    client.get(key, function (err, data) {
        if(err){
            callback(err, null);
        }else{
            callback(null, JSON.parse(data));
        }
    });
};

exports.mget = function(key, callback){
    client.mget(key, function(err, data){
        if(err){
            callback(err, null);
        }else{
            callback(null, data);
        }
    })
}

exports.keys = function(key, callback){
    // key = key.toString();
    client.keys(key, function(err, data){
        if(err){
            callback(err, null);
        }else{
            callback(null, data);
        }
    });
};