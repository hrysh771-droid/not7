import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Card from '../components/UI/Card'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  language: 'ar' | 'en'
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { t, i18n } = useTranslation()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    defaultValues: {
      language: isRTL ? 'ar' : 'en'
    }
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.username, data.email, data.password, data.language)
      navigate('/')
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
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'أنشئ حسابك الجديد وابدأ رحلتك في عالم القراءة'
              : 'Create your new account and start your reading journey'
            }
          </p>
        </div>

        {/* Register Form */}
        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register('username', {
                required: t('errors.validationError'),
                minLength: {
                  value: 3,
                  message: t('errors.usernameTooShort')
                },
                maxLength: {
                  value: 30,
                  message: t('errors.usernameTooLong')
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: t('errors.invalidUsername')
                }
              })}
              type="text"
              label={t('auth.username')}
              placeholder={t('auth.username')}
              leftIcon={<User className="w-4 h-4" />}
              error={errors.username?.message}
              autoComplete="username"
            />

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
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: isRTL 
                      ? 'يجب أن تحتوي كلمة المرور على حرف صغير وحرف كبير ورقم'
                      : 'Password must contain lowercase, uppercase, and number'
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
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Input
                {...register('confirmPassword', {
                  required: t('errors.validationError'),
                  validate: (value) =>
                    value === password || t('errors.passwordsDoNotMatch')
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPassword')}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
            </div>

            <div className="hidden">
              <input
                {...register('language')}
                type="hidden"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {t('auth.register')}
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
                {t('auth.alreadyHaveAccount')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t('auth.login')}
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isRTL ? (
              <>
                بإنشاء حساب، فإنك توافق على{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  شروط الخدمة
                </Link>{' '}
                و{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  سياسة الخصوصية
                </Link>
              </>
            ) : (
              <>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage