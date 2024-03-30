import { Socket } from "net";
import { EventEmitter } from "events";
import { PacketManager } from "./packets/PacketManager";
import { PacketBuffer } from "./PacketBuffer";
import { Cipher, Decipher, createCipheriv, createDecipheriv } from "crypto";

export class Client extends EventEmitter {
    socket: Socket = new Socket();
    packetManager: PacketManager = new PacketManager();

    uuid: string;
    username: string;
    accessToken: string;

    // encryption and decryption kind of that stuff
    decipher?: Decipher;
    cipher?: Cipher;

    constructor(uuid: string, username: string, accessToken: string) {
        super();

        this.uuid = uuid;
        this.username = username;
        this.accessToken = accessToken;
        
        this.socket.on("connect", () => {
            // Send PacketHelloPing
            const packetBuffer = new PacketBuffer(Buffer.alloc(0));
            packetBuffer.writeLong(BigInt(Date.now()))
            packetBuffer.writeInt(24)

            this.sendPacket(0, packetBuffer);
        });

        this.socket.on("data", (d) => {
            if (this.decipher) d = this.decipher.update(d);

            let data = new PacketBuffer(d);

            const length = data.readVarInt();
            const packetId = data.readVarInt();

            const packetHandler = this.packetManager.packets[packetId];
            if (!packetHandler) return console.log(`Unknown packet id: ${packetId}`);

            packetHandler(this, data);
        });
        
        this.socket.on("close", () => {
            console.log("Socket closed");
        });
    }

    connect() {
        this.socket.connect(30336, "chat.labymod.net");
    }

    disconnect() {
        this.socket.end();
    }

    sendPacket(packetId: number, data: PacketBuffer) {
        const packetBuffer = new PacketBuffer(Buffer.alloc(0));
        packetBuffer.writeVarInt(packetId)
        packetBuffer.concat(data.buffer)

        const newPacketBuffer = new PacketBuffer(Buffer.alloc(0));
        newPacketBuffer.writeVarInt(packetBuffer.buffer.length)
        newPacketBuffer.concat(packetBuffer.buffer)

        if (this.cipher) {
            this.socket.write(this.cipher.update(newPacketBuffer.buffer));
        } else {
            this.socket.write(newPacketBuffer.buffer);
        }
    }

    enableEncryption(sharedSecret: Buffer) {
        this.decipher = createDecipheriv("aes-128-cfb8", sharedSecret, sharedSecret)
        this.cipher = createCipheriv("aes-128-cfb8", sharedSecret, sharedSecret)
    }
}