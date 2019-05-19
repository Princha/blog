var server_list = {};

$(document).ready(function () {
    var callback = function () {
        $.get('./server/serlists', function (data) {
            if (data.result == 0) {
                // console.log(data);
                add_list(data);
            } else {
                parent.location.reload();
            }
        })
    }
    setInterval(callback, 1000);
    callback();
})

function page_panel_change_class(This){
    $(This).parent().parent().addClass('panel panel-info');
    $(This).parent().parent().parent().siblings("li").children().removeClass('panel panel-info');
}

function add_list(data) {
    // $("#list-view").html('');
    for (s in data.list) {
        // var k = s.replace(/\./g, '-');
        var k = data.list[s].ip.replace(/\./g, '-');
        var ser_online;
        // console.log(s);
        if ((data.timestamp - data.list[s].timestamp) < 3000) {
            ser_online = '<i class="fa fa-circle appStateOnline"><span class="serviceStateOnline"> ' + language.server_online_text  + '</span>';
        } else {
            ser_online = '<i class="fa fa-circle appStateOnline"><span class="serviceStateOffline"> ' + language.server_offline_text  + '</span>';
        }
        if($('#button-' + k).length > 0){//update server list
            //server page reload
            var server = data.list[s].server;
            // console.log(server);
            if((data.timestamp - data.list[s].timestamp) < 3000)$('#server-status-' + k).html('<i class="fa fa-circle serviceStateOnline"><span class="serviceStateOnline"> ' + language.server_online_text  + '</span>');
            else $('#server-status-' + k).html('<i class="fa fa-circle serviceStateOffline"><span class="serviceStateOffline"> ' + language.server_offline_text  + '</span>');
            $('#server-cpu-' + k).html(server.cpu_usage + '%');
            $('#server-mem-' + k).html(parseInt((server.mem_used / server.mem_total) * 100) + '%');
            $('#server-upload-' + k).html('- mb/s');
            $('#server-download-' + k).html('- mb/s');
            //app page reload
            $('#app-table-' + k + ' tbody').html('');
            var list = data.list[s].list
            for (l in list) {
                switch(list[l].status){
                    case 'online':              list[l].online = '<i class="fa fa-circle appStateOnline"><span class="appStateOnline"> ' + language.app_status_table_status_online + '</span>';break;
                    case 'stopping':            list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_stopping + '</span>';break;
                    case 'stopped':             list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_stopped + '</span>';break;
                    case 'launching':           list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_launching + '</span>';break;
                    case 'errored':             list[l].online = '<i class="fa fa-circle appStateError"><span class="appStateError"> ' + language.app_status_table_status_errored + '</span>';break;
                    case 'one-launch-status':   list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_olstatus + '</span>';break;
                    default:                    list[l].online = '<i class="fa fa-circle appStateUnknow"><span class="appStateUnknow"> ' + language.app_status_table_status_unknow + '</span>';
                }
                var total_s = (list[l].timestamp - list[l].uptime) / 1000;
                var day = parseInt(total_s / 86400);
                var afterDay = total_s - (day * 86400);
                var hour = parseInt(afterDay / 3600);
                var afterHour = afterDay - (hour * 3600);
                var minute = parseInt(afterHour / 60);
                $('#app-table-' + k).append(
                    '<tr>\
                    <td class="online" align="center">' + list[l].online + '</td>\
                    <td class="pmid" align="center">' + list[l].pmid + '</td>\
                    <td class="name" align="center">' + list[l].name + '</td>\
                    <td class="pid" align="center">' + list[l].pid + '</td>\
                    <td class="runtime" align="center">' + day.toString() + 'Day ' + hour.toString() + ':' + minute + '</td>\
                    <td class="restart" align="center">' + list[l].restart + '</td>\
                    <td class="cpu" align="center">' + list[l].cpu + '</td>\
                    <td class="memory" align="center">' + list[l].memory + '</td>\
                    <td class="button" align="center"><button class="btn btn-warning" data-toggle="modal" onclick="restart(this)">' + language.app_status_table_operate_restart_button + '</button></td>\
                </tr>'
                );
            }
        }else{//add server list
            var system_str = '';
            switch(data.list[s].server.system){
                case 'Linux':system_str = '<div class="col-sm-6"><img src="./images/linux.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.system + ' ' + data.list[s].server.arch + '</span></div>';break;
                case 'linux':system_str = '<div class="col-sm-6"><img src="./images/linux.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.system + ' ' + data.list[s].server.arch + '</span></div>';break;
                case 'freebsd':system_str = '<div class="col-sm-6"><img src="./images/nodejs.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.system + ' ' + data.list[s].server.arch + '</span></div>';break;
                case 'win32':system_str = '<div class="col-sm-6"><img src="./images/windiws.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.system + ' ' + data.list[s].server.arch + '</span></div>';break;
                default:system_str = '<div class="col-sm-6"><span class="server-description">' + data.list[s].server.system + ' ' + data.list[s].server.arch + '</span></div>';
            }
            $("#list-view").append(
                '<div style="padding-bottom:20px;">\
                    <button type="button" class="btn btn-block " data-toggle="collapse" data-target="#button-' + k + '">'
                    + data.list[s].ip +
                    '</button>\
                    <div id="button-' + k + '" class="collapse in" style="margin-top:5px;">\
                        <ul id="server-' + k + '-list-tab" class="nav nav-tabs">\
                            <li class="active" style="height:40px;">\
                            <div class="panel panel-info">\
                                <div class="panel-heading">\
                                    <a href="#server-page-' + k + '" data-toggle="tab" onclick="page_panel_change_class(this)">'+ language.collapse_serverstatus_title +'</a>\
                                </div>\
                            </div>\
                            </li>\
                            <li style="height:40px;">\
                            <div>\
                                <div class="panel-heading">\
                                    <a href="#app-page-' + k + '" data-toggle="tab" onclick="page_panel_change_class(this)">' + language.collapse_appstatus_title + '</a>\
                                </div>\
                            </div>\
                            </li>\
                        </ul>\
                        <div class="tab-content" style="margin-top:4px;">\
                            <div class="tab-pane fade in active" id="server-page-' + k + '">\
                                <div class="page-main">\
                                <div class="panel panel-info">\
                                <div class="panel-body">\
                                    <table class="table" frame="void">\
                                        <tbody>\
                                            <tr>\
                                                <td rowspan="2" width="150px;">\
                                                    <div class="image-server">\
                                                        <img src="./images/dell_server.jpeg" style="width:150px;">\
                                                    </div>\
                                                </td>\
                                                <td>\
                                                    <div><i class="fa fa-certificate"></i><span> ' + language.server_status_status_span + '</span></div>\
                                                </td>\
                                                <td>\
                                                    <div><i class="fa fa-tachometer"></i><span> ' + language.server_status_cpu_span + '</span></div>\
                                                </td>\
                                                <td>\
                                                    <div><i class="fa fa-microchip"></i><span> ' + language.server_status_mem_span + '</span></div>\
                                                </td>\
                                                <td>\
                                                    <div><i class="fa fa-arrow-circle-up upload-icon"></i><span> ' + language.server_status_upload_span + '</span></div>\
                                                </td>\
                                                <td>\
                                                    <div><i class="fa fa-arrow-circle-down download-icon"></i><span> ' + language.erver_status_download_span + '</span></div>\
                                                </td>\
                                            </tr>\
                                            <tr>\
                                                <td>\
                                                    <div id="server-status-' + k + '"></div>\
                                                </td>\
                                                <td>\
                                                    <div id="server-cpu-' + k + '"></div>\
                                                </td>\
                                                <td>\
                                                    <div id="server-mem-' + k + '"></div>\
                                                </td>\
                                                <td>\
                                                    <div id="server-upload-' + k + '"></div>\
                                                </td>\
                                                <td>\
                                                    <div id="server-download-' + k + '"></div>\
                                                </td>\
                                            </tr>\
                                        </tbody>\
                                    </table>\
                                    <div>\
                                        <div class="container">\
                                            <div class="row">\
                                                <div class="col-sm-6"><img src="./images/cpu.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.cpus[0].model + '</span></div>'
                                                + system_str + '\
                                            </div>\
                                            <div class="row">\
                                                <div class="col-sm-6"><img src="./images/memory.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + (parseInt(data.list[s].server.mem_total/10737418)/100) + "GB" + '</span></div>\
                                                <div class="col-sm-6"><img src="./images/nodejs.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.node_version + '</span></div>\
                                            </div>\
                                            <!-- <div class="row">\
                                                <div class="col-sm-6"><img src="./images/hdd.png" class="server-description-icon"></img>&nbsp;&nbsp;<span class="server-description">' + data.list[s].server.cpus[0].model + '</span></div>\
                                            </div> -->\
                                        </div>\
                                    </div>\
                                </div>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="tab-pane fade" id="app-page-' + k + '">\
                                <div>\
                                <div class="panel panel-info">\
                                <div class="panel-body">\
                                    <table id="app-table-' + k + '" class="table">\
                                        <thead>\
                                            <tr>\
                                                <td align="center">' + language.app_status_table_status + '</td>\
                                                <td align="center">' + language.app_status_table_pmid + '</td>\
                                                <td align="center">' + language.app_status_table_name + '</td>\
                                                <td align="center">' + language.app_status_table_pid + '</td>\
                                                <td align="center">' + language.app_status_table_runtime + '</td>\
                                                <td align="center">' + language.app_status_table_restart + '</td>\
                                                <td align="center">' + language.app_status_table_cpu + '(%)</td>\
                                                <td align="center">' + language.app_status_table_memory + '(MB)</td>\
                                                <td align="center">' + language.app_status_table_operate + '</td>\
                                            </tr>\
                                        </thead>\
                                        <tbody>\
                                        </tbody>\
                                    </table>\
                                </div>\
                                </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
            );
            //server page load
            var server = data.list[s].server;
            // console.log(server);
            
            if((data.timestamp - data.list[s].timestamp) < 3000)$('#server-status-' + k).html('<i class="fa fa-circle serviceStateOnline"><span class="serviceStateOnline"> ' + language.server_online_text  + '</span>');
            else $('#server-status-' + k).html('<i class="fa fa-circle serviceStateOffline"><span class="serviceStateOffline"> ' + language.server_offline_text  + '</span>');
            $('#server-cpu-' + k).html(server.cpu_usage + '%');
            $('#server-mem-' + k).html(parseInt((server.mem_used / server.mem_total) * 100) + '%');
            $('#server-upload-' + k).html('- mb/s');
            $('#server-download-' + k).html('- mb/s');
            //app page load
            var list = data.list[s].list;
            for (l in list) {
                switch(list[l].status){
                    case 'online':              list[l].online = '<i class="fa fa-circle appStateOnline"><span class="appStateOnline"> ' + language.app_status_table_status_online + '</span>';break;
                    case 'stopping':            list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_stopping + '</span>';break;
                    case 'stopped':             list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_stopped + '</span>';break;
                    case 'launching':           list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_launching + '</span>';break;
                    case 'errored':             list[l].online = '<i class="fa fa-circle appStateError"><span class="appStateError"> ' + language.app_status_table_status_errored + '</span>';break;
                    case 'one-launch-status':   list[l].online = '<i class="fa fa-circle appStateStop"><span class="appStateStop"> ' + language.app_status_table_status_olstatus + '</span>';break;
                    default:                    list[l].online = '<i class="fa fa-circle appStateUnknow"><span class="appStateUnknow"> ' + language.app_status_table_status_unknow + '</span>';
                }
                var total_s = (list[l].timestamp - list[l].uptime) / 1000;
                var day = parseInt(total_s / 86400);
                var afterDay = total_s - (day * 86400);
                var hour = parseInt(afterDay / 3600);
                var afterHour = afterDay - (hour * 3600);
                var minute = parseInt(afterHour / 60);
                $('#app-table-' + k).append(
                    '<tr>\
                    <td class="online" align="center">' + list[l].online + '</td>\
                    <td class="pmid" align="center">' + list[l].pmid + '</td>\
                    <td class="name" align="center">' + list[l].name + '</td>\
                    <td class="pid" align="center">' + list[l].pid + '</td>\
                    <td class="runtime" align="center">' + day.toString() + 'Day ' + hour.toString() + ':' + minute + '</td>\
                    <td class="restart" align="center">' + list[l].restart + '</td>\
                    <td class="cpu" align="center">' + list[l].cpu + '</td>\
                    <td class="memory" align="center">' + list[l].memory + '</td>\
                    <td class="button" align="center"><button class="btn btn-warning" data-toggle="modal" onclick="restart(this)">' + language.app_status_table_operate_restart_button + '</button></td>\
                </tr>'
                );
            }
            //service software page load
        }
        
    }
}

function restart(obj) {
    var obj = $(obj);
    var ip = obj.parent().parent().parent().parent().attr("id").replace(/-/g, '.');
    ip = ip.substring(10,ip.length);
    var pmid = obj.parent().parent().children("td.pmid").text();
    var con = confirm('Are you sure want to restart this application?\n' + 'IP:' + ip + '  PMID:' + pmid);
    if (con) {
        $.post('./server/serestart', { ip: ip, pmid: pmid, message: 'restart' }, function (data) {
            if (data.result == 0) {
                console.log('restart success');
                // $('#config-dialog').modal('hide');
            }
            else if (data.result == 1) {
                window.alert('No power');
                console.log('set config fail, no power');
            }
            else {
                console.log('set config fail, no login');
                parent.location.reload();
            }
        })
    }
}