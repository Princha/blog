$(document).ready(function () {
    function chart_init(data) {
        var chart = echarts.init(document.getElementById('chart-div'));
        data = data;
        var dateList = data.map(function (item) {
            return item[0];
        });
        var valueList = data.map(function (item) {
            return item[1];
        });
        var axisLine = { show: true, lineStyle: { color: '#ddd' } }
        var splitLine = { show: true, lineStyle: { type: 'dotted', color: '#ddd' } }
        var axisLabel = { color: '#666' }
        var tooltip = { trigger: 'axis', textStyle: { fontSize: 11 } }
        var grid = { top: '32px', bottom: '40px', left: '56px', right: '32px' }
        var lineStyle = { normal: { color: '#0099cc88', width: 1 } }
        var option = {
            backgroundColor:'#fff',
            tooltip:tooltip,
            xAxis:[{
                axisLabel:axisLabel, axisLine:axisLine,data:dateList
            }],
            yAxis:[{
                splitNumber:4,splitLine:splitLine,axisLabel:axisLabel,axisLine:axisLine
            }],
            grid:[grid],
            series:[{
                type:'line',showSymbol:false,lineStyle:lineStyle,data:valueList
            }]
        };
        chart.setOption(option);
    }
    $('#search-button').click(function () {
        if($.trim($('#search-did-input').val()) == ''){
            window.alert(language.alert_didparams);
            return;
        }
        if($.trim($('#search-sname-input').val()) == ''){
            window.alert(language.alert_snameparams);
            return;
        }
        localStorage.search_id = $('#search-did-input').val();
        localStorage.search_name = $('#search-sname-input').val();
        var search_button_text = $('#search-button').text();
        var search_mode;
        $('#search-button').html('<i class="fa fa-spinner"></i>');
        // $('.search-bar-advanced-div').css('display', 'none');
        $('.chart-div').css('margin-top', '65px');
        $('#search-bar-advanced-radio').find('input').each(function (element) {
            if ($(this).parent().hasClass('active')) search_mode = $(this).attr("name");
            // console.log(search_type);
        });
        if (search_mode != '1h' && search_mode != '6h' && search_mode != '1d' && search_mode != '7d') search_type = '1h';
        $.get('./api/data_streams_group?search_id=' + $('#search-did-input').val() + '&search_sname=' + $('#search-sname-input').val() + '&search_mode=' + search_mode + '&page_num=1&page_size=1000&sort_by=at&sort=desc', function (result, status) {
            if (result.result == 0) {
                if(result.rows.length > 0){
                    $('#search-button').html(search_button_text);
                    $('.search-bar-div0').css('top', '60px');
                    $('.chart-div').css('display','-webkit-flex');
                    var rows = result.rows;
                    rows.reverse();
                    var data = [];
                    if(search_mode == '1h'){
                        for(var i in rows){
                            var date = new Date(rows[i].at).toLocaleString().replace(/:\d{1,2}$/,' ');
                            var value = rows[i].value;
                            data.push([date, value]);  
                        }
                    }else{
                        for(var i in rows){
                            var date = new Date(rows[i].at).toLocaleString().replace(/:\d{1,2}$/,' ');
                            var value = rows[i].avg;
                            data.push([date, value]);
                        }
                    }
                    chart_init(data);
                }else{
                    $('#search-button').html(search_button_text);
                    window.alert(language.alert_nomatches);
                }
                // console.log(data);
                
            } else if (result.result == -1) {
                console.error('get streams fail, please try again');
            } else {
                console.error('get streams fail, no power');
            }
        });
    });
});