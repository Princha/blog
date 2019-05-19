var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if(req.query.version && req.query.target){
        var response = {};

        db.check_program_version(req.query, function(err,r){
            // console.log(err)
            var response = {};
            if(r){   
                // console.log(r.version)           
                if(r.version == req.query.version){//不需要升级
                    response.result = "success";
                    response.update = "false";
                    res.json(response);
                    // console.log("update=false")
                }
                else{                               //需要升级
                    response.result = "success";
                    response.update = "true";
                    res.json(response);
                    // console.log("update=true")
                }
            }
            else{                                   //找不到该类型版本
                response.result = "fail";
                response.update = "false";
                res.json(response);
                // console.log(r);
            }
            
        });

        // response.result = "success";
        // res.json(response);
    }
    else{
        var response = {};
        response.result = "parameter error";
        res.json(response);
    }

});

module.exports = router;
