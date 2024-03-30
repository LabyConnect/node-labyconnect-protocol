import { constants, publicEncrypt, randomBytes } from "crypto";
import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";
import { yggdrasil } from "@minecraft-js/yggdrasil";
import { parseUUID } from "@minecraft-js/uuid";

// https://github.com/MinecraftJS/protocol-1.8/blob/main/src/utils/parsePublicKey.ts
// I luv u MinecraftJS <3
function parsePublicKey(buffer: Buffer): string {
    const arr = buffer.toString('base64').split('');
  
    for (let i = 0; i < arr.length; i++) if (i % 65 === 0) arr.splice(i, 0, '\n');
  
    return (
      '-----BEGIN PUBLIC KEY-----' + arr.join('') + '\n-----END PUBLIC KEY-----\n'
    );
}

export default async function(client: Client, data: PacketBuffer) {
    const serverId = data.readString();
    const publicKey = data.readBytes();
    const verifyToken = data.readBytes();
    const sharedSecret = randomBytes(16);

    const key = {
        key: parsePublicKey(publicKey),
        padding: constants.RSA_PKCS1_PADDING
    }

    await yggdrasil.join(client.accessToken, parseUUID(client.uuid), serverId, sharedSecret, publicKey)

    const packetBuffer = new PacketBuffer(Buffer.alloc(0));
    packetBuffer.writeBytes(publicEncrypt(key, sharedSecret));
    packetBuffer.writeBytes(publicEncrypt(key, verifyToken));
    client.sendPacket(11, packetBuffer)

    client.enableEncryption(sharedSecret)

    client.emit("encryptionRequest")
}