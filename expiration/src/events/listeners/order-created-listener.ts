import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, OrderCreatedEvent } from '@hvag-tkt/shared'
import { queueGroupName } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly topic = Topics.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(message: OrderCreatedEvent['message'], msg: Message) {

        const currentTime = new Date().getTime()
        const targetTime = new Date(message.expiresAt).getTime()
        const delay = targetTime - currentTime

        console.log(`waiting ${delay} milliseconds before processing job`)

        await expirationQueue.add(
            { orderId: message.id },
            { delay }
        )
        msg.ack()
    }
}
