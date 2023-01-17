class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4260.acapp.acwing.com.cn/wss/multiplayer/");

        start();
    }

}
    start() {
    }
