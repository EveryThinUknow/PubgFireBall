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
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

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

}

