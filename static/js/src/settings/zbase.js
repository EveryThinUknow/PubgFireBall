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
    </div>
    <div class = "pubg-game-settings-register">
    </div>
</div>
`);
        this.$login = this.$settings.find(".pubg-game-settings-login");
        this.$login.hide();
        this.$register = this.$settings.find(".pubg-game-settings-register");
        this.$register.hide();
        this.root.$game.append(this.$settings);
        this.start();
    }

//打开注册界面
    register() {
        this.$login.hide();
        this.$register.show();
    }

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
                    outer.login();
                }
            }
        });
    }

    start() {
        this.getinfo();
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }

}

