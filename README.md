# WayFinder: Tribal Health WayFinder

A mobile-first web application that helps American Indian and Alaska Native community members find healthcare services across IHS direct service, tribal 638, urban Indian, FQHC, and community health center programs in a single unified search.

**Built by [Indigenous Healthcare Advancements](https://indigenous.health)**

## Features

- **Smart Search**: Natural language search by service type, location, zip code, or reservation name
- **Eligibility Wizard**: Plain-language guide to understanding IHS/tribal/urban Indian program eligibility
- **Facility Map**: Interactive map with color-coded pins by facility type (IHS, Tribal 638, Urban Indian, FQHC)
- **PRCDA Boundaries**: Toggle Purchased/Referred Care Delivery Area boundaries on the map
- **Telehealth Directory**: Dedicated view of facilities offering virtual care
- **Health Equity Snapshots**: IHS Area health disparity data on each facility profile
- **Cultural Services**: Traditional healing, Native language services, and cultural programming indicators
- **Facility Details**: Full profiles with services, hours, insurance, PRC eligibility, and directions

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Leaflet.js (mapping)
- Recharts (supplemental charts)
- React Router v7
- Lucide React (icons)
- Client-side search (no backend required)

## Data Sources

| Source | Description |
|--------|-------------|
| [IHS Facility Data](https://www.ihs.gov/findhealthcare/) | Facility locations, types, and services |
| [HRSA Health Centers](https://findahealthcenter.hrsa.gov/) | FQHCs serving AI/AN populations |
| [NCUIH Directory](https://www.ncuih.org/) | Urban Indian health programs |
| [IHS PRC](https://www.ihs.gov/prc/) | PRCDA boundary information |
| [IHS GPRA Reports](https://www.ihs.gov/quality/) | Area-level health indicators |

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Build for Production

```bash
npm run build
npm run preview
```

## Deployment

This app is configured for deployment on Vercel:

```bash
npx vercel
```

Or connect the GitHub repository to Vercel for automatic deployments.

## Project Structure

```
src/
  components/       UI components (SearchBar, FacilityMap, EligibilityWizard, etc.)
  data/             Static JSON data files (facilities, PRCDA boundaries, area metrics)
  hooks/            Custom React hooks (useSearch, useGeolocation, useFilteredFacilities)
  utils/            Utilities (search parser, distance calc, eligibility logic)
  pages/            Route pages (Home, FacilityPage, Eligibility, Telehealth, About)
public/
  assets/           Logo files
```

## Important Disclaimer

This is not an official IHS tool. WayFinder was developed by Indigenous Healthcare Advancements to support community health access. Always contact facilities directly to confirm services, hours, and eligibility.

## License

(c) 2026 Indigenous Healthcare Advancements | indigenous.health
