import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Card from '../components/UI/Card'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isRTL = i18n.language === 'ar'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>()

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'أهلاً بك مرة أخرى! يرجى تسجيل الدخول إلى حسابك'
              : 'Welcome back! Please sign in to your account'
            }
          </p>
        </div>

        {/* Login Form */}
        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register('email', {
                required: t('errors.validationError'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('errors.invalidEmail')
                }
              })}
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.email')}
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                {...register('password', {
                  required: t('errors.validationError'),
                  minLength: {
                    value: 6,
                    message: t('errors.passwordTooShort')
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                placeholder={t('auth.password')}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="mr-2 rtl:mr-0 rtl:ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {isRTL ? 'أو' : 'Or'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t('auth.register')}
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {isRTL ? 'بيانات تجريبية' : 'Demo Credentials'}
            </h3>
            <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <p><strong>{t('auth.email')}:</strong> demo@novelreader.com</p>
              <p><strong>{t('auth.password')}:</strong> demo123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage