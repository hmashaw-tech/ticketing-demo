import { Message } from 'node-nats-streaming'

import { BaseListener } from './base-listener'
import { TicketCreatedEvent } from './ticket-created-event'
import { Topics } from './topics'

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {

    readonly topic = Topics.TicketCreated
    queueGroupName = 'payments-service'

    onMessage(message: TicketCreatedEvent['message'], msg: Message) {
        console.log('Message Detail:', message)
        msg.ack()
    }

}
