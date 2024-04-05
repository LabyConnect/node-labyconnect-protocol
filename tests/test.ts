import { test } from "uvu";
import { Client, Status } from "../src/index";
import { gzipSync } from "zlib";
import { PacketBuffer } from "../src/PacketBuffer";
import { getMinecraftJavaToken, xblAuthenticate } from "@labyconnect/mcauth";
import { config } from "dotenv";

config();

function addDashes(uuid: string): string {
    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`
}

function toBytes(str) {
    return gzipSync(Buffer.from(str, 'utf-8'));
}

test("test", async () => {
    const xsts = await xblAuthenticate(process.env.MS_EMAIL || "", process.env.MS_PASSWORD || "")
    const minecraftToken = await getMinecraftJavaToken(xsts, true)

    const client = new Client(addDashes(minecraftToken.profile.id), minecraftToken.profile.name || "", minecraftToken.token, {
        status: Status.BUSY
    });

    let pin = null;

    client.on("ready", async () => {
        console.log("Client is ready");

        const packetBuffer = new PacketBuffer(Buffer.alloc(0));
        packetBuffer.writeString("dashboard_pin")
        packetBuffer.writeBytes(toBytes("{}"))

        client.sendPacket(32, packetBuffer);
    })

    client.on("addonMessage", (key, data) => {
        if (key === "dashboard_pin") pin = data.pin;
    })

    client.connect();

    while (!pin) await new Promise(resolve => setTimeout(resolve, 100));

    console.log("Pin is", pin)
})

test.run()