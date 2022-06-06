var Amadeus = require('amadeus');
var _ = require('lodash');

var amadeus = new Amadeus({
    clientId: 'TU1zq17CDhk5OmGattigUtpwML6e6Dp1',
    clientSecret: 'DWrZ0juvkrxfaC5w'
});

const SIDE_1 = 'TLV'
const SIDE_2 = 'EWR'
const CURRENCY = 'USD'

const DESTINATIONS = [
    "AUT",
    "BEL",
    "BGR",
    "HRV",
    "CYP",
    "CZE",
    "DNK",
    "EST",
    "FIN",
    "FRA",
    "DEU",
    "GRC",
    "HUN",
    "IRL",
    "ITA",
    "LVA",
    "LTU",
    "LUX",
    "MLT",
    "NLD",
    "POL",
    "PRT",
    "ROU",
    "SVK",
    "SVN",
    "ESP",
    "SWE",
    "GBR",
];

const DEPARTURE_DATE_TO = '2022-07-01'
const RETURN_DATE = '2022-07-06'

const getRoundTripLowestPrice = (destination, home) => {
    return amadeus.shopping.flightOffersSearch.get({
        originLocationCode: home,
        destinationLocationCode: destination,
        departureDate: DEPARTURE_DATE_TO,
        adults: '1',

    })
}

const getLowestRoundTrips = async (destinations, home) => {
    let retVal = [];

    for (let destination of destinations) {
        let flightData;
        try {
            let flightResponse = await getRoundTripLowestPrice(destination, home);
            flightData = flightResponse.data;
        }
        catch (e) {
            console.log(`Didn't find a flight to ${destination}`);
            console.log(e)
        }
        if (flightData && flightData.length > 0) {
            console.log(`Found flight to ${destination}!`);

            let minPriceFlightPrice = getMinPrice(flightData);

            let finalPrice = (_.parseInt(minPriceFlightPrice.price.total)).toFixed(0);
            //let totalTax = (_.parseInt(minPriceFlightPrice.price.totalTaxes)).toFixed(0);

            //let finalPrice = _.parseInt(totalPrice) + _.parseInt(totalTax);

            //let flightDetails = _.get(minPriceFlightPrice, 'services');
            //flightDetails = _.map(flightDetails, 'segments');
            //flightDetails = _.map(flightDetails[0], 'flightSegment');

            retVal.push({
                'destination': destination,
                'price': _.parseInt(finalPrice).toFixed(0)
            });
        }
    }

    return retVal;
}

const getMinPrice = (data) => {
    let retVal;
    retVal = _.sortBy(data, (offer) => {
        return _.parseInt(offer.price.total) + _.parseInt(offer.price.totalTaxes);

    });

    return retVal[0];
}

const getTotalPrices = (telAvivFlights, philiFlights) => {
    let retVal = [];

    _.forEach(telAvivFlights, (flight) => {
        let sameCity = _.find(philiFlights, {'destination': flight.destination});
        console.log(sameCity)
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

    console.log(retVal)

    return retVal;
}

start = async () => {
    let promise = getLowestRoundTrips(DESTINATIONS, SIDE_1);
    let telAvivFlights = await promise;
    promise = getLowestRoundTrips(DESTINATIONS, SIDE_2);
    let philiFlights = await promise;

    let totalPrices = getTotalPrices(_.compact(telAvivFlights), _.compact(philiFlights));
    let sortedTotalPrices = _.sortBy(totalPrices, 'price');

    console.log(`Found flights in dates ${DEPARTURE_DATE_TO} to ${RETURN_DATE}:`);
    console.log(sortedTotalPrices);
}

start();
