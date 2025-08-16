export declare function creditDays(outages: {
    start: Date;
    end?: Date;
}[], windowStart: Date, windowEnd: Date): number;
export declare function nextDue(lastDone: Date, intervalDays: number, creditedDays: number): Date;
