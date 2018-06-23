var Amadeus = require('amadeus');
var _ = require('lodash');
 
var amadeus = new Amadeus({
  clientId: 'TU1zq17CDhk5OmGattigUtpwML6e6Dp1',
  clientSecret: 'DWrZ0juvkrxfaC5w'
});
 
const TLV = 'TLV'
const EWR = 'EWR'
const DOLLAR = 'USD'
const DESTINATIONS = [
		'LON',
		'PAR',
		'HEL',
		'ROM',
		'MAD',
		'REK',
		'DUB',
		'VIE',
		'BRU',
		'SOF',
		'BER',
		'FRA',
		'ZRH',
		'LIS',
		'ADD',
		'BCN',
		'GLA',
		'EDI',
		'AMS',
		'MUC',
		'GVA',
		'MIL'
];

const DEPARTURE_DATE_TO = '2018-07-19'
const RETURN_DATE = '2018-07-22'

start();

async function start() {
	let promise = getLowestRoundTrips(DESTINATIONS, TLV);
	let telAvivFlights = await promise;
	promise = getLowestRoundTrips(DESTINATIONS, EWR);
	let philiFlights = await promise;

	let totalPrices = getTotalPrices(_.compact(telAvivFlights), _.compact(philiFlights));
	let sortedTotalPrices = _.sortBy(totalPrices, 'price');

	console.log(`dound flights in dates ${DEPARTURE_DATE_TO} to ${RETURN_DATE}:`);
	console.log(sortedTotalPrices);
}

async function getLowestRoundTrips(destinations, home) {
	let retVal = [];

	 for (let destination of destinations){ 
		let promise = getRoundTripLowestPrice(destination, home);
		let response;
		try {
			response = await promise;
		}
		catch(e) {
    		console.log(`didnt't find a flight to ${destination}`);      
    	}
    	if (response != null) {
    		console.log(`found flight to ${destination}!`);
			let minPriceFlightPrice = getMinPrice(response.data);

			let totalPrice = (_.parseInt(minPriceFlightPrice.price.total)).toFixed(0);
			let totalTax = (_.parseInt(minPriceFlightPrice.price.totalTaxes)).toFixed(0);

			let finalPrice = _.parseInt(totalPrice) + _.parseInt(totalTax);

			if(home === TLV) {
				finalPrice = totalPrice;
			}
			//let flightDetails = _.get(minPriceFlightPrice, 'services');
			//flightDetails = _.map(flightDetails, 'segments');
			//flightDetails = _.map(flightDetails[0], 'flightSegment');

			retVal.push({
				'destination': destination,
				'price': _.parseInt(finalPrice).toFixed(0)
			});
		}
	};

	return retVal;
}

function getRoundTripLowestPrice(destination, home) {
	return amadeus.shopping.flightOffers.get({
	  origin : home,
	  destination : destination,
	  departureDate : DEPARTURE_DATE_TO,
	  returnDate: RETURN_DATE,
	  nonStop: true,
	  currency: DOLLAR
	});
}

function getMinPrice(data) {
	let retVal; 

	let offers = _.map(data, 'offerItems[0]');
	retVal = _.sortBy(offers, (offer) => {
		return _.parseInt(offer.price.total) + _.parseInt(offer.price.totalTaxes);
	});

	return retVal[0];
}

function getTotalPrices(telAvivFlights, philiFlights) {
	let retVal = [];

	_.forEach(telAvivFlights, (flight) => {
		let sameCity = _.find(philiFlights, {'destination': flight.destination});
		if (sameCity != null) {
			retVal.push({
				'destination': flight.destination,
				'price': (_.parseInt(sameCity.price) + _.parseInt(flight.price)).toFixed(0)
			});
		}
		else {
			retVal.push({
				'destination': flight.destination,
				'price': -1
			});
		}
	});

	return retVal;
}

