class PubgGamePlayground {
    constructor(root) {
        this.root = root;
        //jquery的引用索引
        this.$playground = $('<div class="pubg-game-playground"></div>');

        this.hide();
        this.root.$game.append(this.$playground);
        this.start();
    }

    //随机分配小球颜色
    get_random_color() {
        let colors = ["blue", "red", "green", "white", "grey", "pink", "yellow"];
        return colors[Math.floor(Math.random() * 7)];//下取整
    }

    start() {
        let outer = this;
        //window函数的作用是每次调整窗口大小都执行一下resize函数
        $(window).resize(function(){
            outer.resize();
        });
    }

    //动态调整画面的长宽比,此函数在show中和start中执行
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // 16 : 9
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        //调整画布的基准
        this.scale = this.height;

        //调整画布的size
        if (this.game_map) {
            this.game_map.resize();
        }
    }


    show() {
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new TheGameMap(this);
        //调整大小
        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "orange", 0.15, true));

        for (let i = 0; i < 5; i ++){
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));
        }

    }

    hide() {
        this.$playground.hide();
    }

}

