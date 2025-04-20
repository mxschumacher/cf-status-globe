import { getPopsWithStatus } from './getPopsWithCurrentStatus.js';

export default {
	async fetch(request, env, ctx) {
		// introduce Hono?
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/api/pops_with_status':
				if (request.method !== 'GET') {
					return errorResponse(`This endpoint only supports GET requests, you sent a ${request.method} request.`, 405);
				}
				return Response.json(await getPopsWithStatus(request, env, ctx));
			case '/api/pops_with_coordinates':
				if (request.method !== 'GET') {
					return errorResponse(`This endpoint only supports GET requests, you sent a ${request.method} request.`, 405);
				}
				return new Response('under construction');
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
};

function errorResponse(message, statusCode) {
	return Response.json({ message: message, statusCode: statusCode });
}
