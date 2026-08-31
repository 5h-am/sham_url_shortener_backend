import request from 'supertest'
import app from '../../src/app.js'
import { describe, it, expect, beforeEach, afterEach, vi  } from 'vitest'
import { query } from '../../src/config/db.js'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../../src/config/env.js'


describe("Testing SignUp Flow", () => {
    afterEach(async() => {
        await query("TRUNCATE TABLE users, urls, clicks RESTART IDENTITY CASCADE")
    })

    it("should return 201 with account created successfully and token for successfull login", async() => {
        const response = await request(app)
        .post("/api/v1/auth/signUp")
        .send({
            email: "shubhamrxl06@gmail.com",
            password: "qwerty12345",
            fullName: "Tester"
        })

        expect(response.status).toBe(201)
        const result = await query('SELECT * FROM USERS WHERE email = $1', ["shubhamrxl06@gmail.com"])
        expect(result.rows.length).toBe(1)
        expect(result.rows[0].email).toBe("shubhamrxl06@gmail.com")
    })

    it("should return 400 for invalid email", async() => {
        const response = await request(app)
        .post("/api/v1/auth/signUp")
        .send({
            email: "shubham",
            password: "qwerty12345",
            fullName: "Tester"
        })
        expect(response.status).toBe(400)
        const result = await query('SELECT * FROM USERS WHERE email = $1', ["shubhamrxl06@gmail.com"])
        expect(result.rows.length).not.toBe(1)
    })

})


describe("Testing Login Flow", () => {
    beforeEach(async() => {
        const hashedPassword = await argon2.hash("qwerty12345")
        await query('INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3)', ["shubhamrxl06@gmail.com", hashedPassword, "Tester"])
    })

    afterEach(async() => {
        await query("TRUNCATE TABLE users, urls, clicks RESTART IDENTITY CASCADE")
    })

    it("should return 200 with token for successful login", async() => {
        const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "shubhamrxl06@gmail.com",
            password: "qwerty12345"
        })
        expect(response.status).toBe(200)
        expect(response.body.accessToken).toBeDefined()
    })

    it("should return 401 for invalid password", async() => {
        const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "shubhamrxl06@gmail.com",
            password: "wrongpassword"
        })
        expect(response.status).toBe(401)
        expect(response.body.accessToken).not.toBeDefined()
    })

    it("should return 401 for invalid email", async() => {
        const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "invalid@gmail.com",
            password: "qwerty12345"
        })
        expect(response.status).toBe(401)
        expect(response.body.accessToken).not.toBeDefined()
    })
})
