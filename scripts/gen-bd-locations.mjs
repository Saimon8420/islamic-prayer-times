/**
 * Generates src/data/bdLocations.json — the offline Bangladesh upazila dataset.
 *
 * Source: https://github.com/mdtanjilhasan/bd-geocode-with-lat-long
 *   (all-in-one/db_geocode.json — a phpMyAdmin export with `districts` and
 *   `upazilas` tables; upazilas carry name, bn_name, lat, lng, district_id).
 *
 * Run: node scripts/gen-bd-locations.mjs
 * Then validate: npm run validate:bd
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const SRC =
  'https://raw.githubusercontent.com/mdtanjilhasan/bd-geocode-with-lat-long/master/all-in-one/db_geocode.json';
const BOUNDS = { latMin: 20.5, latMax: 26.7, lonMin: 88.0, lonMax: 92.7 };
const round = (n) => Math.round(n * 1e6) / 1e6;

// Manual coordinate fixes for source records with corrupt coordinates
// (lat==lon typos or 0,0). Keyed by upazila English name. Values are
// approximate town-centre coordinates — well within the upazila, which is
// all prayer-time accuracy requires.
const OVERRIDES = {
  Baraigram: { lat: 24.2667, lon: 89.1333 }, // Natore
  Shanthiganj: { lat: 24.9167, lon: 91.3833 }, // Sunamganj
  Akborsha: { lat: 22.38, lon: 91.79 }, // Chattogram (Akbar Shah)
  Aranghata: { lat: 22.85, lon: 89.52 }, // Khulna
};

const res = await fetch(SRC);
if (!res.ok) {
  console.error(`fetch failed: ${res.status}`);
  process.exit(1);
}
const dump = await res.json();
const table = (name) => dump.find((e) => e.type === 'table' && e.name === name)?.data ?? [];
const districts = table('districts');
const upazilas = table('upazilas');

const dmap = new Map(
  districts.map((d) => [d.id, { name: (d.name || '').trim(), bn: (d.bn_name || '').trim() }]),
);

const out = [];
const seen = new Set();
const skipped = [];

for (const u of upazilas) {
  const d = dmap.get(u.district_id);
  const name = (u.name || '').trim();
  const nameBn = (u.bn_name || '').trim();
  let lat = Number(u.lat);
  let lon = Number(u.lng);

  if (!d) { skipped.push(`no district for "${name}" (district_id ${u.district_id})`); continue; }
  if (!name || !nameBn || !d.name || !d.bn) { skipped.push(`missing name fields id=${u.id}`); continue; }

  const inBounds = (la, lo) =>
    Number.isFinite(la) && Number.isFinite(lo) &&
    la >= BOUNDS.latMin && la <= BOUNDS.latMax && lo >= BOUNDS.lonMin && lo <= BOUNDS.lonMax;

  if (!inBounds(lat, lon) && OVERRIDES[name]) {
    lat = OVERRIDES[name].lat;
    lon = OVERRIDES[name].lon;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) { skipped.push(`non-numeric coords "${name}"`); continue; }
  if (!inBounds(lat, lon)) { skipped.push(`out-of-bounds "${name}" (${lat}, ${lon})`); continue; }
  const key = `${name}|${d.name}`;
  if (seen.has(key)) { skipped.push(`duplicate ${key}`); continue; }
  seen.add(key);

  out.push({ name, nameBn, district: d.name, districtBn: d.bn, lat: round(lat), lon: round(lon) });
}

out.sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name));

const json = '[\n' + out.map((o) => '  ' + JSON.stringify(o)).join(',\n') + '\n]\n';
writeFileSync(resolve('src/data/bdLocations.json'), json);

const districtCount = new Set(out.map((o) => o.district)).size;
console.log(`wrote ${out.length} upazilas across ${districtCount} districts; skipped ${skipped.length}`);
if (skipped.length) console.log('skipped:\n' + skipped.slice(0, 50).join('\n'));
