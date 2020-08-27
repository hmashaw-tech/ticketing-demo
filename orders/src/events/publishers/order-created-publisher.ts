import { BasePublisher, Topics, OrderCreatedEvent } from '@hvag-tkt/shared'

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
    readonly topic = Topics.OrderCreated
}
