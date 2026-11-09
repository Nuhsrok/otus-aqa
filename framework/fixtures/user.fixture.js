import { faker } from '@faker-js/faker'

export const userData = () => {
  return {
    userName: faker.internet.username() + `${Date.now()}`,
    password: `${faker.internet.password({ length: 4 })}!1Aa`
  }
}

