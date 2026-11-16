import { config } from '../config/config.js'

export const bookService = {
  async getAllBooks() {
    const response = await fetch(`${config.baseUrl}/BookStore/v1/Books`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async addBookToUser({ userId, isbns, token }) {
    const response = await fetch(`${config.baseUrl}/BookStore/v1/Books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, collectionOfIsbns: isbns })
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async updateBookForUser({ userId, isbn, newIsbn, token }) {
    const response = await fetch(`${config.baseUrl}/BookStore/v1/Books/${isbn}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, isbn: newIsbn })
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async getBookInfo({ isbn }) {
    const response = await fetch(`${config.baseUrl}/BookStore/v1/Book?ISBN=${isbn}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return { status: response.status, data }
  },

  async deleteBookFromUser({ userId, isbn, token }) {
    const response = await fetch(`${config.baseUrl}/BookStore/v1/Book`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, isbn })
    })
    if (response.status === 204) {
      return { status: response.status, data: {} }
    }

    const data = await response.json()
    return { status: response.status, data }
  }
}
