import Link from 'next/link'
// import buildClient from '../api/build-client'

// Where does tickets come from? See getInitialProps below
const LandingPage = ({ currentUser, tickets }) => {
    // console.log('debug:', currentUser)
    // console.log('debug:', tickets)

    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        )
    })
    
    return currentUser ?
    (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
        
    ) :
    (
        <div>
            <h1>Landing Page</h1>
            <div>
                <h4>You are NOT signed in</h4>
            </div>
        </div>
    )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    // const axiosClient = buildClient(context)
    // const response = await axiosClient.get('/api/users/currentuser')
    // return response.data

    const { data } = await client.get('/api/tickets')
    return { tickets: data }
}

export default LandingPage
