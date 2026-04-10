"""
WayFinder Facility Data Refresh Script
Run monthly to pull latest IHS facility data.

Usage: python scripts/refresh-facilities.py

Data sources:
1. IHS Official Facility Directory (Excel)
   URL: https://www.ihs.gov/sites/ihsoffices/themes/responsive2017/display_objects/documents/ihs_facilities.xlsx
   Updates: Quarterly (June, Sept, Dec, March)

2. IHS Locations Page (JavaScript arrays, 149 IHS Direct facilities)
   URL: https://www.ihs.gov/locations/
   Updates: As facilities change

3. HRSA Health Center API (tribal-affiliated FQHCs)
   URL: https://data.hrsa.gov/HDWLocatorApi/HealthCenters/find
   Updates: Weekly

Schedule: Run on the 1st of each month. Compare against existing facilities.json
and report additions/removals.
"""
import json
import sys
import os
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
    import requests
except ImportError:
    print("Required: pip install pandas requests openpyxl")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "src" / "data"
FACILITIES_FILE = DATA_DIR / "facilities.json"

IHS_EXCEL_URL = "https://www.ihs.gov/sites/ihsoffices/themes/responsive2017/display_objects/documents/ihs_facilities.xlsx"

AREA_MAP = {
    'ALASKA': 'alaska', 'ALBUQUERQUE': 'albuquerque', 'ALBUQUERQUE URBAN': 'albuquerque',
    'BEMIDJI': 'bemidji', 'BILLINGS': 'billings', 'CALIFORNIA': 'california',
    'GREAT PLAINS': 'great_plains', 'NASHVILLE': 'nashville', 'NAVAJO': 'navajo',
    'OKLAHOMA CITY': 'oklahoma_city', 'PHOENIX': 'phoenix', 'PORTLAND': 'portland',
    'TUCSON': 'tucson',
}

OP_MAP = {
    'IHS': 'ihs_direct', 'Tribal': 'tribal_638', 'Urban': 'urban_indian',
    'Other': 'tribal_638', 'Other - Hybrid Urban': 'urban_indian', 'None': 'tribal_638',
}

CAT_MAP = {
    'Hospital': 'hospital', 'Health Center': 'health_center', 'Health Station': 'health_station',
    'Alaska Village Clinic': 'village_clinic', 'Behavioral Health Facility': 'behavioral_health',
    'Alcohol Substance Abuse Treatment Facilities': 'substance_abuse',
    'Alcohol & Substance Abuse Treatment': 'substance_abuse',
    'Dental Clinic': 'dental_clinic', 'Health Location': 'health_center',
    'School Health Center': 'health_center', 'Standalone Urgent Care Facility': 'health_center',
}


def download_ihs_excel():
    """Download the latest IHS facility spreadsheet."""
    print(f"Downloading IHS facility data from {IHS_EXCEL_URL}...")
    resp = requests.get(IHS_EXCEL_URL, timeout=30)
    resp.raise_for_status()
    tmp_path = PROJECT_DIR / "ihs_facilities_latest.xlsx"
    tmp_path.write_bytes(resp.content)
    print(f"  Downloaded {len(resp.content):,} bytes")
    return tmp_path


def parse_ihs_excel(path):
    """Parse the IHS Excel file into facility records."""
    records = []
    for sheet in pd.ExcelFile(path).sheet_names:
        df = pd.read_excel(path, sheet_name=sheet)
        # Normalize column names
        df.columns = [str(c).strip().upper().replace(" ", "_") for c in df.columns]

        # Find key columns with fuzzy matching
        col_map = {}
        for col in df.columns:
            cl = col.lower()
            if 'facility_name' in cl or (cl == 'facility' and 'type' not in cl): col_map['name'] = col
            elif 'area' in cl and 'service' not in cl: col_map['area'] = col
            elif 'service_unit' in cl: col_map['service_unit'] = col
            elif 'facility_type' in cl or cl == 'type': col_map['ftype'] = col
            elif 'street' in cl or (cl == 'address' and 'web' not in cl): col_map['address'] = col
            elif cl == 'city': col_map['city'] = col
            elif cl == 'state': col_map['state'] = col
            elif cl in ('zip', 'zip_code', 'zipcode'): col_map['zip'] = col
            elif cl == 'phone': col_map['phone'] = col
            elif cl in ('lat', 'latitude'): col_map['lat'] = col
            elif cl in ('lon', 'lng', 'longitude', 'long'): col_map['lng'] = col
            elif 'operated' in cl or 'itu' in cl: col_map['operator'] = col
            elif 'website' in cl or 'url' in cl: col_map['website'] = col
            elif 'bed' in cl: col_map['beds'] = col
            elif 'status' in cl: col_map['status'] = col

        if 'name' not in col_map:
            continue

        for _, row in df.iterrows():
            name = str(row.get(col_map.get('name', ''), '')).strip()
            if not name or name == 'nan':
                continue

            lat = row.get(col_map.get('lat', ''))
            lng = row.get(col_map.get('lng', ''))
            try:
                lat = float(lat)
                lng = float(lng)
            except (ValueError, TypeError):
                continue
            if lat == 0 or lng == 0:
                continue

            records.append({
                'name': name,
                'area': str(row.get(col_map.get('area', ''), '')).strip(),
                'service_unit': str(row.get(col_map.get('service_unit', ''), '')).strip(),
                'ftype': str(row.get(col_map.get('ftype', ''), '')).strip(),
                'address': str(row.get(col_map.get('address', ''), '')).strip(),
                'city': str(row.get(col_map.get('city', ''), '')).strip(),
                'state': str(row.get(col_map.get('state', ''), '')).strip(),
                'zip': str(row.get(col_map.get('zip', ''), '')).strip().split('.')[0],
                'phone': str(row.get(col_map.get('phone', ''), '')).strip(),
                'lat': lat,
                'lng': lng,
                'operator': str(row.get(col_map.get('operator', ''), '')).strip(),
                'website': str(row.get(col_map.get('website', ''), '')).strip(),
            })

    print(f"  Parsed {len(records)} facilities from Excel")
    return records


def convert_to_wayfinder(records):
    """Convert IHS records to WayFinder facility format."""
    facilities = []
    for i, r in enumerate(records):
        area = AREA_MAP.get(r['area'].upper(), '')
        if not area:
            continue

        op = r['operator']
        facility_type = OP_MAP.get(op, 'tribal_638')
        category = CAT_MAP.get(r['ftype'], 'health_center')

        addr_parts = [p for p in [r['address'], r['city'], f"{r['state']} {r['zip']}".strip()] if p and p != 'nan']
        address = ', '.join(addr_parts)

        phone = r['phone']
        digits = ''.join(c for c in phone if c.isdigit())
        if len(digits) == 10:
            phone = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"

        services = ['primary_care']
        ft = r['ftype']
        if ft == 'Hospital': services = ['primary_care', 'dental', 'pharmacy', 'behavioral_health', 'lab', 'radiology', 'emergency']
        elif ft == 'Health Center': services = ['primary_care', 'dental', 'pharmacy', 'behavioral_health', 'lab']
        elif 'Behavioral' in ft: services = ['behavioral_health', 'substance_abuse']
        elif 'Alcohol' in ft or 'Substance' in ft: services = ['substance_abuse', 'behavioral_health']
        elif 'Dental' in ft: services = ['dental']
        elif ft == 'Alaska Village Clinic': services = ['primary_care', 'community_health']

        website = r['website'] if r['website'] != 'nan' else f"https://www.ihs.gov/{area}/"

        facilities.append({
            'id': f"ihs-{i+1:04d}",
            'name': r['name'],
            'type': facility_type,
            'lat': r['lat'],
            'lng': r['lng'],
            'address': address,
            'phone': phone,
            'website': website,
            'ihsArea': area,
            'services': services,
            'culturalServices': ['traditional_healing'],
            'telehealth': ft in ('Health Center', 'Hospital', 'Behavioral Health Facility'),
            'telehealthServices': ['general_telehealth'] if ft in ('Health Center', 'Hospital') else [],
            'hours': {'primary_care': 'Mon-Fri 8:00 AM - 4:30 PM'},
            'acceptingNewPatients': 'call_to_confirm',
            'prcEligible': facility_type in ('ihs_direct', 'tribal_638'),
            'prcdaName': None,
            'facilityCategory': category,
            'insuranceAccepted': ['ihs', 'medicaid', 'medicare'] if facility_type != 'urban_indian' else ['medicaid', 'medicare', 'private'],
            'dataSource': f'IHS Official Facility Directory {datetime.now().year}',
            'dataSourceNotes': f"{ft}, operated by {op}. {r['service_unit']} Service Unit.",
        })

    return facilities


def merge_with_existing(new_facilities, existing_path):
    """Merge new facilities with existing, preserving enriched metadata."""
    from difflib import SequenceMatcher

    existing = json.load(open(existing_path))

    # Index existing by lowercase name
    existing_index = {}
    for f in existing:
        existing_index[f['name'].lower().strip()] = f

    added = 0
    updated = 0
    for nf in new_facilities:
        nl = nf['name'].lower().strip()

        # Check for match
        match_key = None
        for ek in existing_index:
            if SequenceMatcher(None, nl, ek).ratio() > 0.78:
                match_key = ek
                break

        if match_key:
            # Update coordinates and phone from IHS source (authoritative)
            ef = existing_index[match_key]
            ef['lat'] = nf['lat']
            ef['lng'] = nf['lng']
            if nf['phone'] and len(nf['phone']) > 5:
                ef['phone'] = nf['phone']
            updated += 1
        else:
            # New facility
            existing.append(nf)
            existing_index[nl] = nf
            added += 1

    return existing, added, updated


def main():
    print(f"=== WayFinder Facility Refresh ({datetime.now().strftime('%Y-%m-%d')}) ===\n")

    # Download latest
    xlsx_path = download_ihs_excel()

    # Parse
    records = parse_ihs_excel(xlsx_path)

    # Convert
    new_facilities = convert_to_wayfinder(records)
    print(f"  Converted {len(new_facilities)} to WayFinder format\n")

    # Merge
    merged, added, updated = merge_with_existing(new_facilities, FACILITIES_FILE)
    print(f"  Added: {added} new facilities")
    print(f"  Updated: {updated} existing facilities (coords/phone)")
    print(f"  Total: {len(merged)} facilities\n")

    # Write
    json.dump(merged, open(FACILITIES_FILE, 'w'), indent=2)
    print(f"  Written to {FACILITIES_FILE}")

    # Cleanup
    xlsx_path.unlink()

    # Summary by area
    areas = {}
    for f in merged:
        areas[f['ihsArea']] = areas.get(f['ihsArea'], 0) + 1
    print(f"\n  By area: {dict(sorted(areas.items()))}")
    print(f"\n=== Done. Review changes and commit. ===")


if __name__ == '__main__':
    main()
