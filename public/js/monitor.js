var data;
var num_device_total;
var num_device_online;
var online_timestamp;
var auto_refresh = true;
var dialog_show_info = {};
var data_view = {};
var dashboard_params = {};

function tableHeight(){
    return $(window).height() - 60;
}

$(document).ready(function () {
    // $("#button").click(function () {
    //     $("#dialog").show("fast");
    // })
    $("#close-dialog-button").click(function () {
        $("#dialog").hide();
    });
    $('#config-dialog').on('show.bs.modal', function(){//modal居中
        var $this = $(this);
        var $modal_dialog = $this.find('.modal-dialog');
        // 关键代码，如没将modal设置为 block，则$modala_dialog.height() 为零
        $this.css('display', 'block');
        $modal_dialog.css({'margin-top': Math.max(0, ($(window).height() - $modal_dialog.height()) / 2) });
    });
    dialog_show_info.id = '';
    $('#dashboard-dialog').on('shown.bs.modal',function(){
        console.log('show dialog');
        var iframe = document.getElementById("dashboard-dialog-frame");
        iframe.src = './monitoring_dashboard?id=' + dashboard_params.id;
        if (iframe.attachEvent){ 
            iframe.attachEvent("onload", function(){
                // alert("Local iframe is now loaded.");
                // console.log("Local iframe is now loaded.");         
            });
        } else { 
            console.log("Local iframe is now loading.");
        }
    });
    $('#dataview-dialog').on('shown.bs.modal',function(){
        console.log('show dialog');
        var iframe = document.getElementById("dataview-dialog-frame");
        iframe.src = './data_view?id=' + data_view.id + '&name=' + data_view.name;
        if (iframe.attachEvent){ 
            iframe.attachEvent("onload", function(){
                // alert("Local iframe is now loaded.");
                // console.log("Local iframe is now loaded.");         
            });
        } else { 
            console.log("Local iframe is now loading.");
        }
    });
    $('#search-button').click(function(){
        $('#Table').bootstrapTable('refresh');
    });
    $('#search-input').bind('keypress', function (event) {
        if (event.keyCode == 13) {
            $('#search-button').click();
        }
    });
    // $("#update-button").click(function(){
    //     multiple_control('update');
    // });
    $("#upgrade-button").click(function(){
        multiple_control('upgrade');
    });
    $("#restart-button").click(function(){
        multiple_control('restart');
    });
    $("#reboot-button").click(function(){
        multiple_control('reboot');
    });

    $('#auto-refresh-switch').bootstrapSwitch({
        onText:language.refresh_input_refresh,
        offText:language.refresh_input_unrefresh,
        handleWidth:50,
        onSwitchChange:function(event,state){
            auto_refresh = state;
        }
    });

    $.get('./device/monitor?page_num=1&page_size=100000',function(result, status){
        var search_pool = [];
        for(var i in result.rows){
            search_pool.push(result.rows[i].id, result.rows[i].ipaddress);
        }
        $('#search-input').typeahead({source:search_pool});
        console.log(result);
    });

    function initTable(){
        $('#Table').bootstrapTable('destroy');
        $('#Table').bootstrapTable({
            method: 'get',
            url:'./device/monitor',
            queryParamsType : "undefined",   
            queryParams: function queryParams(params) {   //设置查询参数  
                var param = {    
                    page_num: params.pageNumber,    
                    page_size: params.pageSize,
                    sort_by: params.sortName,
                    sort: params.sortOrder,
                    search: $('#search-input').val()
                    // search: params.searchText
                };
                search_time_start = new Date().getTime();
                return param;                   
            },
            responseHandler:function(res){
                online_timestamp = res.timestamp;
                return res;
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
                $('#search-time-span').text(search_time);
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
            showColumns:true,
            //高度
            // height:$(window).height() - 50,
            height:tableHeight(),
            //表格显示条纹
            striped:false,
            // toolbar:"#toolbar",
            toggle:'table',
            cache:false,
            toolbarAlign:'right',
            uniqueId:'id',
            showExport:false,
            maintainSelected:true,
            // onDblClickRow:function(row,$element){
            //     console.log(row, $element);
            //     show_detail(row);
            // },
            rowStyle: function (row, index) {
                //这里有5个取值代表5中颜色['active', 'success', 'info', 'warning', 'danger'];
                var strclass = "";
                if (online_timestamp - row.timestamp < 10000) {

                } else {
                    strclass = 'danger';
                }
                return { classes: strclass }
            },
            columns:[{
                checkbox: true
            },{
                field:'id',
                title:language.table_column_id,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    // return '<a onclick="show_detail(this)">' + value + '</a>';
                    // return '<a onclick="dashboard(this)">' + value + '</a>';
                    return '<a onclick="show_dashboard(\'' + value + '\')">' + value + '</a>';
                }
            },{
                field:'ipaddress',
                title:language.table_column_ip,
                align: 'left',
                valign: 'middle',
                sortable: 'true'
            },{
                field:'target',
                title:language.table_column_target,
                align: 'left',
                valign: 'middle',
                sortable: 'true'
            },{
                field:'model',
                title:language.table_column_model,
                align: 'left',
                valign: 'middle',
                sortable: 'true'
            },{
                field:'version',
                title:language.table_column_version,
                align: 'left',
                valign: 'middle',
                sortable: 'true'
            },{
                field:'timestamp',
                title:language.table_column_status,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    if (online_timestamp - value < 10000) {
                        // return "<div class='serviceStateOn'></div>";
                        return "<span class='serviceStateOn'>" + language.table_column_status_online + "</span>";
                    } else {
                        return "<span class='serviceStateOff'>" + language.table_column_status_offline + "</span>";
                    }
                }
            },{
                field:'cpu_usage',
                title:language.table_column_cpu,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    // return (value + '%');
                    // return '<a href="./data_view?id=' + row.id + '&name=cpu_usage" target="_self">' + value + '%' + '</a>';
                    return '<a onclick="show_dataview(\'' + row.id + '\', \'cpu_usage\')">' + value + '%' + '</a>';
                }
            },{
                field:'mem_used',
                title:language.table_column_mem,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    // return (parseInt((row.mem_used / row.mem_total) * 100) + '%');
                    // return (parseInt(row.mem_used / row.mem_total * 100) + '%');
                    // return '<a href="./data_view?id=' + row.id + '&name=mem_used" target="_self">' + parseInt(row.mem_used / row.mem_total * 100) + '%' + '</a>';
                    return '<a onclick="show_dataview(\'' + row.id + '\', \'mem_used\')">' + parseInt(row.mem_used / row.mem_total * 100) + '%' + '</a>';
                }
            },{
                field:'uptime',
                title:language.table_column_uptimed,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    var seconds = value % 60;
                    var minutes = parseInt((value % 3600)/60);
                    var hours = parseInt((value % 86400)/3600);
                    var days = parseInt(value / 86400);
                    if(days > 0){
                        return (days + ' ' + language.table_column_uptime_days);
                    }else if(hours > 0){
                        return (hours + ' ' + language.table_column_uptime_hours);
                    }else if(minutes > 0){
                        return (minutes + ' ' + language.table_column_uptime_minutes);
                    }else{
                        return (seconds + ' ' + language.table_column_uptime_seconds);
                    }
                }
            },{
                field:'net_type',
                title:language.table_column_nettype,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    if (value < 100) {
                        return "Wi-Fi";
                    } else {
                        return "Eth";
                    }
                }
            },{
                field:'net_tx',
                title:language.table_column_nettx,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    // return '<a href="./data_view?id=' + row.id + '&name=net_tx" target="_self">' + value + 'KB/S' + '</a>';
                    return '<a onclick="show_dataview(\'' + row.id + '\', \'net_tx\')">' + value + 'KB/S' + '</a>';
                }
            },{
                field:'net_rx',
                title:language.table_column_netrx,
                align: 'left',
                valign: 'middle',
                sortable: 'true',
                formatter: function (value, row, index) {
                    // return '<a href="./data_view?id=' + row.id + '&name=net_rx" target="_self">' + value + 'KB/S' + '</a>';
                    return '<a onclick="show_dataview(\'' + row.id + '\', \'net_rx\')">' + value + 'KB/S' + '</a>';
                }
            },{
                field:'restart',
                title:language.table_column_restart,
                align: 'left',
                valign: 'middle',
                sortable: 'true'
            },{
                field:'id',
                title:language.table_column_action,
                align: 'center',
                valign: 'middle',
                // sortable: 'true',
                formatter: function(value, row, index){
                    // return '<a onclick="show_location(\'' + value + '\')"><i class="fa fa-map-marker" aria-hidden="true"></i></a>\
                    //         &nbsp;|&nbsp;\
                    //         <a onclick="show_beacon_list(\'' + value + '\')"><i class="fa fa-list-alt" aria-hidden="true"></i></a>';
                    return '<a onclick="show_location(\'' + value + '\')"><i class="fa fa-map-marker" aria-hidden="true"></i></a>';
                }
            }]
        });
    }

    var callback = function () {
        if(auto_refresh){
            initTable();
            $.get('./device/statistics', function (result, status) {
                if(result.result == 0){
                    $('#device-total').text(result.total);
                    $('#device-online').text(result.online);
                    $('#device-offline').text(result.offline);                  
                }
                else{
                    parent.location.reload();
                }
            });
        }
    }
    setInterval(callback, 60000);
    $(window).resize(function(){
        // console.log("window",$(window).height(),"html",$('html').height(),"body",$('body').height());
        $('#Table').bootstrapTable('resetView', {
            height:tableHeight()
        });
    });
    callback();
});

function show_dashboard(id){
    dashboard_params.id = id;
    $('#dashboard-dialog-body').html('<iframe id="dashboard-dialog-frame" width="100%" height="100%"></iframe>');
    $('#dashboard-dialog').modal('show');
}

function show_dataview(id, name){
    data_view.id = id;
    data_view.name = name;
    $('#dataview-dialog-body').html('<iframe id="dataview-dialog-frame" width="100%" height="100%"></iframe>');
    $('#dataview-dialog').modal('show');
}

function show_location(id){
    $('#action-dialog-body').html('<iframe id="action-dialog-frame" width="798px" height="400px"></iframe>');
    $('#action-dialog-frame').attr('src','/device/location/device_map?deviceid=' + id);
    $('#action-dialog').modal('show');  
}

function show_beacon_list(id){
    $('#action-dialog-body').html('<iframe id="action-dialog-frame" width="798px" height="400px"></iframe>');
    $('#action-dialog-frame').attr('src','/device/location/device_map?deviceid=' + id);
    $('#action-dialog').modal('show');  
}

function show_detail(row) {
    // console.log($(row).text())
    // console.log(data)
    // for(var i in data){
    //     if($(row).text() == data[i].id){
    //         row = data[i];
    //     }
    // }
    var data = {};
    $.get('./device/chart_data' + '?id=' + $(row).text(), function (result, status) {
        console.log(result);
        if(result.result == 0){
            console.log(data);
            var cpu_list_average = 0;
            var mem_list_average = 0;
            dialog_show_info.id = $(row).text();
            dialog_show_info.ip = $(row).parent().next().text();

            $('#dialog').modal('show');
            $("#dialog-label").text(dialog_show_info.id);
            $("#button-update").attr('name',dialog_show_info.ip);
            $("#button-reboot").attr('name',dialog_show_info.ip);
            var a = $('#dialog-label').is(':visible')
            for (var j = 0; j < result.cpu_list.length; j++) {
                cpu_list_average += result.cpu_list[j];
            }
            for (var j = 0; j < result.mem_list.length; j++) {
                mem_list_average += result.mem_list[j];
            }
            // console.log(cpu_list_average);
            cpu_list_average /= result.cpu_list.length;
            mem_list_average /= result.mem_list.length;
            mem_list_average /= result.mem_total;
            mem_list_average *= 100;
            // console.log(cpu_list_average);
            cpu_list_average = Math.round(cpu_list_average);
            mem_list_average = Math.round(mem_list_average);

            var cpu_x_axis = [];
            var mem_x_axis = [];
            for(var i = 0; i < result.cpu_list.length; i++){
                cpu_x_axis.push(i);
            }
            for(var i = 0; i < result.mem_list.length; i++){
                mem_x_axis.push(i);
            }
            cpu_chart = echarts.init(document.getElementById('cpu-chart'));
            mem_chart = echarts.init(document.getElementById('mem-chart'));
            var cpu_option = {
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'center',
                    text: language.modal_chart_cpu_title + ' ' + cpu_list_average  + '%',
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: cpu_x_axis
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                series: [
                    {
                        name:'模拟数据',
                        type:'line',
                        smooth:true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: 'rgb(255, 70, 131)'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgb(255, 158, 68)'
                                }, {
                                    offset: 1,
                                    color: 'rgb(255, 70, 131)'
                                }])
                            }
                        },
                        data: result.cpu_list
                    }
                ]
            };
            var mem_option = {
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'center',
                    text: language.modal_chart_mem_title + ' ' + mem_list_average + '%',
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: mem_x_axis
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                series: [
                    {
                        name:'模拟数据',
                        type:'line',
                        smooth:true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: 'rgb(255, 70, 131)'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgb(255, 158, 68)'
                                }, {
                                    offset: 1,
                                    color: 'rgb(255, 70, 131)'
                                }])
                            }
                        },
                        data: result.mem_list
                    }
                ]
            };
            cpu_chart.setOption(cpu_option);
            mem_chart.setOption(mem_option);   
        } else {
            parent.location.reload();
        }
    });
}

function dashboard(This) {
    // window.location.href = './monitoring_dashboard?id=' + $(This).text();
    // var dashboard_div_html = ;

    // $('#myTabContent').after('<div id="dashboard-div" class="dashboard-div"></div>');
    // $('#dashboard-div').append('<iframe id="dashboard-iframe" class="dashboard-iframe" name="dashboard-iframe" src="./monitoring_dashboard?id=' + $(This).text() + '"></iframe>');
    // $('#dashboard-iframe').width($(document).width());
    // $('#dashboard-iframe').height($(document).height());
    popWin.showWin($(document).width() - 20,$(document).height() - 20,$(This).text(),'./monitoring_dashboard?id=' + $(This).text());
    // $('#dashboard-iframe').width('100%');
    // $('#dashboard-iframe').height('100%');
    // console.log($(This).text());
}

function multiple_control(message){
    var selections = $('#Table').bootstrapTable('getSelections');
    if(selections.length > 0){
        console.log(selections);
        var data = {};
        data.list = [];
        for(var i in selections){
            data.list.push(JSON.stringify(selections[i]));
        }
        data.message = message;
        $.ajax({
            type: 'POST',
            url: './device/multiple_control',
            data: data,
            traditional: true,
            beforeSend: function() {

            },
            success: function(result) {
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
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {

            },
            complete: function() {

            }
        });
    }else{
        window.alert('必须至少选择一个设备操作');
    }
}

function _control(ip, message) {
    console.log(ip);
    var data = {ip:ip, message:message};
    $.post('./device/single_control', data, function (data) {
        if(data.result == 0){
            window.alert('消息已发出，请耐心等候');
            console.log('send message success');
        }else if(data.result == 1){
            window.alert('没有相关权限');
            console.log('send message fail, no power');
        }else if(data.result == -1){
            window.alert('操作失败,缺少相关参数');
            console.log('send message fail, no params');
        }
        else{
            console.log('send message fail, no login');
            parent.location.reload();
        }
    })
}

function logout() {
    $.post('./login/exit',function(){
        window.location.href='/login';
    })
}