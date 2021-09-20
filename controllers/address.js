const request = require('request');
const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

const { googleApiKey } = require('../apiKei/key');
function addressToLatLng(address, cb) {
  request(
    encodeURI(`${apiUrl}?address=${address}&key=${googleApiKey}`),
    (err, res, body) => {
      if (err) return cb(err);
      try {
        const json = JSON.parse(body);
        cb(null, json.results[0].geometry.location);
      } catch (err) {
        cb(err);
      }
    }
  );
}

module.exports = { addressToLatLng };
