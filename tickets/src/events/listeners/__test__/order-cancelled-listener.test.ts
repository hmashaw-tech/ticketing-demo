import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { OrderCancelledEvent, OrderStatus } from '@hvag-tkt/shared'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create listener instance
    const listener = new OrderCancelledListener(natsWrapper.stan)

    // cerate and save a ticket
    const orderId = mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: 'Movie',
        price: 25,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    ticket.set({ orderId })
    await ticket.save()

    // create message event
    const message: OrderCancelledEvent['message'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, orderId, message, msg }
}

it('UN-sets the orderId of the ticket', async () => {
    const { listener, ticket, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket?.orderId).toBe(undefined)
})

it('acks the message', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})

it.todo('publishes a ticket updated event')
// it('publishes a ticket updated event', async () => {
//     const { listener, ticket, message, msg } = await setup()

//     // call onMessage
//     await listener.onMessage(message, msg)

//     // assert
//     expect(natsWrapper.stan.publish).toHaveBeenCalled()

//     const ticketUpdatedMessage = JSON.parse((natsWrapper.stan.publish as jest.Mock).mock.calls[0][1])
//     console.log(ticketUpdatedMessage)

//     expect(message.id).toEqual(ticketUpdatedMessage.orderId)
// })
