import { Team } from "../structs/interface";

export function getEmoji(team: Team) {
  switch (team) {
    case "CSK":
      return "<:CSK:1352981014095466526>";
    case "DC":
      return "<:DELHI_CAPITALS:1353586853412077641>";
    case "KKR":
      return "<:KKR:1352980949738197042>";
    case "MI":
      return "<:Mumbai_indians:1353022236633600010>";
    case "PK":
      return "<:PunjabKings:1353919166205136906>";
    case "RCB":
      return "<:RCB:1352980904804487209>";
    case "RR":
      return "<:RR:1353019964596162653>";
    case "SRH":
      return "<:SRH:1353020128446386289>";
    case "LSG":
      return "<:lsg:1353587012191391827>";
    case "GT":
      return "<:gujrat:1353260453501075466>";
  }
}
