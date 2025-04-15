import { Events } from "discord.js";
import { log } from "../helper/utils";
import { Client } from "../structs/client";

const weaponsJsonPath = "data/weapons.json";
const outputDir = "data/weapons/";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (!client.user || !client.application) return;
    log(`Logged in as ${client.user.tag} ${client.user.id}`.green);
    client.user.setActivity(`Solo Leveling`);
  },
};
/*

    try {
      await client.application.fetch(); 

      if (!fs.existsSync(weaponsJsonPath)) {
        console.error("❌ weapons.json not found!");
        return;
      }

      const weaponsData = JSON.parse(fs.readFileSync(weaponsJsonPath, "utf-8"));

      const emojiFiles = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith(".png"));

      for (const file of emojiFiles) {
        const filePath = path.join(outputDir, file);
        const emojiName = path.parse(file).name;

        const emojiBuffer = await fs.readFile(filePath);
        const emojiBase64 = `data:image/png;base64,${emojiBuffer.toString("base64")}`;

        const existingEmoji = client.application.emojis.cache.find(
          (e) => e.name === emojiName
        );

        if (existingEmoji) {
          log(`⚠️ Emoji ${emojiName} already exists, skipping.`);
          continue;
        }

        const newEmoji = await client.application.emojis.create({
          name: emojiName,
          attachment: emojiBase64,
        });

        log(`✅ Uploaded emoji: ${emojiName} (${newEmoji.id})`);

        const weaponEntry = weaponsData.find((weapon: any) => weapon.id == emojiName);
        if (weaponEntry) {
          weaponEntry.emojiId = newEmoji.id;
        }
      }

      fs.writeFileSync(weaponsJsonPath, JSON.stringify(weaponsData, null, 2));
      log("✅ weapons.json updated with emoji IDs!");
    } catch (err) {
      console.error(`❌ Error uploading emojis:`, err);
    }
       */
