import request from 'supertest'
import { app } from '../../app'

it('returns 201 on successful signup', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201)
})

it('returns 400 on invalid email', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test',
        password: 'password'
    })
    .expect(400)
})

it('returns 400 on invalid password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: '1'
    })
    .expect(400)
})

it('returns 400 on missing email or password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com'
    })
    .expect(400)

    await request(app)
    .post('/api/users/signup')
    .send({
        password: 'password'
    })
    .expect(400)
})

it('disallows duplicate email addresses', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password1'
    })
    .expect(201)

    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password2'
    })
    .expect(400)
})

it('sets a coolie after successful signup', async () => {
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201)

    expect (response.get('Set-Cookie')).toBeDefined()
})