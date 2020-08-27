import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { OrderCancelledEvent, OrderStatus } from '@hvag-tkt/shared'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'

const setup = async () => {
    // create listener instance
    const listener = new OrderCancelledListener(natsWrapper.stan)

    // create and save an order
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: 'faker-id',
        price: 25,
        status: OrderStatus.Created,
        version: 0
    })
    await order.save()

    // create message event
    const message: OrderCancelledEvent['message'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'faker-id'
        }
    }

    // create Msg Obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, message, msg }
}

it('updates the order status - cancelled', async () => {
    const { listener, order, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // assert
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, order, message, msg } = await setup()

    // call onMessage
    await listener.onMessage(message, msg)

    // confirm ack
    expect(msg.ack).toHaveBeenCalled()
})
