import Router from 'next/router'
import { useEffect } from 'react'

import useRequest from '../../hooks/use-request'

const SignoutComponent = () => {
    
    const { doRequest, errors } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    })

    useEffect(() => {doRequest()}, [])

    return <div className="container">Signing you out...</div>

}

export default SignoutComponent
