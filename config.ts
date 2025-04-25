import { ColorResolvable } from "discord.js";
import "dotenv/config";

export default {
  token: process.env.TOKEN || "",
  self: process.env.SELF,
  clientId: process.env.CLIENT_ID || "",
  embedColor: `#3f18b5` as ColorResolvable,
  admins: ["241445417831759872", "1346441316623712276"],
  vc: `https://discord.com/channels/1148824674449494047/1148824674915065939`,//`https://discord.com/channels/1237632107657039913/1237632109527699492`,
  animeApi: `https://hianimez.to`,
  adminRole: "1365372060867756032"
};
