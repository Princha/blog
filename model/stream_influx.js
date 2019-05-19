var nms_db = require('../bin/influx').nms_db;
var config = require('../config/config');

exports.stream_insert = async (stream) => {
    for(var i in stream){
        stream[i].measurement = config.influxdb.stream.measurement;
        stream[i].fields.value = parseFloat(stream[i].fields.value);
    }
    await nms_db.writePoints(stream).catch((error) => {
        console.log(error);
        // return {error:error};
    });
};

exports.stream_find_page = async (search, page_num, page_size, sort_by, sort, mode) => {
    if(sort >= 0)sort = 'asc';
    else sort = 'desc';
    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    
    if(mode == '1h'){
        var query_str = 'select \"value\" from \"stream\" where ';
        if(search.id)query_str = query_str + '\"id\" = \'' + search.id + '\' and ';
        if(search.name)query_str = query_str + '\"name\" = \'' + search.name + '\' and ';
        query_str = query_str + '\"time\" >= now() - ' + mode;
        query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        // query_str = query_str + ' limit ' + (page_size).toString() + ' offset -' + (page_size * (page_num - 1)).toString();
        // console.log(query_str);
        var result = await nms_db.query(query_str).catch((error) => {
            // console.log(error);
            return {error:error};
        });
        // console.log(result);
        var data = [];
        var id = search.id;
        var name = search.name;
        if(result.length > 0){
            for(var i in result){
                data.push({id:id,name:name,value:result[i].value,at:Date.parse(new Date(result[i].time))});
            }
            data.pop();
            data.pop();
            data.pop();
            data.pop();
        }
        return {result: 0, data: data, aggregate:false, length:data.length};
    }else{
        var query_str = 'select mean(\"value\") from \"stream\" where ';
        if(search.id)query_str = query_str + '\"id\" = \'' + search.id + '\' and ';
        if(search.name)query_str = query_str + '\"name\" = \'' + search.name + '\' and ';
        if(mode == '6h'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(60s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }else if(mode == '12h'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(90s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }else if(mode == '1d'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(180s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }else if(mode == '3d'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(540s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }else if(mode == '7d'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(1260s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }else if(mode == '14d'){
            query_str = query_str + '\"time\" >= now() - ' + mode;
            query_str = query_str + ' group by time(2520s)';
            query_str = query_str + ' order by ' + sort_by + ' ' + sort;
        }
        var result = await nms_db.query(query_str).catch((error) => {
            return {error:error};
        });
        // console.log(result);
        var data = [];
        var id = search.id;
        var name = search.name + ' (average aggregation operation)';
        if(result.length > 0){
            for(var i in result){
                data.push({id:id,name:name,avg:result[i].mean,at:Date.parse(new Date(result[i].time))});
            }
            data.pop();
            data.pop();
            data.pop();
            data.pop();
        }
        return {result: 0, data: data, aggregate:true, length:data.length};
    }
};