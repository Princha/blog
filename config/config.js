var config = {
  setting:{
    port:3000
  },
  account:{
    url:"/account/user/login?syscode=main&s=monitoring",
    logout_url:'',
    session_db_url:'mongodb://192.168.1.13/usersystem'
    // session_domain:'beaconice.sae.com.hk'
  },
  mongo:{
    device:{
      url:'mongodb://192.168.1.13/niot',
      table_name:'device'
    },
    product:{
      url:'mongodb://192.168.1.13/niot',
      table_name:'product'
    },
    stream:{
      url:'mongodb://192.168.1.4/nms',
      table_name:'stream'
    },
    monitor:{
      url:'mongodb://192.168.1.13/niot',
      table_name:'device_status'
    },
    server:{
      url:'mongodb://192.168.1.4/nms',
      table_name:'server'
    },
    module:{
      url:'mongodb://192.168.1.4/nms',
      table_name:'module'
    },
    setting:{
      url:'mongodb://192.168.1.4/nms',
      table_name:'setting'
    },
    gps:{
      url:'mongodb://192.168.1.4/nms',
      table_name:'gps'
    }
  },
  redis:{
      ip:'192.168.1.12',
      port:'6379'
  },
  influxdb:{
    stream:{
      host:'192.168.1.22',
      database:'stream',
      measurement:'stream'
    }
  },
  model:[
    {name:'Intel', version:'', fireware_size:0, link:'', protocol:'http'},
    {name:'P4011-v1', version:'', fireware_size:0, link:'', protocol:'coap'},
    {name:'STM32', version:'', fireware_size:0, link:'', protocol:'coap'}
  ]
};

module.exports = config;
