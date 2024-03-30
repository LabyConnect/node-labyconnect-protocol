import { randomBytes } from "crypto";
import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";
import yggdrasil from "yggdrasil";

const server = yggdrasil.server({
    
})

export default async function(client: Client, data: PacketBuffer) {
    console.log("Enabling encryption...")

    const serverId = data.readString();
    const publicKey = data.readBytes();
    const verifyToken = data.readBytes();
    const sharedSecret = randomBytes(16);
}