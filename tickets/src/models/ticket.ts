import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface TicketProps {
    title: string
    price: number
    userId: string
}

// Interface for Ticket Document
// version used for OCC
interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
}

// Yet another interface in support of TypeScript
// Describe properties of model - supports statics below
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(props: TicketProps): TicketDoc
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: false
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
    return new Ticket(props)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
