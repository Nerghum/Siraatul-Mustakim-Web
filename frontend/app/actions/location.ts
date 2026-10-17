"use server";

import { Country, City } from "country-state-city";

export async function getCountries() {
  return Country.getAllCountries().map(c => ({
    name: c.name,
    isoCode: c.isoCode,
  }));
}

export async function getCities(countryCode: string) {
  return City.getCitiesOfCountry(countryCode)?.map(c => ({
    name: c.name,
    lat: Number(c.latitude),
    lng: Number(c.longitude),
  })) || [];
}
