import { describe, expect, it } from 'vitest';
import { GetDog200Response, GetRescue200Response, ListBreeds200Response, ListDogs200Response, ListRescues200Response } from '@dogadopt/contracts';
import { ALL_DOGS, BREEDS, CARDIFF, DOGS_TRUST, DOG_PAGE, RESCUE_PAGE } from './fixtures';

// If the contract changes shape, these fail before any page test can pass
// against a fixture that no longer matches the API.
describe('test fixtures match the Dogs API contract', () => {
  it('dogs', () => {
    for (const dog of ALL_DOGS) expect(GetDog200Response.safeParse(dog), dog.name).toMatchObject({ success: true });
    expect(ListDogs200Response.safeParse(DOG_PAGE).success).toBe(true);
  });
  it('rescues', () => {
    for (const rescue of [CARDIFF, DOGS_TRUST]) expect(GetRescue200Response.safeParse(rescue), rescue.name).toMatchObject({ success: true });
    expect(ListRescues200Response.safeParse(RESCUE_PAGE).success).toBe(true);
  });
  it('breeds', () => {
    expect(ListBreeds200Response.safeParse({ items: BREEDS }).success).toBe(true);
  });
});
