# cf-status-globe

A visualization of Cloudflare's status page on a draggable globe

Use the pnpm package manager.

Taking the information from https://www.cloudflarestatus.com/api to create a visualization on a webgl-rendered globe

Taking geographical information about Pops from https://speed.cloudflare.com/locations

Outgoing gateway Worker to get the status in the format we want (if the API is down, return data from storage (most recent successful request))
-> for both endpoints

I have found a webgl based library that can be reused, surely there are also other packages that would look good.

The frontend will be delivered as a workers static asset (js, html, css)

about page saying that this is not a CF project

Some kind of web analytics to see how many people access the site.

When clicking on a pop, it should provide more information on the incident.

Some incidents are not pop-specific, how should I deal with those?

I currently cannot launch Chrome, so I will reboot my machine.

Deployment funnel is no longer wrangler deploy, but pushing to github.
