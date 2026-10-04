/** Regression thresholds for audit:compare (percent and absolute floor). */
export const REGRESSION_THRESHOLDS = {
  lcpMs: { pct: 0.1, floorMs: 200 },
  fcpMs: { pct: 0.1, floorMs: 100 },
  tbtMs: { pct: 0.15, floorMs: 50 },
  cls: { pct: 0.2, floor: 0.05 },
  interactionP95Ms: { pct: 0.15, floorMs: 16 },
} as const;

export const SEO_TITLE_LEN = { min: 30, max: 60 } as const;
export const SEO_DESC_LEN = { min: 70, max: 160 } as const;
