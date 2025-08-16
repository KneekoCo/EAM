"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditDays = creditDays;
exports.nextDue = nextDue;
const date_fns_1 = require("date-fns");
function creditDays(outages, windowStart, windowEnd) {
    let credit = 0;
    for (const w of outages) {
        const s = (0, date_fns_1.max)([w.start, windowStart]);
        const e = w.end ?? windowEnd;
        const overlapDays = Math.max(0, Math.floor((e.getTime() - s.getTime()) / 86400000));
        if (overlapDays >= 30)
            credit += overlapDays;
    }
    return credit;
}
function nextDue(lastDone, intervalDays, creditedDays) {
    return (0, date_fns_1.addDays)(lastDone, intervalDays + creditedDays);
}
