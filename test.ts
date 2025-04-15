import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';
import { Message, Client } from "discord.js-selfbot-v13";
import { playStream, prepareStream, Utils } from '@dank074/discord-video-stream';
import { Streamer } from '@dank074/discord-video-stream';

const streamer = new Streamer(new Client());



const prefix = `.`,
    admins = [`241445417831759872`, `1088711089014968320`]
const config = {
    voiceChannelId: `1237632109527699492`,
    token: "OTQwMjM4NTkwNTUyNzE5Mzgw.GGP0Fp._4p5k-DMCMmixcsVOeR1UTVA1_Tlth1R7uloP8"
}
const client = streamer.client;
streamer.client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    admins.push(client.user.id);
});
(streamer.client as any).on("messageCreate", async(message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (!admins.includes(message.author.id)) return;

    //Join Voice channel
    if (command == `join`) {
        message.react(`🥱`)
        const id = args[0] || config.voiceChannelId;
        if (!id) return message.reply(`Please provide a voice channel ID or set it in the config.`);
        const channel = client.channels.cache.get(id);
        if (!channel) return message.reply(`Invalid voice channel ID.`);
        if (channel.type !== `GUILD_VOICE`) return message.reply(`This channel is not a voice channel.`);
        if (!channel.permissionsFor(client.user).has(`CONNECT`)) return message.reply(`I don't have permission to connect to this channel.`);
        if (!channel.permissionsFor(client.user).has(`SPEAK`)) return message.reply(`I don't have permission to speak in this channel.`);
        if (!channel.permissionsFor(client.user).has(`VIEW_CHANNEL`)) return message.reply(`I don't have permission to view this channel.`);
        if (!channel.permissionsFor(client.user).has(`USE_VAD`)) return message.reply(`I don't have permission to use VAD in this channel.`);
        if (!channel.permissionsFor(client.user).has(`STREAM`)) return message.reply(`I don't have permission to stream in this channel.`);

        // Join the channel
        const hlsUrl = 'https://ef.netmagcdn.com:2228/hls-playback/d8c0dc2ae338235f141319d29eb8c96c0f7fc25be42fe47928a66712a00196042aaccf5a14b0aee6a67683efe5a80e2f6814269dd78696070297dc88b57c56e16638eedc72c9d8208a74b01060850304ca6b4127bd7c7d646e21ad976579886938c4abd863456b39230b6cd861af64062cbe17a5642f43391813642d248faca3ab74ea6bbeb2097802b2c6993ddc5d5d/master.m3u8';
        const connection = await streamer.joinVoice(channel.guildId, channel.id);

        const { command, output } = prepareStream(hlsUrl, {
            height: 1080,
            frameRate: 30,
            bitrateVideo: 5000,
            bitrateVideoMax: 7500,
            videoCodec: Utils.normalizeVideoCodec("H264" /* or H265, VP9 */),
            h26xPreset: "ultrafast" // or superfast, ultrafast, ...
        });

        await playStream(output, streamer, {
            type: "go-live" // use "camera" for camera stream
        });


    }

});

await streamer.client.login(config.token);