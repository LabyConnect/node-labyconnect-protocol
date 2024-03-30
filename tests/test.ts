import { test } from "uvu";
import { Client } from "../src/index";

const { Authflow, Titles } = (await import('prismarine-auth')).default

test("test", async () => {
    const flow = new Authflow("holybaechu", "./tests/cache", { authTitle: Titles.MinecraftNintendoSwitch, deviceType: 'Nintendo', flow: 'live' })
    const response = await flow.getMinecraftJavaToken({ fetchEntitlements: true, fetchProfile: true, fetchCertificates: true })

    const client = new Client(response.profile.id, response.profile.name, response.token);

    client.connect();
})

test.run()