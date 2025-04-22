import { getPopsWithStatus } from './getPopsWithCurrentStatus';
import { getPopCoordinates } from './getCoordinatesForPops';

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
				return Response.json(await getPopCoordinates(request, env, ctx));
			case '/api/pops_with_coordinates_and_status':
				if (request.method !== 'GET') {
					return errorResponse(`This endpoint only supports GET requests, you sent a ${request.method} request.`, 405);
				}
				return Response.json(await getPopsWithCoordinatesAndStatus(request, env, ctx));
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
};

function errorResponse(message, statusCode) {
	return Response.json({ message: message, statusCode: statusCode });
}

async function getPopsWithCoordinatesAndStatus(request, env, ctx) {
	const [popsWithStatus, popCoordinates] = await Promise.all([getPopsWithStatus(request, env, ctx), getPopCoordinates(request, env, ctx)]);

	if (popsWithStatus === 'undefined' || popCoordinates === 'undefined') {
		console.error('getPopsWithCoordinatesAndStatus: Failed to retrieve the pop data');
		return;
	}

	const statusAndCoordinates = popsWithStatus.map((p) => {
		const iata = extractIATACodeFromName(p.name);
		if (typeof iata !== 'string' && iata.length !== 3) {
			console.error('A three letter IATA code is expected');
			return {};
		}
		// go into the second array and fetch the object that has the iata code we extracted from the first array
		const matchedPop = popCoordinates.find((el) => (el.iata == iata));
		// now we merge the two objects
		if (matchedPop === undefined) {
			console.error(`getPopsWithCoordinatesAndStatus: No coordinates found for IATA code ${iata}`);
			return p;
		}
		if (matchedPop.lat === undefined || matchedPop.lon === undefined) {
			console.error(`getPopsWithCoordinatesAndStatus: No coordinates found for IATA code ${iata}`);
			return p;
		}
		return Object.assign(p, { lat: matchedPop.lat, lon: matchedPop.lon });
	});

	return statusAndCoordinates;
}

// i'd like to set up a unit test for this function, it's perfectly pure
function extractIATACodeFromName(name) {
	if (typeof name !== 'string') {
		console.error("extractIATACodeFromName expects argument 'name' to be of type 'string'");
		return '';
	}
	if (name.length === 0) {
		console.error('extractIATACodeFromName received an argument with length 0');
		return '';
	}
	const firstBrace = name.indexOf('(');
	if (firstBrace === -1) {
		console.error("extractIATACodeFromName no '(' character in string");
		return '';
	}
	const secondBrace = name.lastIndexOf(')');
	if (secondBrace === -1) {
		console.error("extractIATACodeFromName no ')' character in string");
		return '';
	}
	return name.substring(firstBrace + 1, secondBrace);
}

// environment variables and secrets are only available within the lifetime of a fetch request, there's no dotenv support to get environment variables
const ENV = 'development';

export const __private =
	ENV === 'development'
		? {
				extractIATACodeFromName,
			}
		: undefined;
