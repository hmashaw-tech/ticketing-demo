import axios from 'axios'

const buidClient = ({ req }) => {

    if (typeof window === 'undefined') {

        // on server, send request to fully qualified ingress url
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local:8080',
            headers: req.headers
        })

    } else {

        // in browser, base url = ''
        return axios.create({})

    }

}

export default buidClient
