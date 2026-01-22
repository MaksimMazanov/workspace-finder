import { lazy } from 'react'

const MainPage = lazy(() => import(/* webpackChunkName: 'main' */'./main'))
const LoginPage = lazy(() => import(/* webpackChunkName: 'login' */'./login'))
const RegisterPage = lazy(() => import(/* webpackChunkName: 'register' */'./register'))
const AdminLoginPage = lazy(() => import(/* webpackChunkName: 'admin-login' */'./admin-login'))
const AdminPage = lazy(() => import(/* webpackChunkName: 'admin' */'./admin'))

export { MainPage, LoginPage, RegisterPage, AdminLoginPage, AdminPage }