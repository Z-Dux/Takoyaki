import { ColorResolvable } from "discord.js";
import "dotenv/config";

export default {
  token: process.env.TOKEN || "",
  self: process.env.SELF,
  clientId: process.env.CLIENT_ID || "",
  embedColor: `#3f18b5` as ColorResolvable,
  admins: ["241445417831759872", "1346441316623712276"]
};
