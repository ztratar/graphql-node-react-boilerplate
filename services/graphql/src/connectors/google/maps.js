import { inject } from 'injectorator';
import debug from 'debug';

import xhr from '../../io/xhr';
import BaseGoogleConnector from '../../connectors/google/base';

import {
  GOOGLE_PLACES_API_KEY
} from '../../../config/environment';

const log = debug('graphql:connectors:google:maps');

const BASE_URL = 'https://maps.googleapis.com/maps/api';
const key = GOOGLE_PLACES_API_KEY;

import {
  GoogleMapsInvalidRequestError,
  GoogleMapsOverQueryLimitError,
  GoogleMapsRequestDeniedError,
  GoogleMapsUnknownError,
  GoogleMapsPlaceNotFoundError,
  GoogleMapsPlaceNoLongerValidError,
  GoogleMapsTimezoneNotFoundError
} from '../../errors/google/maps';

@inject({
  xhr: () => xhr,
  BASE_URL,
  key
})
export default class GoogleMapsConnector extends BaseGoogleConnector {
  static throwError (data) {
    console.trace(data);
    if (data._name && data._humanized_message) throw data;

    const { status, error_message } = data;

    log(`handling error from status ${status}`);

    switch (status) {
      case 'INVALID_REQUEST': throw new GoogleMapsInvalidRequestError({
        data
      });
      case 'OVER_QUERY_LIMIT': throw new GoogleMapsOverQueryLimitError({
        data
      });
      case 'REQUEST_DENIED': throw new GoogleMapsRequestDeniedError({
        data
      });
      case 'NOT_FOUND': throw new GoogleMapsPlaceNotFoundError({
        data
      });
      case 'UNKNOWN_ERROR':
      default: throw new GoogleMapsUnknownError({
        data
      });
    }
  }

  static serializeAutocompletePlaces ({ predictions = [] }) {
    return predictions.map((prediction) => ({
      googleId: prediction.id,
      googlePlaceId: prediction.place_id,
      googleName: prediction.description
    }));
  }

  static serializePlaceDetails ({ result }) {
    return {
      googleId: result.id,
      googlePlaceId: result.place_id,
      googleName: result.formatted_address,
      googleCoords: result.geometry.location,
      googleIcon: result.icon
    };
  }

  static serializeTimezone (data) {
    return {
      googleTimezoneId: data.timeZoneId,
      googleTimezoneName: data.timeZoneName,
      googleTimezoneDstOffset: data.dstOffset,
      googleTimezoneRawOffset: data.rawOffset
    };
  }

  constructor (
    { xhr, BASE_URL, key }
  ) {
    super();
    this._xhr = xhr;
    this._BASE_URL = BASE_URL;
    this._key = key;
  }

  async autocompletePlaces ({ input = '', language = 'en', types = '(cities)'}) {
    log(`autocompleting from text "${input}"`);
    const key = this._key;
    const BASE_URL = this._BASE_URL;
    try {
      const { data } = await this._xhr.get(`${BASE_URL}/place/autocomplete/json`, {
        params: {
          input,
          language,
          types,
          key
        }
      });
      switch (data.status) {
        case 'OK':
          log(`found ${data.predictions.length} places matching text "${input}"`);
          return GoogleMapsConnector.serializeAutocompletePlaces(data);
        // NOTE: We sanitize non-error output to an array every time, even if nothing is found
        case 'ZERO_RESULTS':
          log(`found 0 places matching text "${input}"`);
          return [];
        default: GoogleMapsConnector.throwError(data);
      }
    } catch (e) {
      GoogleMapsConnector.throwError(e);
    }
  }

  async getPlaceDetails ({ googlePlaceId = '', language = 'en'}) {
    log(`getting place details for place ${googlePlaceId}`);
    const key = this._key;
    const BASE_URL = this._BASE_URL;
    try {
      const { data } = await this._xhr.get(`${BASE_URL}/place/details/json`, {
        params: {
          placeid: googlePlaceId,
          language,
          key
        }
      });
      switch (data.status) {
        case 'OK':
          log(`successfully fetched place details for place ${googlePlaceId}`);
          return GoogleMapsConnector.serializePlaceDetails(data);
        // NOTE: "ZERO_RESULTS" in this context means "that the reference was valid but no longer refers to a valid result.
        // This may occur if the establishment is no longer in business." - https://developers.google.com/places/web-service/details
        // Because of this, we are throwing a special case error as a signal to outside code that this place was valid at one point
        // but no longer is.
        case 'ZERO_RESULTS':
          log(`could not fetch place details for place ${googlePlaceId}`);
          throw new GoogleMapsPlaceNoLongerValidError({
            data: {
              status: data.status
            }
          });
        default: GoogleMapsConnector.throwError(data);
      }
    } catch (e) {
      GoogleMapsConnector.throwError(e)
    }
  }

  async getTimezone ({ googleCoordLat, googleCoordLng, language = 'en' }) {
    log(`getting timezone for ${googleCoordLat} lat,  ${googleCoordLng} lng`);
    const key = this._key;
    const BASE_URL = this._BASE_URL;
    const location = `${googleCoordLat},${googleCoordLng}`;
    const timestamp = (Date.now()) / 1000;
    try {
      const { data } = await this._xhr.get(`${BASE_URL}/timezone/json`, {
        params: {
          location,
          timestamp,
          language,
          key
        }
      });
      switch (data.status) {
        case 'OK':
          log(`successfully fetched timezone for ${googleCoordLat} lat,  ${googleCoordLng} lng`);
          return GoogleMapsConnector.serializeTimezone(data);
        // NOTE: "ZERO_RESULTS" in this context means "that no time zone data could be found for the specified position or
        // time. Confirm that the request is for a location on land, and not over water." - https://developers.google.com/maps/documentation/timezone/intro
        // Because of this, we assume that the timezone wasn't found
        case 'ZERO_RESULTS':
          log(`could not fetch timezone for ${googleCoordLat} lat,  ${googleCoordLng} lng`);
          throw new GoogleMapsTimezoneNotFoundError({
            data: {
              status: data.status
            }
          });
        default: GoogleMapsConnector.throwError(data);
      }
    } catch (e) {
      GoogleMapsConnector.throwError(e);
    }
  }
}
