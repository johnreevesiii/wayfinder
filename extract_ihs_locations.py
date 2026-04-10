"""
Extract IHS facility data from the IHS Locations page HTML.
The page embeds facility data as JavaScript arrays.
"""
import re
import json
import html as html_module
from pathlib import Path

HTML_PATH = Path(r"C:\Users\johnr\chap\ihs_locations_page.html")
OUTPUT_PATH = Path(r"C:\Users\johnr\chap\ihs_locations_extracted.json")

text = HTML_PATH.read_text(encoding="utf-8")

# ---- helpers ----

def extract_js_string_array(varname: str, text: str) -> list:
    """Extract a JS array of strings: var fac_xxx = ['a','b','c'];
    Uses the LAST occurrence (the active one, not the commented-out one)."""
    pattern = rf"(?<!//)var\s+{varname}\s*=\s*\[(.*?)\];"
    matches = re.findall(pattern, text, re.DOTALL)
    if not matches:
        # Try without the negative lookbehind (might have spaces before //)
        pattern2 = rf"^\s*var\s+{varname}\s*=\s*\[(.*?)\];"
        matches = re.findall(pattern2, text, re.DOTALL | re.MULTILINE)
    if not matches:
        print(f"  WARNING: No matches for {varname}")
        return []
    # Use the last match (active, not commented out)
    raw = matches[-1]
    items = re.findall(r"""['"]([^'"]*?)['"]""", raw)
    # Decode HTML entities (&#x28; -> (, &amp; -> &, etc.)
    items = [html_module.unescape(s) for s in items]
    return items


def extract_js_number_array(varname: str, text: str) -> list:
    """Extract a JS array of numbers: var fac_ids = [1,2,5];"""
    pattern = rf"(?<!//)var\s+{varname}\s*=\s*\[(.*?)\];"
    matches = re.findall(pattern, text, re.DOTALL)
    if not matches:
        pattern2 = rf"^\s*var\s+{varname}\s*=\s*\[(.*?)\];"
        matches = re.findall(pattern2, text, re.DOTALL | re.MULTILINE)
    if not matches:
        print(f"  WARNING: No matches for {varname}")
        return []
    raw = matches[-1]
    return [x.strip() for x in raw.split(',') if x.strip()]


def extract_coordinates(text: str) -> list:
    """Extract (lon, lat) tuples from ol.proj.fromLonLat calls."""
    pattern = r"fromLonLat\(\[(-?[\d.]+)\s*,\s*(-?[\d.]+)\]\)"
    matches = re.findall(pattern, text)
    return [(float(lon), float(lat)) for lon, lat in matches]


# ---- extract all arrays ----

print("Extracting JavaScript arrays from IHS Locations page...")
print(f"  HTML file size: {HTML_PATH.stat().st_size:,} bytes")
print()

names = extract_js_string_array('fac_names', text)
cities = extract_js_string_array('fac_cities', text)
states = extract_js_string_array('fac_states', text)
zips = extract_js_string_array('fac_zips', text)
urls = extract_js_string_array('fac_urls', text)
ids = extract_js_number_array('fac_ids', text)
coords = extract_coordinates(text)

print(f"Arrays found:")
print(f"  fac_names:  {len(names)} entries")
print(f"  fac_cities: {len(cities)} entries")
print(f"  fac_states: {len(states)} entries")
print(f"  fac_zips:   {len(zips)} entries")
print(f"  fac_urls:   {len(urls)} entries")
print(f"  fac_ids:    {len(ids)} entries")
print(f"  coordinates (fromLonLat): {len(coords)} entries")
print()

# ---- check for additional data ----

# Look for any other var declarations in the JS
all_vars = re.findall(r"var\s+(\w+)\s*=", text)
fac_vars = [v for v in all_vars if v.startswith('fac_')]
other_vars = [v for v in set(all_vars) if not v.startswith('fac_')]
print(f"All fac_ variables: {sorted(set(fac_vars))}")
print(f"Other JS variables (sample): {sorted(set(other_vars))[:20]}")
print()

# Check for any API endpoints, JSON URLs, CSV/Excel download links
api_refs = re.findall(r'(?:https?://[^\s"\'<>]+(?:api|json|csv|xlsx|download)[^\s"\'<>]*)', text, re.IGNORECASE)
if api_refs:
    print(f"API/download URLs found:")
    for u in set(api_refs):
        print(f"  {u}")
else:
    print("No API/download URLs found in page.")

# Check for iframe sources
iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', text, re.IGNORECASE)
if iframes:
    print(f"\niframe sources found:")
    for u in iframes:
        print(f"  {u}")
print()

# ---- build facility records ----

n = len(names)
print(f"Building {n} facility records...")

# Pad shorter arrays
def pad(arr, n, default=''):
    return arr + [default] * max(0, n - len(arr))

cities = pad(cities, n)
states = pad(states, n)
zips = pad(zips, n)
urls = pad(urls, n)
ids = pad(ids, n, default='')
coords = pad(coords, n, default=(None, None))

facilities = []
for i in range(n):
    lon, lat = coords[i] if i < len(coords) and coords[i] != (None, None) else (None, None)
    url = urls[i] if urls[i] and urls[i] != 'NA' else ''

    # Build full URL if relative
    if url and not url.startswith('http'):
        url = f"https://www.ihs.gov{url}" if url.startswith('/') else f"https://www.ihs.gov/{url}"

    facilities.append({
        'id': int(ids[i]) if ids[i] and ids[i].isdigit() else None,
        'name': names[i].strip(),
        'city': cities[i].strip(),
        'state': states[i].strip(),
        'zip': zips[i].strip(),
        'latitude': lat,
        'longitude': lon,
        'url': url,
    })

# Remove any blank-name entries
facilities = [f for f in facilities if f['name']]

print(f"  Valid facilities after filtering: {len(facilities)}")
print()

# ---- state distribution ----
state_counts = {}
for f in facilities:
    st = f['state'] or 'UNKNOWN'
    state_counts[st] = state_counts.get(st, 0) + 1
print("Facilities by state:")
for st in sorted(state_counts.keys()):
    print(f"  {st}: {state_counts[st]}")
print()

# ---- fields summary ----
has_coords = sum(1 for f in facilities if f['latitude'] is not None and f['longitude'] is not None)
has_url = sum(1 for f in facilities if f['url'])
has_zip = sum(1 for f in facilities if f['zip'])
has_id = sum(1 for f in facilities if f['id'] is not None)
print(f"Field coverage:")
print(f"  name:      {len(facilities)}/{len(facilities)} (100%)")
print(f"  city:      {sum(1 for f in facilities if f['city'])}/{len(facilities)}")
print(f"  state:     {sum(1 for f in facilities if f['state'])}/{len(facilities)}")
print(f"  zip:       {has_zip}/{len(facilities)}")
print(f"  lat/lon:   {has_coords}/{len(facilities)}")
print(f"  url:       {has_url}/{len(facilities)}")
print(f"  id:        {has_id}/{len(facilities)}")
print()

# ---- sample records ----
print("=" * 70)
print("SAMPLE RECORDS (first 5):")
print("=" * 70)
for f in facilities[:5]:
    print(json.dumps(f, indent=2))
    print()

print("=" * 70)
print("SAMPLE RECORDS (last 3):")
print("=" * 70)
for f in facilities[-3:]:
    print(json.dumps(f, indent=2))
    print()

# ---- save to JSON ----
output = {
    "source": "https://www.ihs.gov/sites/locations/",
    "extraction_date": "2026-04-10",
    "total_facilities": len(facilities),
    "fields": ["id", "name", "city", "state", "zip", "latitude", "longitude", "url"],
    "facilities": facilities,
}

OUTPUT_PATH.write_text(json.dumps(output, indent=2), encoding="utf-8")
print(f"Saved {len(facilities)} facilities to: {OUTPUT_PATH}")
print(f"Output file size: {OUTPUT_PATH.stat().st_size:,} bytes")
