import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { BadRequestError, validateRequest } from '@hvag-tkt/shared'

import { User } from '../models/user'
import { PasswordManager } from '../utils/PasswordManager'

const router = express.Router()

router.post('/api/users/signin',
    [
        // https://express-validator.github.io/docs/
    
        body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    
        body('password')
        .trim()
        .notEmpty()
        .withMessage('Password must be supplied')
    
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body
        const existingUser = await User.findOne({ email })
        
        if (!existingUser) {
            throw new BadRequestError('Invalid Credentials')
        }

        const passwordsMatch = await PasswordManager.compare(existingUser.password, password)
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid Credentials')
        }

        // Generate web token
        const userJWT = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!)

        // Store web token on session object
        req.session = { jwt: userJWT }

        res.status(200).send(existingUser)
    }
)

export { router as signinRouter }
