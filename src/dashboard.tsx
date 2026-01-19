import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { URLs } from './__data__/urls'
import { MainPage, LoginPage, RegisterPage } from './pages'
import { ProtectedRoute } from './components'

const PageWrapper = ({ children }: React.PropsWithChildren) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
)

export const Dashboard = () => {
  return (
    <Routes>
      <Route
        path={URLs.login}
        element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.register}
        element={
          <PageWrapper>
            <RegisterPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.baseUrl}
        element={
          <PageWrapper>
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          </PageWrapper>
        }
      />
    </Routes>
  )
}
