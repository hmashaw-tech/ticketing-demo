import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './order'

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface TicketProps {
    id: string
    title: string
    price: number
}

// Interface for Ticket Document
export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    version: number
    isReserved(): Promise<boolean>
}

// Yet another interface in support of TypeScript
// Describe properties of model - supports statics below
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(props: TicketProps): TicketDoc
    findByIdAndVersion(criteria: { id: string, version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

// Add custom function to model
ticketSchema.statics.build = (props: TicketProps) => {
    return new Ticket({
        _id: props.id,
        title: props.title,
        price: props.price
    })
}

ticketSchema.statics.findByIdAndVersion = (criteria: { id: string, version: number }) => {
    return Ticket.findOne({ _id: criteria.id, version: criteria.version - 1 })
}

// Document method
ticketSchema.methods.isReserved = async function() {
    // Find order with this ticket and order status != cancelled
    const existingOrder = await Order.findOne({
        ticket: this,
        status: { $ne: OrderStatus.Cancelled }
    })
    return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
