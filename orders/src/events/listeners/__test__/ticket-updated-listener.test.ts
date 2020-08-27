import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { TicketUpdatedEvent } from '@hvag-tkt/shared'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create listener instance
    const listener = new TicketUpdatedListener(natsWrapper.stan)

    // cerate and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()

    // create message event
    const message: TicketUpdatedEvent['message'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'Movie Sequel',
        price: 30,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, message, msg }
}

it('finds, updates and saves a ticket', async () => {
    const { listener, ticket, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket).toBeDefined()
    expect(updatedTicket?.version).toEqual(message.version)
    expect(updatedTicket?.title).toEqual(message.title)
    expect(updatedTicket?.price).toEqual(message.price)
})

it('acks the message', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})

it('does not ack the message on bad version number', async () => {
    const { listener, message, msg } = await setup()
    message.version = 10

    // call onMessage
    try {
        await listener.onMessage(message, msg)
    } catch (error) {}

    // confirm no ack
    expect(msg.ack).not.toHaveBeenCalled()
})
