var mongoose = require('mongoose');
var nms_db = require('../bin/mongo').nms_db;
var config = require('../config/config');

var stream_schema = new mongoose.Schema({
    id:{type: String},
    name:{type: String},
    value:{type: Number},
    at:{type: Number}
});

stream_schema.index({id : 1});
stream_schema.index({name : 1});
stream_schema.index({at : 1});

var stream_model = nms_db.model(config.mongo.stream.table_name, stream_schema, config.mongo.stream.table_name);

exports.stream_insert = async (stream) => {
    // var stream_entity = new monitor_model(stream);
    var result = await stream_model.create(stream).catch((error) => {
        return {error:error};
    });
    return {result:result};
};

exports.stream_find_count = async (search, counts) => {
    if(search.id)search.id = search.id;
    if(search.name)search.name = search.name;
    var query = await stream_model.find(search).sort('-at').limit(counts).exec().catch((error) => {
        return {error:error};
    });
    // console.log('srteam find', query);
    return {data:query};
};

exports.stream_find_page = async (search, page_num, page_size, sort_by, sort, mode) => {
    if(sort >= 0)sort = 1;
    else sort = -1;
    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    // if(search.id)search.id = {$regex: search.id, $options:'i'};
    // if(search.name)search.name = {$regex: search.name, $options:'i'};
    if(search.id)search.id = search.id;
    if(search.name)search.name = search.name;
    if(mode == '1h'){
        search.at = { $gte: (new Date().getTime() - 3600000) };
        var query = await stream_model.find(search).sort({[sort_by]: sort}).skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
            return {error: error};
        });
        var count = await stream_model.find(search).count().exec().catch((error) => {
            return {error: error};
        });
        return {data:query, length:count};
    }else{
        var period = 0;
        if(mode == '6h'){
            search.at = { $gte: (new Date().getTime() - 21600000) };
            period = 60000;
        }else if(mode == '1d'){
            search.at = { $gte: (new Date().getTime() - 86400000) };
            period = 180000;
        }
        else if(mode == '7d'){
            search.at = { $gte: (new Date().getTime() - 604800000) };
            period = 1260000;
        }
        
        var promise = await stream_model
            .aggregate()
            .match(search)
            .project({
                id: 1,
                name: 1,
                value: 1,
                at: 1,
                interval: { $trunc: { $divide: ['$at', period] } }
            })
            .sort({ interval: -1 })
            .group({
                _id: '$interval',
                id: {
                    $first: '$id'
                },
                name: {
                    $first: '$name'
                },
                at: {
                    $first: '$at'
                },
                data: {
                    $push: '$value'
                }
            })
            .project({
                // data: 1,
                id: 1,
                name: 1,
                at: 1,
                avg:{$avg: "$data"}
            })
            .sort({ at: -1 })
            .facet({
                count:[{$count:'total'}],
                result:[
                    {$skip:page_size * (page_num - 1)},
                    {$limit:page_size}
                ]
            })
            // .skip(page_size * (page_num - 1))
            // .limit(page_size)
            .exec()
            .catch((error) => {
                return {result: -1, error: error};
            });
        // console.log(promise);
        return {result: 0, data: promise[0].result, aggregate:true, length:promise[0].count[0].total};
    }
};

exports.stream_aggregate = async (params) => {
    var match = {};
    var group = {};
    if(params.id && params.id.length > 0)match.id = params.id;
    if(params.name && params.name.length > 0)match.name = params.name;
    if(!params.skip)params.skip = 0;
    if(!params.limit)params.limit = 9999999999999;
    if(!params.start_time)params.start_time = 0;
    if(!params.stop_time)params.stop_time = 9999999999999;
    match.at = { $gte: params.start_time, $lte: params.stop_time };
    if(params.mode){
        if(!params.name || params.name.length <= 0)return{result: -1, error: 'aggregate operation must need params name'};
        if(!params.period || isNaN(parseInt(params.period)))return{result:-1, error: 'aggregate operation must need params period'};
        params.period = params.period * 1000;//ms translate to s
        // group._id = params.name;
        var calculate = {};
        switch (params.mode) {
            case 'max':
                // group['max'] = { $max:('$value') };
                // calculate.data = 1;
                calculate['max'] = {
                    $max: "$data"
                };
                break;
            case 'min':
                // group['min'] = { $min:('$value') };
                // calculate.data = 1;
                calculate['min'] = {
                    $min: "$data"
                };
                break;
            case 'avg':
                // group['avg'] = { $avg:('$value') };
                // calculate.data = 1;
                calculate['avg'] = {
                    $avg: "$data"
                };
                break;
            default:
                return {result: -1, error: 'unknow aggregate operation mode'};
                break;
        }
        var promise = await stream_model
            .aggregate()
            .match(match)
            .project({
                id: 1,
                name: 1,
                value: 1,
                at: 1,
                interval: { $trunc: { $divide: ['$at', params.period] } }
            })
            .sort({ interval: -1 })
            .group({
                _id: '$interval',
                data: {
                    $push: '$value'
                }
            })
            .project(calculate)
            .skip(params.skip)
            .limit(params.limit)
            .exec()
            .catch((error) => {
                return {result: -1, error: error};
            });
        // console.log(promise);
        return {result: 0, data: promise, aggregate:true};
    }else{
        var promise = await stream_model
            .aggregate([
                {$match:match},
            ])
            .skip(params.skip)
            .limit(params.limit)
            .exec()
            .catch((error) => {
                return {result: -1, error: error};
            });
        // console.log(promise);
        return {result: 0, data: promise, aggregate:false};
    }
};