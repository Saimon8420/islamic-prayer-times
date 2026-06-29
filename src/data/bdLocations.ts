/**
 * Offline Bangladesh location database — all 64 districts covered at upazila
 * granularity (~570 upazilas) with English + Bengali names and coordinates.
 * Generated from an open dataset; see scripts/gen-bd-locations.mjs for
 * provenance and scripts/validate-bd-locations.mjs for the integrity checks.
 *
 * Prayer/fasting times are computed locally by `adhan` from these coordinates,
 * so a user anywhere in Bangladesh gets accurate times fully offline.
 */
import data from './bdLocations.json';

export interface BdLocation {
  name: string;
  nameBn: string;
  district: string;
  districtBn: string;
  lat: number;
  lon: number;
}

export const BD_LOCATIONS: BdLocation[] = data as BdLocation[];

export interface BdDistrictGroup {
  district: string;
  districtBn: string;
  upazilas: BdLocation[];
}

/** Group upazilas under their district, both sorted alphabetically (English). */
export function groupByDistrict(locations: BdLocation[]): BdDistrictGroup[] {
  const map = new Map<string, BdDistrictGroup>();
  for (const l of locations) {
    let g = map.get(l.district);
    if (!g) {
      g = { district: l.district, districtBn: l.districtBn, upazilas: [] };
      map.set(l.district, g);
    }
    g.upazilas.push(l);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => a.district.localeCompare(b.district));
  for (const g of groups) g.upazilas.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}
