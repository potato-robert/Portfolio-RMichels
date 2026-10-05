/** Regression thresholds for audit:compare (percent and absolute floor). */
export const REGRESSION_THRESHOLDS = {
  lcpMs: { pct: 0.1, floorMs: 200 },
  fcpMs: { pct: 0.1, floorMs: 100 },
  tbtMs: { pct: 0.15, floorMs: 50 },
  cls: { pct: 0.2, floor: 0.05 },
  interactionP95Ms: { pct: 0.15, floorMs: 16 },
  scrollEffectiveFps: { pct: 0.1, floor: 2 },
  inpMs: { pct: 0.15, floorMs: 16 },
  seoFindingCount: { pct: 0.2, floor: 1 },
  categoryScore: { pct: 0.05, floor: 3 },
} as const;

/** Absolute budgets for scroll scenario (audit compare warnings). */
export const INTERACTION_BUDGETS = {
  scrollP95Ms: 50,
  scrollEffectiveFpsMin: 45,
  inpMsMax: 200,
} as const;

export const SEO_TITLE_LEN = { min: 30, max: 60 } as const;
export const SEO_DESC_LEN = { min: 70, max: 160 } as const;
