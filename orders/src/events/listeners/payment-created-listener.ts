import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, PaymentCreatedEvent } from '@hvag-tkt/shared'
import { Order, OrderStatus } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class PaymentCreatedListener extends BaseListener<PaymentCreatedEvent> {
    readonly topic = Topics.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(message: PaymentCreatedEvent['message'], msg: Message) {
        console.log('DEBUG:', message)
        const order = await Order.findById(message.orderId)

        if (!order) throw new Error('order not found')

        order.set({ status: OrderStatus.Complete })
        await order.save()

        // NOTE: Currently not publishing order:updated event
        // Once order is complete, there should be no additional updates
        // TODO :)

        msg.ack()
    }
}
