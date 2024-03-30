export class PacketManager {
    packets: Function[] = [];

    constructor() {
        ;(async () => {
            this.register(1, await import("./PacketHelloPong"));
            this.register(10, await import("./PacketEncryptionRequest"));
            this.register(62, await import("./PacketPing"));
        })()
    }

    register(packetId: number, callback: { default: any }) {
        this.packets[packetId] = callback.default.default || callback.default; // There is a bun.js bug where it exports the default twice
    }
}