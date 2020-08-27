import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/orders for post requests', async () => {
    const response = await request(app)
    .post('/api/orders')
    .send({})

    expect(response.status).not.toEqual(404)
})

it('can only be accesses if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/orders')
    .send({})
    .expect(401)
})

it('returns status other than 401 if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({})

    expect(response.status).not.toEqual(401)
})

it('returns error if invalid ticket id', async () => {
    await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: '' })
    .expect(400)
})

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId })
    .expect(404)
})

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        userId: 'Fake-User',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('creates an order if valid params and all is well', async () => {
    let orders = await Order.find({})
    expect(orders.length).toEqual(0)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 20
    })
    await ticket.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201)

    orders = await Order.find({})
    expect(orders.length).toEqual(1)
    // expect(orders[0].ticket.id).toEqual(ticket.id)
})

// it.todo('publishes an order created event')
it('publishes an order created event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 20
    })
    await ticket.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201)

    expect(natsWrapper.stan.publish).toHaveBeenCalled()
})
