var express = require('express');

// var device_db = require('../model/device');
// var monitor_db = require('../model/monitor');
// var stream_mongo_db = require('../model/stream_mongo');
// var stream_influx_db = require('../model/stream_influx');
// var gps_db = require('../model/gps');

var router = express.Router();

router.get('/ipsource', async (req, res, next) => {
	var response = {};
	//ipv4
	// const ip_array = req.query.ip.split('.');
	// const ip_num = 16777216*parseInt(ip_array[0]) + 65536*parseInt(ip_array[1]) + 256*parseInt(ip_array[2]) + parseInt(ip_array[3]);
	// console.log(ip_num);
	// response.ip_num = ip_num;
	console.log(req.headers);
	if (req.connection.remoteFamily == 'IPv4') {
		const ip_array = req.connection.remoteAddress.split('.');
		console.log(ip_array);
		const ip_num = 16777216*parseInt(ip_array[0]) + 65536*parseInt(ip_array[1]) + 256*parseInt(ip_array[2]) + parseInt(ip_array[3]);
		console.log(ip_num);
		response.ip_num = ip_num;
	} else {
	//ipv6
		const ip_array = req.connection.remoteAddress.split(':');
		const ip_num = (65536^7)*ip_array[0] + (65536^6)*ip_array[1] + (65536^5)*ip_array[2] + (65536^4)*ip_array[3] + (65536^3)*ip_array[4] + (65536^2)*ip_array[5] + 65536*ip_array[6] + ip_array[7];
		console.log(ip_num);
		response.ip_num = ip_num;
	}
	res.json(response);
});

module.exports = router;