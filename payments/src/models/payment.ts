import mongoose from 'mongoose'

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface PaymentProps {
    orderId: string
    stripeId: string
}

// Interface for Payment Document
interface PaymentDoc extends mongoose.Document {
    orderId: string
    stripeId: string
}

// Yet another interface in support of TypeScript
// Describe properties of model - supports statics below
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(props: PaymentProps): PaymentDoc
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

// Add custom function to model
paymentSchema.statics.build = (props: PaymentProps) => {
    return new Payment(props)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema)

export { Payment }
