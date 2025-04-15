import { EmbedBuilder, ColorResolvable } from "discord.js";
import { 
  CricketMatch, 
  PointsTableEntry, 
  TeamInfo, 
  TeamColors
} from "../services/cricketApi";

// Colors
const COLORS = {
  primary: "#1DB954",
  accent: "#5865F2",
  yellow: "#FFC107",
};

export function createMatchEmbed(match: CricketMatch): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary as ColorResolvable)
    .setTitle(`🏏 ${match.isLive ? 'LIVE: ' : ''}${match.title}`)
    .setTimestamp();

  // Team information
  const teamContent = [];
  teamContent.push(
    `**${match.team1.name}**\n${match.team1.score || 'Yet to bat'}`
  );
  
  teamContent.push(
    `**${match.team2.name}**\n${match.team2.score || 'Yet to bat'}`
  );

  embed.addFields({ name: 'Teams', value: teamContent.join('\n\n') });

  // Match status
  if (match.status) {
    embed.addFields({ name: 'Status', value: match.status });
  }

  // Recent balls if available
  if (match.recentBalls && match.recentBalls.length > 0) {
    embed.addFields({
      name: 'RECENT BALLS',
      value: match.recentBalls.join(' ')
    });
  }

  // Batsmen and bowler information if available
  if (match.batsmen && match.batsmen.length > 0) {
    const batsmenInfo = match.batsmen
      .map(b => `${b.name}: ${b.runs} (${b.balls})`)
      .join('\n');
      
    embed.addFields({ name: 'BATSMEN', value: batsmenInfo });
  }

  if (match.bowler) {
    embed.addFields({ 
      name: 'BOWLER', 
      value: `${match.bowler.name}: ${match.bowler.wickets}/${match.bowler.runs} (${match.bowler.overs})` 
    });
  }

  // Footer with last updated time
  embed.setFooter({ 
    text: `Last updated: ${match.lastUpdated} • Auto-refreshing every 1 minute` 
  });

  return embed;
}

export function createUpcomingMatchesEmbed(matches: CricketMatch[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.accent as ColorResolvable)
    .setTitle('📅 Upcoming IPL Matches')
    .setTimestamp();

  if (matches.length === 0) {
    embed.setDescription('No upcoming matches scheduled at the moment.');
    return embed;
  }

  // Add up to 5 upcoming matches
  const matchesToShow = matches.slice(0, 5);
  for (const match of matchesToShow) {
    embed.addFields({
      name: `${match.team1.name} vs ${match.team2.name}`,
      value: `${match.dateTime}${match.venue ? ` • ${match.venue}` : ''}`
    });
  }

  if (matches.length > 5) {
    embed.setFooter({ 
      text: `Use !schedule for the full tournament schedule` 
    });
  }

  return embed;
}

export function createScheduleEmbed(matches: CricketMatch[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.accent as ColorResolvable)
    .setTitle('📆 IPL Tournament Schedule')
    .setTimestamp();

  if (matches.length === 0) {
    embed.setDescription('No scheduled matches found.');
    return embed;
  }

  // Group matches by date
  const matchesByDate = new Map<string, CricketMatch[]>();
  
  for (const match of matches) {
    const date = match.dateTime.split('at')[0].trim();
    if (!matchesByDate.has(date)) {
      matchesByDate.set(date, []);
    }
    matchesByDate.get(date)?.push(match);
  }

  // Add matches grouped by date (limit to fit in Discord embed)
  let count = 0;
  // Convert the entries to an array to avoid iterator issues
  const dateEntries = Array.from(matchesByDate.entries());
  
  for (let i = 0; i < dateEntries.length; i++) {
    if (count >= 6) break; // Discord embeds have limits
    
    const [date, dateMatches] = dateEntries[i];
    const matchesText = dateMatches
      .map((m: CricketMatch) => `${m.team1.name} vs ${m.team2.name} - ${m.dateTime.split('at')[1]?.trim() || m.dateTime}${m.venue ? ` (${m.venue})` : ''}`)
      .join('\n');
      
    embed.addFields({ name: date, value: matchesText });
    count++;
  }

  // If we couldn't show all dates
  if (count < matchesByDate.size) {
    embed.setFooter({ 
      text: `Showing ${count} out of ${matchesByDate.size} dates` 
    });
  }

  return embed;
}

export function createPointsTableEmbed(points: PointsTableEntry[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary as ColorResolvable)
    .setTitle('🏆 IPL Points Table')
    .setTimestamp();

  if (points.length === 0) {
    embed.setDescription('Points table information not available.');
    return embed;
  }

  // Header row
  let tableContent = "```\nPos Team        P   W   L   NR  PTS  NRR\n";
  tableContent += "---------------------------------------------\n";

  // Add each team's points
  for (const entry of points) {
    const position = entry.position.toString().padEnd(3);
    const team = entry.team.padEnd(12);
    const played = entry.played.toString().padEnd(4);
    const won = entry.won.toString().padEnd(4);
    const lost = entry.lost.toString().padEnd(4);
    const nr = entry.noResult.toString().padEnd(4);
    const points = entry.points.toString().padEnd(5);
    const nrr = entry.nrr.padEnd(6);
    
    tableContent += `${position}${team}${played}${won}${lost}${nr}${points}${nrr}\n`;
  }
  
  tableContent += "```";
  
  embed.setDescription(tableContent);
  
  embed.setFooter({ 
    text: `P: Played, W: Won, L: Lost, NR: No Result, PTS: Points, NRR: Net Run Rate` 
  });

  return embed;
}

export function createTeamEmbed(team: TeamInfo): EmbedBuilder {
  // Get team color or use default
  const teamColor = (TeamColors[team.code] || COLORS.accent) as ColorResolvable;
  
  const embed = new EmbedBuilder()
    .setColor(teamColor)
    .setTitle(`${team.name} (${team.code})`)
    .setTimestamp();

  // Add team info
  if (team.captain) {
    embed.addFields({ name: 'Captain', value: team.captain });
  }
  
  if (team.coach) {
    embed.addFields({ name: 'Coach', value: team.coach });
  }
  
  if (team.homeGround) {
    embed.addFields({ name: 'Home Ground', value: team.homeGround });
  }

  // Add recent results if available
  if (team.recentResults && team.recentResults.length > 0) {
    const recentResults = team.recentResults
      .map(result => `${result.match}: ${result.result}`)
      .join('\n');
      
    embed.addFields({ name: 'Recent Results', value: recentResults });
  }

  // Add key players if available
  if (team.keyPlayers && team.keyPlayers.length > 0) {
    embed.addFields({ 
      name: 'Key Players', 
      value: team.keyPlayers.join(', ')
    });
  }

  return embed;
}

export function createHelpEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.yellow as ColorResolvable)
    .setTitle('❓ IPL Score Bot Help')
    .setDescription('Here are the commands you can use with IPL Score Bot:')
    .addFields(
      { name: '!current', value: 'Shows the currently live match' },
      { name: '!upcoming', value: 'Lists upcoming matches' },
      { name: '!schedule', value: 'Displays the full tournament schedule' },
      { name: '!team [name]', value: 'Shows team information and recent results' },
      { name: '!points', value: 'Displays the current points table' },
      { name: '!subscribe', value: 'Subscribe to match updates in this channel' },
      { name: '!unsubscribe', value: 'Unsubscribe from match updates' },
      { name: '!help', value: 'Shows this help message' }
    )
    .setFooter({ 
      text: 'Example: !team CSK - Shows Chennai Super Kings team information' 
    })
    .setTimestamp();

  return embed;
}
