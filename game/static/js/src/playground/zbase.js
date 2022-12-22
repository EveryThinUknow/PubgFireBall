class PubgGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div class="pubg-game-playground"></div>');

        //this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new TheGameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "orange", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }


        this.start();
    }

    //随机分配小球颜色
    get_random_color() {
        let colors = ["blue", "red", "green", "white", "grey"];
        return colors[Math.floor(Math.random() * 5)];//下取整
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

