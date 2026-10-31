// Contract-shaped fixtures. Every fixture is validated against the zod
// response schemas from @dogadopt/contracts in fixtures.test.ts, so a
// fixture that drifts from the contract fails the suite.
import type { Breed, Dog, DogPage, Rescue, RescuePage } from '@dogadopt/contracts';

export const CARDIFF: Rescue = {
  id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'Cardiff Dogs Home',
  type: 'Full',
  region: 'South Wales',
  website: 'https://www.cardiffdogshome.co.uk',
  phone: '029 2071 1243',
  email: 'info@cardiffdogshome.co.uk',
  address: 'Westpoint Industrial Estate, Penarth Road, Cardiff',
  postcode: 'CF11 8JQ',
  charityNumber: '1114457',
  contactNotes: null,
  latitude: 51.48,
  longitude: -3.17,
  dogCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const DOGS_TRUST: Rescue = {
  ...CARDIFF,
  id: '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
  name: 'Dogs Trust',
  region: 'National',
  website: 'https://www.dogstrust.org.uk',
  phone: null,
  email: null,
  address: null,
  postcode: null,
  charityNumber: null,
  latitude: null,
  longitude: null,
  dogCount: 1,
};

const base = {
  unresolvedBreeds: [] as string[],
  imageUrl: null,
  description: null,
  birthYear: null,
  birthMonth: null,
  birthDay: null,
  rescueSinceDate: null,
  statusNotes: null,
  firstSeenAt: '2026-10-10T08:00:00.000Z',
  lastSeenAt: '2026-10-18T08:00:00.000Z',
  createdAt: '2026-10-10T08:00:00.000Z',
  updatedAt: '2026-10-18T08:00:00.000Z',
};

const summary = (r: Rescue) => ({ id: r.id, name: r.name, region: r.region, website: r.website });

export const BELLA: Dog = {
  ...base,
  id: '3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f',
  name: 'Bella',
  status: 'available',
  age: 'Adult',
  size: 'Medium',
  gender: 'Female',
  breeds: ['Staffordshire Bull Terrier'],
  goodWithKids: true,
  goodWithDogs: null,
  goodWithCats: false,
  imageUrl: 'https://www.cardiffdogshome.co.uk/img/bella.jpg',
  profileUrl: 'https://www.cardiffdogshome.co.uk/dog/bella-2/',
  birthYear: 2021,
  rescue: summary(CARDIFF),
};

export const MAX: Dog = {
  ...base,
  id: '4d5e6f7a-8b9c-4d0e-9f2a-3b4c5d6e7f8a',
  name: 'Max',
  status: 'reserved',
  age: 'Young',
  size: 'Large',
  gender: 'Male',
  breeds: ['Labrador Retriever'],
  goodWithKids: null,
  goodWithDogs: null,
  goodWithCats: null,
  profileUrl: 'https://www.cardiffdogshome.co.uk/dog/max-7/',
  rescue: summary(CARDIFF),
};

export const DOT: Dog = {
  ...base,
  id: '5e6f7a8b-9c0d-4e1f-8a3b-4c5d6e7f8a9b',
  name: 'Dot',
  status: 'available',
  age: 'Senior',
  size: 'Small',
  gender: 'Female',
  breeds: ['Jack Russell Terrier'],
  goodWithKids: false,
  goodWithDogs: true,
  goodWithCats: true,
  profileUrl: null,
  rescue: summary(DOGS_TRUST),
};

export const ALL_DOGS = [BELLA, MAX, DOT];

export function page<T>(items: T[], pageNumber = 1, pageSize = 24, total = items.length) {
  return { items, meta: { page: pageNumber, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export const DOG_PAGE: DogPage = page(ALL_DOGS);
export const RESCUE_PAGE: RescuePage = page([CARDIFF, DOGS_TRUST]);
export const BREEDS: Breed[] = [
  { name: 'Jack Russell Terrier', synonyms: ['JRT'] },
  { name: 'Labrador Retriever', synonyms: ['Lab'] },
  { name: 'Staffordshire Bull Terrier', synonyms: ['Staffie', 'Staffy'] },
];
