# GraphQL Node/React Boilerplate

GraphQL Node/React Boilerplate, (GNRP for short) is a fast way to start building out a custom GraphQL project. And yes, GraphQL is as awesome as promised.

You can find the [open source code on github](https://github.com/ztratar/graphql-node-react-boilerplate). It is available for non-commercial use.

Warning: This repo is still using an old version of Apollo (apollo-client). Apollo has gone through a number of improvements & breaking changes. I intend to upgrade this repo to a newer version, and will do so when I have more time.

## Installation

> 1. Fork the repository
> 2. yarn install
> 3. make containers-up
> 4. make watch

## Features

Why all of the above tech? Not for the sake of just using them, of course... they enable real engineering & business value in the form of some of the following features.

- Docker-based Services
- GraphQL + Restful Endpoints
- GraphQL Subscriptions (Real-time Pub/Sub)
- React Server-side Rendering
- JWT-based Authentication
- Simple, Abstracted File Store
- CRON Workers w/ Distributed Lock
- Nightwatch E2E Tests
- MJML Email Templates
- Email Tracking (Opens, Clicks, Spam Reports, etc)
- API Request Timing Logs
- Signup UTM Tracking
- Basic Recurring Payments
- Easy Send-to-Slack Channel Notifications

## Technologies

- Node.js, Express
- GraphQL, Apollo
- Javascript, React, Redux, Webpack
- Postgres, Sequelize
- Elasticsearch
- Nightwatch, Selenium
- Etcd
- Redis
- RabbitMQ
- Statsd
- HTML, MJML, CSS

## Backstory

This is a heavily stripped down code-base that ran our startup, [Jobstart](https://www.jobstart.com), in production for more than year and a half with 99% uptime. We were involved in the GraphQL & Apollo communities, presented some of our ideas at Apollo Day, and [published one of the top guides to getting started with GraphQL]([https://www.jobstart.com/posts/graphql-tutorial-getting-started](https://www.jobstart.com/posts/graphql-tutorial-getting-started)).

We've implemented custom solutions to some issues, which are included in this project and available as separate repositories:

- [Apollo-errors]([https://github.com/thebigredgeek/apollo-errors](https://github.com/thebigredgeek/apollo-errors)) (6,400 weekly downloads)
- [Apollo-resolvers]([https://github.com/thebigredgeek/apollo-resolvers](https://github.com/thebigredgeek/apollo-resolvers)) (1,400 weekly downloads)

This boilerplate works, but best practices as defined by open-source communities are always changing, especially for GraphQL.

## Integrations & Connectors

In order to accomplish 

- AWS
- Clearbit
- Datadog
- Facebook
- Google Maps (Places)
- Sendgrid
- Segment
- Sentry
- Stripe
- Slack
