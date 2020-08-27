import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import { currentUser, errorHandler, NotFoundError } from '@hvag-tkt/shared'
import { createChargeRouter } from './routes/new'

const app = express()

// This app is behind nginx ingress proxy
app.set('trust proxy', true)

app.use(express.json())

app.use(cookieSession({
    signed: false,
    secure: false
    // secure: process.env.NODE_ENV !== 'test'
}))

// Typically will include app.get, app.post, etc. (routes) here but am using
// app.use with externally defined router instead
app.use(currentUser)
app.use(createChargeRouter)

/*
// Adding extras so that async functions are properly handled
// https://expressjs.com/en/guide/error-handling.html
app.all('*', async (req, res, next) => {
    next(new NotFoundError())
})
*/

// Redo above using express-async-errors
// https://www.npmjs.com/package/express-async-errors
app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }
