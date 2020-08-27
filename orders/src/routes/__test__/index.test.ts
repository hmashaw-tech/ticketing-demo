import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

const createTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Movie',
        price: 25
    })
    await ticket.save()
    return ticket
}

it('fetches orders for a given user', async () => {

    // create three tickets
    const ticketOne = await createTicket()
    const ticketTwo = await createTicket()
    const ticketThree = await createTicket()

    const userOne = global.getCookie()
    const userTwo = global.getCookie()

    // create one order as user #1
    await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201)

    // create two orders as user #2
    const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201)

    const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201)

    // get orders for user #2
    const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200)

    // confirm only got orders for user #2
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].id).toEqual(orderTwo.id)
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
    expect(response.body[1].ticket.id).toEqual(ticketThree.id)

})
