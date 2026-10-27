function greet(name) {
  return `Hello, ${name}!`
}
console.log(greet('World'))



const book = {}


book.title = 'JavaScript Basics'
book.author = 'unknown'

book.title = 'Ivan Ivanov'

console.log(book)

delete book.title

console.log(book)