import pgp from 'pg-promise'
import fs from 'fs'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async (): Promise<void> => {
  try {
    const HOST = 'localhost'
    const PORT = 5432
    const USER = 'my_user'
    const DATABASE = 'my_database'

    const dbClient = pgp()({
      host: HOST,
      port: PORT,
      database: DATABASE,
      user: USER,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, '/client/ca.crt')).toString(),
        cert: fs
          .readFileSync(path.join(__dirname, '/client/client.crt'))
          .toString(),
        key: fs
          .readFileSync(path.join(__dirname, '/client/client.key'))
          .toString(),
      },
    })

    console.log('Connecting...')

    const connection = await dbClient.connect()

    console.log('Connected')

    console.log('Terminating...')

    connection.done()

    console.log('Terminated')

    process.exit(0)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  }
})()
