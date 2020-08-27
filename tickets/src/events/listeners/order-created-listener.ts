import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, OrderCreatedEvent } from '@hvag-tkt/shared'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly topic = Topics.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(message: OrderCreatedEvent['message'], msg: Message) {

        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(message.ticket.id)

        // If no ticket, throw error
        if (!ticket) throw new Error('Ticket not found')

        // Mark ticket as being reserved - set orderId
        ticket.set({ orderId: message.id })

        // Save the ticket
        await ticket.save()
        await new TicketUpdatedPublisher(this.stan).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        })

        // ack the message
        msg.ack()
        
    }
}
