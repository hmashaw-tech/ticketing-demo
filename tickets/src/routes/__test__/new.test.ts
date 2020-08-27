import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .send({})

    expect(response.status).not.toEqual(404)
})

it('can only be accesses if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401)
})

it('returns status other than 401 if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({})

    expect(response.status).not.toEqual(401)
})

it('returns error if invalid title', async () => {
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        price: 10
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        title: '',
        price: 10
    })
    .expect(400)
})

it('returns error if invalid price', async () => {
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        title: 'Fake Title'
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        title: 'Fake Title',
        price: -10
    })
    .expect(400)
})

it('creates a ticket if valid params', async () => {
    const title = 'Fake Title'
    const price = 20

    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        title,
        price
    })
    .expect(201)

    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].title).toEqual(title)
    expect(tickets[0].price).toEqual(price)
})

it('publishes an event', async () => {
    const title = 'Fake Title'
    const price = 20

    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
        title,
        price
    })
    .expect(201)

    expect(natsWrapper.stan.publish).toHaveBeenCalled()
})
