import React, { useState, useEffect } from 'react';
import { opencageApiKey } from './config';

interface Country {
  country: string;
  iso2: string;
  cities: string[];
}

const CountryCitySelector = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/')
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = event.target.value;
    setSelectedCountry(selectedCountry);

    const selectedCountryObj = countries.find((country) => country.iso2 === selectedCountry);
    if (selectedCountryObj) {
      setSelectedCity('');
      setCities(selectedCountryObj.cities);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = event.target.value;
    setSelectedCity(selectedCity);
  };

  const handleSubmit = async () => {
    const selectedCountryObj = countries.find((country) => country.iso2 === selectedCountry);
    if (selectedCountryObj) {
      const location = await getLocation(selectedCity, selectedCountryObj.country);
      setLocation(location);
    } else {
      setLocation(null);
    }
  };

  const sortedCountries = [...countries].sort((a, b) => (a.country || '').localeCompare(b.country || ''));

  return (
    <div>
      <select value={selectedCountry} onChange={handleCountryChange}>
        <option value="">Select a country</option>
        {sortedCountries.map((country, index) => (
          <option key={`${country.iso2}-${index}`} value={country.iso2}>
            {country.country}
          </option>
        ))}
      </select>
      <select value={selectedCity} onChange={handleCityChange} disabled={!selectedCountry}>
        <option value="">Select a city</option>
        {cities.map((city, index) => (
          <option key={`${city}-${index}`} value={city}>
            {city}
          </option>
        ))}
      </select>
      {location && (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}
      <button onClick={handleSubmit} disabled={!selectedCountry || !selectedCity}>
        Submit
      </button>
    </div>
  );
};

const getLocation = async (city: string, country: string) => {
  const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${city},${country}&key=${opencageApiKey}`
  );
  const data = await response.json();
  if (data.results.length > 0) {
    const location = data.results[0].geometry;
    return location;
  } else {
    throw new Error('Location not found');
  }
};

export default CountryCitySelector;
