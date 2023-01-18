class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4260.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    //该前端函数接受后端接收到的group信息
    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            //将后端的字典数据类型转换成json给前端
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            //避免自己接收自己发出去的消息,uuid是收到的data里的id，outer.id是自己的
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                //发送到信息包括：所有玩家的id，name，photo
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event === "move_to"){
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
        };
    }

////////////编写联机函数//////////////
    //创建玩家函数
    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
    //创建玩家函数
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "green",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    //通过id寻找对应的player，后续同步各项操作需要找到对应的player
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++){
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }
        return null;
    }

    //同步移动函数
    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    //同步移动函数
    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        //如果找到了该player
        if (player) {
            player.move_to(tx, ty);
        }
    }

    //同步火球函数
    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    //同步火球函数
    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) { //如果有该player
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

}

