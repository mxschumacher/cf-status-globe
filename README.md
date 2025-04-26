# cf-status-globe

A visualization of Cloudflare's status page on a draggable globe

The project is deployed [here](https://cf-status-globe.mxschumacher.xyz)

This site is hosted on Cloudflare and as such would not be available in the case that CF itself is unavailable. Not ideal for a status page.

 * - Run `pnpm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action

 # API client interaction

 We have client code in Hoppscotch ( https://hoppscotch.io/ ) and Hurl ( https://hurl.dev/ ) in the api-clients folder

 to create the KV namespace, I ran:
 > npx wrangler kv namespace create cf-pop-status

Use the pnpm package manager.

Taking the information from https://www.cloudflarestatus.com/api to create a visualization on a webgl-rendered globe

Taking geographical information about Pops from https://speed.cloudflare.com/locations

Outgoing gateway Worker to get the status in the format we want (if the API is down, return data from storage (most recent successful request))
-> for both endpoints

Some kind of web analytics to see how many people access the site.

When clicking on a pop, it should provide more information on the incident.

Some incidents are not pop-specific, how should I deal with those?