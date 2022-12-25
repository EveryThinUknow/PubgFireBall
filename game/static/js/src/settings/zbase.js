class PubgGameSettings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        //如果数据是从app端传过来的，那么会有一个名为AppOS的参数，则platform=acapp
        if (this.root.AppOS) this.platform = "ACAPP";

        this.start();
    }

//打开注册界面
    register() {
    
    }

    login() {
    
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
                    outer.hide();
                    outer.root.menu.show();
                } else{
                    outer.login();
                }
            }
        });
    }

    start() {
        this.getinfo();
    }

    hide() {
    
    }

    show() {
    
    }

}

