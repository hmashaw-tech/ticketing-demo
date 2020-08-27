import mongoose from 'mongoose'
import { PasswordManager } from '../utils/PasswordManager'

// Mongoose + TypeScript = Crazy!

// This interface and build fn below are being used because we're
// using TypeScript - enables type checking
interface UserProps {
    email: string
    password: string
}

// Interface for User Document
interface UserDoc extends mongoose.Document {
    email: string
    password: string
}

// Yet another interface in support of TypeScript
// Describe properties of model - supports statics below
interface UserModel extends mongoose.Model<UserDoc> {
    build(props: UserProps): UserDoc
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.__v
        }
    }
})

// Replace submitted password in document with hashed version
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const hashed = await PasswordManager.toHash(this.get('password'))
        this.set('password', hashed)
    }
})

// Add custom function to model
userSchema.statics.build = (props: UserProps) => {
    return new User(props)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
