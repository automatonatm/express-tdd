const request = require('supertest')

const app = require('../app')

const SMTPServer = require("smtp-server").SMTPServer;

//jest.mock("nodemailer");

//const api  =  request(app);


const User = require('../src/models/User')


const sequelize = require('../src/config/db')


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

const postUser = (user = validUser, options = {}) => {

    const agent =  request(app).post('/api/v1/users')

    if(options.language) {
        agent.set('Accept-Language', options.language)
    }
    return agent.send(user)
}

describe('User Registration', () => {

    it('returns 200 OK when sign up is valid', async () => {
        const res = await postUser()
        expect(res.status).toBe(200)

    })


    it('returns success message when signup request is valid', async () => {

        const res = await postUser()
        expect(res.body.message).toBe('Account Created')
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


        expect(res3.body.validationErrors).toMatchObject({password: 'your password should have at least one special character', username: 'Username should be btw 3 to 10 xters long'})

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

    const username_null = 'Username cannot be null'
    const username_size = 'Username should be btw 3 to 10 xters long'
    const email_null = 'Email cannot be null'
    const email_invalid = 'Email must be a valid email'
    const password_null = 'Password cannot be null'
    const password_size = 'your password should have min and max length between 8-15'
    const password_pattern1 = 'your password should have at least one number'
    const password_pattern2 = 'your password should have at least one special character'
    const email_in_use = 'Email already in use'

    it.each`
     field         | value                        | expectedMessage
    ${'username'}  | ${null}                      | ${username_null}
    ${'username'}  | ${'us'}                      | ${username_size}
    ${'username'}  |  ${'u'.repeat(33)}     | ${username_size}
    ${'email'}     | ${null}                      | ${email_null}
    ${'email'}     | ${'user@'}                   | ${email_invalid}
    ${'password'}  | ${null}                      | ${password_null}
    ${'password'}  | ${'pass'}                    | ${password_size}
    ${'password'}  | ${'password'}                | ${password_pattern1}
    ${'password'}  | ${'password1'}               | ${password_pattern2}
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

        expect(response.body.validationErrors.email).toBe(email_in_use)

    })



    it('return errors for both username is null and email is in use', async () => {

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


    it('creates user inactive mode', async () => {

        await postUser()
        const users = await User.findAll()
        const savedUser = users[0]
        expect(savedUser.inactive).toBe(true)

    })

    it('creates user inactive mode even if request body contains inactive false', async () => {

        await postUser({...validUser, inactive: false})
        const users = await User.findAll()
        const savedUser = users[0]
        expect(savedUser.inactive).toBeTruthy()

    })


    it('creates an activation token for user', async () => {

        await postUser()
        const users = await User.findAll()
        const savedUser = users[0]
        expect(savedUser.activationToken).toBeTruthy()

    })

  /* it('sends an account activation email with activation token', async () => {

        let lastMail;

        const server = new SMTPServer({
            authOptional: true,
            onData(stream, session, callBack) {
                let mailBody
                stream.on('data', (data) => {
                    mailBody += data.toString()
                })
                stream.on('end', () => {
                    lastMail = mailBody()
                    callBack()
                })

            }

        })

        await server.listen(8585, 'localhost')

        await postUser()

        await server.close()

        const users = await User.findAll()
        const savedUser = users[0]

        expect(lastMail).toContain(validUser.email)

        expect(lastMail).toContain(savedUser.activationToken)


    })

*/

})



describe('Account activation', () => {

    it('activates the account when token is sent', async () => {

        await postUser()

        let users = await User.findAll()

        const token = users[0].activationToken;

        await  request(app).post(`/api/v1/users/token/${token}`).send()

        expect(users[0].inactive).toBe(false)


    })

})



describe('Internalization', () => {




    const username_null = 'Le nom d\'utilisateur ne peut pas être nul'
    const username_size = 'Le nom d\'utilisateur doit être compris entre 3 et 10 xters'
    const email_null = 'L\'e-mail ne peut pas être nul'
    const email_invalid = 'L\'e-mail doit être un e-mail valide'
    const password_null = 'Le mot de passe ne peut pas être nul'
    const password_size = 'votre mot de passe doit avoir une longueur minimale et maximale comprise entre 8 et 15'
    const password_pattern1 = 'votre mot de passe doit comporter au moins un chiffre'
    const password_pattern2 = 'votre mot de passe doit comporter au moins un caractère spécial'
    const email_in_use = 'Email déjà utilisé'
    const account_success = 'Compte créé'

    it.each`
     field         | value                        | expectedMessage
    ${'username'}  | ${null}                      | ${username_null}
    ${'username'}  | ${'us'}                      | ${username_size}
    ${'username'}  |  ${'u'.repeat(33)}     | ${username_size}
    ${'email'}     | ${null}                      | ${email_null}
    ${'email'}     | ${'user@'}                   | ${email_invalid}
    ${'password'}  | ${null}                      | ${password_null}
    ${'password'}  | ${'pass'}                    | ${password_size}
    ${'password'}  | ${'password'}                | ${password_pattern1}
    ${'password'}  | ${'password1'}               | ${password_pattern2}
    `('returns $expectedMessage when field is $value when language is set to french', async ({field, expectedMessage,  value}) => {

        const user = {
            user: 'user1',
            email: 'user@mail.com',
            password: 'P4ssword'
        }

        user[field] = value
        const response = await postUser(user,  {language: 'fr'})
        expect(response.body.validationErrors[field]).toBe(expectedMessage)
    })


    it('return Email already exists when same email is used', async () => {


        await User.create(  {...validUser})

        const response = await postUser(validUser, {language: 'fr'})

        expect(response.body.validationErrors.email).toBe(email_in_use)

    })

    it('returns success message when signup request is valid when language is set to french', async () => {
        const res =  await postUser(validUser, {language: 'fr'})
        expect(res.body.message).toBe(account_success)
        expect(res.body.success).toBe(true)
    })




})




