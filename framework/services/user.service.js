import { config } from '../config/config.js'

export const userService = {
  async createUser({ userName, password }) {
    const response = await fetch(`${config.baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userName, password })
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async getUserAuthStatus({ userName, password }) {
    const response = await fetch(`${config.baseUrl}/Account/v1/Authorized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userName, password })
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async generateToken({ userName, password }) {
    const response = await fetch(`${config.baseUrl}/Account/v1/GenerateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userName, password })
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async getUser({ UUID, token }) {
    const response = await fetch(`${config.baseUrl}/Account/v1/User/${UUID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async deleteUser({ UUID, token }) {
    const response = await fetch(`${config.baseUrl}/Account/v1/User/${UUID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (response.status === 204) {
      return { status: response.status }
    } else {
      const data = await response.json()
      return { status: response.status, data }
    }
  }
}
