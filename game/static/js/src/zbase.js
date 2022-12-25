export class PubgGame {
    constructor(id, AppOS) {
        this.id = id;
        this.$game = $('#' + id);
        //传给app端口的参数
        this.AppOS = AppOS;
        this.settings = new PubgGameSettings(this);
        this.menu = new PubgGameMenu(this);
        this.playground = new PubgGamePlayground(this);

        this.start();

    }

    start() {
    }

}

