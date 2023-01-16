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
        <div class="pubg-game-menu-field-item pubg-game-menu-field-item-settings">
            退出游戏
        </div>
    </div>
</div>
`);
        this.$menu.hide();//访问时先进入登录或者注册界面，因此先关闭游戏菜单界面
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.pubg-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.pubg-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.pubg-game-menu-field-item-settings');

        this.start();
    }
    
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }

    show() { //显示menu界面
        this.$menu.show();
    }

    hide() { //关闭menu界面
        this.$menu.hide();
    }
}

//全局数组
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
        if (!obj.has_called_start){ //如果尚未执行start函数，执行一次
            obj.start();
            obj.has_called_start = true;
        } else { //已经执行过start函数，无需再次执行，直接更新画面
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(PUBG_GAME_ANIMATION);
}

//每秒调用60次
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

    start() {
        //canvans始终居中，超出canvas的边界截取掉
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
        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class Player extends PubgGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo){
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
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.spent_time = 0;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
        this.cur_skill = null;
    }

    start() {
        if (this.character === "me"){
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            } else if (e.which == 1) {
                if (outer.cur_skill == "fireball"){
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
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
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.35;
        let move_length = 1; //射程
        let damage = 0.01; //球半径是h*0.05 / scale,由于scale = this.height，所以damage = 0.01，攻击一次球变小
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
        this.radius -= damage;//被攻击后球变小
        //当球的半径小于eps像素时
        if (this.radius < this.eps) {
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
        this.update_move();
        this.render();
    }

    update_move() {//更新玩家的移动
        this.spent_time += this.timedelta / 1000;//冷静期，经过一定时间后，spent_time大于该时间，才能发射小球，不然一开始玩家就死了
        //让其它球随机发射炮弹
        if (this.character === "robot" && this.spent_time > 3 && Math.random() < 1 / 180.0) {
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
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height/ this.playground.scale;
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
    }


    render() {
        let scale = this.playground.scale;//定义成绝对值，每台电脑的窗口大小不一样，用绝对像素来生成击中效果
        //把图片切割成圆形作为头像
        if (this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
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
        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}

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


    show(mode) {
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new TheGameMap(this);
        //调整大小
        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "orange", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        
        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
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
        this.username = "";
        this.photo = "";

        //绘制登录界面UI
        this.$settings = $(`
<div class = "pubg-game-settings">
    <div class = "pubg-game-settings-login">
        <div class = "pubg-game-settings-title">
            登录
        </div>
        <div class = "pubg-game-settings-username">
            <div class = "pubg-game-settings-item">
                <input type = "text" placeholder = "Username">
            </div>
        </div>
        <div class = "pubg-game-settings-password">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Password">
            </div>
        </div>
        <div class = "pubg-game-settings-submit">
            <div class = "pubg-game-settings-item">
                <button>Login</button>
            </div>
        </div>
        <div class = "pubg-game-settings-error-message">
        </div>
        <div class = "pubg-game-settings-option">
            SignUp
        </div>
    </div>

    <div class = "pubg-game-settings-register">
        <div class = "pubg-game-settings-title">
            注册
        </div>
        <div class = "pubg-game-settings-username">
            <div class = "pubg-game-settings-item">
                <input type = "text" placeholder = "Input Username">
            </div>
        </div>
        <div class = "pubg-game-settings-password pubg-game-settings-password-first">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Input Password">
            </div>
        </div>
        <div class = "pubg-game-settings-password pubg-game-settings-password-second">
            <div class = "pubg-game-settings-item">
                <input type = "password" placeholder = "Input again">
            </div>
        </div>
        <div class = "pubg-game-settings-submit">
            <div class = "pubg-game-settings-item">
                <button>Sign Up</button>
            </div>
        </div>
        <div class = "pubg-game-settings-error-message">
        </div>
        <div class = "pubg-game-settings-option">
            Login
        </div>
    </div>

</div>
`);
        this.$login = this.$settings.find(".pubg-game-settings-login");
        //把登录，注册中的用户名，密码的字符串截取
        this.$login_username = this.$login.find(".pubg-game-settings-username input");
        this.$login_password = this.$login.find(".pubg-game-settings-password input");
        this.$login_submit   = this.$login.find(".pubg-game-settings-submit button");
        this.$login_error_message = this.$login.find(".pubg-game-settings-error-message");
        this.$login_register = this.$login.find(".pubg-game-settings-option");


        this.$login.hide();

        this.$register = this.$settings.find(".pubg-game-settings-register");
        this.$register_username = this.$register.find(".pubg-game-settings-username input");
        this.$register_password = this.$register.find(".pubg-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".pubg-game-settings-password-second input");
        this.$register_submit = this.$register.find(".pubg-game-settings-submit button");
        this.$register_error_message = this.$register.find(".pubg-game-settings-error-message");
        this.$register_login = this.$register.find(".pubg-game-settings-option");

        this.$register.hide();

        this.root.$game.append(this.$settings);
        this.start();
    }

    //判断是从acwing平台登入的app端口，还是网页端登录
    start() {
        if (this.platform === "ACAPP") {
            this.getinfo_app();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }
   //绑定监听函数
    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    //执行该函数，会从login
    add_listening_events_login() {
        let outer = this;

        //点击跳转按钮
        this.$login_register.click(function() {
            outer.register();
        });
        //点击登录按钮
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        //点击跳转按钮
        this.$register_login.click(function() {
            outer.login();
        });
        //点击注册按钮
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }


    //远程服务器登录
    login_on_remote() {
        let outer = this;
        //获取文本框中username,password的哈希值
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app4260.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },

            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload();//如果登陆成功，刷新一下
                }
                else {
                    //显出错误信息
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    //远程服务器注册
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app4260.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },

            success: function(resp) {
                if (resp.result == "success"){
                    location.reload(); //刷新界面，进入登陆状态
                }
                else {
                    //显示错误信息
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    //远程服务器登出
    logout_on_remote() {
        //若是在app分享平台网站登录，则可以直接关闭窗口退出，不需要点击退出按钮
        if(this.platform == "ACAPP") {
            this.root.AppOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app4260.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp) {
                    console.log(resp);
                    if (resp.result == "success") {
                        location.reload();
                    }
                }
            });
        }
    }

///////////////////////////////////

    //打开注册界面
    register() {
        this.$login.hide();
        this.$register.show();
    }

    //打开登录界面
    login() {
        this.$register.hide();
        this.$login.show();
    }

//用于app端口一键授权登录（web端不需要，测试功能，可注释掉）
    app_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AppOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

//从acwing的app共享平台登录，用getinfo_acapp（可注释掉）
    getinfo_app() {
        let outer = this;
        $.ajax({
            url: "https://app4260.acapp.acwing.com.cn/settings/redistest/app/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.app_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

//从web浏览器登录，用getinfo_web
    getinfo_web() {
        let outer = this;
        $.ajax({
            //通过urls找到urls.py的路由，再寻找到views里对应的函数，得到返回值
            url: "https://app4260.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            //resp是收到的传入的值（WEB或者ACAPP）
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else{
                    //没有登录，执行login函数，login函数会打开登录界面
                    outer.login();
                }
            }
        });
    }


    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
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

