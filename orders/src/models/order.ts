import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '@hvag-tkt/shared'
import { TicketDoc } from './ticket'

export { OrderStatus }

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface OrderProps {
    userId: string
    status: OrderStatus
    expiresAt: Date
    ticket: TicketDoc
}

// Interface for Order Document
interface OrderDoc extends mongoose.Document {
    userId: string
    status: OrderStatus
    expiresAt: Date
    ticket: TicketDoc
    version: number
}

// Yet another interface in support of TypeScript
// Describe properties of model - supports statics below
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(props: OrderProps): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

// Add custom function to model
orderSchema.statics.build = (props: OrderProps) => {
    return new Order(props)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
