import gql from 'graphql-tag';

export default gql`
  fragment UserFragment on User {
    __typename
    id
    name
    email
    phoneNumber
    emailSubscribed
    smsSubscribed
    isAdmin
    signupComplete
    selectedPlan
    stripeCardLast4
    hasConnectedBilling
    hasInvalidBilling
    createdAt
    CurrentLocation {
      __typename
      id
      googleName
      googlePlaceId
    }
    Avatar {
      __typename
      id
      key
    }
  }
`;
