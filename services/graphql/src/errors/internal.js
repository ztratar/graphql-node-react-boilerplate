import { createError } from 'apollo-errors';

export const InvalidExchangeError = createError('InvalidExchangeError', {
  message: 'An internal error has occurred.'
});

export const InvalidExchangeTypeError = createError('InvalidExchangeTypeError', {
  message: 'An internal error has occurred.'
});

export const TransactionNotFoundError = createError('TransactionNotFoundError', {
  message: 'An internal error has occurred.'
});

export const UnknownError = createError('UnknownError', {
  message: 'An internal error has occurred.'
});

export const CreatorNotFoundError = createError('CreatorNotFoundError', {
  message: 'An internal error has occured.'
});

export const CreatorRequiredError = createError('CreatorRequiredError', {
  message: 'An internal error has occured.'
});

export const UserNotFoundError = createError('UserNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const UserRequiredError = createError('UserRequiredError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const PostNotFoundError = createError('PostNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const TopicNotFoundError = createError('TopicNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const LocationNotFoundError = createError('LocationNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const RecipientsRequiredError = createError('RecipientsRequiredError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const RecipientNotFoundError = createError('RecipientNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const SenderRequiredError = createError('SenderRequiredError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const SenderNotFoundError = createError('SenderNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const EmailNotFoundError = createError('EmailNotFoundError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const EmailRedirectTokenMismatchError = createError('EmailRedirectTokenMismatchError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const CannotCalculateEmailSubject = createError('CannotCalculateEmailSubject', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const SlackSendMessageChannelRequiredError = createError('SlackSendMessageChannelRequiredError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});

export const SlackSendMessageTextRequiredError = createError('SlackSendMessageTextRequiredError', {
  message: 'An internal error has occured.  Please contact our support team at support@jobstart.com'
});
