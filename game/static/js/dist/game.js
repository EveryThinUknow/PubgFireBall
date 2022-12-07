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

let PUBG_GAME_OBJECTS = [];

class PubgGameObject {
    constructor(){
        PUBG_GAME_OBJECTS.push(this);

        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前距离上一帧的时间间隔
    }

    start(){ //只在第一帧执行
    }

    update(){ //每一帧都执行
    }

    on_destroy(){ //在被删除前执行一次
    }

    destroy(){ //删掉该实体
        this.on_destroy();

        for (let i = 0; i < PUBG_GAME_OBJECTS.length; i ++){
            if (PUBG_GAME_OBJECTS[i] == this) {
                PUBG_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
//递归调用该函数
let PUBG_GAME_ANIMATION = function(timestamp) {

    for (let i = 0; i < PUBG_GAME_OBJECTS.length; i ++){
        let obj = PUBG_GAME_OBJECTS[i];
        if (!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(PUBG_GAME_ANIMATION);
}


requestAnimationFrame(PUBG_GAME_ANIMATION);





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

    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; //0.2是透明度
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }


}
class Player extends PubgGameObject {
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        
        this.cur_skill = null;
    }

    start() {
        if (this.is_me){
            this.add_listening_events();
        }
    }

    //添加鼠标操作事件
    add_listening_events(){
        let outer = this;
        //关闭鼠标右键菜单事件
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        //绑定鼠标点击时间
        this.playground.game_map.$canvas.mousedown(function(e){
            //鼠标右键是3，左键是1，滚轮是2
            if (e.which == 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which == 1) {
                if (outer.cur_skill == "fireball"){
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                //释放技能后，技能状态要恢复初始状态
                outer.cur_skill = null;
            }
        });
        //获取键盘指令
        $(window).keydown(function(e) {
            if (e.which == 81) { //q键
                outer.cur_skill = "fireball";
                return false;
            }

        });


    }
    //////////////////////////////////
    //发射一个火球
    shoot_fireball(tx, ty){
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.35;
        let move_length = this.playground.height * 1.5;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);

    }
    //求两点间的距离
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    //球体的移动位置
    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);//atan2(y, x),求与x轴的角度
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
        console.log("move to", tx, ty);
    }




    //////////////////////////////////
    update() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            //timedelta是毫秒，除以1000换成秒
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }

}

class FireBall extends PubgGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground =playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;
    }


    start(){
    }
    
    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }


        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }




}

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
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.25, true));

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

export class PubgGame {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        //this.menu = new PubgGameMenu(this);
        this.playground = new PubgGamePlayground(this);

        this.start();

    }

    start() {
    }

}

