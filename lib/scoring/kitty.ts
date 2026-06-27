export const DEFAULT_KITTY_PAYOUT = 25;
export const DEFAULT_WALL_GAME_POINTS = 10;

export function getEffectiveKittyPayout(
  kittyPayout: string,
  customRuleValues: Record<string, { type: 'multiplier' | 'points'; value: number }>
): number {
  return customRuleValues.kitty?.value ?? Number(kittyPayout || DEFAULT_KITTY_PAYOUT);
}

/** Per-player wall game award: 10 pts in points mode; currency kitty amount when enabled. */
export function getWallGameAwardPerPlayer(
  displayMode: 'currency' | 'points',
  kittyPayout: string,
  customRuleValues: Record<string, { type: 'multiplier' | 'points'; value: number }>,
  kittyEnabled: boolean
): number {
  if (displayMode === 'points') {
    return DEFAULT_WALL_GAME_POINTS;
  }
  if (!kittyEnabled) {
    return 0;
  }
  return getEffectiveKittyPayout(kittyPayout, customRuleValues);
}
