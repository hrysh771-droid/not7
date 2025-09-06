import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { User } from '@shared/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, language?: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Get current user
  const { data: userData, isLoading: userLoading } = useQuery(
    'user',
    async () => {
      const token = localStorage.getItem('token')
      if (!token) return null
      
      const response = await api.get('/auth/me')
      return response.data.data
    },
    {
      retry: false,
      onError: () => {
        localStorage.removeItem('token')
        setUser(null)
      }
    }
  )

  useEffect(() => {
    if (userData) {
      setUser(userData)
    } else {
      setUser(null)
    }
    setLoading(userLoading)
  }, [userData, userLoading])

  // Login mutation
  const loginMutation = useMutation(
    async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('token', data.data.token)
        setUser(data.data.user)
        queryClient.setQueryData('user', data.data.user)
        toast.success(t('auth.loginSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('errors.invalidCredentials'))
      }
    }
  )

  // Register mutation
  const registerMutation = useMutation(
    async ({ username, email, password, language }: { 
      username: string; 
      email: string; 
      password: string; 
      language?: string 
    }) => {
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password, 
        language: language || 'ar' 
      })
      return response.data
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('token', data.data.token)
        setUser(data.data.user)
        queryClient.setQueryData('user', data.data.user)
        toast.success(t('auth.registerSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('errors.validationError'))
      }
    }
  )

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data: Partial<User>) => {
      const response = await api.put('/auth/profile', data)
      return response.data
    },
    {
      onSuccess: (data) => {
        setUser(data.data)
        queryClient.setQueryData('user', data.data)
        toast.success(t('success.profileUpdated'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('errors.validationError'))
      }
    }
  )

  // Change password mutation
  const changePasswordMutation = useMutation(
    async ({ currentPassword, newPassword }: { 
      currentPassword: string; 
      newPassword: string 
    }) => {
      const response = await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success(t('success.passwordChanged'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('errors.validationError'))
      }
    }
  )

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (username: string, email: string, password: string, language?: string) => {
    await registerMutation.mutateAsync({ username, email, password, language })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    queryClient.clear()
    toast.success(t('auth.logoutSuccess'))
  }

  const updateProfile = async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}