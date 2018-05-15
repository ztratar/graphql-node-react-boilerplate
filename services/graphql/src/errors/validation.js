import { createError } from 'apollo-errors';

export const InvalidEmailError = createError('InvalidEmailError', {
  message: 'The email you entered appears to be invalid.'
});

export const InvalidDateError = createError('InvalidDateError', {
  message: 'The date you entered appears to be invalid.'
});

export const InvalidPasswordError = createError('InvalidPasswordError', {
  message: 'The password you entered appears to be invalid.  Passwords must contain at least 6 characters and may not contain any spaces.'
});

export const InvalidResetPasswordMatchError = createError('InvalidResetPasswordMatchError', {
  message: 'Your passwords must match'
});

export const InvalidCreditCardNumberError = createError('InvalidCreditCardNumberError', {
  message: 'The credit card number you entered appears to be invalid.'
});

export const InvalidCreditCardExpirationError = createError('InvalidCreditCardExpirationError', {
  message: 'The credit card expiration date you entered appears to be invalid.'
});

export const InvalidCreditCardCVCError = createError('InvalidCreditCardCVCError', {
  message: 'The CVC number you entered appears to be invalid'
});

export const InvalidPhoneNumberError = createError('InvalidPhoneNumberError', {
  message: 'The phone number you entered appears to be invalid'
});

export const InvalidUrlError = createError('InvalidUrlError', {
  message: 'The url you entered appears to be invalid. Are you missing an http://?'
});
