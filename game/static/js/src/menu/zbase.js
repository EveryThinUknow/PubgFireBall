class PubgGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="pubg-game-menu">
    <div class="pubg-game-menu-field">
        <div class="pubg-game-menu-field-item pubg-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="pubg-game-menu-field-item pubg-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="pubg-game-menu-field-item pubg-game-menu-field-item-settings">
            退出游戏
        </div>
    </div>
</div>
`);
        this.$menu.hide();//访问时先进入登录或者注册界面，因此先关闭游戏菜单界面
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.pubg-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.pubg-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.pubg-game-menu-field-item-settings');

        this.start();
    }
    
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }

    show() { //显示menu界面
        this.$menu.show();
    }

    hide() { //关闭menu界面
        this.$menu.hide();
    }
}

