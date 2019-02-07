/* eslint import/prefer-default-export: 0 */
import ServerErr from './ServerErr'
import { formatAPIRes } from '../index'
import { APIRes, ERR_TYPE } from '../../types'

interface ErrData {
  code?: number
  message?: string
  status?: number
}

export const genErr = (status?: number, message?: string): ServerErr => {
  let m = message
  if (!m) {
    switch (status) {
      case 404:
        m = 'Not found'
        break
      case 500:
        m = 'Internal server error'
        break
      default:
        m = 'Something broke!'
    }
  }

  return new ServerErr(m, status)
}

export const genErrRes = (err: ServerErr): APIRes<ErrData> => {
  let { status } = err
  const code = Number(err.code)

  if (typeof code === 'number' && !status) {
    if (code === 0) {
      status = 404
    } else if (code === 22007 || code === 23502) {
      status = 400
    }
  }

  return formatAPIRes<ErrData>(
    {
      status: status || 500,
      message: err.message || 'Something broke!'
    },
    ERR_TYPE
  )
}
