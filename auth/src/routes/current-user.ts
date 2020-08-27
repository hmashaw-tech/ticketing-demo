import express from 'express'
import jwt from 'jsonwebtoken'

import { currentUser } from '@hvag-tkt/shared'

const router = express.Router()

router.get('/api/users/currentuser', currentUser, (req, res) => {

    // Migrate functionality to currentUser Middleware
    res.send({ currentUser: req.currentUser || null })

    /*
    if (!req.session?.jwt) {
        return res.send({ currentuser: null })
    }

    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!)
        res.send({ currentuser: payload })
    } catch (error) {
        res.send({ currentuser: null })
    }*/
    
})

export { router as currentUserRouter }
