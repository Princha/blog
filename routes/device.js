var express = require('express');

var settings = require('../config/settings');
var config = require('../config/config');

var monitor_db = require('../model/monitor');
var setting_db = require('../model/setting');
var server_db = require('../model/server');
var module_db = require('../model/module');
var product_db = require('../model/product');

// var mcuHostControl = require('../middleware/mcu_host_control');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (req.power.read) res.render('device.html');
  else res.redirect(config.account.url);
});

router.get('/monitor', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    var params = {};
    params.search = req.query.search || {};
    params.page_num = req.query.page_num || 1;
    params.page_size = req.query.page_size || 20;
    params.sort_by = req.query.sort_by || "timestamp";
    if(req.query.sort && req.query.sort == 'asc')params.sort = 1;
    else params.sort = -1;
    var result = await monitor_db.monitor_find_page(params.search, params.page_num, params.page_size, params.sort_by, params.sort);
    if(result.error){
      response.result = -1;
    }else{
      response.result = 0;
      response.page = parseInt(req.query.page_num);
      response.rows = result.data;
      response.total = result.length;
      response.timestamp = Date.now();
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.post('/settregister_confirming', async (req, res, next) => {
  var response = {};
  if (req.power.read) {    
    if (req.power.write) {
      if(req.body.id){
        response.result = 0;

      } else {
        response.result = -1;
      }
    } else {
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.get('/chart_data', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    var search = {};
    if(req.query.id){
      search.id = req.query.id;
      search.name = 'cpu_usage';
    }
    var cpu_usage_result = await influxdb.stream_find_page(search, 1, 1000, 'time', -1, '1h');
    // var cpu_usage_result = await mongodb.stream_find_count(search, 50);
    if(req.query.id)search.name = 'mem_used';
    var mem_used_result = await influxdb.stream_find_page(search, 1, 1000, 'time', -1, '1h');
    // var mem_used_result = await mongodb.stream_find_count(search, 50);
    if(req.query.id)search.sname = 'mem_total';
    var mem_total_result = await influxdb.stream_find_page(search, 1, 1000, 'time', -1, '1h');
    // var mem_total_result = await mongodb.stream_find_count(search, 1);
    if(cpu_usage_result.error || mem_used_result.error || mem_used_result.error){
      response.result = -1;
    }else{
      response.result = 0;
      response.cpu_list = [];
      response.mem_list = [];
      response.mem_total = 0;
      
      // for(var i in mem_total_result.data){
        response.mem_total = mem_total_result.data[0].value;
      // }
      for(var i in cpu_usage_result.data){
        response.cpu_list.push(cpu_usage_result.data[i].value);  
        response.mem_list.push(mem_used_result.data[i].value);
        response.mem_list[i] = parseInt(response.mem_list[i] / response.mem_total * 100);
      }
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.get('/setting', async (req, res, next) => {
  var response = {};
  if (req.power.read) {    
    if (req.power.write) {
      var result = await setting_db.get_setting();
      if(result.error){
        response.result = -1;
        response.error = result.error;
      }else{
        response.result = 0;
        response.data = result.data;
        if(response.data._doc._id)delete response.data._doc._id;
      }
    } else {
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.post('/setting', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    if (req.power.write) {
      if (req.body.http_url && req.body.coap_url && req.body.register_interval
        && req.body.heartbeat_interval && req.body.datapush_interval) {
        req.body.last_modified = new Date().getTime();
        var result = await setting_db.set_setting(req.body);
        if(result.error){
          response.result = -1;
          response.error = result.error;
        }else{
          response.result = 0;
        }
      } else {
        response.result = -1;
        response.error = "Params Error";
      }
    } else {
      response.result = 1;
      response.error = "You do not have permission";
    }
  } else {
    response.result = 2;
    response.error = "You do not have permission";
  }
  res.json(response);
});

//获取控制列表
// router.get('/control', async (req, res, next) => {
//   var response = {};
//   if (req.power.read) {
//     if (req.power.write) {
//       // response.data = config.model;
//       var result = await module_db.get_module();
//       if(result.error){
//         response.result = -1;
//       }else{
//         response.result = 0;
//         response.data = result.data;
//       }
//     } else {
//       response.result = 1;
//     }
//   } else {
//     response.result = 2;
//   }
//   res.json(response);
// });

router.get('/control', async (req, res, next) => {
  var response = {};
  // if (req.power.read) {
  //   if (req.power.write) {
      if(req.query.page_num && req.query.page_size){
        var params = {};
        params.page_num = req.query.page_num || 1;
        params.page_size = req.query.page_size || 100;
        var result = await product_db.get_by_apge(params);
        if(result.error){
          response.result = -1;
        }else{  
          var data = result.data;
          for(var i in data){
            if(data[i]._doc._id)delete data[i]._doc._id;
          }
          response.result = 0;
          response.page = parseInt(req.query.page_num), 
          response.rows = data;
          response.total = result.length;
        }
      } else {
        response.result = -1;
        response.error = 'params error';
      }
      
  //   } else {
  //     response.result = 1;
  //   }
  // } else {
  //   response.result = 2;
  // }
  res.json(response);
});

//发送控制命令
router.post('/control', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    if (req.power.write) {
      if (req.body.name && req.body.message) {
        var message = {};
        // console.log(req.body.name,req.body.message) 
        if(req.body.name == "Intel" || req.body.name == "ubuntu" || req.body.name == 'CG-1000'){
          message.name = req.body.message;
          message.timestamp = new Date().getTime();
          var result = await monitor_db.monitor_push_message_by_model(req.body.name, message);
          if(result.error){
            response.result = -1;
          }else{
            response.result = 0;
          }
        }else if(req.body.name == "STM32" || req.body.name == "GW-2003" || req.body.name == "P4011-v1"){
          // await mcuHostControl.send_message(req.body.name);
          response.result = 0;
        }else{
          response.result = 0;
        }
      } else {
        response.result = -1;
      }
    } else {
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.post('/multiple_control', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    if (req.power.write) {
      if (req.body.list) {
        var list = []
        console.log(typeof(req.body.list));
        if(typeof(req.body.list) == 'string'){
          list.push(JSON.parse(req.body.list));
        }else{
          for(var i in req.body.list){
            list.push(JSON.parse(req.body.list[i]));
          }
        }
        var message = {};
        message.name = req.body.message;
        message.timestamp = new Date().getTime();
        for(var i in list){
          await monitor_db.monitor_push_message(list[i].id, message);
        }
        // console.log(list);
        // console.log(req.body.message);
        // var message = {};
        // message.name = req.body.message;
        // message.timestamp = new Date().getTime();
        // console.log(req.body.ip,req.body.message)
        // session.send_single_message(req.body.ip, message);
        // var result = await mongodb.monitor_push_message(req.body.id, message);
        // console.log(result);
        response.result = 0;
      } else {
        response.result = -1;
      }
    } else {
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.post('/single_control', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    if (req.power.write) {
      if (req.body.id && req.body.message) {
        var message = {};
        message.name = req.body.message;
        message.timestamp = new Date().getTime();
        // console.log(req.body.ip,req.body.message)
        // session.send_single_message(req.body.ip, message);
        var result = await monitor_db.monitor_push_message(req.body.id, message);
        // console.log(result);
        response.result = 0;
      } else {
        response.result = -1;
      }
    } else {
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.get('/statistics', async (req, res, next) => {
  var response = {};
  if(req.power.read){
      var result = await monitor_db.monitor_state_count();
      if(result.error || result.data.error){
          response.result = -1;
          response.data = result.error;
      }else{
          var total = 0;
          var online = 0;
          var timestamp = Date.now();
          for(var i in result.data){
              if(timestamp - result.data[i].timestamp < 10000){
                  online ++;
              }
              total ++;
          }
          response.result = 0;
          response.online = online;
          response.offline = total - online;
          response.total = total;
      }
  }else{
      response.result = 2;
  }
  res.json(response);
});

module.exports = router;