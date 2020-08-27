import Router from 'next/router'
import { useState } from 'react'

import useRequest from '../../hooks/use-request'

const signup = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: { email, password },
        onSuccess: () => Router.push('/')
    })

    const onFormSubmit = async event => {
        event.preventDefault()
        doRequest()
    }

    return (
        <div className="container">
        <form onSubmit={onFormSubmit}>
            <h1>Sign In</h1>

            <div className="form-group">
                <label>Email Address</label>
                <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            {errors}
            
            <button className="btn btn-primary">Sign In</button>
        </form>
        </div>
    )

}

export default signup
