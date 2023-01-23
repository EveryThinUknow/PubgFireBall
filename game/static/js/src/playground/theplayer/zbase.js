class Player extends PubgGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo){

        console.log(character, username, photo);

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
        this.move_length = 0;
        this.radius = radius;//半径
        this.color = color;//robot的颜色
        this.speed = speed;//火球和玩家运行的速度
        this.character = character;//player的类型：玩家，其他玩家，robot
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.spent_time = 0;
        this.fireballs = [];//所有players发出的火球

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_breaktime = 3;
        }

        this.cur_skill = null;
    }

    start() {
        //每添加一个游戏对象，player_count +1
        this.playground.player_count ++;
        this.playground.room_notice_board.write("Ready Player: " + this.playground.player_count);
        //多人模式下判断游戏开始
        if (this.playground.player_count >= 3) {
            this.playground.room_state = "starting";
            this.playground.room_notice_board.write("live to the end");
        }

        if (this.character === "me"){
            this.add_listening_events();
        } else if (this.character === "robot") {
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
        //游戏阶段，绑定各个鼠标点击事件
        this.playground.game_map.$canvas.mousedown(function(e){
            if (outer.playground.room_state !== "starting")
                return false;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            //鼠标右键是3，左键是1，滚轮是2
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                //单机模式跳过，如果是多人模式
                if(outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);//广播自己的移动
                }

            } else if (e.which === 1) {
                //只有当技能冷却时间为0，才可以操作技能
                if (outer.fireball_breaktime > outer.eps)
                    return false;

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball"){
                    let fireball = outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                //释放技能后，技能状态要恢复初始状态
                outer.cur_skill = null;
            }
        });
        //获取键盘指令
        $(window).keydown(function(e) {
            if (outer.playground.room_state !== "starting")
                return false;

            //只有当冷却时间为0时，才可发射
            if (outer.fireball_breaktime > outer.eps)
                return false;

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
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);//本player发出的fireball
        this.fireballs.push(fireball);//将该fireball加到所有的fireball的集合数组中
        this.fireball_breaktime = 3;//释放技能后，刷新冷却时间

        return fireball;
    }

    //联机中通过uuid来删除玩家的火球,当击中或者飞行一段距离后执行该函数
    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
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
    //如果多人模式被攻击，另行操作，需要同步坐标
    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        attacker.destroy_fireball(ball_uuid);//删除击中player的炮弹
        //同步被攻击者的坐标，因为可能有延迟，每个player画面中被攻击者的坐标不一样
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }


    //////////////////////////////////
    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.room_state === "starting") {
            this.update_breaktime();
        }

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

    //更新冷却时间
    update_breaktime() {
        this.fireball_breaktime -= this.timedelta /1000;
        this.fireball_breaktime = Math.max(this.fireball_breaktime, 0);
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
                break;
            }
        }
    }

}

