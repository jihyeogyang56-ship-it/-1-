/**
 * Radioactive Decay & Half-life Calculations
 * A(t) = A0 * (0.5)^(t / T_half)
 */

export function calculateCurrentActivity(
  initialActivityMBq: number,
  receivedIsoDate: string,
  halfLifeMinutes: number,
  currentDate = new Date()
): {
  currentActivityMBq: number;
  decayFraction: number; // 0 to 1
  elapsedMinutes: number;
} {
  const received = new Date(receivedIsoDate).getTime();
  const now = currentDate.getTime();
  const elapsedMinutes = Math.max(0, (now - received) / (1000 * 60));

  if (halfLifeMinutes <= 0) {
    return {
      currentActivityMBq: initialActivityMBq,
      decayFraction: 1,
      elapsedMinutes: 0,
    };
  }

  const fraction = Math.pow(0.5, elapsedMinutes / halfLifeMinutes);
  const currentActivityMBq = initialActivityMBq * fraction;

  return {
    currentActivityMBq: Math.max(0, Number(currentActivityMBq.toFixed(2))),
    decayFraction: Math.max(0, Math.min(1, fraction)),
    elapsedMinutes: Math.round(elapsedMinutes),
  };
}

/**
 * Generate 24-point decay curve coordinates for SVG visualization
 */
export function generateDecayCurvePoints(
  initialActivityMBq: number,
  halfLifeMinutes: number,
  totalTimeMinutes: number
): { t: number; activity: number }[] {
  const points: { t: number; activity: number }[] = [];
  const steps = 30;
  const timeStep = totalTimeMinutes / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i * timeStep;
    const activity = initialActivityMBq * Math.pow(0.5, t / halfLifeMinutes);
    points.push({ t, activity });
  }

  return points;
}

/**
 * Format MBq to Curie equivalent (1 mCi = 37 MBq)
 */
export function formatMBqWithCi(mbq: number): string {
  const mCi = mbq / 37;
  return `${mbq.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} MBq (${mCi.toFixed(2)} mCi)`;
}
