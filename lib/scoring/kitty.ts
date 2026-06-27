export const DEFAULT_KITTY_PAYOUT = 25;

export function getEffectiveKittyPayout(
  kittyPayout: string,
  customRuleValues: Record<string, { type: 'multiplier' | 'points'; value: number }>
): number {
  return customRuleValues.kitty?.value ?? Number(kittyPayout || DEFAULT_KITTY_PAYOUT);
}
