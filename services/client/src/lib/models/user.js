export const serializeExtendedUserForApollo = (u) => ({
  __typename: 'User',
  id: u.id || undefined,
  isAdmin: u.isAdmin || undefined,
  hasInvalidBilling: u.hasInvalidBilling || undefined,
  stripeCardLast4: u.stripeCardLast4 || undefined,
  smsSubscribed: u.smsSubscribed || undefined,
  emailSubscribed: u.emailSubscribed || undefined,
  email: u.email || undefined,
  name: u.name || undefined,
  signupComplete: u.signupComplete || undefined,
  selectedPlan: u.selectedPlan || undefined,
  createdAt: u.createdAt || undefined,
  phoneNumber: u.phoneNumber || undefined,
  updatedAt: u.updatedAt || undefined,
  hasConnectedBilling: u.hasConnectedBilling || undefined,
  CurrentLocation: u.CurrentLocation ? {
    __typename: 'Location',
    id: u.CurrentLocation.id || undefined,
    googleName: u.CurrentLocation.googleName || undefined,
    googlePlaceId: u.CurrentLocation.googlePlaceId || undefined
  } : undefined,
  Avatar: u.Avatar ? {
    __typename: 'File',
    id: u.Avatar.id || undefined,
    key: u.Avatar.key || undefined
  } : undefined,
  CurrentCoach: u.CurrentCoach ? {
    __typename: 'User',
    id: u.CurrentCoach.id || undefined,
    name: u.CurrentCoach.name || undefined
  } : undefined
});
