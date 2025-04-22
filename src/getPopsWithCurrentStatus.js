export async function getPopsWithStatus(request, env, ctx) {
	const latest_pop_status = await env.cf_pop_status.get(env.cf_status_cache_key_for_kv, { type: 'json' });

	if (latest_pop_status) {
		return latest_pop_status;
	} else {
		console.log('Could not fetch the status from cache, so we will retrieve it from the API.');

		// any endpoint might be unavailabe or slow.
		// We need a retry mechanism, https://www.npmjs.com/package/fetch-retry ?
		const apiUrl = env.cf_status_api_endpoint;
		if (apiUrl === undefined) {
			throw new Error("The value of the environment variable 'cf_status_api_endpoint' is undefined")
		}

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
			console.log("Caching the result from the API call in KV for future reference")
			// can I somehow return 'filteredPops' before having to wait for the write to KV to complete?
			// Yes you can: https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil
			// The expirationTtl option is used to set the expiration time for the cache entry (in seconds), otherwise it will be stored indefinitely
			ctx.waitUntil(env.cf_pop_status.put(env.cf_status_cache_key_for_kv, JSON.stringify(filteredPops), { expirationTtl: env.cf_status_cache_ttl_in_seconds }));
			return filteredPops;
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
			return [];
		}
	}
}
