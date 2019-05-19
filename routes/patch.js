const express = require('express');
const fs = require('fs');
const util = require('util');
const path = require('path');
const config = require('../config/config');
const router = express.Router();

const extended_name = 'zip';
const file_path_name = __dirname + '/../public/patch';

const file_split = (filename) => {
    var pos = filename.lastIndexOf(".");
    extended = filename.substring(pos + 1, filename.length);
    // console.log(extended)
    filename = filename.substring(0, pos);
    var names = filename.split("_");
    if(names.length >= 2){
        return {model:names[0],version:names[1],extended:extended};
    }else{
        return {error:'Parsing error'};
    }
};

const version_max = (a,b) => {
    var v_str = a.substring(0, 1);
    if(v_str == 'v' || v_str == 'V')a = a.substring(1, a.length);
    var v_str = b.substring(0, 1);
    if(v_str == 'v' || v_str == 'V')b = b.substring(1, b.length);
    
    var versions_a = a.split(".");
    var versions_b = b.split(".");
    if(versions_a.length != versions_b.length)return a;
    for(var i in versions_a){
        if(parseInt(versions_a[i]) < parseInt(versions_b[i]))return b;
        else if(parseInt(versions_a[i]) > parseInt(versions_b[i]))return a;
    }
    return a;
};

const readdir = async (pathname) => {
    const filePath = path.resolve(pathname);
    const readdir = util.promisify(fs.readdir);
    var files = await readdir(filePath).catch((error) => {
        return{error:error};
    });
    return{files:files};
};

router.get('/', async (req, res, next) => {
    var response = {};
    response.code = '404'
    console.log(file_path_name);
    if(req.query.model && req.query.version){
        var names = await readdir(file_path_name);
        if(names.error){
            response.code = '404';
            response.error = names.error;
            res.json(response);
        }else{
            var version_max_num = '0.0.0'
            for(var i in names.files){
                // console.log(names.files[i]);
                var name = file_split(names.files[i]);
                if(name.error)continue;
                if(name.model == req.query.model && name.extended == extended_name){
                    version_max_num = version_max(version_max_num,name.version);
                }
            }
            if(version_max_num != '0.0.0'){
                if(req.query.version < version_max_num){
                    // console.log(version_max_num);
                    res.download(file_path_name + '/' + req.query.model + '_v' + version_max_num + '.' + extended_name, req.query.model + '_v' + version_max_num + '.' + extended_name);
                } 
                else{
                    response.code = '404';
                    response.error = 'this version is the least';  
                    res.json(response.code,response); 
                }
            }else{
                response.code = '404';
                response.error = 'can not find match patch file';  
                res.json(response.code,response); 
            }
        }
    }else{
        response.result = -1;
        response.error = "parameter error";
        res.json(response.code,response);
    }
});

module.exports = router;
