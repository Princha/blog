var express = require('express');
var config = require('../config/config');

var monitor_db = require('../model/monitor');
var setting_db = require('../model/setting');
var device_db = require('../model/device');
var module_db = require('../model/module');

var router = express.Router();

router.post('/', async (req, res, next) => {
  var response = {};
  if(req.body.mac && req.body.target && req.body.version && req.body.model){
    var params = {};
    params.id = req.body.mac.toLowerCase();
    params.target = req.body.target;
    params.version = req.body.version;
    params.model = req.body.model;
    params.ipaddress = req._remoteAddress.substring(req._remoteAddress.lastIndexOf(':') + 1, req._remoteAddress.length) || "";

    var result = await device_db.device_register_check(params.id);
    if(result.error){
      response.result = -1;
      response.error = "database find error";
    }else{
      if(result.data == null){
        response.result = 1;
        response.error = "This device have not register";
      }else{
        console.log(result);
        response.key = result.data.key;
        // if(result.data.key == params.key){
          var modules = await module_db.get_module();
          if(modules.error){
            response.result = -1;
            response.error = "database get target error";
          }else{
            // console.log(result);
            response.result = -1;
            response.error = "Can not find this target";
            for(var i in modules.data){
              if(modules.data[i].name == params.target){
                if(response.error)delete response.error;
                await monitor_db.monitor_insert(params);
                var setting = await setting_db.get_setting();
                if(setting.error){
                  response.result = -1;
                  response.error = "get setting fail";
                }else{
                  response.result = 0;
                  response.config = modules.data[i]._doc.config;
                  response.config = Object.assign(response.config, setting.data._doc);
                  if(response.config._id)delete response.config._id;
                }
                // response.config = result.data[i]._doc.config;
              }
            }
          }
        // }else{
        //   response.result = 1;
        //   response.error = "This device have not register";
        // }
      }      
    }
  }
  else{
    response.result = -1;
    response.error = "parameter error";
  }
  res.json(response);
});

module.exports = router;
