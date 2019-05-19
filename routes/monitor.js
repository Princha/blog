var express = require('express');
var config = require('../config/settings');

var monitor_db = require('../model/monitor');
var server_db = require('../model/server');
var stream_mongo_db = require('../model/stream_mongo');
var stream_influx_db = require('../model/stream_influx');
var router = express.Router();

var config_timestamp = 0;
var reboot_timestamp = 0;
var update_timestamp = 0;

router.get('/message', function (req, res, next) {
  if (req.power.read) {
    var response = {};
    var message = {};
    if (req.power.write) {
      if (req.query.name) {
        message.name = req.query.name;
        message.timestamp = new Date().getTime();
        if (req.query.name == 'reboot') {
          reboot_timestamp = message.timestamp;
        }
        else if (req.query.name == 'update') {
          update_timestamp = message.timestamp;
        }
        else {

        }
        response.result = 0;
        res.json(response);
      }
      else {
        response.result = -1;
        res.json(response);
      }
    }
    else {
      response.result = 1;
      res.json(response);
    }
  }
  else {
    res.redirect('/login');
  }
});

router.post('/push', async (req, res, next) => {
  var response = {};
  if (req.body.mac) {
    var params = {};
    params.id = req.body.mac;
    params.ipaddress = req._remoteAddress.substring(req._remoteAddress.lastIndexOf(':') + 1, req._remoteAddress.length) || "";
    params.port = req.socket.remotePort;
    params.target = req.body.target || "";
    params.version = req.body.version || "";
    params.mem_total = req.body.mem_total || 0;
    params.mem_used = req.body.mem_used || 0;
    params.cpu_usage = req.body.cpu_usage || 0;
    params.uptime = req.body.uptime || 0;
    params.net_type = req.body.net_type || 0;
    params.net_tx = req.body.net_tx || 0;
    params.net_rx = req.body.net_rx || 0;
    params.restart = true;
    params.timestamp = Date.now();

    await monitor_db.monitor_insert(params);

    await stream_mongo_db.stream_insert({id:params.id, name:"mem_total", value:params.mem_total, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"mem_used", value:params.mem_used, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"cpu_usage", value:params.cpu_usage, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"uptime", value:params.uptime, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"net_type", value:params.net_type, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"net_tx", value:params.net_tx, at:params.timestamp});
    await stream_mongo_db.stream_insert({id:params.id, name:"net_rx", value:params.net_rx, at:params.timestamp});

    var stream = [];
    stream.push({tags:{id:params.id,name:"mem_total"},fields:{value:params.mem_total}});
    stream.push({tags:{id:params.id,name:"mem_used"},fields:{value:params.mem_used}});
    stream.push({tags:{id:params.id,name:"cpu_usage"},fields:{value:params.cpu_usage}});
    stream.push({tags:{id:params.id,name:"uptime"},fields:{value:params.uptime}});
    stream.push({tags:{id:params.id,name:"net_tx"},fields:{value:params.net_tx}});
    stream.push({tags:{id:params.id,name:"net_rx"},fields:{value:params.net_rx}});
    await stream_influx_db.stream_insert(stream);

    var updatetimestart = 3;
    var updatetimeend = 4;

    if(config.get_settings(params.target)){
      config_timestamp = config.get_settings(params.target).config_timestamp || 0;
      if (req.body.config_timestamp != config_timestamp) {
        response.config = config.get_settings(params.target);
        response.config.config_timestamp = config_timestamp;
      }

      var result = await monitor_db.monitor_pop_message(req._remoteAddress.substring(req._remoteAddress.lastIndexOf(':') + 1, req._remoteAddress.length) || "");
      if(result.error){
        response.result = "success";
      }else{
        if(result.message)response.message = result.message;
        response.result = "success";
      }
    }else{
      response.result = "failure";
      response.reason = "unknow target";
    }
  }
  else {
    response.result = "failure";
    response.reason = "parameter mac error";
  }
  res.json(response);
});

router.post('/serinfo', async (req, res, next) => {
  var response = {};
  var item = {};

  item.timestamp = new Date().getTime();

  var cpu_idle_time = 0;
  var cpu_total_time = 0;
  for(var i in req.body.server.cpus){
      cpu_total_time = cpu_total_time + (req.body.server.cpus[i].times.user || 0);
      cpu_total_time = cpu_total_time + (req.body.server.cpus[i].times.nice || 0);
      cpu_total_time = cpu_total_time + (req.body.server.cpus[i].times.sys || 0);
      cpu_total_time = cpu_total_time + (req.body.server.cpus[i].times.idle || 0);
      cpu_total_time = cpu_total_time + (req.body.server.cpus[i].times.irq || 0);
      cpu_idle_time = cpu_idle_time + (req.body.server.cpus[i].times.idle || 0);
  }
  var cpu_used_time = cpu_total_time - cpu_idle_time;
  
  item.ip = req.ip;
  item.server = {};
  item.server.system = req.body.server.type || '';
  item.server.arch = req.body.server.arch || '';
  item.server.cpus = req.body.server.cpus || '';
  item.server.cpu_usage = parseInt((cpu_used_time / cpu_total_time) * 100);
  item.server.mem_total = req.body.server.totalmem || 0;
  item.server.mem_used = (req.body.server.totalmem || 0) - (req.body.server.freemem || 0);
  item.server.hostname = req.body.server.hostname || '';
  item.server.loadavg = req.body.server.loadavg || [];
  item.server.networkInterfaces = req.body.server.networkInterfaces || {};
  item.server.uptime = req.body.server.uptime || 0;
  item.server.node_version = req.body.server.node_version || '';

  item.list = [];
  for (var m in req.body.list) {
      item.list[m] = {};
      item.list[m].pid = req.body.list[m].pid || 0;
      item.list[m].name = req.body.list[m].name || '0';
      item.list[m].path = req.body.list[m].path || '0';
      item.list[m].uptime = req.body.list[m].uptime || '0';
      item.list[m].create = req.body.list[m].create || '0';
      item.list[m].timestamp = req.body.list[m].timestamp || '0';
      item.list[m].status = req.body.list[m].status || '0';
      item.list[m].pmid = req.body.list[m].pmid || 0;
      item.list[m].restart = req.body.list[m].restart || 0;
      item.list[m].memory = req.body.list[m].memory || 0;
      item.list[m].cpu = req.body.list[m].cpu || 0;
  }
  var result = await server_db.server_insert(item);
  if(result.error){
    response.result = -1;
  }else{
    result = await server_db.server_pop_message(item.ip);
    if(result.error){
      response.result = -1;
    }else{
        if(result.result == 0){
          response.message = result.message;
        }
        response.result = 0;
    }
  }
  res.json(response);
});

module.exports = router;