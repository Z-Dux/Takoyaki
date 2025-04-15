import { 
  Client, 
  Message,
  Events,
  TextChannel
} from "discord.js";
import { IStorage } from "../storage";
import { 
  createMatchEmbed, 
  createUpcomingMatchesEmbed, 
  createHelpEmbed,
  createPointsTableEmbed,
  createTeamEmbed,
  createScheduleEmbed
} from "./embeds";
import { 
  getCurrentMatch, 
  getCricketMatches, 
  getPointsTable, 
  getSchedule,
  getTeamInfo
} from "../services/cricketApi";
import { insertSubscriptionSchema } from "@shared/schema";

// Command prefix
const PREFIX = '!';

type CommandHandler = (message: Message, args: string[]) => Promise<void>;

export async function registerCommands(client: Client, storage: IStorage): Promise<void> {
  console.log("Bot is now ready to respond to commands with prefix:", PREFIX);

  // Command handlers
  const commandHandlers = new Map<string, CommandHandler>();
  
  commandHandlers.set("current", async (message, args) => {
    try {
      // Show loading indicator
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const loadingMsg = await textChannel.send("Fetching current match data...");
      
      const match = await getCurrentMatch();
      
      if (!match) {
        await loadingMsg.edit("No live matches are currently in progress.");
        return;
      }
      
      const embed = createMatchEmbed(match);
      await loadingMsg.edit({ content: " ", embeds: [embed] });
    } catch (error) {
      console.error("Error with current command:", error);
      await message.reply("Sorry, I couldn't fetch the current match information. Please try again later.");
    }
  });
  
  commandHandlers.set("upcoming", async (message, args) => {
    try {
      // Show loading indicator
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const loadingMsg = await textChannel.send("Fetching upcoming matches...");
      
      const matches = await getCricketMatches("upcoming");
      
      if (!matches || matches.length === 0) {
        await loadingMsg.edit("No upcoming matches found.");
        return;
      }
      
      const embed = createUpcomingMatchesEmbed(matches);
      await loadingMsg.edit({ content: " ", embeds: [embed] });
    } catch (error) {
      console.error("Error with upcoming command:", error);
      await message.reply("Sorry, I couldn't fetch the upcoming matches. Please try again later.");
    }
  });
  
  commandHandlers.set("schedule", async (message, args) => {
    try {
      // Show loading indicator
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const loadingMsg = await textChannel.send("Fetching schedule...");
      
      const schedule = await getSchedule();
      
      if (!schedule || schedule.length === 0) {
        await loadingMsg.edit("No schedule information found.");
        return;
      }
      
      const embed = createScheduleEmbed(schedule);
      await loadingMsg.edit({ content: " ", embeds: [embed] });
    } catch (error) {
      console.error("Error with schedule command:", error);
      await message.reply("Sorry, I couldn't fetch the schedule. Please try again later.");
    }
  });
  
  commandHandlers.set("team", async (message, args) => {
    try {
      if (args.length === 0) {
        await message.reply("Please specify a team name or code. Example: `!team CSK`");
        return;
      }
      
      // Show loading indicator
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const loadingMsg = await textChannel.send(`Fetching information for team ${args.join(' ')}...`);
      
      const teamCode = args.join(' ');
      const teamInfo = await getTeamInfo(teamCode);
      
      if (!teamInfo) {
        await loadingMsg.edit(`Team "${teamCode}" not found. Please check the team name or use abbreviations like CSK, MI, RCB, etc.`);
        return;
      }
      
      const embed = createTeamEmbed(teamInfo);
      await loadingMsg.edit({ content: " ", embeds: [embed] });
    } catch (error) {
      console.error("Error with team command:", error);
      await message.reply("Sorry, I couldn't fetch the team information. Please try again later.");
    }
  });
  
  commandHandlers.set("points", async (message, args) => {
    try {
      // Show loading indicator
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const loadingMsg = await textChannel.send("Fetching points table...");
      
      const points = await getPointsTable();
      
      if (!points || points.length === 0) {
        await loadingMsg.edit("Points table information not available.");
        return;
      }
      
      const embed = createPointsTableEmbed(points);
      await loadingMsg.edit({ content: " ", embeds: [embed] });
    } catch (error) {
      console.error("Error with points command:", error);
      await message.reply("Sorry, I couldn't fetch the points table. Please try again later.");
    }
  });
  
  commandHandlers.set("subscribe", async (message, args) => {
    try {
      const channelId = message.channelId;
      const guildId = message.guildId;
      
      if (!channelId || !guildId) {
        await message.reply("This command can only be used in a server channel.");
        return;
      }
      
      const existingSubscription = await storage.getSubscription(channelId);
      
      if (existingSubscription) {
        await message.reply("This channel is already subscribed to match updates!");
        return;
      }
      
      const subscriptionData = {
        channelId: channelId,
        guildId: guildId
      };
      
      const validatedData = insertSubscriptionSchema.parse(subscriptionData);
      await storage.createSubscription(validatedData);
      
      await message.reply(
        "✅ Successfully subscribed to IPL match updates in this channel! You will receive:\n" +
        "• Pre-match notifications 30 minutes before each game\n" +
        "• Live score updates every 5 minutes during matches\n" +
        "• End of match summaries\n\n" +
        "Use `!unsubscribe` to stop receiving updates."
      );
    } catch (error) {
      console.error("Error with subscribe command:", error);
      await message.reply("Sorry, I couldn't complete the subscription. Please try again later.");
    }
  });
  
  commandHandlers.set("unsubscribe", async (message, args) => {
    try {
      const channelId = message.channelId;
      
      if (!channelId) {
        await message.reply("This command can only be used in a server channel.");
        return;
      }
      
      const existingSubscription = await storage.getSubscription(channelId);
      
      if (!existingSubscription) {
        await message.reply("This channel is not subscribed to match updates!");
        return;
      }
      
      await storage.deleteSubscription(channelId);
      
      await message.reply("✅ Successfully unsubscribed from IPL match updates in this channel.");
    } catch (error) {
      console.error("Error with unsubscribe command:", error);
      await message.reply("Sorry, I couldn't unsubscribe this channel. Please try again later.");
    }
  });
  
  commandHandlers.set("help", async (message, args) => {
    try {
      if (!message.channel.isTextBased()) return;
      
      const textChannel = message.channel as TextChannel;
      const embed = createHelpEmbed();
      await textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error with help command:", error);
      await message.reply("Sorry, I couldn't show the help information. Please try again later.");
    }
  });

  // Register message handler for prefix commands
  client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots or messages that don't start with the prefix
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Extract command and arguments
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    
    if (!commandName) return;
    
    const handler = commandHandlers.get(commandName);
    if (!handler) {
      await message.reply(`Unknown command. Type \`${PREFIX}help\` to see available commands.`);
      return;
    }
    
    try {
      await handler(message, args);
    } catch (error) {
      console.error(`Error handling command ${commandName}:`, error);
      await message.reply("Sorry, an error occurred while processing your command.");
    }
  });
}
