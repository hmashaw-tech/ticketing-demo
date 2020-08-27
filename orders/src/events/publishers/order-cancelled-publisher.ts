import { BasePublisher, Topics, OrderCancelledEvent } from '@hvag-tkt/shared'

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
    readonly topic = Topics.OrderCancelled
}
