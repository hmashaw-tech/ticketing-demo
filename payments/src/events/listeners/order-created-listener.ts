import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, OrderCreatedEvent } from '@hvag-tkt/shared'
import { Order } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly topic = Topics.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(message: OrderCreatedEvent['message'], msg: Message) {

        const order = Order.build({
            id: message.id,
            userId: message.userId,
            price: message.ticket.price,
            status: message.status,
            version: message.version
        })
        await order.save()

        msg.ack()
        
    }
}
