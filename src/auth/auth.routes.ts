import { Router } from 'express'
import { signUpHandler, logInHandler, refreshHandler, forgetPwdHandler, resetPwdHandler } from './auth.handlers.js'
import { userSignUpSchema, userLoginSchema, userForgetPwdSchema, userResetPwdSchema } from './auth.schema.js'
import { validateData } from '../middlewares/validation.middleware.js'

const router = Router()

router.post('/signUp', validateData(userSignUpSchema), signUpHandler)

router.post('/logIn', validateData(userLoginSchema), logInHandler)

router.post('/forgetPwd', validateData(userForgetPwdSchema), forgetPwdHandler)

router.post('/resetPwd', validateData(userResetPwdSchema), resetPwdHandler)

router.get('/refresh', refreshHandler)

export default router