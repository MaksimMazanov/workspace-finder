import { lazy } from 'react'

const MainPage = lazy(() => import(/* webpackChunkName: 'main' */'./main'))
const LoginPage = lazy(() => import(/* webpackChunkName: 'login' */'./login'))
const RegisterPage = lazy(() => import(/* webpackChunkName: 'register' */'./register'))

export { MainPage, LoginPage, RegisterPage }