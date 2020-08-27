import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { OrderCreatedEvent, OrderStatus } from '@hvag-tkt/shared'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create listener instance
    const listener = new OrderCreatedListener(natsWrapper.stan)

    // cerate and save a ticket
    const ticket = Ticket.build({
        title: 'Movie',
        price: 25,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    // create message event
    const message: OrderCreatedEvent['message'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, message, msg }
}

it('sets the orderId of the ticket', async () => {
    const { listener, ticket, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket?.orderId).toEqual(message.id)
})

it('acks the message', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    expect(natsWrapper.stan.publish).toHaveBeenCalled()

    const ticketUpdatedMessage = JSON.parse((natsWrapper.stan.publish as jest.Mock).mock.calls[0][1])

    expect(message.id).toEqual(ticketUpdatedMessage.orderId)
})
