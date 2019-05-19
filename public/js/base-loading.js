/*******************************************
 * 
 * 创建人：Quber（qubernet@163.com）
 * 创建时间：2014年6月10日
 * 创建说明：Base=>页面加载（loading）效果
 * 
 * 修改人：lu xi
 * 修改时间：2017年12月13日
 * 修改说明：修改加载动画效果
 * 
*********************************************/
var style = document.createElement('style');

style.type = 'text/css';
style.id = 'spinkit'
style.innerHTML = ".sk-three-bounce { margin: 40px auto;width: 80px;text-align: center; }" +
    ".sk-three-bounce .sk-child {width: 20px;height: 20px;background-color: #333;border-radius: 100%;display: inline-block;-webkit-animation: sk-three-bounce 1.4s ease-in-out 0s infinite both;animation: sk-three-bounce 1.4s ease-in-out 0s infinite both; }" +
    ".sk-three-bounce .sk-bounce1 {-webkit-animation-delay: -0.32s;animation-delay: -0.32s; }" +
    ".sk-three-bounce .sk-bounce2 { -webkit-animation-delay: -0.16s;animation-delay: -0.16s; }" +
    "@-webkit-keyframes sk-three-bounce {0%, 80%, 100% {-webkit-transform: scale(0);transform: scale(0); } 40% {-webkit-transform: scale(1);transform: scale(1); } }" +
    "@keyframes sk-three-bounce {0%, 80%, 100% {-webkit-transform: scale(0); transform: scale(0); } 40% {-webkit-transform: scale(1);transform: scale(1); } }";
document.getElementsByTagName('head').item(0).appendChild(style);

// 获取浏览器页面可见高度和宽度
var _PageHeight = document.documentElement.clientHeight,
    _PageWidth = document.documentElement.clientWidth;

// 计算loading框距离顶部和左部的距离（loading框的宽度为120px，高度为61px）
var _LoadingTop = _PageHeight > 60 ? (_PageHeight - 60) / 2 : 0,
    _LoadingLeft = _PageWidth > 100 ? (_PageWidth - 100) / 2 : 0;

// 在页面未加载完毕之前显示的loading Html自定义内容
var _LoadingHtml = '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:' + _PageHeight + 'px;top:0;background:#f3f8ff;opacity:1;filter:alpha(opacity=80);z-index:10000;"><div style="position: absolute; cursor1: wait; left: ' + _LoadingLeft + 'px; top:' + _LoadingTop + 'px; width: auto; height: 60px; ">' +
    '<div class="sk-three-bounce">' +
    '<div class="sk-child sk-bounce1"></div>' +
    '<div class="sk-child sk-bounce2"></div>' +
    '<div class="sk-child sk-bounce3"></div>' +
    '</div>' +
    '</div></div>';
// 呈现loading效果
document.write(_LoadingHtml);

// Add By ChengZhen
function hideSpinkitLoading() {
    $("#loadingDiv").fadeOut()
}

// Add By ChengZhen
function showSpinkitLoading() {
    $("#loadingDiv").show()
}

// 加载状态为complete时移除loading效果
function onPageStateChange() {
    if (document.readyState == "complete") {
        if($('.table-responsive').hasClass("table-responsive")){
            // $('html').on('all.bs.table', function (name, args) {
            //     console.log("all",name,args);
            // });

            $('html').on('page-change.bs.table refresh.bs.table search.bs.table', function () {
                // console.log("page-change or refresh or search");
                showSpinkitLoading();
            });

            $('html').on('load-success.bs.table', function () {
                console.log("load-success");
                hideSpinkitLoading();
            });
            
            // $('html').on('post-header.bs.table', function () {
            //     // console.log("post-header");
            //     hideSpinkitLoading();
            // });
        } else {
            // console.log("html");
            hideSpinkitLoading();
        }
    }
}

// 监听加载状态改变
document.onreadystatechange = onPageStateChange;