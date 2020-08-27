import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'

it('returns 404 if ticket not found', async () => {
    const user = global.getCookie()
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', user)
    .send()
    .expect(404)
})

it('fetches an order', async () => {
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

    // fetch the order with ticket
    const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

    expect(fetchedOrder.id).toEqual(order.id)
})

it('return unauthorized when requesting different users order', async () => {
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
