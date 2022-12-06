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
        <div class="pubg-game-menu-field-item pubg-game-menu-field-item-settings-mode">
            设置
        </div>
    </div>
</div>
`);
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.pubg-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.pubg-game-menu-field-item-multi-mode');
        this.$settings_mode = this.$menu.find('.pubg-game-menu-field-item-settings-mode');

        this.start();
    }
    
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi_mode.click(function(){

        });

        this.$settings_mode.click(function(){

        });
    }

    show() { //显示menu界面
        this.$menu.show();
    }

    hide() { //关闭menu界面
        this.$menu.hide();
    }
}

class PubgGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div>游戏界面</div>');

        this.hide();
        this.root.$game.append(this.$playground);

        this.start();
    }

    start() {
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }

}

class PubgGame {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        this.menu = new PubgGameMenu(this);
        this.playground = new PubgGamePlayground(this);

        this.start();

    }

    start() {
    }

}

