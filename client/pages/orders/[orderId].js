import Router from 'next/router'
import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'

const OrderShow = ({ order, currentUser, SKP }) => {

    // console.log('DEBUG_P:', process.env.NEXT_PUBLIC_STRIPE_KEY_P)

    const [timeLeft, setTimeLeft] = useState(0)

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })

    useEffect(() => {
        const getTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        getTimeLeft()
        const timerId = setInterval(getTimeLeft, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [])

    if (timeLeft < 0) return <div>Order Expired</div>

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey={process.env.NEXT_PUBLIC_STRIPE_KEY_P}
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    )
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)
    const SKP = process.env.STRIPE_KEY_P
    return { order: data, SKP }
}

export default OrderShow
