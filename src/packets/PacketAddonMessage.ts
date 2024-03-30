import { gunzipSync } from "zlib";
import { Client } from "../Client";
import { PacketBuffer } from "../PacketBuffer";

function getJson(data: Buffer) {
    if (!data || data.length === 0) {
        return '';
    }
  
    return JSON.parse(gunzipSync(data).toString());
}

export default function(client: Client, data: PacketBuffer) {
    client.emit("addonMessage", data.readString(), getJson(data.readBytes()))
}