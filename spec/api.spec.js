describe('User creation', () => {
  let userId
  let token

  test('User created successfully', async () => {
    const response = await fetch('https://bookstore.demoqa.com/Account/v1/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'RitikaTest',
        password: 'Ritika#1'
      })
    })
    const data = await response.json()
    expect(response.status).toBe(201)
    expect(data.username).toBe('RitikaTest')
    expect(data.userID).not.toBeNull()

    userId = data.userID
  })

  test('User creation fails because he already exist', async () => {
    const response = await fetch('https://bookstore.demoqa.com/Account/v1/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'RitikaTest',
        password: 'Ritika#1'
      })
    })
    const data = await response.json()
    expect(response.status).toBe(406)
    expect(data.code).toBe('1204')
    expect(data.message).toBe('User exists!')
  })

  test('User creation fails because of incorrect password', async () => {
    const response = await fetch('https://bookstore.demoqa.com/Account/v1/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'RandomName',
        password: 'Incorrectpassword'
      })
    })
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.code).toBe('1300')
    expect(data.message).toBe(
      "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer."
    )
  })

  // Test fails because of the known error in swaagger documentation. The responce status is not 400 but 200.
  test('Token generation with an error', async () => {
    const response = await fetch('https://bookstore.demoqa.com/Account/v1/GenerateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'RandomName',
        password: 'Incorrectpassword'
      })
    })
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.code).toBe('0')
    expect(data.message).toBe('string')
  })

  test('Token generation successfully', async () => {
    const response = await fetch('https://bookstore.demoqa.com/Account/v1/GenerateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'RitikaTest',
        password: 'Ritika#1'
      })
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.token).not.toBeNull()
    expect(data.expires).not.toBeNull()
    expect(data.status).toBe('Success')
    expect(data.result).toBe('User authorized successfully.')

    token = data.token
  })

  test('User deletion successfully (data cleanup)', async () => {
    const response = await fetch(`https://bookstore.demoqa.com/Account/v1/User/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    expect(response.status).toBe(204)
  })
})
