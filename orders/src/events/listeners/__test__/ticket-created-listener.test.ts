import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { TicketCreatedEvent } from '@hvag-tkt/shared'
import { TicketCreatedListener } from '../ticket-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create listener instance
    const listener = new TicketCreatedListener(natsWrapper.stan)

    // create message event
    const message: TicketCreatedEvent['message'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'Movie',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, message, msg }
}

it('creates and saves a ticket', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const ticket = await Ticket.findById(message.id)

    expect(ticket).toBeDefined()
    expect(ticket?.title).toEqual(message.title)
    expect(ticket?.price).toEqual(message.price)
})

it('acks the message', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})
