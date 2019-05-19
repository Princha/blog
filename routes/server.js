var express = require('express');
var config = require('../config/config');

var server_db = require('../model/server');

var router = express.Router();

router.get('/serlists', async (req, res, next) => {
  var response = {};
  if (req.power.read) {
    response.list = await server_db.server_find();
    response.timestamp = new Date().getTime();
    response.result = 0;
    // response.list = serssion.list();
    // res.json(response);
  } else {
    response.result = 2;
  }
  res.json(response);
});

router.post('/serestart', async (req, res, next) => {
  var response = {};
  var message = {};
  if (req.power.read) {
    if (req.power.write) {
      // serssion.push_message(req.body.ip, req.body.pmid, req.body.message);
      var result = await server_db.server_push_message(req.body.ip, req.body.pmid, req.body.message);
      if(result.error){
        response.result = -1;
      }else{
        response.result = 0;
      }
    }else{
      response.result = 1;
    }
  } else {
    response.result = 2;
  }
  res.json(response);
});

module.exports = router;