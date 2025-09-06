import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft, BookOpen } from 'lucide-react'
import Button from '../components/UI/Button'

const NotFoundPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-16 h-16 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {isRTL 
              ? 'عذراً، الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها.'
              : 'Sorry, the page you are looking for does not exist. It might have been moved or deleted.'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('navigation.home')}
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full btn btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('common.back')}
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {isRTL ? 'ربما تبحث عن:' : 'You might be looking for:'}
          </h3>
          <div className="space-y-2">
            <Link
              to="/novels"
              className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('navigation.novels')}
            </Link>
            <Link
              to="/search"
              className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('navigation.search')}
            </Link>
            <Link
              to="/novels?country=korean"
              className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('novels.koreanNovels')}
            </Link>
            <Link
              to="/novels?country=chinese"
              className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('novels.chineseNovels')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage