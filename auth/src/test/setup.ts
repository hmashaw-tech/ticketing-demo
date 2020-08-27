import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../app'

declare global {
    namespace NodeJS {
        interface Global {
            getCookie(): Promise<string[]>
        }
    }
}

let mongo: MongoMemoryServer

beforeAll(async () => {
    process.env.JWT_KEY = 'fakeout_key'
    
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

// Note - Global is not a requirement - used for simplicity
global.getCookie = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201)

    const cookie = response.get('Set-Cookie')
    return cookie
}
