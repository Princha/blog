/**
 * 文件上传
 */
var express = require('express');
var multer  = require('multer');
var crypto  = require('crypto');
var fs      = require('fs');

var config  = require('../config/config');
var settings = require('../config/settings');

var module_db = require('../model/module');
var product_db = require('../model/product');
// var mongodb = require('../bin/mongo');

var router  = express.Router();

var patch_path = __dirname + '/../public/patch/';
var firmware_path = __dirname + '/../public/firmware/';
var storage = multer.memoryStorage();

var upload = multer({ storage: storage });

//单位件上传   
//注意上传界面中的 <input type="file" name="avatar"/>中的name必须是下面代码中指定的名称  
// router.post('/singleUpload', upload.single('avatar'), function(req, res, next) {
//     // req.file is the `avatar` file   
//     // req.body will hold the text fields, if there were any   
//     console.log(req.file);
//     console.log(req.body);

//     res.end("上传成功");
// });

function load(req, res, next) {
    console.log(req.file);
    console.log(req.body);
    res.send('File upload success');
}

function multiLoad(req, res, next) {
    // req.files is array of `photos` files   
    // req.body will contain the text fields, if there were any   
    console.log(req.files);
    console.log(req.body);
    res.end("aaaaa");
}

// function display(req, res, next) {
//     if(req.session.isLogin)res.render('upload.html');
//     else res.redirect('/login');
// }

// router.route('/').post(display).get(display);

//单文件上传
//
// router.route('/singleUpload').post(upload.single('avatar'), load);
// var upload_file = upload.single('avatar');
// router.post('/file',function(req, res){
//     if(req.power.write){   
//         upload_file(req, res, function(err){
//             console.log(req.body.version);
//             console.log(req.body.target);
//             db.update_program_version(req.body,function(err){
//                 console.log(err);
//             });
//             if(err) res.send({result:err});
//             else res.send({result:'success', data:'File Upload Success'});
//         })
//     }
//     else res.send({result:'fail', data:'no login'});
// })

router.post('/', upload.single('avatar'), async (req, res) => {
    // if(req.power.write){
        var buffer = req.file.buffer;
        var hashvalue = crypto.createHash('md5').update(buffer).digest('hex');
        var extensionname = /\.[^\.]+$/.exec(req.file.originalname)[0];
        var filename = req.query.model + '_' + req.query.version + extensionname;
        fs.exists(firmware_path + filename, async (exists) => {
            if(exists){
                // console.log('file is exists');
                res.send({result:-2, data:'file is exists'});
            }else{
                // console.log('file is not exists');
                fs.writeFile(firmware_path + filename, buffer, async (err) => {
                    if(err){
                        res.send({result:-1, data:err});
                    }else{
                        var model = await product_db.get();
                        if(model.error){
                            res.send({result:-1, data:'upload file success,but get params fail', error:error});
                        }else{
                            for(var i in model.data){
                                if(model.data[i].model == req.query.model){
                                    var control = {};
                                    var update_url = 'http://nms.beaconice.cn:' + config.setting.port + '/firmware/' + filename;
                                    control.link = './firmware/' + filename;
                                    control.firmware_url = 'http://nms.beaconice.cn' + '/firmware/' + filename;
                                    control.firmware_size = buffer.length;
                                    control.version = req.query.version;
                                    control.last_upload = new Date().getTime();
                                    // model.data[i].link = update_url;
                                    // model.data[i].firmware_size = buffer.length;
                                    // model.data[i].version = req.query.version;
                                    // var config_timestamp = new Date().getTime();
                                    // model.data[i].last_upload = config_timestamp;
                                    var result = await product_db.set_control_by_model(req.query.model, control);
                                    if(result.error){
                                        res.send({result:-1, data:'upload file success,but set params fail', error:error});
                                        break;
                                    }else{
                                        var set = {};
                                        set.update_url = update_url;
                                        // settings.set_settings(req.query.model, set, config_timestamp);
                                        res.send({result:0, data:'File Upload Success'});
                                        break;
                                    }
                                }
                            }
                            
                        }
                    }    
                });
            }
        });
    // }
    // else res.send({result:1, data:'no login'});
});

router.post('/patch', upload.single('avatar'), async (req, res) => {
    if(req.power.write){
        var buffer = req.file.buffer;
        var hashvalue = crypto.createHash('md5').update(buffer).digest('hex');
        var extensionname = /\.[^\.]+$/.exec(req.file.originalname)[0];
        // var filename = req.query.target.toLowerCase() + '_' + req.query.version + '_' + hashvalue + extensionname;
        var filename = req.query.target + '_' + req.query.version + extensionname;
        // console.log(filename);
        fs.exists(patch_path + filename, async (exists) => {
            if(exists){
                // console.log('file is exists');
                res.send({result:-2, data:'file is exists'});
            }else{
                // console.log('file is not exists');
                fs.writeFile(patch_path + filename, buffer, async (err) => {
                    if(err){
                        res.send({result:-1, data:err});
                    }else{
                        var model = await product_db.get();
                        if(model.error){
                            res.send({result:-1, data:'upload file success,but get params fail', error:error});
                        }else{
                            for(var i in model.data){
                                if(model.data[i].model == req.query.model){
                                    var update_url = 'http://nms.beaconice.cn:' + config.setting.port + '/firmware/' + filename;
                                    model.data[i].link = update_url;
                                    model.data[i].firmware_size = buffer.length;
                                    model.data[i].version = req.query.version;
                                    var config_timestamp = new Date().getTime();
                                    model.data[i].last_upload = config_timestamp;
                                    var result = await module_db.set_module(model.data[i]);
                                    if(result.error){
                                        res.send({result:-1, data:'upload file success,but set params fail', error:error});
                                        break;
                                    }else{
                                        var set = {};
                                        set.update_url = update_url;
                                        settings.set_settings(req.query.model, set, config_timestamp);
                                        res.send({result:0, data:'File Upload Success'});
                                        break;
                                    }
                                }
                            }
                            
                        }
                    }    
                });
            }
        });
        
    }
    else res.send({result:1, data:'no login'});
});

router.post('/firmware', upload.single('avatar'), async (req, res) => {
    if(req.power.write){
        var buffer = req.file.buffer;
        var hashvalue = crypto.createHash('md5').update(buffer).digest('hex');
        var extensionname = /\.[^\.]+$/.exec(req.file.originalname)[0];
        // var filename = req.query.target.toLowerCase() + '_' + req.query.version + '_' + hashvalue + extensionname;
        var filename = req.query.target + '_' + req.query.version + extensionname;
        // console.log(filename);
        fs.exists(firmware_path + filename, async (exists) => {
            if(exists){
                // console.log('file is exists');
                res.send({result:-2, data:'file is exists'});
            }else{
                // console.log('file is not exists');
                fs.writeFile(firmware_path + filename, buffer, async (err) => {
                    if(err){
                        res.send({result:-1, data:err});
                    }else{
                        var modules = await module_db.get_module();
                        if(modules.error){
                            res.send({result:-1, data:'upload file success,but get params fail', error:error});
                        }else{
                            for(var i in modules.data){
                                if(modules.data[i].name == req.query.target){
                                    var update_url = 'http://nms.beaconice.cn:' + config.setting.port + '/firmware/' + filename;
                                    modules.data[i].link = update_url;
                                    modules.data[i].firmware_size = buffer.length;
                                    modules.data[i].version = req.query.version;
                                    var config_timestamp = new Date().getTime();
                                    modules.data[i].upload_time = config_timestamp;
                                    var result = await module_db.set_module(modules.data[i]);
                                    if(result.error){
                                        res.send({result:-1, data:'upload file success,but set params fail', error:error});
                                        break;
                                    }else{
                                        var set = {};
                                        set.update_url = update_url;
                                        settings.set_settings(req.query.target, set, config_timestamp);
                                        res.send({result:0, data:'File Upload Success'});
                                        break;
                                    }
                                }
                            }
                            
                        }
                    }    
                });
            }
        });
        
    }
    else res.send({result:1, data:'no login'});
});

// router.post('/singleUpload', upload.single('avatar'), function (req, res, next) {
//     var buffer = req.file.buffer;
//     var hashvalue = crypto.createHash('md5').update(buffer).digest('hex');
//     var filename = hashvalue;
//     // console.log("filename",filename);
//     async.waterfall([
//         function (cb) {
//             ContentInfo.findOne({ audioUrl: { $regex: hashvalue } }, cb);
//         },
//         function (arg, cb) {
//             console.log("查询是否包含hash：", arg);
//             if (!arg) {
//                 fs.writeFileSync(path + filename, buffer);
//                 var fileurl = encodeURI(config.host + "/assetimg/" + filename);
//                 cb(null, fileurl);
//             } else {
//                 cb(null, arg.audioUrl);
//             }
//         }
//     ], function (err, audioUrl) {
//         if (err) {
//             console.log(err);
//             res.send('Error:' + err);
//         } else {
//             console.log("aduiourl:", audioUrl);
//             res.json(audioUrl);
//         }
//     });
// });

//多附件上传  
//注意上传界面中的 <input type="file" name="photos"/>中的name必须是下面代码中指定的名 
// router.post('/mulUpload', upload.array('photos', 12), multiLoad);



module.exports = router;