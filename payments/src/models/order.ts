import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '@hvag-tkt/shared'

export { OrderStatus }

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface OrderProps {
    id: string
    userId: string
    price: number
    status: OrderStatus
    version: number
}

// Interface for Order Document
interface OrderDoc extends mongoose.Document {
    userId: string
    price: number
    status: OrderStatus
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
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
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
    return new Order({
        _id: props.id,
        version: props.version,
        price: props.price,
        userId: props.userId,
        status: props.status
    })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
