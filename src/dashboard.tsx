import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { URLs } from './__data__/urls'
import { MainPage, LoginPage, RegisterPage, AdminLoginPage, AdminPage } from './pages'
import { ProtectedRoute, AdminRoute } from './components'

const PageWrapper = ({ children }: React.PropsWithChildren) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
)

export const Dashboard = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <PageWrapper>
            <RegisterPage />
          </PageWrapper>
        }
      />
      <Route
        path="/"
        element={
          <PageWrapper>
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          </PageWrapper>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PageWrapper>
            <AdminLoginPage />
          </PageWrapper>
        }
      />
      <Route
        path="/admin"
        element={
          <PageWrapper>
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          </PageWrapper>
        }
      />
    </Routes>
  )
}
