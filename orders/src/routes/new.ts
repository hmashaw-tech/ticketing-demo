import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import mongoose from 'mongoose'

import { requireAuth, validateRequest, BadRequestError, NotFoundError, OrderStatus } from '@hvag-tkt/shared'
import { Order } from '../models/order'
import { Ticket } from '../models/ticket'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const EXPIRATION_WINDOW_SECONDS = 60 * 2

const router = express.Router()

router.post('/api/orders',
    requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId is required')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body

        // Find ticket being ordered
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) throw new NotFoundError()

        // Confirm ticket not already reserved
        const isReserved = await ticket.isReserved()
        if (isReserved) throw new BadRequestError('Ticket is already reserved')

        // Calculate order expiration
        const expiration = new Date()
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

        // Build order and save to db
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        })
        await order.save()

        // Publish order created event
        new OrderCreatedPublisher(natsWrapper.stan).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        })
        
        res.status(201).send(order)
})

export { router as newOrderRouter }
