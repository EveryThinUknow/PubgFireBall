class PubgGame {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        this.menu = new PubgGameMenu(this);

    }
}

