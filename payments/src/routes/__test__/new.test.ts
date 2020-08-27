import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Payment } from '../../models/payment'
import { natsWrapper } from '../../nats-wrapper'
import { stripe } from '../../stripe'

// jest.mock('../../stripe')

it('has a route handler listening to /api/payments for post requests', async () => {
    const response = await request(app)
    .post('/api/payments')
    .send({})

    expect(response.status).not.toEqual(404)
})

it('can only be accesses if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/payments')
    .send({})
    .expect(401)
})

it('returns status other than 401 if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({})

    expect(response.status).not.toEqual(401)
})

it('returns 404 if purchasing an order that does not exist', async () => {
    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
        token: 'faker-token',
        orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
})

it('returns 401 if purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 25,
        status: OrderStatus.Created
    })
    await order.save()

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
        token: 'faker-token',
        orderId: order.id
    })
    .expect(401)
})

it('returns 400 if purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 25,
        status: OrderStatus.Cancelled
    })
    await order.save()

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
        token: 'faker-token',
        orderId: order.id
    })
    .expect(400)
})

// When mock
// it('returns 201 if all good', async () => {
//     const userId = mongoose.Types.ObjectId().toHexString()

//     const order = Order.build({
//         id: mongoose.Types.ObjectId().toHexString(),
//         userId,
//         version: 0,
//         price: 25,
//         status: OrderStatus.Created
//     })
//     await order.save()

//     console.log('All good to here...')
//     await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.getCookie(userId))
//     .send({
//         token: 'tok_visa',
//         orderId: order.id
//     })
//     .expect(201)

//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    
//     expect(chargeOptions.source).toEqual('tok_visa')
//     expect(chargeOptions.amount).toEqual(25 * 100)
//     expect(chargeOptions.currency).toEqual('usd')
// })

// When live
// it('returns 204 if all good', async () => {
//     const userId = mongoose.Types.ObjectId().toHexString()

//     const price = Math.floor(Math.random() * 100000)

//     const order = Order.build({
//         id: mongoose.Types.ObjectId().toHexString(),
//         userId,
//         version: 0,
//         price,
//         status: OrderStatus.Created
//     })
//     await order.save()

//     await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.getCookie(userId))
//     .send({
//         token: 'tok_visa',
//         orderId: order.id
//     })
//     .expect(201)

//     const stripeCharges = await stripe.charges.list({ limit: 10 })
//     const stripeCharge = stripeCharges.data.find(charge => {
//         return charge.amount === price * 100
//     })
    
//     expect(stripeCharge).toBeDefined()
//     expect(stripeCharge?.currency).toEqual('usd')

//     const payment = await Payment.findOne({
//         orderId: order.id,
//         stripeId: stripeCharge!.id
//     })

//     expect(payment).not.toBeNull()
// })
