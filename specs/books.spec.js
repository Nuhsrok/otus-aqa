import { userService } from '../framework/services/user.service.js'
import { userData } from '../framework/fixtures/user.fixture.js'
import { bookService } from '../framework/services/books.service.js'
import Ajv from 'ajv'
import { jest } from '@jest/globals'

jest.setTimeout(10000)

const ajv = new Ajv()

const bookSchema = {
    type: 'object',
  "properties": {
  "isbn": {type:'string'},
  "title": {type:'string'},
  "subTitle": {type:'string'},
  "author": {type:'string'},
  "publish_date": {type:'string'},
  "publisher": {type:'string'},
  "pages": {type:'number'},
  "description": {type:'string'},
  "website": {type:'string'}
},
required: [
    'isbn',
    'title',
    'subTitle',
    'author',
    'publish_date',
    'publisher',
    'pages',
    'description',
    'website'
  ],
  additionalProperties: false
}



describe('Book tests', () => {
  let userCreds
  let userId
  let token
  let firstBookIsbn
  let secondBookIsbn
  let thirdBookIsbn

  beforeAll(async () => {
    const getAllBooksResponse = await bookService.getAllBooks()
    firstBookIsbn = getAllBooksResponse.data.books[0].isbn
    secondBookIsbn = getAllBooksResponse.data.books[1].isbn
    thirdBookIsbn = getAllBooksResponse.data.books[2].isbn
  })

  beforeEach(async () => {
    userCreds = userData()
    const createUserResponse = await userService.createUser(userCreds)
    userId = createUserResponse.data.userID
    const generateTokenResponse = await userService.generateToken(userCreds)
    token = generateTokenResponse.data.token
  })

  afterEach(async () => {
    await userService.deleteUser({ UUID: userId, token })
  })

  describe('Add book to user', () => {
    test('Add one book to user successfully', async () => {
      const response = await bookService.addBookToUser({
        userId,
        isbns: [{ isbn: firstBookIsbn }],
        token
      })
      const responseUser = await userService.getUser({ UUID: userId, token })

      expect(response.data).toEqual({
        books: [{ isbn: firstBookIsbn }]
      })
      
      expect(responseUser.data.books).toHaveLength(1)
      expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
      expect(response.status).toBe(201)
      expect(responseUser.status).toBe(200)
    })

    test('Add one book then one more successfully and verify that user has two books', async () => {
      const response1 = await bookService.addBookToUser({
        userId,
        isbns: [{ isbn: firstBookIsbn }],
        token
      })
      const response2 = await bookService.addBookToUser({
        userId,
        isbns: [{ isbn: secondBookIsbn }],
        token
      })
      const responseUser = await userService.getUser({ UUID: userId, token })

      expect(response1.data).toEqual({
        books: [{ isbn: firstBookIsbn }]
      })
      expect(response1.status).toBe(201)

      expect(response2.data).toEqual({
        books: [{ isbn: secondBookIsbn }]
      })
      expect(response2.status).toBe(201)

      expect(responseUser.data.books).toHaveLength(2)
      expect(responseUser.data.books).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ isbn: firstBookIsbn }),
          expect.objectContaining({ isbn: secondBookIsbn })
        ])
      )
      expect(responseUser.status).toBe(200)
    })

      test('Add multiple books to user successfully', async () => {
        const response = await bookService.addBookToUser({
          userId,
          isbns: [{ isbn: firstBookIsbn }, { isbn: secondBookIsbn }, { isbn: thirdBookIsbn }],
          token
        })
        const responseUser = await userService.getUser({ UUID: userId, token })

        expect(response.data).toEqual({
          books: [{ isbn: firstBookIsbn }, { isbn: secondBookIsbn }, { isbn: thirdBookIsbn }]
        })
        expect(response.status).toBe(201)

        expect(responseUser.data.books).toHaveLength(3)
        expect(responseUser.data.books).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ isbn: firstBookIsbn }),
            expect.objectContaining({ isbn: secondBookIsbn }),
            expect.objectContaining({ isbn: thirdBookIsbn })
          ])
        )
        expect(responseUser.status).toBe(200)
      })

      test('Add the same book twice to user fails', async () => {
        const response1 = await bookService.addBookToUser({
          userId,
          isbns: [{ isbn: firstBookIsbn }],
          token
        })
        const response2 = await bookService.addBookToUser({
          userId,
          isbns: [{ isbn: firstBookIsbn }],
          token
        })

        expect(response1.data).toEqual({
          books: [{ isbn: firstBookIsbn }]
        })
        expect(response1.status).toBe(201)

        expect(response2.data.code).toBe('1210')
        expect(response2.data.message).toBe('ISBN already present in the User\'s Collection!')
        expect(response2.status).toBe(400)
      })

        test('Add book to user fails with invalid token', async () => {
          const response = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token: 'InvalidToken'
          })

          expect(response.data.code).toBe('1200')
          expect(response.data.message).toBe('User not authorized!')
          expect(response.status).toBe(401)
        })

        test('Add book to user fails with invalid userId', async () => {
          const response = await bookService.addBookToUser({
            userId: 'InvalidUserId',
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          expect(response.data.code).toBe('1207')
          expect(response.data.message).toBe('User Id not correct!')
          expect(response.status).toBe(401)
        })

        test('Add book to user fails with invalid isbn', async () => {
          const response = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: 'InvalidIsbn' }],
            token
          })

          expect(response.data.code).toBe('1205')
          expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
          expect(response.status).toBe(400)
        })

        test('Add book to user fails with empty isbn', async () => {
          const response = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: '' }],
            token
          })

          expect(response.data.code).toBe('1205')
          expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
          expect(response.status).toBe(400)
        })

        test('Add book to user fails with empty userId', async () => {
          const response = await bookService.addBookToUser({
            userId: '',
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          expect(response.data.code).toBe('1207')
          expect(response.data.message).toBe('User Id not correct!')
          expect(response.status).toBe(401)
        })
      })
    
      describe('Update book tests', () => {
        test('Update book successfully', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId,
            isbn: firstBookIsbn,
            newIsbn: secondBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.books).toHaveLength(1)
          expect(responseUpdate.data.books[0].isbn).toBe(secondBookIsbn)
          expect(responseUpdate.status).toBe(200)
          
          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(secondBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Update book with the same isbn fails', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId,
            isbn: firstBookIsbn,
            newIsbn: firstBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.code).toBe('1206')
          expect(responseUpdate.data.message).toBe('ISBN supplied is not available in User\'s Collection!')
          expect(responseUpdate.status).toBe(400)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Update book fails with invalid original isbn', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId,
            isbn: 'InvalidIsbn',
            newIsbn: secondBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.code).toBe('1206')
          expect(responseUpdate.data.message).toBe('ISBN supplied is not available in User\'s Collection!')
          expect(responseUpdate.status).toBe(400)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Update book fails with invalid new isbn', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId,
            isbn: firstBookIsbn,
            newIsbn: 'InvalidNewIsbn',
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.code).toBe('1205')
          expect(responseUpdate.data.message).toBe('ISBN supplied is not available in Books Collection!')
          expect(responseUpdate.status).toBe(400)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Update book fails with invalid token', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId,
            isbn: firstBookIsbn,
            newIsbn: secondBookIsbn,
            token: 'InvalidToken'
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.code).toBe('1200')
          expect(responseUpdate.data.message).toBe('User not authorized!')
          expect(responseUpdate.status).toBe(401)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Update book fails with invalid userId', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseUpdate = await bookService.updateBookForUser({
            userId: 'InvalidUserId',
            isbn: firstBookIsbn,
            newIsbn: secondBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseUpdate.data.code).toBe('1207')
          expect(responseUpdate.data.message).toBe('User Id not correct!')
          expect(responseUpdate.status).toBe(401)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })
      })

      describe('Get book info tests', () => {
        test('Get book info successfully', async () => {
          const response = await bookService.getBookInfo({ isbn: firstBookIsbn })
          expect(response.status).toBe(200)
          expect(response.data.isbn).toBe(firstBookIsbn)
          const validate = ajv.compile(bookSchema)
          const valid = validate(response.data)
          expect(valid).toBe(true)
        })

      test('Get book info fails with invalid isbn', async () => {
        const response = await bookService.getBookInfo({ isbn: 'InvalidIsbn' })

        expect(response.data.code).toBe('1205')
        expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
        expect(response.status).toBe(400)
      })

      test('Get book info fails with empty isbn', async () => {
        const response = await bookService.getBookInfo({ isbn: '' })
        
        expect(response.data.code).toBe('1205')
        expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
        expect(response.status).toBe(400)
      })  
      })

      describe('Delete book from user tests', () => {
        test('Delete book from user successfully', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseDelete = await bookService.deleteBookFromUser({
            userId,
            isbn: firstBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseDelete.data).toEqual({})
          expect(responseDelete.status).toBe(204)

          expect(responseUser.data.books).toHaveLength(0)
          expect(responseUser.status).toBe(200)
        })

        test('Delete book from user fails with invalid isbn', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseDelete = await bookService.deleteBookFromUser({
            userId,
            isbn: 'InvalidIsbn',
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseDelete.data.code).toBe('1206')
          expect(responseDelete.data.message).toBe('ISBN supplied is not available in User\'s Collection!')
          expect(responseDelete.status).toBe(400)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Delete book from user fails with invalid token', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseDelete = await bookService.deleteBookFromUser({
            userId,
            isbn: firstBookIsbn,
            token: 'InvalidToken'
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseDelete.data.code).toBe('1200')
          expect(responseDelete.data.message).toBe('User not authorized!')
          expect(responseAdd.status).toBe(201)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })

        test('Delete book from user fails with invalid userId', async () => {
          const responseAdd = await bookService.addBookToUser({
            userId,
            isbns: [{ isbn: firstBookIsbn }],
            token
          })

          const responseDelete = await bookService.deleteBookFromUser({
            userId: 'InvalidUserId',
            isbn: firstBookIsbn,
            token
          })
          const responseUser = await userService.getUser({ UUID: userId, token })

          expect(responseAdd.data.books).toHaveLength(1)
          expect(responseAdd.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseAdd.status).toBe(201)

          expect(responseDelete.data.code).toBe('1207')
          expect(responseDelete.data.message).toBe('User Id not correct!')
          expect(responseAdd.status).toBe(201)

          expect(responseUser.data.books).toHaveLength(1)
          expect(responseUser.data.books[0].isbn).toBe(firstBookIsbn)
          expect(responseUser.status).toBe(200)
        })
      })
    })
