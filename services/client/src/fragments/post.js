import gql from 'graphql-tag';

export default gql`
  fragment PostFragment on Post {
    __typename
    id
    title
    slug
    summary
    content
    status
    createdAt
    updatedAt
    Image {
      __typename
      id
      key
    }
  }
`;
