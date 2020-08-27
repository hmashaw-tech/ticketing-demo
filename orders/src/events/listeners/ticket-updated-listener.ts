import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, TicketUpdatedEvent } from '@hvag-tkt/shared'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends BaseListener<TicketUpdatedEvent> {
    readonly topic = Topics.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(message: TicketUpdatedEvent['message'], msg: Message) {
        const ticket = await Ticket.findByIdAndVersion(message)
        if (!ticket) throw new Error('Ticket not found')

        const { title, price } = message
        ticket.set({ title, price })
        await ticket.save()

        msg.ack()
    }
}
