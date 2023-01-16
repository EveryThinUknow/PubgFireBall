class TheGameMap extends PubgGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $('<canvas></canvas>'); //js里的画布，渲染用
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
        this.$canvas.focus();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        //每次更新时，render，重涂模板,防止拖动时闪烁
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";//完全不透明
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; //0.2是透明度
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
