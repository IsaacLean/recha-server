import request from 'supertest'

import app, { db } from '../../../app'
import Todo, { TYPE } from '../../../types/Todo'
import { API } from '../../../config'
import { clearDBTable } from '../../../util/test'
import { ERR_TYPE } from '../../../types'
import { TABLE } from '../../../util/db/todos'

const ENDPOINT = `${API.VERS.V1.PATH}${TABLE}`

beforeAll(() => clearDBTable(db, TABLE))

afterAll(() => clearDBTable(db, TABLE))

describe('Todo endpoints', () => {
  const NEW_TODO_DATA: Partial<Todo> = {
    date: '2019-02-03T08:00:00.000Z',
    name: 'Hello world!',
    details:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget odio eu nisi congue semper. Cras a ultrices sapien. Suspendisse non metus eu ex tempor facilisis. Pellentesque faucibus nunc vitae eleifend elementum. Nam tincidunt, ipsum quis vulputate blandit, odio velit sagittis ligula, in elementum elit risus a lacus. Vivamus eu tincidunt sapien, sit amet blandit sapien. Donec sollicitudin pellentesque augue, nec egestas elit volutpat ac. Nullam in arcu ac nulla tincidunt luctus et sed erat. Sed quis dapibus ante, quis consequat mauris. Vestibulum quis purus ac velit congue viverra et id dui. Nam a magna imperdiet, lobortis nunc nec, aliquet quam. Nam dapibus velit ac erat rhoncus cursus. Suspendisse tempus est massa, vitae lacinia dolor pellentesque sit amet. Nunc mattis eros quam, quis ornare lectus bibendum a. Donec porttitor, neque quis dapibus lacinia, turpis sapien tempor eros, eget semper nisl magna ut libero.'
  }
  const UPDATED_TODO_DATA: Partial<Todo> = {
    date: '1990-01-01T08:00:00.000Z',
    name: 'New Name',
    details: 'New details!'
  }

  let todo

  it('should list no todos when no todos are in the DB', () =>
    request(app)
      .get(ENDPOINT)
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body.data.length).toBe(0)
      }))

  it('should create a todo', () =>
    request(app)
      .post(ENDPOINT)
      .send(NEW_TODO_DATA)
      .then(res => {
        expect(res.statusCode).toBe(201)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data.date).toBe(NEW_TODO_DATA.date)
        expect(res.body.data.name).toBe(NEW_TODO_DATA.name)
        expect(res.body.data.details).toBe(NEW_TODO_DATA.details)
        todo = res.body.data
      }))

  it('should fail to create a todo when name is null', () =>
    request(app)
      .post(ENDPOINT)
      .send({
        ...NEW_TODO_DATA,
        name: null
      })
      .then(res => {
        expect(res.statusCode).toBe(500)
        expect(res.body.type).toBe(ERR_TYPE)
      }))

  it('should list all todos', () =>
    request(app)
      .get(ENDPOINT)
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body.data.length).toBe(1)
        expect(res.body.data[0].date).toBe(todo.date)
        expect(res.body.data[0].name).toBe(todo.name)
        expect(res.body.data[0].details).toBe(todo.details)
      }))

  it('should read a specific todo', () =>
    request(app)
      .get(`${ENDPOINT}/${todo.id}`)
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data.date).toBe(NEW_TODO_DATA.date)
        expect(res.body.data.name).toBe(NEW_TODO_DATA.name)
        expect(res.body.data.details).toBe(NEW_TODO_DATA.details)
      }))

  // eslint-disable-next-line quotes
  it("should update a specific todo's date, name & details", () =>
    request(app)
      .patch(`${ENDPOINT}/${todo.id}`)
      .send(UPDATED_TODO_DATA)
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data.date).toBe(UPDATED_TODO_DATA.date)
        expect(res.body.data.name).toBe(UPDATED_TODO_DATA.name)
        expect(res.body.data.details).toBe(UPDATED_TODO_DATA.details)
      }))

  // eslint-disable-next-line quotes
  it("should update a specific todo's completed datetime", () => {
    const completed_at = '2019-01-25T00:53:52.000Z'

    return request(app)
      .patch(`${ENDPOINT}/${todo.id}`)
      .send({ completed_at })
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data.date).toBe(UPDATED_TODO_DATA.date)
        expect(res.body.data.name).toBe(UPDATED_TODO_DATA.name)
        expect(res.body.data.details).toBe(UPDATED_TODO_DATA.details)
        expect(res.body.data.completed_at).toBe(completed_at)
      })
  })

  // eslint-disable-next-line quotes
  it("should fail to update a specific todo's name to null", () =>
    request(app)
      .patch(`${ENDPOINT}/${todo.id}`)
      .send({ name: null })
      .then(res => {
        expect(res.statusCode).toBe(500)
        expect(res.body.type).toBe(ERR_TYPE)
      }))

  it('should delete a specific todo', () =>
    request(app)
      .del(`${ENDPOINT}/${todo.id}`)
      .then(res => {
        expect(res.statusCode).toBe(200)
        expect(res.body.type).toBe(TYPE)
        expect(res.body.data.date).toBe(UPDATED_TODO_DATA.date)
        expect(res.body.data.name).toBe(UPDATED_TODO_DATA.name)
        expect(res.body.data.details).toBe(UPDATED_TODO_DATA.details)
      }))

  // eslint-disable-next-line quotes
  it("should fail to read a specific todo that doesn't exist", () =>
    request(app)
      .get(`${ENDPOINT}/${todo.id}`)
      .then(res => {
        expect(res.statusCode).toBe(404)
        expect(res.body.type).toBe(ERR_TYPE)
      }))

  // eslint-disable-next-line quotes
  it("should fail to update a specific todo that doesn't exist", () =>
    request(app)
      .patch(`${ENDPOINT}/${todo.id}`)
      .send(UPDATED_TODO_DATA)
      .then(res => {
        expect(res.statusCode).toBe(404)
        expect(res.body.type).toBe(ERR_TYPE)
      }))

  // eslint-disable-next-line quotes
  it("should fail to delete a specific todo that doesn't exist", () =>
    request(app)
      .del(`${ENDPOINT}/${todo.id}`)
      .then(res => {
        expect(res.statusCode).toBe(404)
        expect(res.body.type).toBe(ERR_TYPE)
      }))
})
