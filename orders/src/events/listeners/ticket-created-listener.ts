import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, TicketCreatedEvent } from '@hvag-tkt/shared'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
    readonly topic = Topics.TicketCreated
    queueGroupName = queueGroupName

    async onMessage(message: TicketCreatedEvent['message'], msg: Message) {
        const { id, title, price } = message

        const ticket = Ticket.build({ id, title, price })
        await ticket.save()

        msg.ack()
    }
}
