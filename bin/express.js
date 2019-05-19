var express = require('express');
var path = require('path');
var fs = require('fs');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);
var ejs = require('ejs');
var config = require('../config/config');

var index = require('../routes/index');
// var update = require('../routes/update');
// var upload = require('../routes/upload');
// var monitor = require('../routes/monitor');
// var register = require('../routes/register');
// var heartbeat = require('../routes/heartbeat');
// var patch = require('../routes/patch');
// var firmware = require('../routes/firmware');
// var device = require('../routes/device');
// var server = require('../routes/server');
var api = require('../routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'views/'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//session
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'sae-cmpp',
  cookie: { 
    maxAge: 3600000//keep time 3600 seconds
    // domain: config.account.session_domain 
  }
  // store: new MongoStore({ 
  //   url: config.account.session_db_url, 
  //   autoReconnect: true, 
  //   poolSize: 10 
  // })
}));

//power
app.use(function (req, res, next) {
  req.power = { login: true, read: true, write: true };
  // req.power = { login: false, read: false, write: false };
  if (req.session.user && req.session.user.permissions) {
    req.power.login = true;
    if(req.session.user.permissions.nms){
      req.power.read = true;
      req.session.user.permissions.nms.forEach(function (ele) {
        req.power[ele] = true;
      })
    }
  }
  next();
});

app.use(cookieParser());

//language
app.use(function(req, res, next){
  var langs = (function(){
    var dpath = path.join(__dirname, '..', '/config/lang'),
        files = fs.readdirSync(dpath),
        langss = {};
    for(var i = 0; i < files.length; i++){
      var name = files[i].replace(path.extname(files[i]), '');
      langss[name] = require(path.join(dpath, files[i]));
    }
    return langss;
  }());
  var lang = req.cookies.lang || 'en-US';
  res.cookie('lang', lang, {path:'/', maxAge:900000000});
  res.locals.lang = langs[lang];
  res.locals.langlocale = lang;
  next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(res.locals.message);
  console.log(res.locals.error);
  // render the error page
  res.status(err.status || 500);
  if(err.status == 404){
    res.render('404.html');
  }else{
    res.render('error');
  }
});

module.exports = app;
