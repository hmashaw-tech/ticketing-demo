import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { OrderStatus, ExpirationCompleteEvent } from '@hvag-tkt/shared'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'

const setup = async () => {
    // create listener instance
    const listener = new ExpirationCompleteListener(natsWrapper.stan)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()

    const order = Order.build({
        userId: 'random-junk',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    // create message event
    const message: ExpirationCompleteEvent['message'] = {
        orderId: order.id
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, order, message, msg }
}

it('updates the order status to cancelled', async () => {
    const { listener, ticket, order, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled)
})

it('emits an OrderCancelled event', async() => {
    const { listener, ticket, order, message, msg } = await setup()

     // call onMessage
     await listener.onMessage(message, msg)

     // assert
     expect(natsWrapper.stan.publish).toHaveBeenCalled()
     
     const eventData = JSON.parse((natsWrapper.stan.publish as jest.Mock).mock.calls[0][1])
     expect(eventData.id).toEqual(order.id)
})

it('acks the message', async () => {
    const { listener, ticket, order, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})
