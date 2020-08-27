import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../app'

declare global {
    namespace NodeJS {
        interface Global {
            getCookie(): string[]
        }
    }
}

jest.mock('../nats-wrapper')

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
    jest.clearAllMocks()
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
global.getCookie = () => {

    // Mock this since auth service is not available

    // Builld JWT payload; { id, email }
    const payload = {
        //id: 'fake-id',
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'fake.id@fake.domain'
    }

    // Create JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session object; { jwt: MY_JWT }
    const session = { jwt: token }

    // Turn session into JSON
    const sessionJSON = JSON.stringify(session)

    // Encode JSON - base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    // Return string - cookie with encoded data
    return [`express:sess=${base64}`]

}

/*
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
*/
