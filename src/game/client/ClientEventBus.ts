import {
  ClientEvents,
  EventType,
  Handlers
} from '@/game/events/ClientEvents.ts';

type HandlerMap<T extends EventType> = Map<T, Set<Handlers[T]>>;

export class ClientEventBus {
  #topics: HandlerMap<EventType> = new Map();
  static #instance: ClientEventBus;

  private constructor() {}

  static instance() {
    if (!ClientEventBus.#instance) {
      ClientEventBus.#instance = new ClientEventBus();
    }
    return ClientEventBus.#instance;
  }

  subscribe<T extends EventType>(topic: T, handler: Handlers[T]) {
    let channel = this.#topics.get(topic);  
    
    if (!channel) {
      channel = new Set();
      this.#topics.set(topic, channel);
    }
    
    channel.add(handler);

    if (handler === undefined) console.trace()
    console.log(channel);
  }

  unsubscribe<T extends EventType>(topic: T, handler: Handlers[T]) {
    const channel = this.#topics.get(topic);

    if (!channel) {
      console.error('[EventBus] Topic "%s" not found', topic);
      return;
    }

    channel.delete(handler);
  }

  publish<T extends EventType>(topic: T, data: ClientEvents[T]) {
    const channel = this.#topics.get(topic) as Set<Handlers[T]>;

    if (!channel) {
      console.error('[EventBus] Topic "%s" not found', topic);
      return;
    }

    for (const handler of channel) {
      handler(data);
    }
    
    console.debug('[%s] posted message:', topic, data);
  }
}
