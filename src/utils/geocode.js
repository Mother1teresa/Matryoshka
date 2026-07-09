const API_KEY = 'ab3a562f-41f9-4eb0-94ab-b982e13c7742';

export async function geocodeByQuery(query) {
  if (!query || query.length < 2) return null;
  
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&format=json&geocode=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const feature = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    return feature ? {
      name: feature.name,
      description: feature.description,
      coordinates: feature.Point.pos.split(" ").map(Number),
    } : null;
  } catch (e) {
    console.error("Ошибка геокодера:", e);
    return null;
  }
}

export async function geocodeByCoords(lon, lat) {
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&format=json&geocode=${lon},${lat}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const feature = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    return feature ? feature.name : null;
  } catch (e) {
    console.error("Ошибка обратного геокодирования:", e);
    return null;
  }
}