import { test } from "uvu";
import { Client } from "../src/index";
import { gzipSync } from "zlib";
import { PacketBuffer } from "../src/PacketBuffer";

const { Authflow, Titles } = (await import('prismarine-auth')).default

function addDashes(uuid: string): string {
    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`
}

function toBytes(str) {
    return gzipSync(Buffer.from(str, 'utf-8'));
}

test("test", async () => {
    const flow = new Authflow("holybaechu", "./tests/cache", { authTitle: Titles.MinecraftNintendoSwitch, deviceType: 'Nintendo', flow: 'live' })
    const response = await flow.getMinecraftJavaToken({ fetchEntitlements: true, fetchProfile: true, fetchCertificates: true })

    const client = new Client(addDashes(response.profile.id), response.profile.name, response.token);

    client.on("ready", async () => {
        const packetBuffer = new PacketBuffer(Buffer.alloc(0));
        packetBuffer.writeString("dashboard_pin")
        packetBuffer.writeBytes(toBytes("{}"))

        client.sendPacket(32, packetBuffer);
    })

    client.connect();
})

test.run()