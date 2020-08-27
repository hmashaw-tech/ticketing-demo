// _app.js is how we import global css when using NextJS.  This file
// is loaded with every page request, unlike index.js, etc.
// https://github.com/vercel/next.js/blob/canary/errors/css-global.md

import 'bootstrap/dist/css/bootstrap.css'

import HeaderComponent from '../components/header'
import buildClient from '../api/build-client'

const AppComponent =  ({ Component, pageProps, currentUser }) => {
    return <div>
        <HeaderComponent currentUser={currentUser} />
        <div className="container">
            <Component currentUser={currentUser} {...pageProps} />
        </div>
    </div>
}

AppComponent.getInitialProps = async appContext => {
    const axiosClient = buildClient(appContext.ctx)

    const { data } = await axiosClient.get('/api/users/currentuser')

    // Does the wrapped page also have a getInitialProps fn?
    let pageProps = {}
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, axiosClient, data.currentUser)
    }
    
    return {
        pageProps,
        ...data
        // currentUser: data.currentUser
    }
}

export default AppComponent
