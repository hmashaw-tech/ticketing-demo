import request from 'supertest'
import { app } from '../../app'

const title = 'Mock Title'
const price = 20

const createTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title, price })
}

it('can fetch a list of tickets', async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

    expect(response.body.length).toEqual(3)
    expect(response.body[2].title).toEqual(title)
    expect(response.body[2].price).toEqual(price)
})
