import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

const title = 'Mock Title'
const price = 20

it('#1. returns 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title, price })
    .expect(401)
})

it('#2. returns 404 if id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getCookie())
    .send({ title, price })
    .expect(404)
})

it('#3. returns 401 if user does not own ticket', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title, price })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getCookie())
    .send({ title, price: 1000 })
    .expect(401)

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

    expect(ticketResponse.body.title).toEqual(title)
    expect(ticketResponse.body.price).toEqual(price)
})

it('#4. returns 400 for invalid title/price', async () => {
    const title = 'Fake Title'
    const price = 20

    const cookie = global.getCookie()

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ price: 10 })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 10 })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Fake Title' })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Fake Title', price: -10 })
    .expect(400)

})

it('#5. updates the ticket if all is well', async () => {
    const title = 'Fake Title'
    const price = 20

    const cookie = global.getCookie()

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Updated Title', price: 100 })
    .expect(200)

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

    expect(ticketResponse.body.title).toEqual('Updated Title')
    expect(ticketResponse.body.price).toEqual(100)
})

it('#6. publishes an event', async () => {
    const title = 'Fake Title'
    const price = 20

    const cookie = global.getCookie()

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Updated Title', price: 100 })
    .expect(200)

    expect(natsWrapper.stan.publish).toBeCalledTimes(2)
})

it('#7. rejects updates if the ticket is reserved', async () => {
    const title = 'Fake Title'
    const price = 20

    const cookie = global.getCookie()

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

    const ticket = await Ticket.findById(response.body.id)
    ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() })
    await ticket?.save()

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Updated Title', price: 100 })
    .expect(400)
})
