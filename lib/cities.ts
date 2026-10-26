export interface CityArea {
  name: string;
  slug: string;
}

export interface City {
  name: string;
  slug: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  areas: CityArea[];
}

export const CITIES: City[] = [
  {
    name: 'Ashta',
    slug: 'ashta',
    state: 'Madhya Pradesh',
    lat: 23.0167,
    lng: 76.7167,
    description:
      'Ashta is a historic town in Sehore district known for its temples, colleges, and growing residential areas.',
    areas: [
      { name: 'College Road', slug: 'college-road' },
      { name: 'Bus Stand', slug: 'bus-stand' },
      { name: 'Gandhi Chowk', slug: 'gandhi-chowk' },
      { name: 'Hospital Road', slug: 'hospital-road' },
      { name: 'Main Market', slug: 'main-market' },
      { name: 'Station Road', slug: 'station-road' },
      { name: 'Kannad Road', slug: 'kannad-road' },
    ],
  },
  {
    name: 'Kothri',
    slug: 'kothri',
    state: 'Madhya Pradesh',
    lat: 23.0833,
    lng: 76.8333,
    description:
      'Kothri is a growing town near Ashta, popular with students and families looking for affordable rentals.',
    areas: [
      { name: 'Main Road', slug: 'main-road' },
      { name: 'Bus Stand', slug: 'bus-stand' },
      { name: 'Market Area', slug: 'market-area' },
      { name: 'Station Road', slug: 'station-road' },
      { name: 'Colony Area', slug: 'colony-area' },
    ],
  },
  {
    name: 'Sehore',
    slug: 'sehore',
    state: 'Madhya Pradesh',
    lat: 23.2,
    lng: 77.0833,
    description:
      'Sehore is the district headquarters, offering urban amenities, government offices, and quality schools.',
    areas: [
      { name: 'Station Road', slug: 'station-road' },
      { name: 'Court Road', slug: 'court-road' },
      { name: 'Bus Stand', slug: 'bus-stand' },
      { name: 'Main Market', slug: 'main-market' },
      { name: 'Indore Road', slug: 'indore-road' },
      { name: 'Bhopal Road', slug: 'bhopal-road' },
      { name: 'Collectorate Area', slug: 'collectorate-area' },
    ],
  },
];

export const CITY_NAMES = CITIES.map((c) => c.name);

export const CITIES_BY_SLUG: Record<string, City> = CITIES.reduce(
  (acc, c) => ({ ...acc, [c.slug]: c }),
  {}
);

export function getCityBySlug(slug: string): City | undefined {
  return CITIES_BY_SLUG[slug?.toLowerCase()];
}

export function getCityByName(name: string): City | undefined {
  return CITIES.find((c) => c.name.toLowerCase() === name?.toLowerCase());
}

export function getAreaBySlug(citySlug: string, areaSlug: string): CityArea | undefined {
  const city = getCityBySlug(citySlug);
  return city?.areas.find((a) => a.slug === areaSlug);
}

export function getAllAreas() {
  return CITIES.flatMap((c) =>
    c.areas.map((a) => ({
      city: c.name,
      citySlug: c.slug,
      area: a.name,
      areaSlug: a.slug,
      href: `/rent-in/${c.slug}/${a.slug}`,
    }))
  );
}

export function isCity(name: string): boolean {
  return CITY_NAMES.some((c) => c.toLowerCase() === name?.toLowerCase());
}