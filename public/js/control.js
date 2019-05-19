var datas = [];
var control_id = '';
var control_model = '';

function tableHeight(){
    return document.body.clientHeight - 10;
}

function page_panel_change_class(This){
    $(This).parent().parent().addClass('panel panel-info');
    $(This).parent().parent().parent().siblings("li").children().removeClass('panel panel-info');
}

function initTable(){
    // $('#Table').bootstrapTable('destroy');
    $('#Table').bootstrapTable({
        method: 'get',
        url:'./device/control',
        queryParamsType : "undefined",   
        queryParams: function queryParams(params) {   //设置查询参数  
            var param = {    
                page_num: params.pageNumber,    
                page_size: params.pageSize
            };
            search_time_start = new Date().getTime();
            return param;                   
        },
        responseHandler:function(res){
            // online_timestamp = res.timestamp;
            console.log(res);
            datas = res.rows;
            // console.table(res);
            return res;
        },
        onLoadSuccess: function(){  //加载成功时执行   
            // search_time_stop = new Date().getTime();
            // var search_time = search_time_stop - search_time_start;
            // if(search_time > 1000){
            //     search_time = search_time/1000;
            //     search_time = search_time + 's';
            // }else{
            //     search_time = search_time + 'ms';
            // }
            // $('#search-time-span').text(search_time);
            console.log("加载成功");
        },
        onLoadError: function(){  //加载失败时执行  
            console.log("加载数据失败", {time : 1500, icon : 2});  
        },
        classes: 'table table-hover',
        locale: language.langlocale,
        undefinedText: '-',
        // sortName: 'id',
        // sortOrder: 'desc',
        contentType: "application/x-www-form-urlencoded",
        //分页
        pagination:true,
        sidePagination:'server',
        pageNumber:1,
        pageSize:100,
        // pageList:[10,20,30,50,100,'all'],
        pageList:[10,20,30,50,100],
        //搜索框
        search:false,//启用搜索
        searchOnEnterKey:false,//回车搜索
        strictSearch:false,//全匹配搜索
        trimOnSearch:false,//允许空字符搜索
        //排序
        silentSort:false,//分页重置排序方式
        //列选择
        showColumns:true,
        //高度
        height:tableHeight(),
        //表格显示条纹
        striped:true,
        // toolbar:"#toolbar",
        toggle:'table',
        cache:false,
        toolbarAlign:'right',
        uniqueId:'id',
        showExport:false,
        maintainSelected:true,
        columns:[
        {
            field:'name',
            title:language.bulk_management_table_name,
            align: 'left',
            valign: 'middle'
            // sortable: 'true'
        },{
            field:'key',
            title:language.bulk_management_table_key,
            align: 'left',
            valign: 'middle'
            // sortable: 'true'
        },{
            field:'description',
            title:language.bulk_management_table_description,
            align: 'left',
            valign: 'middle'
            // sortable: 'true'
        },{
            field:'id',
            title:language.bulk_management_table_uploaddate,
            align: 'left',
            valign: 'middle',
            // sortable: 'true',
            formatter: function (value, row, index) {
                if(row.control && row.control.last_upload)return new Date(row.control.last_upload).toLocaleString();
                else return '-';
            }
        },{
            field:'id',
            title:language.bulk_management_table_control_and_download,
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                var link = '';
                if(row.control && row.control.link)link = row.control.link;
                else link = '';
                return '<a onclick="show_dialog(\'' + value + '\')"><i class="fa fa-eject" aria-hidden="true"></i></a> | <a href="' + link + '"><i class="fa fa-cloud-download" aria-hidden="true"></i></a>';
            }
        }]
    });
}

function show_dialog(id){
    console.log(id);
    console.log(datas);
    for(var i in datas){
        if(datas[i].id == id){
            control_id = datas[i].id;
            control_model = datas[i].model;
            $('#dialog-label').text(datas[i].name);
            $('#dialog').modal('show');
        }
    }            
}

function post_data(message) {
    // console.log(name, message);
    var name = control_model;
    var data = { name: name, message: message };
    var r = confirm("Are you sure want to " + message + " all " + name + " device?");
    if (r == true){
        $.post('./device/control', data, function (result, status) {
            if (result.result == 0) {
                window.alert('消息已发出，请耐心等候');
                console.log('Post message success,please wait');
            } else if (result.result == 1) {
                window.alert('没有相关权限');
                console.log('Post config fail, no power');
            } else {
                console.log('Post config fail, no login');
                parent.location.reload();
            }
        });
    } else {
        window.alert("Canceled!");
    }   
}

function upload() {
    var formData = new FormData($("#files")[0]);
    // var target = $('#select').val();
    var version = $('#version').val();
    var find_flag = false;
    $.ajax({
        url: './upload/?model=' + control_model + '&version=' + version,
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            // console.log(data);
            if (data.result == 0) {
                window.alert('upload success');
                $('#dialog').modal('hide');
            } else if (data.result == -1) {
                window.alert('write file fail,please retry',data.data);
                console.log('write file fail,please retry',data.data);
            } else if (data.result == -2) {
                window.alert('upload fail,the file is exists');
                console.log('upload fail,the file is exists');
            } else if (data.result == 1) {
                window.alert('upload fail, no power');
                console.log('upload fail, no power');
            } else {
                window.alert('upload fail, unknow reason');
                console.log('upload fail, unknow reason');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            window.alert(textStatus, errorThrown);
        }
    });
}
$(document).ready(function () {
    // $.get('./device/control1', function (result, status) {
    //     if (result.result == 0) {
    //         for (var i in result.data) {
    //             _add(result.data[i])
    //         }
    //     } else if (result.result == 1) {
    //         window.alert('Have not relevant authority');
    //         console.log('get config fail, no power');
    //     } else {
    //         console.log('get config fail, no login');
    //         parent.location.reload();
    //     }
    // })
    initTable();
});

$(window).resize(function(){
    $('#Table').bootstrapTable('resetView', {
        height:tableHeight()
    });
});
