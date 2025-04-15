import { Client, Events, GatewayIntentBits, IntentsBitField, TextChannel } from "discord.js";
import { registerCommands } from "./commands";
import { IStorage } from "../storage";
import { getCurrentMatch } from "../services/cricketApi";
import * as cron from "node-cron";
import { createMatchEmbed } from "./embeds";

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
] });

let storage: IStorage;

export async function initializeBot(storageImpl: IStorage): Promise<void> {
  storage = storageImpl;
  
  // Check if token is available
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  
  if (!token) {
    console.error("Discord bot token not found! Bot will not be initialized.");
    return;
  }
  
  if (!clientId) {
    console.error("Discord client ID not found! Bot will not be initialized properly.");
    return;
  }

  try {
    // Register event handlers
    client.once(Events.ClientReady, readyClient => {
      console.log(`Bot logged in as ${readyClient.user.tag}`);
      setupUpdateSchedule();
    });
    
    // Register command handlers
    try {
      await registerCommands(client, storage);
    } catch (commandError) {
      console.error("Failed to register Discord commands, but continuing bot initialization:", commandError);
    }
    
    // Login to Discord with token
    await client.login(token);
  } catch (error) {
    console.error("Failed to initialize Discord bot:", error);
    throw error;
  }
}

function setupUpdateSchedule(): void {
  // Update live match scores every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const subscriptions = await storage.getSubscriptions();
      if (subscriptions.length === 0) return;
      
      const currentMatch = await getCurrentMatch();
      if (!currentMatch || !currentMatch.isLive) return;
      
      const matchEmbed = createMatchEmbed(currentMatch);
      
      // Send updates to all subscribed channels
      for (const subscription of subscriptions) {
        try {
          const channel = await client.channels.fetch(subscription.channelId);
          if (channel?.isTextBased()) {
            // Using type assertion to ensure TypeScript recognizes the send method
            await (channel as TextChannel).send({ 
              content: "🔴 **LIVE MATCH UPDATE**",
              embeds: [matchEmbed] 
            });
          }
        } catch (err) {
          console.error(`Failed to send update to channel ${subscription.channelId}:`, err);
        }
      }
    } catch (error) {
      console.error("Error in update schedule:", error);
    }
  });
}

export function getBot(): Client {
  return client;
}
