export class PubgGame {
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

