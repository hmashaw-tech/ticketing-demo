import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, OrderCancelledEvent } from '@hvag-tkt/shared'
import { Order, OrderStatus } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly topic = Topics.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(message: OrderCancelledEvent['message'], msg: Message) {

        const order = await Order.findOne({ _id: message.id, version: message.version - 1 })

        if (!order) throw new Error('Order not found')
        
        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        msg.ack()
        
    }
}
