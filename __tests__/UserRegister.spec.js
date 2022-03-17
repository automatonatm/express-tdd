const request = require('supertest')
const globalErrorHandler = require('../utils/errorHandler');

const app = require('../app')



const User = require('../models/User')


const sequelize = require('../database/db')

beforeAll(() => {
    return sequelize.sync()
})

beforeEach(() => {
    return User.destroy({truncate: true})
})


const validUser = {
    username: 'user1',
    email: "user1@email.com",
    password: 'password#2'
}

const postUser = (user = validUser) => {
    return request(app)
        .post('/api/v1/users')
        .send(user)
}

describe('User Registration', () => {




    it('returns 200 OK when sign up is valid', async () => {

        const res = await postUser()
        expect(res.status).toBe(200)

    })


    it('returns success message when signup request is valid', async () => {

        const res = await postUser()



        expect(res.body.message).toBe('Account created')
        expect(res.body.success).toBe(true)


    })

    it('saves the user to database', async () => {

        const res = await postUser()

        const users = await User.findAll()

        expect(users.length).toBe(1)

    })

    it('it saves username and email to database', async () => {


        const res = await postUser()

        const users = await User.findAll()

        expect(users[0].username).toBe(validUser.username)
        expect(users[0].email).toBe(validUser.email)

    })


    it('hashes the password in db', async () => {


        const res = await postUser()

        const users = await User.findAll()
        const user = users[0]

        expect(user.password).not.toBe(validUser.password)

    })

    it('returns 400 when username is null', async () => {
        const  res = await postUser({
            username: null,
            email: "user1@email.com",
            password: 'password'
        })

        expect(res.status).toBe(400)

    })

    it('returns validationErrors field in response body when validation error occurs', async () => {


            const  res = await postUser({
                username: null,
                email: "user1@email.com",
                password: 'password'
            })

            expect(res.body.validationErrors).not.toBeUndefined()
    })

    it.each([
        ['username', 'Username cannot be null'],
        ['email', 'Email cannot be null'],
        ['password', 'Password cannot be null'],
    ])('when %s is null %s is received', async (field, expectedMessage) => {
        const user = {
            username: "morld",
            email: "user1@email.com",
            password: 'password'
        }

        user[field] = null
        res = await postUser(user)
        expect(res.body.validationErrors[field]).toBe(expectedMessage)
    })






    it('returns validation errors and messages ', async () => {


        const  res1 = await postUser({
            username: null,
            email: "user1@email.com",
            password: 'password'
        })

        const  res2= await postUser({
            username: "username",
            email: null,
            password: 'password'
        })


        const  res3= await postUser({
            username: "us",
            email: "",
            password: 'password1'
        })



        expect(res1.body.validationErrors).toMatchObject({username: 'Username cannot be null'})


        expect(res2.body.validationErrors).toMatchObject({email: 'Email cannot be null'})


        expect(res3.body.validationErrors).toMatchObject({password: 'your password should have at least one sepcial character', username: 'Username should be btw 3 to 10 xters long'})

      //  expect(res.body.validationErrors.username).toBe('Username cannot be null')


    })


    it('returns errors for both when username and email is null ', async () => {


        const  res = await postUser({
            username: "",
            email: "",
            password: 'password'
        })


       // expect(Object.keys(res.body.validationErrors)).toEqual(['email', 'username'])

        expect(Object.keys(res.body.validationErrors)).toEqual(expect.arrayContaining(['email', 'username']))

        expect(Object.keys(res.body.validationErrors).includes('email', 'username')).toBe(true)

        expect(Object.keys(res.body.validationErrors).includes('email', 'username')).toBeTruthy()

        expect(res.body.validationErrors).toMatchObject({email: 'Email cannot be null', username: 'Username cannot be null'})



    })


   it('returns password cannot be null when password is null', async () => {

       const  res = await postUser({
           username: "user",
           email: "user@mail.com",
           password: ''
       })

       expect(res.body.validationErrors).toMatchObject({password: 'Password cannot be null'})

   } )


    it.each`
     field         | value                        | expectedMessage
    ${'username'}  | ${null}                      | ${'Username cannot be null'}
    ${'username'}  | ${'us'}                      | ${'Username should be btw 3 to 10 xters long'}
    ${'username'}  |  ${'u'.repeat(33)}     |  ${'Username should be btw 3 to 10 xters long'}
    ${'email'}     | ${null}                      | ${'Email cannot be null'}
    ${'email'}     | ${'user@'}                   | ${'Email must be a valid email'}
    ${'password'}  | ${null}                      | ${'Password cannot be null'}
    ${'password'}  | ${'pass'}                    | ${'your password should have min and max length between 8-15'}
    ${'password'}  | ${'password'}                | ${'your password should have at least one number'}
    ${'password'}  | ${'password1'}               | ${'your password should have at least one sepcial character'}
    `('returns $expectedMessage when field is $value', async ({field, expectedMessage,  value}) => {

       const user = {
            user: 'user1',
            email: 'user@mail.com',
            password: 'P4ssword'
        }

        user[field] = value
        const response = await postUser(user)
        expect(response.body.validationErrors[field]).toBe(expectedMessage)
    })


    it('return Email already exists when same email is used', async () => {


        await User.create(  {...validUser})

        const response = await postUser()

        expect(response.body.validationErrors.email).toBe('Email already in use')

    })



    it('return errors for both username is null and email in user', async () => {

        await User.create(  {...validUser})

        const response = await postUser({
            username: null,
            email: validUser.email,
            password: 'password1#'
        })

      //  expect(Object.keys(response.body.validationErrors)).toBe(['username', 'email'])
        expect(response.body.validationErrors).toMatchObject({email: 'Email already in use', username: 'Username cannot be null'})
        expect(Object.keys(response.body.validationErrors)).toEqual(expect.arrayContaining(['email', 'username']))

    })



})



