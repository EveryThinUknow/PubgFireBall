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

