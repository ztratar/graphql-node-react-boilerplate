import { createError } from 'apollo-errors';

const message = 'An error has occurred.  Please try again';

export const GoogleMapsInvalidRequestError = createError('GoogleMapsInvalidRequestError', {
  message
});

export const GoogleMapsOverQueryLimitError = createError('GoogleMapsOverQueryLimitError', {
  message
});

export const GoogleMapsRequestDeniedError = createError('GoogleMapsRequestDeniedError', {
  message
});

export const GoogleMapsUnknownError = createError('GoogleMapsUnknownError', {
  message
});

export const GoogleMapsPlaceNotFoundError = createError('GoogleMapsPlaceNotFoundError', {
  message
});

// NOTE: This is a special case error.  See graphql/src/connectors/google/maps.js
export const GoogleMapsPlaceNoLongerValidError = createError('GoogleMapsPlaceNoLongerValidError', {
  message
});

// NOTE: This is a special case error.  See graphql/src/connectors/google/maps.js
export const GoogleMapsTimezoneNotFoundError = createError('GoogleMapsTimezoneNotFoundError', {
  message
});
