class PubgGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="pubg-game-menu">
</div>
`);
        this.root.$game.append(this.$menu);
    }
}

class PubgGame {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        this.menu = new PubgGameMenu(this);

    }
}

