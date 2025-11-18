import { ModifierDef, PayoutConfig } from "./types";

export const DEFAULT_MODIFIERS: ModifierDef[] = [
  { key: "jokerless",      label: "Jokerless / Natural",  type: "multiplier", value: 2, enabledByDefault: false },
  { key: "selfPick",       label: "Self-Pick (Self-Draw)",type: "multiplier", value: 2, enabledByDefault: false },
  { key: "lastTile",       label: "Last Tile",            type: "multiplier", value: 2, enabledByDefault: false },
  { key: "robbingTheKong", label: "Robbing the Kong",     type: "flat",       value: 0, enabledByDefault: false },
  { key: "eastWinner",     label: "East Wins Bonus",      type: "flat",       value: 0, enabledByDefault: false },
];

export const DEFAULT_PAYOUT: PayoutConfig = {
  settlementMode: "winner_takes_all_from_all",
  numPlayers: 4
};
