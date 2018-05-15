import { createError } from 'apollo-errors';

export const LoginFailedError = createError('LoginFailedError', {
  message: 'We were unable to log you in with the provided email and password.  Please try again.'
});

export const RegisterFailedError = createError('RegisterFailedError', {
  message: 'We were unable to register your account with the provided information.  Please try again.'
});

export const AlreadyRegisteredError = createError('AlreadyRegisteredError', {
  message: 'You already have an account. Please log in.'
});

export const NotAuthenticatedError = createError('NotAuthenticatedError', {
  message: 'You must be authenticated to do this'
});

export const AlreadyAuthenticatedError = createError('AlreadyAuthenticatedError', {
  message: 'You are already authenticated'
});

export const NotAuthorizedError = createError('NotAuthorizedError', {
  message: 'You are not authorized to do this'
});

export const ForbiddenError = createError('ForbiddenError', {
  message: 'You are not allowed to do that'
});

export const AdminRequiredError = createError('AdminRequiredError', {
  message: 'You must be an admin to perform this action'
});

export const CardNameRequiredError = createError('CardNameRequiredError', {
  message: 'You must enter the name as shown on your card'
});

export const CardNumberRequiredError = createError('CardNumberRequiredError', {
  message: 'You must enter the number shown on your card'
});

export const CardExpMonthRequiredError = createError('CardExpMonthRequiredError', {
  message: 'You must enter the expiration month as shown on your card'
});

export const CardExpYearRequiredError = createError('CardExpYearRequiredError', {
  message: 'You must enter the expiration year as shown on your card'
});

export const CardCVCRequiredError = createError('CardCVCRequiredError', {
  message: 'You must enter the cvc security code located on the back of your card'
});

export const InvalidCardError = createError('InvalidCardError', {
  message: 'We were unable to verify the billing information you provided'
});

export const EmailRedirectTokenAlreadyUsedError = createError('EmailRedirectTokenAlreadyUsedError', {
  message: 'It looks like you have already responded to this email.'
});

export const IssueUpdatingBillingError = createError('IssueUpdatingBillingError', {
  message: 'There was an issue updating your billing information.  Please try again later.'
});

export const UserIncorrectPasswordError = createError('UserIncorrectPasswordError', {
  message: 'Your password is not correct'
});

export const CouponCodeNotFoundError = createError('CouponCodeNotFoundError', {
  message: 'That is not a valid coupon code'
});

export const PhoneNumberRequiredError = createError('PhoneNumberRequiredError', {
  message: 'A phone number is required'
});

export const PhoneNumberAlreadyUsedError = createError('PhoneNumberAlreadyUsedError', {
  message: 'That phone number is already associated with an account'
});
