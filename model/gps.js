var mongoose = require('mongoose');
var nms_db = require('../bin/mongo').nms_db;
var config = require('../config/config');

var stream_schema = new mongoose.Schema({
    id:{type: String},
    lat:{type: Number},
    lng:{type: Number},
    at:{type: Number}
});

stream_schema.index({id : 1});
stream_schema.index({lat : 1});
stream_schema.index({lng : 1});
stream_schema.index({at : 1});

var stream_model = nms_db.model(config.mongo.gps.table_name, stream_schema, config.mongo.gps.table_name);

exports.stream_find_page = async (search, page_num, page_size, sort_by, sort) => {
    if(sort >= 0)sort = 1;
    else sort = -1;
    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    var query = await stream_model.find(search).sort({[sort_by]: sort}).skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
        return {error: error};
    });
    var count = await stream_model.find(search).count().exec().catch((error) => {
        return {error: error};
    });
    return {data:query, length:count};
};