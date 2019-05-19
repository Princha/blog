var express = require('express');
var config = require('../config/config');

var monitor_db = require('../model/monitor');
var setting_db = require('../model/setting');
var mongodb = require('../bin/mongo');

var router = express.Router();

router.post('/', async (req, res, next) => {
    var response = {};
    if(req.body.id && req.body.if_modified_since){
        var id = req.body.id;
        var ip = req._remoteAddress.substring(req._remoteAddress.lastIndexOf(':') + 1, req._remoteAddress.length) || "";
        var result = await monitor_db.monitor_heartbeat(id);//findone by ip and update timestamp from table monitor
        if(result.error){
            response.result = -1;
            response.error = result.error;
        }else{
            if(result.data._doc.message){
                var message = await monitor_db.monitor_pop_message(id);//pop message from monitor table
                if(!message.error && message.message)response.actions = message.message;
            }
            //get last modified
            var setting = await setting_db.get_setting();
            if(setting.error){
                response.result = -1;
                response.error = "get setting fail";
            }else{
                response.result = 0;
                if(req.body.if_modified_since != setting.data._doc.last_modified){
                    response.config = setting.data._doc;
                    if(response.config._id)delete response.config._id;
                }
            }
        }
    }else{
        response.result = -1;
        response.error = "parameter error";
    }
    res.json(response);
});

module.exports = router;
