import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";

export default function(client: Client) {
    client.sendPacket(63, new PacketBuffer(Buffer.alloc(0)));
}