import { createError } from 'apollo-errors';

const message = 'An error has occurred.  Please try again';

export const SendgridMailBadRequestError = createError('SendgridMailBadRequestError', {
  message
});

export const SendgridMailUnauthorizedError = createError('SendgridMailUnauthorizedError', {
  message
});

export const SendgridMailForbiddenError = createError('SendgridMailForbiddenError', {
  message
});

export const SendgridMailNotFoundError = createError('SendgridMailNotFoundError', {
  message
});

export const SendgridMailMethodNotAlloedError = createError('SendgridMailMethodNotAlloedError', {
  message
});

export const SendgridMailPayloadTooLargeError = createError('SendgridMailPayloadTooLargeError', {
  message
});

export const SendgridMailUnsupportedMediaTypeError = createError('SendgridMailUnsupportedMediaTypeError', {
  message
});

export const SendgridMailTooManyRequestsError = createError('SendgridMailTooManyRequestsError', {
  message
});

export const SendgridMailUnknownError = createError('SendgridMailUnknownError', {
  message
});

export const SendgridMailNotAvailableError = createError('SendgridMailNotAvailableError', {
  message
});
