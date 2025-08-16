import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const assets = [
    { fleetId: "UTA-1001", make: "MPI",     model: "MP36PH-3C", hasMicroMon: false, status: "InService" },
    { fleetId: "UTA-1002", make: "MPI",     model: "MP36PH-3C", hasMicroMon: true,  status: "InService" },
    { fleetId: "UTA-1003", make: "Siemens", model: "Charger",   hasMicroMon: false, status: "Stored" }
  ];
  for (const a of assets) {
    await prisma.asset.upsert({ where: { fleetId: a.fleetId }, update: a, create: a });
  }
  console.log("Seed complete.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
