import request from 'supertest'
import { app } from '../../app'

it('fails when email does not exists', async () => {
    await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(400)
})

it('fails when incorrect password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password1'
    })
    .expect(201)

    const response = await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password2'
    })
    .expect(400)
})

it('responds with cookie when good credentials', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201)

    const response = await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(200)

    expect (response.get('Set-Cookie')).toBeDefined()
    
})
