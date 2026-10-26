export interface PropertyTypeOption {
  value: string;
  label: string;
  labelHi: string;
  needsBhk: boolean;
  icon: string;
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  {
    value: 'Room',
    label: 'Room (PG / Single)',
    labelHi: 'कमरा (PG / सिंगल)',
    needsBhk: false,
    icon: '🛏️',
  },
  {
    value: 'Flat',
    label: 'Apartment / Flat',
    labelHi: 'अपार्टमेंट / फ्लैट',
    needsBhk: true,
    icon: '🏢',
  },
  {
    value: 'Builder Floor',
    label: 'Builder Floor',
    labelHi: 'बिल्डर फ्लोर',
    needsBhk: true,
    icon: '🏗️',
  },
  {
    value: 'Independent House',
    label: 'Independent House',
    labelHi: 'स्वतंत्र मकान',
    needsBhk: true,
    icon: '🏠',
  },
  {
    value: 'Villa',
    label: 'Villa',
    labelHi: 'विला',
    needsBhk: true,
    icon: '🏡',
  },
  {
    value: 'Row House',
    label: 'Row House',
    labelHi: 'रो हाउस',
    needsBhk: true,
    icon: '🏘️',
  },
  {
    value: 'Studio',
    label: 'Studio (1RK)',
    labelHi: 'स्टूडियो (1RK)',
    needsBhk: false,
    icon: '🎨',
  },
  {
    value: 'Penthouse',
    label: 'Penthouse',
    labelHi: 'पेंटहाउस',
    needsBhk: true,
    icon: '🌆',
  },
  {
    value: 'Duplex',
    label: 'Duplex',
    labelHi: 'डुप्लेक्स',
    needsBhk: true,
    icon: '🏛️',
  },
  {
    value: 'Home',
    label: 'Home (Generic)',
    labelHi: 'घर (सामान्य)',
    needsBhk: false,
    icon: '🏠',
  },
];

export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map((t) => t.value);

export const BHK_OPTIONS = [
  { value: '1RK', label: '1 RK (Studio)' },
  { value: '1BHK', label: '1 BHK' },
  { value: '1.5BHK', label: '1.5 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '2.5BHK', label: '2.5 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '3.5BHK', label: '3.5 BHK' },
  { value: '4BHK', label: '4 BHK' },
  { value: '4+BHK', label: '4+ BHK' },
];

export const BHK_VALUES = BHK_OPTIONS.map((b) => b.value);

export function getPropertyType(value: string): PropertyTypeOption | undefined {
  return PROPERTY_TYPES.find((t) => t.value === value);
}

export function needsBhk(propertyType: string): boolean {
  return getPropertyType(propertyType)?.needsBhk ?? false;
}

export function getPropertyTypeLabel(value: string, locale = 'en'): string {
  const t = getPropertyType(value);
  if (!t) return value;
  return locale === 'hi' ? t.labelHi : t.label;
}

export function getBhkLabel(value?: string): string {
  if (!value) return '';
  return BHK_OPTIONS.find((b) => b.value === value)?.label || value;
}

// Common filter shortcuts for browsing
export const BHK_FILTERS = ['1BHK', '2BHK', '3BHK', '4+BHK'];