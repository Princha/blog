settings = {
  "Intel":{
    colserip:"192.168.1.11",
    appserip:"192.168.1.10",
    update_url:"3",
    update_time :"4",
    push_interval :"1000",
    config_timestamp:"0"
  },
  "ubuntu":{
    colserip:"192.168.1.11",
    appserip:"192.168.1.10",
    update_url:"3",
    update_time :"4",
    push_interval :"1000",
    config_timestamp:"0"
  },
  "P4011-v1":{
    collect_host:'coll.beaconice.cn',
    collect_port:'8983',
    expired:3600,
    heartbeat:10
  },
  "GW-2003":{
    collect_host:'coll.beaconice.cn',
    collect_port:'8983',
    expired:3600,
    heartbeat:10
  },
  "STM32":{
    collect_host:'coll.beaconice.cn',
    collect_port:'8983',
    expired:3600,
    heartbeat:10
  }
}

exports.get_settings = function(target)  {
  return settings[target];
}

exports.set_settings = function(target, params, settings_timestamp) {
  settings[target].colserip = params.colserip || settings[target].colserip;
  settings[target].appserip = params.appserip || settings[target].appserip;
  settings[target].update_url = params.update_url || settings[target].update_url;
  settings[target].update_time = params.update_time || settings[target].update_time;
  settings[target].push_interval = params.push_interval || settings[target].push_interval;
  settings[target].config_timestamp = settings_timestamp || settings[target].config_timestamp;
  
  // db.set_config(settings, function (result) {
  //   console.log(result);
  // })
}

exports.get_settings_in_database = function(){
  // db.get_settings(function(message, r){
  //   if(message == 'success'){
  //     settings.colserip = r.colserip;
  //     settings.appserip = r.appserip;
  //     settings.update_url = r.upurl;
  //     settings.update_packname = r.packname;
  //     settings.update_time = r.uptime;
  //     settings.push_interval = r.pushint;
  //   }
  // })
}

exports.set_settings_in_database = function(){

}
