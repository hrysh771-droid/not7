import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Settings, 
  Heart, 
  BookOpen, 
  Clock, 
  Star,
  Edit3,
  Save,
  X,
  Eye,
  Calendar
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

interface ProfileFormData {
  username: string
  email: string
  preferences: {
    language: 'ar' | 'en'
    theme: 'light' | 'dark' | 'auto'
  }
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'settings'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { t, i18n } = useTranslation()
  const { user, updateProfile, changePassword } = useAuth()
  const queryClient = useQueryClient()
  const isRTL = i18n.language === 'ar'

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      preferences: {
        language: user?.preferences?.language || 'ar',
        theme: user?.preferences?.theme || 'auto'
      }
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    watch
  } = useForm<PasswordFormData>()

  const newPassword = watch('newPassword')

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery(
    'user-stats',
    async () => {
      const response = await api.get('/users/stats')
      return response.data.data
    },
    {
      enabled: !!user
    }
  )

  // Fetch user's favorite novels
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery(
    'user-favorites',
    async () => {
      const response = await api.get('/novels/user/favorites')
      return response.data
    },
    {
      enabled: !!user && activeTab === 'favorites'
    }
  )

  // Fetch user's reading history
  const { data: historyData, isLoading: historyLoading } = useQuery(
    'user-history',
    async () => {
      const response = await api.get('/users/reading-history')
      return response.data
    },
    {
      enabled: !!user && activeTab === 'history'
    }
  )

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile(data)
      setIsEditing(false)
      toast.success(t('success.profileUpdated'))
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setIsChangingPassword(false)
      resetPassword()
      toast.success(t('success.passwordChanged'))
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    resetProfile({
      username: user?.username || '',
      email: user?.email || '',
      preferences: {
        language: user?.preferences?.language || 'ar',
        theme: user?.preferences?.theme || 'auto'
      }
    })
  }

  const cancelPasswordChange = () => {
    setIsChangingPassword(false)
    resetPassword()
  }

  const tabs = [
    { id: 'profile', label: t('profile.personalInfo'), icon: User },
    { id: 'favorites', label: t('profile.favorites'), icon: Heart },
    { id: 'history', label: t('profile.readingHistory'), icon: Clock },
    { id: 'settings', label: t('profile.settings'), icon: Settings }
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>

            {/* Statistics */}
            {statsLoading ? (
              <Card className="p-4 mt-4">
                <LoadingSpinner size="sm" />
              </Card>
            ) : (
              <Card className="p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('profile.statistics')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.totalNovelsRead')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userStats?.totalNovelsRead || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.totalChaptersRead')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userStats?.totalReadingHistory || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.favorites')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userStats?.totalFavorites || 0}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('profile.personalInfo')}
                  </h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('common.edit')}
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                    <Input
                      {...registerProfile('username', {
                        required: t('errors.validationError'),
                        minLength: {
                          value: 3,
                          message: t('errors.usernameTooShort')
                        },
                        maxLength: {
                          value: 30,
                          message: t('errors.usernameTooLong')
                        }
                      })}
                      label={t('auth.username')}
                      error={profileErrors.username?.message}
                    />

                    <Input
                      {...registerProfile('email', {
                        required: t('errors.validationError'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('errors.invalidEmail')
                        }
                      })}
                      type="email"
                      label={t('auth.email')}
                      error={profileErrors.email?.message}
                    />

                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <Button
                        type="submit"
                        loading={isProfileSubmitting}
                        disabled={isProfileSubmitting}
                      >
                        <Save className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('common.save')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('auth.username')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('auth.email')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Favorites */}
            {activeTab === 'favorites' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t('profile.favorites')}
                </h2>

                {favoritesLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : favoritesData?.data?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritesData.data.map((novel: any) => (
                      <div key={novel._id} className="group">
                        <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg">
                          <img
                            src={novel.coverImage}
                            alt={novel.title[isRTL ? 'ar' : 'en']}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {novel.title[isRTL ? 'ar' : 'en']}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {novel.author[isRTL ? 'ar' : 'en']}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isRTL ? 'لا توجد روايات مفضلة' : 'No favorite novels'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isRTL 
                        ? 'ابدأ بإضافة رواياتك المفضلة'
                        : 'Start adding your favorite novels'
                      }
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Reading History */}
            {activeTab === 'history' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t('profile.readingHistory')}
                </h2>

                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : user.readingHistory?.length > 0 ? (
                  <div className="space-y-4">
                    {user.readingHistory.map((history: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-12 h-16 flex-shrink-0">
                          <img
                            src={history.novel?.coverImage || '/placeholder-cover.jpg'}
                            alt={history.novel?.title || 'Novel'}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {history.novel?.title || 'Unknown Novel'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('chapters.chapter')} {history.chapter?.chapterNumber || 'N/A'}
                          </p>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${history.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {history.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(history.lastRead).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isRTL ? 'لا يوجد تاريخ قراءة' : 'No reading history'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isRTL 
                        ? 'ابدأ بقراءة رواياتك المفضلة'
                        : 'Start reading your favorite novels'
                      }
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Language and Theme Settings */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {t('profile.settings')}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'اللغة' : 'Language'}
                      </label>
                      <select
                        value={user.preferences?.language || 'ar'}
                        onChange={(e) => {
                          i18n.changeLanguage(e.target.value)
                          updateProfile({
                            preferences: {
                              ...user.preferences,
                              language: e.target.value as 'ar' | 'en'
                            }
                          })
                        }}
                        className="input"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'المظهر' : 'Theme'}
                      </label>
                      <select
                        value={user.preferences?.theme || 'auto'}
                        onChange={(e) => {
                          updateProfile({
                            preferences: {
                              ...user.preferences,
                              theme: e.target.value as 'light' | 'dark' | 'auto'
                            }
                          })
                        }}
                        className="input"
                      >
                        <option value="light">{isRTL ? 'فاتح' : 'Light'}</option>
                        <option value="dark">{isRTL ? 'داكن' : 'Dark'}</option>
                        <option value="auto">{isRTL ? 'تلقائي' : 'Auto'}</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Change Password */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {t('profile.changePassword')}
                    </h2>
                    {!isChangingPassword && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangingPassword(true)}
                      >
                        {t('profile.changePassword')}
                      </Button>
                    )}
                  </div>

                  {isChangingPassword ? (
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                      <Input
                        {...registerPassword('currentPassword', {
                          required: t('errors.validationError')
                        })}
                        type="password"
                        label={t('profile.currentPassword')}
                        error={passwordErrors.currentPassword?.message}
                      />

                      <Input
                        {...registerPassword('newPassword', {
                          required: t('errors.validationError'),
                          minLength: {
                            value: 6,
                            message: t('errors.passwordTooShort')
                          }
                        })}
                        type="password"
                        label={t('profile.newPassword')}
                        error={passwordErrors.newPassword?.message}
                      />

                      <Input
                        {...registerPassword('confirmPassword', {
                          required: t('errors.validationError'),
                          validate: (value) =>
                            value === newPassword || t('errors.passwordsDoNotMatch')
                        })}
                        type="password"
                        label={t('profile.confirmNewPassword')}
                        error={passwordErrors.confirmPassword?.message}
                      />

                      <div className="flex space-x-4 rtl:space-x-reverse">
                        <Button
                          type="submit"
                          loading={isPasswordSubmitting}
                          disabled={isPasswordSubmitting}
                        >
                          <Save className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                          {t('common.save')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelPasswordChange}
                        >
                          <X className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      {isRTL 
                        ? 'قم بتغيير كلمة المرور الخاصة بك للحفاظ على أمان حسابك'
                        : 'Change your password to keep your account secure'
                      }
                    </p>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage