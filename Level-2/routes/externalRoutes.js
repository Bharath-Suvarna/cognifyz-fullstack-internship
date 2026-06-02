const express = require('express');
const Event = require('../../Level-3/models/Event');

const router = express.Router();

async function getCoordinates(location) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
  );

  if (!response.ok) {
    throw new Error('Location lookup failed');
  }

  const data = await response.json();
  return data.results && data.results[0] ? data.results[0] : null;
}

async function getWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  if (!response.ok) {
    throw new Error('Weather API request failed');
  }

  const data = await response.json();
  return data.current_weather;
}

router.get('/weather', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const weatherReports = await Promise.all(
      events.map(async (event) => {
        try {
          const coordinates = await getCoordinates(event.location);

          if (!coordinates) {
            return {
              event,
              locationName: event.location,
              weather: null,
              error: 'Location not found'
            };
          }

          const weather = await getWeather(coordinates.latitude, coordinates.longitude);

          return {
            event,
            locationName: `${coordinates.name}${coordinates.country ? `, ${coordinates.country}` : ''}`,
            weather,
            error: null
          };
        } catch (error) {
          return {
            event,
            locationName: event.location,
            weather: null,
            error: 'Weather unavailable'
          };
        }
      })
    );

    res.render('weather', { weatherReports, error: null });
  } catch (error) {
    res.render('weather', {
      weatherReports: [],
      error: 'Unable to load event weather reports right now.'
    });
  }
});

module.exports = router;
