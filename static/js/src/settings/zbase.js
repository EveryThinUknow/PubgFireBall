class PubgGameSettings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        //如果数据是从app端传过来的，那么会有一个名为AppOS的参数，则platform=acapp
        if (this.root.AppOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        //绘制登录界面UI
        this.$settings = $(`
<div class = "pubg-game-settings">
    <div class = "pubg-game-settings-login">
        <div class = "pubg-game-settings-title">
            登录账号
        </div>
        <div class = "pubg-game-settings-username">
            <div class = "pubg-game-settings-item">
                <input type = "text" placeholder = "Username">
            </div>
        </div>
        <div class = "pubg-game-settings-password">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Password">
            </div>
        </div>
        <div class = "pubg-game-settings-submit">
            <div class = "pubg-game-settings-item">
                <button>Login</button>
            </div>
        </div>
        <div class = "pubg-game-settings-error-message">
        </div>
        <div class = "pubg-game-settings-option">
            SignUp
        </div>
    </div>

    <div class = "pubg-game-settings-register">
        <div class = "pubg-game-settings-title">
            注册
        </div>
        <div class = "pubg-game-settings-username">
            <div class = "pubg-game-settings-item">
                <input type = "text" placeholder = "Input Username">
            </div>
        </div>
        <div class = "pubg-game-settings-password pubg-game-settings-password-first">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Input Password">
            </div>
        </div>
        <div class = "pubg-game-settings-password pubg-game-settings-password-second">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Input again">
            </div>
        </div>
        <div class = "pubg-game-settings-submit">
            <div class = "pubg-game-settings-item">
                <button>Sign Up</button>
            </div>
        </div>
        <div class = "pubg-game-settings-error-message">
        </div>
        <div class = "pubg-game-settings-option">
            Login
        </div>
    </div>

</div>
`);
        this.$login = this.$settings.find(".pubg-game-settings-login");
        //把登录，注册中的用户名，密码的字符串截取
        this.$login_username = this.$login.find(".pubg-game-settings-username input");
        this.$login_password = this.$login.find(".pubg-game-settings-password input");
        this.$login_submit   = this.$login.find(".pubg-game-settings-submit button");
        this.$login_error_message = this.$login.find(".pubg-game-settings-error-message");
        this.$login_register = this.$login.find(".pubg-game-settings-option");


        this.$login.hide();

        this.$register = this.$settings.find(".pubg-game-settings-register");
        this.$register_username = this.$register.find(".pubg-game-settings-username input");
        this.$register_password = this.$register.find(".pubg-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".pubg-game-settings-password-second input");
        this.$register_submit = this.$register.find(".pubg-game-settings-submit button");
        this.$register_error_message = this.$register.find(".pubg-game-settings-error-message");
        this.$register_login = this.$register.find(".pubg-game-settings-option");

        this.$register.hide();
        this.root.$game.append(this.$settings);
        this.start();
    }

    //绑定监听函数
    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    //执行该函数，会从login
    add_listening_events_login() {
        let outer = this;

        //点击跳转按钮
        this.$login_register.click(function() {
            outer.register();
        });
        //点击登录按钮
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        //点击跳转按钮
        this.$register_login.click(function() {
            outer.login();
        });
        //点击注册按钮
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    //远程服务器登录
    login_on_remote() {
        let outer = this;
        //获取文本框中username,password的哈希值
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "http://121.4.44.128:8000/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },

            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload();//如果登陆成功，刷新一下
                }
                else {
                    //显出错误信息
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    //远程服务器注册
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "http://121.4.44.128:8000/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },

            success: function(resp) {
                if (resp.result == "success"){
                    location.reload(); //刷新界面，进入登陆状态
                }
                else {
                    //显示错误信息
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }


    //远程服务器登出
    logout_on_remote() {
        //若是在app分享平台网站登录，则可以直接关闭窗口退出，不需要点击退出按钮
        if(this.platform == "ACAPP") return false;

        $.ajax({
            url: "http://121.4.44.128:8000/settings/logout/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload();
                }
            }
        });
    }


    //打开注册界面
    register() {
        this.$login.hide();
        this.$register.show();
    }

//打开登录界面
    login() {
        this.$register.hide();
        this.$login.show();
    }


    getinfo() {
        let outer = this;
        $.ajax({
            url: "http://121.4.44.128:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            //resp是收到的传入的值（WEB或者ACAPP）
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else{
                    //没有登录，执行login函数，login函数会打开登录界面
                    outer.register();
                }
            }
        });
    }

//启动时执行的函数
    start() {
        this.getinfo();
        this.add_listening_events();
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }

}

