import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { OrderCreatedEvent, OrderStatus } from '@hvag-tkt/shared'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'

const setup = async () => {
    // create listener instance
    const listener = new OrderCreatedListener(natsWrapper.stan)

    // create message event
    const message: OrderCreatedEvent['message'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
            id: 'faker-id',
            price: 25
        }
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, message, msg }
}

it('replicates order info', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const order = await Order.findById(message.id)
    expect(order?.id).toEqual(message.id)
})

it('acks the message', async () => {
    const { listener, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})
