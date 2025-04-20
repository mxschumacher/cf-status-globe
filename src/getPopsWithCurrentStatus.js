// the JSON file could change at any moment, but I cannot listen to changes, I have to poll the site.
// I can expose an endpoint that I trigger with cron to make a call every 5 minutes to see whether there was a change
// https://developers.cloudflare.com/workers/configuration/cron-triggers/
// poll every few minutes and then update a KV store.

export async function getPopsWithStatus(request, env, ctx) {
	// before calling the API, let's do a KV lookup and see whether we have an entry that's less than 5 minutes old.

	const EXPIRATION_TTL = 60; // Cache expiration in seconds => let's turn this into an environment variable
	// Try to get data from KV cache first
	const cacheKey = "latest_status"
	let data = await env.cf_pop_status.get(cacheKey, { type: 'json' });

	if (!data) {
		console.log('Could not fetch the status from cache, so we will retrieve it from the API.');
		// this endpoint might be unavailabe or slow.
		// We need a retry mechanism
		// We need a fallback mechanism. Store the most recent result on KV?
		const apiUrl = 'https://www.cloudflarestatus.com/api/v2/components.json';

		try {
			const response = await fetch(apiUrl);
			if (!response.ok) {
				// in terms of Workers observability, how are Exceptions and console.error handled differently?
				throw new Error('Network response was not ok ' + response.statusText);
			}
			const data = await response.json();

			// Filter out the components that are data centers
			// we are implicitly assuming that the schema stays the same, but this is out of our control. We should validate first
			const filteredPops = data.components
				.filter((component) => {
					// Assuming data centers have a specific pattern in their name or other properties
					if (component.name.includes('- (') && !component.group && !component.description) return component;
				})
				.map((component) => {
					return {
						id: component.id,
						name: component.name,
						status: component.status,
						updated_at: component.updated_at,
					};
				});

			// The expirationTtl option is used to set the expiration time for the cache entry (in seconds), otherwise it will be stored indefinitely
			await env.cf_pop_status.put(cacheKey, JSON.stringify(filteredPops), { expirationTtl: EXPIRATION_TTL });

			return filteredPops;
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
			return [];
		}
	}
}
