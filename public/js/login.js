$(document).ready(function(){ 
    $("#submit").click(function(){ 
        var username = $("#username").val();
        var password = $("#password").val();
        if(username == ""){ 
            alert("用户名不能为空");
            // $("#username").css("border","1px solid red");                 
        }
        else if(password == ""){
            alert("密码不能为空");
            // $("#password").css("border","1px solid red");
        }
        else{
            var data = {'username':username,'password':password};
            $.ajax({ 
                url: '/',
                type: 'post',
                data: data,
                success:function(data){
                    if(data.result == "success"){
                        window.location.href='/';
                    }
                    else{
                        alert("用户名或密码错误！");
                    }
                },
                error: function() {
                    alert("失败，请稍后再试！");
                }
            }); 
        }
    });
});