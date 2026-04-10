# WayFinder Data Scripts

## Monthly Facility Refresh

`refresh-facilities.py` pulls the latest IHS Official Facility Directory and merges it with our enriched facility data.

### Run manually:
```bash
pip install pandas requests openpyxl
python scripts/refresh-facilities.py
```

### Automated:
A GitHub Action runs on the 1st of each month, creates a PR with any changes for review.

### Data sources:
| Source | URL | Updates | What it provides |
|--------|-----|---------|-----------------|
| IHS Facility Directory (Excel) | ihs.gov/sites/ihsoffices/.../ihs_facilities.xlsx | Quarterly | 1,000+ facilities with coords, phone, type, area |
| IHS Locations Page | ihs.gov/locations/ | As needed | 149 IHS Direct facilities with coordinates |
| HRSA Health Center API | data.hrsa.gov/HDWLocatorApi/ | Weekly | Tribal-affiliated FQHCs |

## PRCDA Boundary Data

PRCDA (Purchased/Referred Care Delivery Area) boundaries are NOT published as geospatial data by IHS. Our boundaries are compiled from:

1. **Federal Register notices** describing PRCDA county/area designations
2. **Census Bureau AIANNH (American Indian/Alaska Native/Native Hawaiian Areas)** GeoJSON
   - Tiger/Line: https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2023&layergroup=American+Indian+Area+Geography
   - This is the most comprehensive tribal boundary geodata available
3. **IHS Area office maps** (published as PDFs, manually traced)
4. **Tribal government published boundaries**

### To improve PRCDA coverage:
1. Download Census AIANNH shapefiles (link above)
2. Convert to simplified GeoJSON polygons
3. Match against our facility locations by tribal affiliation
4. The Census data has 862+ tribal areas; we currently have 140 PRCDA boundaries

### PRCDA vs Tribal Boundary:
A PRCDA is not always identical to a reservation boundary. PRCDAs can include surrounding counties where PRC-eligible members live. However, the reservation boundary is a reasonable proxy for visualization purposes.
