import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { requireAuth, validateRequest, BadRequestError, NotAuthorizedError, NotFoundError } from '@hvag-tkt/shared'

import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put('/api/tickets/:id',
    requireAuth, 
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id)

        if (!ticket) throw new NotFoundError
        if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError
        if (ticket.orderId) throw new BadRequestError('Cannot edit a ticket while it is reserved')

        // in-memoty update
        ticket.set({
            title: req.body.title,
            price: req.body.price
        })

        // db update
        await ticket.save()

        // publish
        await new TicketUpdatedPublisher(natsWrapper.stan).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        })

        res.send(ticket)
    })

export { router as updateTicketRouter }
