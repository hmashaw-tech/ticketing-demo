import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

it('returns 404 if ticket not found', async () => {
    const user = global.getCookie()
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', user)
    .send()
    .expect(404)
})

it('marks an order as cancelled', async () => {
    // ceate a ticket
    const ticket = Ticket.build({ 
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()

    const user = global.getCookie()

    // create an order with ticket
    const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

    // cancel the order
    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('return unauthorized when deleting different users order', async () => {
    // ceate a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()

    // create an order with ticket
    const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201)

    // fetch the order with ticket as different user
    const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401)
})

it('publishes an order cancelled event', async () => {
    // ceate a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()

    const user = global.getCookie()

    // create an order with ticket
    const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

    // cancel the order
    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

    expect(natsWrapper.stan.publish).toHaveBeenCalled()
})
