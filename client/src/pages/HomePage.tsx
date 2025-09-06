import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { 
  BookOpen, 
  Star, 
  Eye, 
  Heart, 
  TrendingUp,
  Clock,
  Users,
  Award
} from 'lucide-react'
import api from '../utils/api'
import { Novel } from '@shared/types'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Button from '../components/UI/Button'

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch featured novels
  const { data: featuredNovels, isLoading: featuredLoading } = useQuery(
    'featured-novels',
    async () => {
      const response = await api.get('/novels/featured?limit=6')
      return response.data.data
    }
  )

  // Fetch popular novels
  const { data: popularNovels, isLoading: popularLoading } = useQuery(
    'popular-novels',
    async () => {
      const response = await api.get('/novels/popular?limit=8')
      return response.data.data
    }
  )

  // Fetch recent novels
  const { data: recentNovels, isLoading: recentLoading } = useQuery(
    'recent-novels',
    async () => {
      const response = await api.get('/novels?sortBy=createdAt&sortOrder=desc&limit=8')
      return response.data.data
    }
  )

  const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
    const title = novel.title[isRTL ? 'ar' : 'en']
    const author = novel.author[isRTL ? 'ar' : 'en']
    const description = novel.description[isRTL ? 'ar' : 'en']

    return (
      <Card hover className="group">
        <Link to={`/novels/${novel._id}`}>
          <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg">
            <img
              src={novel.coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="novel-title mb-2">{title}</h3>
          <p className="novel-author mb-3">{author}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="badge badge-primary">
                {t(`countries.${novel.country}`)}
              </span>
              <span className="badge badge-secondary">
                {t(`status.${novel.status}`)}
              </span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span>{novel.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Eye className="w-3 h-3" />
              <span>{novel.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Heart className="w-3 h-3" />
              <span>{novel.favorites.toLocaleString()}</span>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  const SectionHeader: React.FC<{ 
    title: string; 
    subtitle?: string; 
    linkTo?: string; 
    linkText?: string 
  }> = ({ title, subtitle, linkTo, linkText }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {linkTo && linkText && (
        <Link to={linkTo}>
          <Button variant="outline" size="sm">
            {linkText}
          </Button>
        </Link>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              {isRTL 
                ? 'اكتشف عوالم جديدة من الخيال والمغامرة'
                : 'Discover New Worlds of Fantasy and Adventure'
              }
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
              {isRTL
                ? 'منصة متكاملة لقراءة الروايات الإلكترونية باللغتين العربية والإنجليزية. استمتع بأفضل الروايات الكورية والصينية واليابانية.'
                : 'A comprehensive platform for reading electronic novels in Arabic and English. Enjoy the best Korean, Chinese, and Japanese novels.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/novels">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  <BookOpen className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('novels.allNovels')}
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  {t('navigation.search')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                150+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('novels.title')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                1000+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'مستخدم نشط' : 'Active Users'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                50+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'مؤلف' : 'Authors'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                10K+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'فصل' : 'Chapters'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Novels */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title={t('novels.featuredNovels')}
            subtitle={isRTL 
              ? 'أفضل الروايات المختارة بعناية لضمان تجربة قراءة استثنائية'
              : 'The best carefully selected novels to ensure an exceptional reading experience'
            }
            linkTo="/novels?featured=true"
            linkText={t('common.view')}
          />
          
          {featuredLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featuredNovels?.map((novel: Novel) => (
                <NovelCard key={novel._id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Novels */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <SectionHeader
            title={t('novels.popularNovels')}
            subtitle={isRTL 
              ? 'الروايات الأكثر شعبية ومتابعة من قبل القراء'
              : 'The most popular and followed novels by readers'
            }
            linkTo="/novels?sortBy=views&sortOrder=desc"
            linkText={t('common.view')}
          />
          
          {popularLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {popularNovels?.map((novel: Novel) => (
                <NovelCard key={novel._id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Novels */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title={t('novels.newNovels')}
            subtitle={isRTL 
              ? 'أحدث الإضافات إلى مكتبتنا المتنوعة'
              : 'The latest additions to our diverse library'
            }
            linkTo="/novels?sortBy=createdAt&sortOrder=desc"
            linkText={t('common.view')}
          />
          
          {recentLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {recentNovels?.map((novel: Novel) => (
                <NovelCard key={novel._id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL 
              ? 'ابدأ رحلتك في عالم القراءة اليوم'
              : 'Start Your Reading Journey Today'
            }
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            {isRTL
              ? 'انضم إلى آلاف القراء واكتشف قصصاً لا تُنسى من جميع أنحاء العالم'
              : 'Join thousands of readers and discover unforgettable stories from around the world'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                {t('navigation.register')}
              </Button>
            </Link>
            <Link to="/novels">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                {t('novels.allNovels')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage