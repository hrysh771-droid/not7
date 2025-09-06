import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import NovelsPage from './pages/NovelsPage'
import NovelDetailPage from './pages/NovelDetailPage'
import ReadingPage from './pages/ReadingPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNovels from './pages/admin/AdminNovels'
import AdminUsers from './pages/admin/AdminUsers'
import AdminComments from './pages/admin/AdminComments'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { i18n } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()

  // Set document direction based on language
  useEffect(() => {
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  // Set theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="novels" element={<NovelsPage />} />
          <Route path="novels/:id" element={<NovelDetailPage />} />
          <Route path="novels/:novelId/chapters/:chapterId" element={<ReadingPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/novels" element={
            <ProtectedRoute requiredRole="admin">
              <AdminNovels />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="admin/comments" element={
            <ProtectedRoute requiredRole="admin">
              <AdminComments />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App