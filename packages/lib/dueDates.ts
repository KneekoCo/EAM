import { addDays, max } from "date-fns";
export function creditDays(
  outages: { start: Date; end?: Date }[],
  windowStart: Date,
  windowEnd: Date,
): number {
  let credit = 0;
  for (const w of outages) {
    const s = max([w.start, windowStart]);
    const e = w.end ?? windowEnd;
    const overlapDays = Math.max(
      0,
      Math.floor((e.getTime() - s.getTime()) / 86400000),
    );
    if (overlapDays >= 30) credit += overlapDays;
  }
  return credit;
}
export function nextDue(
  lastDone: Date,
  intervalDays: number,
  creditedDays: number,
): Date {
  return addDays(lastDone, intervalDays + creditedDays);
}
