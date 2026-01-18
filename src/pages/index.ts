import { lazy } from 'react'

export const MainPage = lazy(() => import(/* webpackChunkName: 'main' */'./main'))
export const LoginPage = lazy(() => import(/* webpackChunkName: 'login' */'./login'))