import debug from 'debug';

import { InvalidExchangeError, InvalidExchangeTypeError } from '../errors/internal';

import { connectedPromise } from '../io/rabbitmq';

const log = debug('graphql:connectors:rabbitmq');

const bufferToObject = buffer => JSON.parse(buffer.toString('utf8'));

const objectToBuffer = obj => new Buffer(JSON.stringify(obj), 'utf8');

let channel = null;

function requiresConnectedChannel (target, name, descriptor) {
  const orgMethod = descriptor.value;
  descriptor.value = async function () {
    channel = await connectedPromise;
    return await orgMethod.apply(this, arguments);
  };
  return descriptor;
}

export class Exchange {
  static types = {
    direct: 'direct',
    fanout: 'fanout',
    topic: 'topic',
    headers: 'match'
  };

  constructor (name = '', type = Exchange.types.direct, options = {}) {
    if (!Exchange.types[type]) throw new InvalidExchangeTypeError(type);
    this.__name = name;
    this.__type = type;
    this.__options = options;
    this.__asserted = false;
  }

  get name () {
    return this.__name;
  }

  @requiresConnectedChannel
  async assert () {
    if (!this.__asserted) await channel.assertExchange(this.name, this.__type, this.__options);
    this.__asserted = true;
    return true;
  }

  @requiresConnectedChannel
  async publish (routingKey = '', data = {}, options = {}) {
    await this.assert();
    log(`dispatching on ${routingKey}`);
    return channel.publish(this.name, routingKey, objectToBuffer(data), options);
  }
}

export class Queue {
  constructor (name = '', options = {}) {
    this.__name = name;
    this.__options = options;
    this.__boundTo = [];
    this.__asserted = false;
  }

  get name () {
    return this.__name;
  }

  @requiresConnectedChannel
  async assert () {
    if (!this.__asserted) await channel.assertQueue(this.name, this.__options);
    this.__asserted = true;
    return true;
  }

  @requiresConnectedChannel
  purge () {
    return channel.purgeQueue(this.name);
  }

  @requiresConnectedChannel
  async bind (exchange, routingKey = '', args = {}) {
    if (!(exchange instanceof Exchange)) throw new InvalidExchangeError({
      data: {
        queueName: this.__name
      }
    });
    const ret = await channel.bindQueue(this.name, exchange.name, routingKey, args);
    this.__boundTo.push({name: exchange.name, key: routingKey});
    return ret;
  }

  @requiresConnectedChannel
  async subscribe (fn, options = {}) {
    await this.assert();
    const { consumerTag } = await channel.consume(this.name, (message) => fn(new Message(message)), options);
    return consumerTag;
  }

  @requiresConnectedChannel
  async unsubscribe (tag) {
    await this.assert();
    return channel.cancel(tag);
  }
}

export class Message {
  constructor (message) {
    this.__data = bufferToObject(message.content);
    this.__message = message;
    this.__fields = message.fields;
    this.__properties = message.properties;
  }

  get data () {
    return this.__data;
  }

  get type () {
    return this.__message.fields.routingKey;
  }

  @requiresConnectedChannel
  ack () {
    return channel.ack(this.__message);
  }

  @requiresConnectedChannel
  nack (retry = false) {
    return channel.nack(this.__message, false, retry);
  }
}
