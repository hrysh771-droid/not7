import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Heart, Github, Twitter, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <BookOpen className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">
                {t('navigation.novels')}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isRTL 
                ? 'منصة متكاملة لقراءة الروايات الإلكترونية باللغتين العربية والإنجليزية. اكتشف عوالم جديدة من الخيال والمغامرة.'
                : 'A comprehensive platform for reading electronic novels in Arabic and English. Discover new worlds of fantasy and adventure.'
              }
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.novels')}
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.search')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?country=korean"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('novels.koreanNovels')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?country=chinese"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('novels.chineseNovels')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'التصنيفات' : 'Categories'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/novels?genres=fantasy"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('genres.fantasy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?genres=romance"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('genres.romance')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?genres=action"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('genres.action')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?genres=martialArts"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('genres.martialArts')}
                </Link>
              </li>
              <li>
                <Link
                  to="/novels?genres=cultivation"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('genres.cultivation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'الدعم' : 'Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {isRTL ? 'مركز المساعدة' : 'Help Center'}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {isRTL ? 'اتصل بنا' : 'Contact Us'}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {isRTL ? 'شروط الاستخدام' : 'Terms of Service'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 {isRTL ? 'منصة قراءة الروايات' : 'Novel Reader Platform'}. 
              {isRTL ? ' جميع الحقوق محفوظة.' : ' All rights reserved.'}
            </p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 text-sm">
              <span>{isRTL ? 'صُنع بـ' : 'Made with'}</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>{isRTL ? 'للمجتمع العربي' : 'for the Arabic community'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer