import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { createId } from '@paralleldrive/cuid2';
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DEPARTMENTS = [
  { name: 'Public Works', emailAlias: 'publicworks@city.gov' },
  { name: 'Utilities', emailAlias: 'utilities@city.gov' },
  { name: 'Sanitation', emailAlias: 'sanitation@city.gov' },
  { name: 'Code Enforcement', emailAlias: 'codeenforcement@city.gov' },
  { name: 'Parks & Recreation', emailAlias: 'parks@city.gov' },
  { name: 'Police', emailAlias: 'police@city.gov' },
];

const CATEGORIES_BY_DEPT: Record<string, { name: string; slaHours: number }[]> =
  {
    'Public Works': [
      { name: 'Pothole / Road Damage', slaHours: 48 },
      { name: 'Streetlight Outage', slaHours: 72 },
      { name: 'Traffic Signal Issue', slaHours: 24 },
      { name: 'Sidewalk Damage', slaHours: 96 },
      { name: 'Abandoned Vehicle', slaHours: 72 },
    ],
    Utilities: [
      { name: 'Water Leak', slaHours: 12 },
      { name: 'Sewer Issue', slaHours: 24 },
      { name: 'Storm Drain Blockage', slaHours: 48 },
    ],
    Sanitation: [
      { name: 'Missed Trash Pickup', slaHours: 48 },
      { name: 'Illegal Dumping', slaHours: 72 },
      { name: 'Graffiti Removal', slaHours: 96 },
    ],
    'Code Enforcement': [
      { name: 'Property Maintenance Violation', slaHours: 120 },
      { name: 'Zoning Violation', slaHours: 120 },
      { name: 'Abandoned Structure', slaHours: 168 },
    ],
    'Parks & Recreation': [
      { name: 'Park Facility Damage', slaHours: 72 },
      { name: 'Dead Tree / Fallen Branch', slaHours: 48 },
    ],
    Police: [
      { name: 'Noise Complaint', slaHours: 24 },
      { name: 'Suspicious Activity', slaHours: 12 },
    ],
  };

async function seed() {
  console.log('Seeding departments and categories...');

  for (const dept of DEPARTMENTS) {
    const [inserted] = await db
      .insert(schema.departments)
      .values({ id: createId(), ...dept })
      .onConflictDoNothing()
      .returning();

    if (!inserted) continue;

    const cats = CATEGORIES_BY_DEPT[dept.name] ?? [];
    for (const cat of cats) {
      await db
        .insert(schema.categories)
        .values({
          id: createId(),
          name: cat.name,
          departmentId: inserted.id,
          slaHours: cat.slaHours,
        })
        .onConflictDoNothing();
    }
  }

  console.log('Seed complete.');
}

seed().catch(console.error);
