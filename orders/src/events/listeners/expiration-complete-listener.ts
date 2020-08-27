import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, ExpirationCompleteEvent, OrderStatus } from '@hvag-tkt/shared'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers//order-cancelled-publisher'
import { queueGroupName } from './queue-group-name'

export class ExpirationCompleteListener extends BaseListener<ExpirationCompleteEvent> {
    readonly topic = Topics.ExpirationComplete
    queueGroupName = queueGroupName

    async onMessage(message: ExpirationCompleteEvent['message'], msg: Message) {
        const order = await Order.findById(message.orderId).populate('ticket')

        if (!order) throw new Error('Order not found')

        // Do not cancel completed orders
        if (order.status === OrderStatus.Complete) return msg.ack()

        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        await new OrderCancelledPublisher(this.stan).publish({
            id: order.id,
            version: order.version,
            ticket: { id: order.ticket.id }
        })
        
        msg.ack()
    }
}
