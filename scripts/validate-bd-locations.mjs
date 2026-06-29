/**
 * Validates src/data/bdLocations.json: count, required fields, Bangladesh
 * coordinate bounds, and uniqueness. Run: npm run validate:bd
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const data = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/data/bdLocations.json'), 'utf8'),
);

const BOUNDS = { latMin: 20.5, latMax: 26.7, lonMin: 88.0, lonMax: 92.7 };
const errors = [];

if (!Array.isArray(data)) errors.push('bdLocations.json is not an array');
if (data.length < 500 || data.length > 600)
  errors.push(`expected ~570 records, got ${data.length}`);

const seen = new Set();
for (const [i, r] of data.entries()) {
  for (const f of ['name', 'nameBn', 'district', 'districtBn']) {
    if (typeof r[f] !== 'string' || !r[f].trim()) errors.push(`#${i}: missing/empty "${f}"`);
  }
  if (typeof r.lat !== 'number' || typeof r.lon !== 'number') {
    errors.push(`#${i} (${r.name}): non-numeric coordinates`);
    continue;
  }
  if (r.lat < BOUNDS.latMin || r.lat > BOUNDS.latMax)
    errors.push(`#${i} (${r.name}): lat ${r.lat} outside BD bounds`);
  if (r.lon < BOUNDS.lonMin || r.lon > BOUNDS.lonMax)
    errors.push(`#${i} (${r.name}): lon ${r.lon} outside BD bounds`);
  const key = `${r.name}|${r.district}`;
  if (seen.has(key)) errors.push(`duplicate: ${key}`);
  seen.add(key);
}

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):\n` + errors.slice(0, 60).join('\n'));
  process.exit(1);
}
const districts = new Set(data.map((r) => r.district));
console.log(
  `OK: ${data.length} upazilas across ${districts.size} districts, all in-bounds, no duplicates.`,
);
