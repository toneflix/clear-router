import '../example/express/web'

import { beforeAll, describe, expect, it } from "vitest"

import Routes from "../src/express/routes"
import express from "express"
import request from "supertest"

describe('Express App (JS)', () => {
    let app: express.Application

    beforeAll(() => {
        app = express()
        const router = express.Router()
        Routes.apply(router)
        app.use(router)
    })

    it('GET / should return 200', async () => {
        const res = await request(app).get('/directly')
        expect(res.statusCode).toBe(200)
        expect(res.text || res.body).toBeDefined()
    })
})
