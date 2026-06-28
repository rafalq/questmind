// src/features/character/lib/hp.ts
// HP calculation logic.
// maxHp depends on endurance — changing endurance updates maxHp but not currentHp.
//
// Formula: BASE_HP + (endurance * HP_PER_ENDURANCE)
// Default endurance = 5 → maxHp = 100

export const BASE_HP = 50
export const HP_PER_ENDURANCE = 10
export const DEFAULT_ENDURANCE = 5

export function calculateMaxHp(endurance: number): number {
  return BASE_HP + endurance * HP_PER_ENDURANCE
}

// Default maxHp used when no endurance value is available yet
// (e.g. during campaign character reset on deletion)
export const DEFAULT_MAX_HP = calculateMaxHp(DEFAULT_ENDURANCE) // 100
