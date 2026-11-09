import { userService } from '../framework/services/user.service.js'
import { userData } from '../framework/fixtures/user.fixture.js'

describe('User tests', () => {
  let userCreds
  let userId
  let token

  beforeAll(async () => {
    userCreds = userData()
    const createUserResponse = await userService.createUser(userCreds)
    userId = createUserResponse.data.userID
    const generateTokenResponse = await userService.generateToken(userCreds)
    token = generateTokenResponse.data.token
  })

  describe('User Authorisation tests', () => {
    test('Authorisation successful with valid credentials', async () => {
      const response = await userService.getUserAuthStatus(userCreds)
      expect(response.status).toBe(200)
      expect(response.data).toBe(true)
    })

    test('Authorisation fails with invalid credentials', async () => {
      const response = await userService.getUserAuthStatus({ userName: 'InvalidUser', password: 'InvalidPassword' })
      expect(response.status).toBe(404)
      expect(response.data.code).toBe('1207')
      expect(response.data.message).toBe('User not found!')
    })

    test('Authorisation fails with valid username and invalid password', async () => {
      const response = await userService.getUserAuthStatus({
        userName: userCreds.userName,
        password: 'InvalidPassword'
      })
      expect(response.status).toBe(404)
      expect(response.data.code).toBe('1207')
      expect(response.data.message).toBe('User not found!')
    })

    test('Authorisation fails with invalid username and valid password', async () => {
      const response = await userService.getUserAuthStatus({ userName: 'InvalidUser', password: userCreds.password })
      expect(response.status).toBe(404)
      expect(response.data.code).toBe('1207')
      expect(response.data.message).toBe('User not found!')
    })

    test('Authorisation fails with empty username and password', async () => {
      const response = await userService.getUserAuthStatus({ userName: '', password: '' })
      expect(response.status).toBe(400)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('UserName and Password required.')
    })

    test('Authorisation fails with empty username and valid password', async () => {
      const response = await userService.getUserAuthStatus({ userName: '', password: userCreds.password })
      expect(response.status).toBe(400)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('UserName and Password required.')
    })

    test('Authorisation fails with valid username and empty password', async () => {
      const response = await userService.getUserAuthStatus({ userName: userCreds.userName, password: '' })
      expect(response.status).toBe(400)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('UserName and Password required.')
    })
  })

  describe('Get user tests', () => {
    test('Get user successfully with valid credentials', async () => {
      const response = await userService.getUser({ UUID: userId, token: token })
      expect(response.status).toBe(200)
      expect(response.data.userId).not.toBeNull()
      expect(response.data.userName).toBe(userCreds.username)
      expect(response.data.books).toEqual(expect.any(Array))
    })

    test('Get user fails with invalid token', async () => {
      const response = await userService.getUser({ UUID: userId, token: `${token}a` })
      expect(response.status).toBe(401)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('User not authorized!')
    })

    // Test fails because of the known error in swaagger documentation. The responce status is not 404 but 200.
    test.skip('Get user fails with invalid UUID', async () => {
      const response = await userService.getUser({ UUID: `${userId}a`, token: token })
      expect(response.status).toBe(404)
      expect(response.data.code).toBe('1207')
      expect(response.data.message).toBe('User not found!')
    })

    // Test fails because Account/v1/User/ returns 200 HTML instead of 400 JSON.
    test.skip('Get user fails with empty UUID', async () => {
      const response = await userService.getUser({ UUID: '', token: token })
      expect(response.status).toBe(400)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('UserId required.')
    })

    test('Get user fails with empty token', async () => {
      const response = await userService.getUser({ UUID: userId, token: '' })
      expect(response.status).toBe(401)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('User not authorized!')
    })
  })

  describe('Delete user tests', () => {
    test('Delete user fails with invalid token', async () => {
      const response = await userService.deleteUser({ UUID: userId, token: `${token}a` })
      expect(response.status).toBe(401)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('User not authorized!')
    })

    // Test fails because of the known error in swaagger documentation. The responce status is not 404 but 200.
    test.skip('Delete user fails with invalid UUID', async () => {
      const response = await userService.deleteUser({ UUID: `${userId}a`, token: token })
      expect(response.status).toBe(404)
      expect(response.data.code).toBe('1207')
      expect(response.data.message).toBe('User not found!')
    })

    // Test fails because Account/v1/User/ returns 200 HTML instead of 400 JSON.
    test.skip('Delete user fails with empty UUID', async () => {
      const response = await userService.deleteUser({ UUID: '', token: token })
      expect(response.status).toBe(400)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('UserId required.')
    })

    test('Delete user fails with empty token', async () => {
      const response = await userService.deleteUser({ UUID: userId, token: '' })
      expect(response.status).toBe(401)
      expect(response.data.code).toBe('1200')
      expect(response.data.message).toBe('User not authorized!')
    })

    test('Delete user successfully with valid credentials', async () => {
      const response = await userService.deleteUser({ UUID: userId, token: token })
      expect(response.status).toBe(204)
    })
  })
})
