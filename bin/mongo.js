var mongoose = require('mongoose');
var config = require('../config/config');

mongoose.Promise = global.Promise;
var niot_db = mongoose.createConnection(config.mongo.device.url);
var nms_db = mongoose.createConnection(config.mongo.stream.url);

niot_db.on('error', function (error) {
    console.error('mongoose create niot_db connection error', error);
});

niot_db.on('open', function () {
    console.log('mongoose create niot_db connection success');
});

nms_db.on('error', function (error) {
    console.error('mongoose create nms_db connection error', error);
});

nms_db.on('open', function () {
    console.log('mongoose create nms_db connection success');
});

exports.niot_db = niot_db;
exports.nms_db = nms_db;

// var device_schema = new mongoose.Schema({
//     id: { type: String },
//     key: { type: String },
//     name: { type: String },
//     ip: { type: String },
//     desc: { type: String }
// });

// var monitor_schema = new mongoose.Schema({
//     id:{type: String},
//     ipaddress:{type: String},
//     port:{type: Number, default:0},
//     target:{type: String, default:""},
//     model:{type: String},
//     version:{type: String},
//     mem_total:{type: Number, default:0},
//     mem_used:{type: Number, default:0},
//     cpu_usage:{type: Number, default:0},
//     uptime:{type: Number, default:0},
//     net_type:{type: Number, default:0},
//     net_tx:{type: Number, default:0},
//     net_rx:{type: Number, default:0},
//     timestamp:{type: Number, default:0},
//     message:{type: Object}
// });

// var server_schema = new mongoose.Schema({
//     ip:{type: String},
//     server:{
//         system:{type: String},
//         arch:{type: String},
//         cpus:{type: Array},
//         cpu_usage:{type: Number},
//         mem_total:{type: Number},
//         mem_used:{type: Number},
//         hostname:{type: String},
//         loadavg:{type: Array},
//         networkInterfaces:{type: Object},
//         uptime:{type: Number},
//         node_version:{type: String}
//     },
//     list:{type:Array},
//     message:{type:Array},
//     timestamp:{type: Number, default:0}
// });

// var stream_schema = new mongoose.Schema({
//     id:{type: String},
//     name:{type: String},
//     value:{type: Number},
//     at:{type: Number}
// });

// var module_schema = new mongoose.Schema({
//     name:{type: String}, 
//     version:{type: String}, 
//     firmware_size:{type: Number},
//     upload_time:{type: Number},
//     link:{type: String}, 
//     protocol:{type: String}
// });

// var setting_schema = new mongoose.Schema({
//     http_url:{type: String}, 
//     coap_url:{type: String}, 
//     register_interval:{type: Number},
//     heartbeat_interval:{type: Number},
//     datapush_interval:{type: Number},
//     last_modified:{type: Number}
// });

// stream_schema.index({id : 1});
// stream_schema.index({name : 1});
// stream_schema.index({at : 1});

// monitor_schema.index({id:1});
// monitor_schema.index({ipaddress:1});
// monitor_schema.index({port:1});
// monitor_schema.index({target:1});
// monitor_schema.index({version:1});
// monitor_schema.index({mem_total:1});
// monitor_schema.index({mem_used:1});
// monitor_schema.index({cpu_usage:1});
// monitor_schema.index({uptime:1});
// monitor_schema.index({net_type:1});
// monitor_schema.index({net_tx:1});
// monitor_schema.index({net_rx:1});
// monitor_schema.index({timestamp:1});

// server_schema.index({ip:1});

// var device_model = niot_db.model(config.mongo.device.table_name, device_schema, config.mongo.device.table_name);
// var monitor_model = niot_db.model(config.mongo.monitor.table_name, monitor_schema, config.mongo.monitor.table_name);
// var server_model = nms_db.model(config.mongo.server.table_name, server_schema, config.mongo.server.table_name);
// var stream_model = nms_db.model(config.mongo.stream.table_name, stream_schema, config.mongo.stream.table_name);
// var module_model = nms_db.model(config.mongo.module.table_name, module_schema, config.mongo.module.table_name);
// var setting_model = nms_db.model(config.mongo.setting.table_name, setting_schema, config.mongo.setting.table_name);

// // var stream_mem_model = mem_db.model(config.mongo.mem.table_name, stream_schema, config.mongo.mem.table_name);

// exports.device_register_check = async (id) => {
//     var result = await device_model.findOne({ id: id }).exec().catch((error) => {
//         return {error: error};
//     });
//     return {data:result};
// };

// exports.get_setting = async () => {
//     var result = await setting_model.findOne({}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result == null){
//         return {error:'can not find setting data in setting table'};
//     }
//     return {data:result};
// }

// exports.set_setting = async (setting) => {
//     var result = await setting_model.update({},{$set:setting}).exec().catch((error) => {
//             return {error:error};
//         });
//     return {result:result};
// }

// exports.get_module = async () => {
//     var result = await module_model.find({}).exec().catch((error) => {
//         return {error:error};
//     });
//     return {data:result};
// };

// exports.getone_module = async (name) => {
//     var result = await module_model.findOne({'name':name}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result == null){
//         return {error:'Do not have this model in database'};
//     }
//     return {data:result};
// };

// exports.set_module = async (modules) => {
//     var result = await module_model.update(
//         {
//             'name':modules.name
//         },
//         {
//             $set:{
//                 'version':modules.version,
//                 'firmware_size':modules.firmware_size,
//                 'upload_time':modules.upload_time,
//                 'link':modules.link
//             }
//         }).exec().catch((error) => {
//             return {error:error};
//         });
//     return {result:result};
// };

// exports.monitor_state_count = async (counts) => {
//     var query = await monitor_model.find().exec().catch((error) => {
//         return {error:error};
//     });
//     // console.log('srteam find', query);
//     return {data:query};
// };

// exports.monitor_find_page = async (search_text, page_num, page_size, sort_by, sort) => {
//     var search = {};
//     if(typeof(search_text) == 'string'){
//         search.$or = [];
//         search.$or.push({"id":{$regex: search_text, $options:'i'}});
//         search.$or.push({"ipaddress":{$regex: search_text, $options:'i'}});
//         search.$or.push({"target":{$regex: search_text, $options:'i'}});
//         search.$or.push({"version":{$regex: search_text, $options:'i'}});
//     }
//     page_num = parseInt(page_num);
//     page_size = parseInt(page_size);
//     var query = await monitor_model.find(search).sort({[sort_by]: sort}).skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
//         return {error: error};
//     });
//     var count = await monitor_model.find(search).count().exec().catch((error) => {
//         return {error: error};
//     });
//     // console.log(query);
//     return {data:query, length:count};
// };

// exports.monitor_find_target_list = async (target) => {
//     var result = await monitor_model.find({'target':target}).exec().catch((error) => {
//         return {error:error};
//     });
//     return {data:result};
// }

// exports.monitor_findone_by_id = async (id) => {
//     var result = await monitor_model.findOne({ id: id }).exec().catch((error) => {
//         return {error: error};
//     });
//     return {data:result};
// }

// exports.monitor_findone_by_ip = async (ipaddress) => {
//     var result = await monitor_model.findOne({ ipaddress: ipaddress }).exec().catch((error) => {
//         return {error: error};
//     });
//     return {data:result};
// }

// exports.monitor_heartbeat = async (ip) => {
//     var ipaddress = {'ipaddress':ip};
//     var update = {
//         $set:{
//             'timestamp':Date.now()
//         }
//     }
//     var result = await monitor_model.findOneAndUpdate(ipaddress, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result == null){
//         return {error:'This device is not register'};
//     }
//     return {data:result};
// }

// exports.monitor_insert = async (item) => {
//     var id = {'id':item.id};
//     var params = {};
//     if(item.ipaddress)params.ipaddress = item.ipaddress;
//     if(item.port)params.port = item.port;
//     if(item.target)params.target = item.target;
//     if(item.model)params.model = item.model;
//     if(item.version)params.version = item.version;
//     if(item.mem_total)params.mem_total = parseInt(item.mem_total);
//     if(item.mem_used)params.mem_used = parseInt(item.mem_used);
//     if(item.cpu_usage)params.cpu_usage = parseInt(item.cpu_usage);
//     if(item.uptime)params.uptime = parseInt(item.uptime);
//     if(item.net_type)params.net_type = parseInt(item.net_type);
//     if(item.net_tx)params.net_tx = parseInt(item.net_tx);
//     if(item.net_rx)params.net_rx = parseInt(item.net_rx);
//     if(item.timestamp)params.timestamp = parseInt(item.timestamp);
//     var update = {
//         $set:params
//     };
//     var result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(!result.n){
//         // var item = params;
//         params.id = item.id;
//         result = await monitor_model.create(params).catch((error) => {
//             return {error:error};
//         });
//     }
//     // console.log(result);
//     return {result:result};
// };

// exports.monitor_ping = async (ip) => {
//     var ip = {'ipaddress':ip};
//     var update = {
//         $set:{
//             timestamp:Date.now()
//         }
//     };
//     var result = await monitor_model.update(ip, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     console.log(result);
//     if(!result.n){
//         return {result:false};
//     }else{
//         return {result:true};
//     }
// }

// exports.monitor_push_message = async (id, message) => {
//     // var ip = {'ipaddress':ip};
//     var id = {'id':id};
//     var update = {
//         $set:{
//             'message':message
//         }
//     };
//     var result = await monitor_model.update(id, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result.n){
//         return{result:result};
//     }else{
//         return{error:'Do not update anyone!'};
//     }
// };

// exports.monitor_push_message_by_model = async (message) => {
//     var update = {
//         $set:{
//             'message':message
//         }
//     };
//     var result = await monitor_model.update({}, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result.n){
//         return{result:result};
//     }else{
//         return{error:'Do not update anyone!'};
//     }
// };

// exports.monitor_pop_message = async (ip) => {
//     // var result = {};
//     var message = {};
//     var ip = {'ipaddress':ip};
//     var result = await monitor_model.findOne(ip).exec().catch((error) => {
//         return {error:error};
//     }); 
//     if(result && result.message){
//         message = result.message
//         var update = {
//                 $set:{
//                     message:undefined
//                 }
//             };
//         result = await monitor_model.update(ip, update, {multi:true}).exec().catch((error) => {
//             return {error:error};
//         });
//         if(result.error){
//             return {message:undefined};
//         }else{
//             return {message:message};
//         } 
//     }else{
//         return {message:undefined};
//     }
// };

// exports.server_find = async () => {
//     var query = await server_model.find().exec().catch((error) => {
//         return {error: error};
//     });
//     return query;
// };

// exports.server_insert = async (item) => {
//     var ip = {'ip':item.ip};
//     var update = {
//         $set:{
//             server:item.server,
//             list:item.list,
//             timestamp:item.timestamp
//         }
//     };
//     var result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(!result.n){
//         create = {
//             'ip':item.ip || '',
//             server:item.server,
//             list:item.list,
//             timestamp:item.timestamp
//         };
//         result = await server_model.create(create).catch((error) => {
//             return {error:error};
//         });
//     }
//     // console.log(result);
//     return {result:result};
// };

// exports.server_push_message = async (ip, pmid, message) => {
//     var ip = {'ip':ip};
//     var update = {
//         $push:{
//             message:{pmid:pmid, message:message}
//         }
//     };
//     var result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result.n){
//         return{result:result};
//     }else{
//         return{error:'Do not update anyone!'};
//     }
// };

// exports.server_pop_message = async (ip) => {
//     var ip = {'ip':ip};
//     var result = await server_model.findOne(ip).exec().catch((error) => {
//         return {error:error};
//     });
//     if(result){
//         var message = {};
//         if(result.message.length > 0){
//             for(var i in result.message){
//                 message[result.message[i].pmid] = result.message[i].message;
//             }
//             var update = {
//                 $set:{
//                     message:[]
//                 }
//             };
//             result = await server_model.update(ip, update, {multi:true}).exec().catch((error) => {
//                 return {error:error};
//             });
//             if(result.error){
//                 return {error:error};
//             }else{
//                 return {result:0, message:message};
//             }
//         }else{
//             return {result:-1};
//         }
        
//     }else{
//         return {error:'Can not find device by this ip: ' + ip.ip};
//     }    
// };

// exports.stream_insert = async (stream) => {
//     // var stream_entity = new monitor_model(stream);
//     var result = await stream_model.create(stream).catch((error) => {
//         return {error:error};
//     });
//     return {result:result};
// };

// exports.stream_find_count = async (search, counts) => {
//     if(search.id)search.id = search.id;
//     if(search.name)search.name = search.name;
//     var query = await stream_model.find(search).sort('-at').limit(counts).exec().catch((error) => {
//         return {error:error};
//     });
//     // console.log('srteam find', query);
//     return {data:query};
// };

// exports.stream_find_page = async (search, page_num, page_size, sort_by, sort, mode) => {
//     if(sort >= 0)sort = 1;
//     else sort = -1;
//     page_num = parseInt(page_num);
//     page_size = parseInt(page_size);
//     // if(search.id)search.id = {$regex: search.id, $options:'i'};
//     // if(search.name)search.name = {$regex: search.name, $options:'i'};
//     if(search.id)search.id = search.id;
//     if(search.name)search.name = search.name;
//     if(mode == '1h'){
//         search.at = { $gte: (new Date().getTime() - 3600000) };
//         var query = await stream_model.find(search).sort({[sort_by]: sort}).skip(page_size * (page_num - 1)).limit(page_size).exec().catch((error) => {
//             return {error: error};
//         });
//         var count = await stream_model.find(search).count().exec().catch((error) => {
//             return {error: error};
//         });
//         return {data:query, length:count};
//     }else{
//         var period = 0;
//         if(mode == '6h'){
//             search.at = { $gte: (new Date().getTime() - 21600000) };
//             period = 60000;
//         }else if(mode == '1d'){
//             search.at = { $gte: (new Date().getTime() - 86400000) };
//             period = 180000;
//         }
//         else if(mode == '7d'){
//             search.at = { $gte: (new Date().getTime() - 604800000) };
//             period = 1260000;
//         }
        
//         var promise = await stream_model
//             .aggregate()
//             .match(search)
//             .project({
//                 id: 1,
//                 name: 1,
//                 value: 1,
//                 at: 1,
//                 interval: { $trunc: { $divide: ['$at', period] } }
//             })
//             .sort({ interval: -1 })
//             .group({
//                 _id: '$interval',
//                 id: {
//                     $first: '$id'
//                 },
//                 name: {
//                     $first: '$name'
//                 },
//                 at: {
//                     $first: '$at'
//                 },
//                 data: {
//                     $push: '$value'
//                 }
//             })
//             .project({
//                 // data: 1,
//                 id: 1,
//                 name: 1,
//                 at: 1,
//                 avg:{$avg: "$data"}
//             })
//             .sort({ at: -1 })
//             .facet({
//                 count:[{$count:'total'}],
//                 result:[
//                     {$skip:page_size * (page_num - 1)},
//                     {$limit:page_size}
//                 ]
//             })
//             // .skip(page_size * (page_num - 1))
//             // .limit(page_size)
//             .exec()
//             .catch((error) => {
//                 return {result: -1, error: error};
//             });
//         // console.log(promise);
//         return {result: 0, data: promise[0].result, aggregate:true, length:promise[0].count[0].total};
//     }
// };

// exports.stream_aggregate = async (params) => {
//     var match = {};
//     var group = {};
//     if(params.id && params.id.length > 0)match.id = params.id;
//     if(params.name && params.name.length > 0)match.name = params.name;
//     if(!params.skip)params.skip = 0;
//     if(!params.limit)params.limit = 9999999999999;
//     if(!params.start_time)params.start_time = 0;
//     if(!params.stop_time)params.stop_time = 9999999999999;
//     match.at = { $gte: params.start_time, $lte: params.stop_time };
//     if(params.mode){
//         if(!params.name || params.name.length <= 0)return{result: -1, error: 'aggregate operation must need params name'};
//         if(!params.period || isNaN(parseInt(params.period)))return{result:-1, error: 'aggregate operation must need params period'};
//         params.period = params.period * 1000;//ms translate to s
//         // group._id = params.name;
//         var calculate = {};
//         switch (params.mode) {
//             case 'max':
//                 // group['max'] = { $max:('$value') };
//                 // calculate.data = 1;
//                 calculate['max'] = {
//                     $max: "$data"
//                 };
//                 break;
//             case 'min':
//                 // group['min'] = { $min:('$value') };
//                 // calculate.data = 1;
//                 calculate['min'] = {
//                     $min: "$data"
//                 };
//                 break;
//             case 'avg':
//                 // group['avg'] = { $avg:('$value') };
//                 // calculate.data = 1;
//                 calculate['avg'] = {
//                     $avg: "$data"
//                 };
//                 break;
//             default:
//                 return {result: -1, error: 'unknow aggregate operation mode'};
//                 break;
//         }
//         var promise = await stream_model
//             .aggregate()
//             .match(match)
//             .project({
//                 id: 1,
//                 name: 1,
//                 value: 1,
//                 at: 1,
//                 interval: { $trunc: { $divide: ['$at', params.period] } }
//             })
//             .sort({ interval: -1 })
//             .group({
//                 _id: '$interval',
//                 data: {
//                     $push: '$value'
//                 }
//             })
//             .project(calculate)
//             .skip(params.skip)
//             .limit(params.limit)
//             .exec()
//             .catch((error) => {
//                 return {result: -1, error: error};
//             });
//         // console.log(promise);
//         return {result: 0, data: promise, aggregate:true};
//     }else{
//         var promise = await stream_model
//             .aggregate([
//                 {$match:match},
//             ])
//             .skip(params.skip)
//             .limit(params.limit)
//             .exec()
//             .catch((error) => {
//                 return {result: -1, error: error};
//             });
//         // console.log(promise);
//         return {result: 0, data: promise, aggregate:false};
//     }
// };
