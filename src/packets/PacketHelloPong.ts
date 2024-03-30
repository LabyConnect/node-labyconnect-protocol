import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";

export default function(client: Client, data: PacketBuffer) {
    let packetBuffer = new PacketBuffer(Buffer.alloc(0));

    // PacketLoginVersion
    packetBuffer.writeInt(29) // Protocol version
    packetBuffer.writeString("1.20.4_4.2.6") // Game version_LabyMod version
    packetBuffer.writeString("") // Beta Key (deprecated, empty string)
    packetBuffer.writeInt(765) // Minecraft Protocol version
    client.sendPacket(9, packetBuffer)

    // PacketLoginData
    packetBuffer = new PacketBuffer(Buffer.alloc(0))
    packetBuffer.writeString(client.uuid) // UUID
    packetBuffer.writeString(client.username) // Username
    packetBuffer.writeString("") // Status Message (deprecated, empty string)
    client.sendPacket(3, packetBuffer)

    // PacketLoginOptions
    packetBuffer = new PacketBuffer(Buffer.alloc(0))
    packetBuffer.writeBoolean(false) // Show connected server
    packetBuffer.writeInt(0) // Status
    packetBuffer.writeString(Intl.DateTimeFormat().resolvedOptions().timeZone) // Timezone ID 
    client.sendPacket(6, packetBuffer)
}