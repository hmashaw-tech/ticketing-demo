import { Message } from 'node-nats-streaming'
import { Topics, BaseListener, OrderCancelledEvent } from '@hvag-tkt/shared'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly topic = Topics.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(message: OrderCancelledEvent['message'], msg: Message) {

        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(message.ticket.id)

        // If no ticket, throw error
        if (!ticket) throw new Error('Ticket not found')

        // Mark ticket as being NOT reserved - set orderId
        ticket.set({ orderId: undefined })

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
