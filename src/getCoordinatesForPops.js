export async function getPopCoordinates(request, env, ctx) {
	const EXPIRATION_TTL = 600; // Cache expiration in seconds => let's turn this into an environment variable
	// before calling the API, let's do a KV lookup and see whether we have an entry that's less than 5 minutes old.
	const cacheKey = 'pop_coordinates';
	let data = await env.cf_pop_coordinates.get(cacheKey, { type: 'json' });

	if (!data) {
		console.log('Could not fetch the pop_coordinates from cache, so we will retrieve it from the API.');
		// this endpoint might be unavailabe or slow.
		// We need a retry mechanism
		// We need a fallback mechanism. Store the most recent result on KV?
		const apiUrl = 'https://speed.cloudflare.com/locations';

		try {
			const response = await fetch(apiUrl);
			if (!response.ok) {
				// in terms of Workers observability, how are Exceptions and console.error handled differently?
				throw new Error('Network response was not ok ' + response.statusText);
			}
			const data = await response.json();

			// Filter out the components that are data centers
			// we are implicitly assuming that the schema stays the same, but this is out of our control. We should validate first
			const popCoordinates = data.map((component) => {
				return {
					iata: component.iata,
					lat: component.lat,
					lon: component.lon,
				};
			});

			// The expirationTtl option is used to set the expiration time for the cache entry (in seconds), otherwise it will be stored indefinitely
			await env.cf_pop_coordinates.put(cacheKey, JSON.stringify(popCoordinates), { expirationTtl: EXPIRATION_TTL });

			return popCoordinates;
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
			return [];
		}
	}
	return data;
}
