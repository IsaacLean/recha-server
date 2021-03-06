import { CONFIG } from '../types'

let configDB: CONFIG['DB'] = {
  HOST: 'localhost',
  NAME: 'database',
  USER: 'username',
  PASS: 'password',
  PORT: 5432
}

let configPort: CONFIG['APP']['PORT'] = 3000

if (process.env.NODE_ENV) {
  const { DB, PORT } = require(`./${process.env.NODE_ENV}`) // eslint-disable-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires

  configDB = {
    ...configDB,
    ...DB
  }

  configPort = PORT
}

export const API = {
  NAME: 'recha',
  VERS: {
    V1: {
      NUM: 1,
      PATH: '/v1/'
    }
  }
}

export const CLIENT = undefined

export const DB = configDB

export const PORT = configPort
