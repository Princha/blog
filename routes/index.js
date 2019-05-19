var express = require('express');
var config = require('../config/config');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.power.read) res.render('index.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/monitoring', function (req, res, next) {
  if(req.power.read)res.render('monitor.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/monitoring_dashboard', function (req, res, next) {
  if(req.power.read)res.render('monitor_dashboard.html',{id:req.query.id});
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/gateway_settings', function (req, res, next) {
  if(req.power.read)res.render('setting.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/remote_control', function (req, res, next) {
  // if(req.power.read)res.render('control.html');
  // else if(req.power.login) res.render('ban.html');
  // else res.redirect(config.account.url);
  res.render('control.html');
});

router.get('/servers_status', function (req, res, next) {
  if (req.power.read) res.render('servers.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/dhcp', function (req, res, next) {
  if (req.power.read) res.render('dhcp.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/data_stream', function (req, res, next) {
  if (req.power.read) res.render('stream.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/gps_stream', function (req, res, next) {
  if (req.power.read) res.render('gps_stream.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/data_view', function (req, res, next) {
  if (req.power.read) {
    if(req.query.id && req.query.name){
      res.render('view.html',{id:req.query.id,name:req.query.name});
    }else{
      res.render('view.html',{id:null,name:null});
    }
  }
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/data_view_influx', function (req, res, next) {
  if (req.power.read) res.render('view_influx.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/camera', function (req, res, next) {
  if (req.power.read) res.render('camera.html');
  else if(req.power.login) res.render('ban.html');
  else res.redirect(config.account.url);
});

router.get('/session', function (req, res, next) {
  var response = {};
  if (req.power.read) {
    response.result = 0;
  } else {
    response.result = 1;
  }
  res.json(response);
});

module.exports = router;