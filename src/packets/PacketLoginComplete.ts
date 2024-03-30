import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";

export default function(client: Client, data: PacketBuffer) {
    client.emit("ready")
}