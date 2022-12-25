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
        this.$menu.hide();
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
class Particle extends PubgGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.move_length = move_length;
        this.eps = 1;
    }

    start(){
    }

    update(){
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }
        //最后一帧的移动距离不一定大于▲t时间内移动的量，这时候以剩余值为最后帧数的移动长
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
        //受到伤害时速度会变化
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9; //摩擦力
        /////
        this.move_length = 0;
        this.radius = radius
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.spent_time = 0;

        this.cur_skill = null;
    }

    start() {
        if (this.is_me){
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
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
            const rect = outer.ctx.canvas.getBoundingClientRect();
            //鼠标右键是3，左键是1，滚轮是2
            if (e.which == 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which == 1) {
                if (outer.cur_skill == "fireball"){
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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
        let move_length = this.playground.height * 1; //射程
        let damage = this.playground.height * 0.01; //球半径是h*0.05，攻击一次球变小
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);

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

    //player的球体被击中
    is_attacked(angle, damage) {
        this.radius -= damage;//被攻击后球变小
        //释放烟花particle
        for (let i = 0; i < 20 + Math.random() * 5; i ++) {
             let x = this.x, y = this.y;
             let radius = this.radius * Math.random() * 0.1; //烟花球是该球半径十分之一大小的0-1倍
             let angle = Math.PI * 2 * Math.random();//轨迹随机角度释放
             let vx = Math.cos(angle), vy = Math.sin(angle);
             let color = this.color;
             let speed = this.speed * 8;
             let move_length = this.radius * Math.random() * 5;
             new Particle (this.playground, x, y, radius, vx, vy, color, speed, move_length);
         }
        //当球的半径小于10像素时
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 200;
        this.speed *= 0.9;
    }


    //////////////////////////////////
    update() {
        this.spent_time += this.timedelta / 1000;//冷静期，经过一定时间后，spent_time大于该时间，才能发射小球，不然一开始玩家就死了
        //让其它球随机发射炮弹
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / 180.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];//随机向某个player射击
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.4;//预判0.4s后的位置
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.4;
            this.shoot_fireball(tx, ty);//对预判位置射击
        }
        if (this.damage_speed > this.eps) {
            //停止原来的路线，vx和vy和剩余路径长度move_length初始化为0
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                //timedelta是毫秒，除以1000换成秒
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    //player死去后要pop掉
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
            }
        }
    }

}

class FireBall extends PubgGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
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
        this.damage = damage;
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

        //判断攻击有没有触碰到球体
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    //判断球和攻击（火球等）是否碰撞
    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);

        this.destroy();

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

        this.hide();

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
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new TheGameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "orange", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

    }

    hide() {
        this.$playground.hide();
    }

}

class PubgGameSettings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        //如果数据是从app端传过来的，那么会有一个名为AppOS的参数，则platform=acapp
        if (this.root.AppOS) this.platform = "ACAPP";

        this.start();
    }

//打开注册界面
    register() {
    
    }

    login() {
    
    }


    getinfo() {
        let outer = this;
        $.ajax({
            url: "http://121.4.44.128:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            //resp是收到的传入的值（WEB或者ACAPP）
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    outer.hide();
                    outer.root.menu.show();
                } else{
                    outer.login();
                }
            }
        });
    }

    start() {
        this.getinfo();
    }

    hide() {
    
    }

    show() {
    
    }

}

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

