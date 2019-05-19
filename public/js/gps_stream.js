var search_time_start = 0;
var search_time_stop = 0;

$(document).ready(function () {
    var auto_refresh = true;
    function get_stream () {
        if(auto_refresh){
            $.get('./api/gps_stream?count=1000', function (result, status) {
                if(result.result == 0){
                    // console.log('0',result.data);
                    $('#Table').bootstrapTable('load',result.data); 
                }else if(result.result == -1){
                    console.error('get streams fail, please try again');
                }else{
                    console.error('get streams fail, no power');
                }
            });
        }
    }
    function post_stream (){
        var id = $('#add-did-input').val();
        var name = $('#add-sname-input').val();
        var stream = $('#add-stream-input').val();
        $.post('./api/gps_stream?count=1000', {id:id, name:name, value:stream}, function (result, status) {
            if(result.result == 0){
                // console.log('0',result.data);
                $('#dialog').modal('hide');
            }else if(result.result == -1){
                // console.log('-1');
                window.alert('add stream fail, please try again');
            }else{
                window.alert('add stream fail, no power');
            }
        });
    }
    function tableHeight(){
        return $(window).height() - 50;
    }
    function initTable(){
        $('#Table').bootstrapTable('destroy');  
        $('#Table').bootstrapTable({
            method: 'get',
            url:'./api/gps_stream',
            // url:'./api/data_stream_aggregate',
            queryParamsType : "undefined",   
            queryParams: function queryParams(params) {   //设置查询参数  
                var param = {    
                    page_num: params.pageNumber,    
                    page_size: params.pageSize,
                    sort_by : params.sortName,
                    sort : params.sortOrder,
                    search_id: $('#did-search-input').val()
                };
                search_time_start = new Date().getTime();
                return param;                   
            },
            responseHandler:function(res){
                if(res.aggregate){
                    var rows = [];
                    for(var i in res.rows){
                        rows[i] = {};
                        rows[i]._id = res.rows[i]._id;
                        rows[i].id = res.rows[i].id;
                        rows[i].name = res.rows[i].name + '   (average aggregation operation)';
                        rows[i].value = res.rows[i].avg;
                        rows[i].at = res.rows[i].at;
                    }
                    res.rows = rows;
                    return res;
                }else{
                    return res;
                }
            },
            onLoadSuccess: function(){  //加载成功时执行        
                search_time_stop = new Date().getTime();
                var search_time = search_time_stop - search_time_start;
                if(search_time > 1000){
                    search_time = search_time/1000;
                    search_time = search_time + 's';
                }else{
                    search_time = search_time + 'ms';
                }
                if($('.page-list').length >= 0){
                    $('.page-list').after('&nbsp;&nbsp;<span>' + language.searchtime_span + ': ' + search_time + '</span>');
                }
                // console.log("加载成功");
            },
            onLoadError: function(){  //加载失败时执行  
                console.log("加载数据失败", {time : 1500, icon : 2});  
            },
            classes: 'table table-hover',
            locale: language.langlocale,
            undefinedText: '-',
            sortName: 'at',
            sortOrder: 'desc',
            contentType: "application/x-www-form-urlencoded",
            //分页
            pagination:true,
            sidePagination:'server',
            pageNumber:1,
            pageSize:20,
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
            showColumns:false,
            //高度
            height:$(window).height() - 50,
            // height:tableHeight(),
            striped:true,
            // toolbar:"#toolbar",
            toggle:'table',
            cache:false,
            toolbarAlign:'right',
            uniqueId:'id',
            showExport:false,
            maintainSelected:true,
            columns:[{
                field:'_id',
                title:language.table_column_id,
                align: 'left',
                valign: 'middle',
                sortable: false
            },{
                field:'id',
                title:language.table_column_did,
                align: 'left',
                valign: 'middle',
                sortable: false
            },{
                field:'lng',
                title:language.table_column_lng,
                align: 'left',
                valign: 'middle',
                sortable: false
            },{
                field:'lat',
                title:language.table_column_lat,
                align: 'left',
                valign: 'middle',
                sortable: false,
                formatter: function(value, row, index){                        
                    return JSON.stringify(value);
                }
            },{
                field:'at',
                title:language.table_column_timestamp,
                align: 'left',
                valign: 'middle',
                sortable: true
            }]
        });
        // search_time_start = new Date().getTime();
    }
    // $(document).ready(function () {
        $('#search-button').click(function(){
            // initTable();
            var select = $('#search-time-select').val();
            if(select == '1h'){
                initTable();
            }else{
                if($.trim($('#did-search-input').val()) == '')window.alert('The aggregation operation must contain the "Device ID" parameter');
                else if($.trim($('#sname-search-input').val()) == '')window.alert('The aggregation operation must contain the "Stream Name" parameter');
                else initTable();
            }
        });
        $('#did-search-input').bind('keypress',function(event){   
            if(event.keyCode == 13){  
                $('#search-button').click(); 
            }  
        });
        $('#auto-refresh-switch').bootstrapSwitch({
            onText:'Refresh',
            offText:'Off',
            handleWidth:50,
            onSwitchChange:function(event,state){
                auto_refresh = state;
            }
        });
        $('#add-button').click(function(){
            post_stream();
        })
        $('#stream-add-form').bootstrapValidator({
            message: 'This value is not valid',
            live: 'enable',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                add_did_input: {
                    // message: '用户名验证失败',
                    validators: {
                        notEmpty: {
                            message: 'Can not be empty'
                        }
                    }
                },
                add_sname_input: {
                    validators: {
                        notEmpty: {
                            message: 'Can not be empty'
                        }
                    }
                },
                add_stream_input: {
                    validators: {
                        notEmpty: {
                            message: 'Can not be empty'
                        },
                        numeric: {
                            message: 'Stream Value must be number'
                        }
                    }
                }
            }
        });
        initTable();
    // });
});