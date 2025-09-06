import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  Search,
  X
} from 'lucide-react'
import api from '../utils/api'
import { Novel, SearchFilters } from '@shared/types'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const NovelsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Get current filters from URL
  const currentFilters: SearchFilters = {
    query: searchParams.get('q') || undefined,
    country: searchParams.get('country')?.split(',') || undefined,
    genres: searchParams.get('genres')?.split(',') || undefined,
    status: searchParams.get('status')?.split(',') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12')
  }

  // Fetch novels
  const { data: novelsData, isLoading } = useQuery(
    ['novels', currentFilters],
    async () => {
      const params = new URLSearchParams()
      
      if (currentFilters.query) params.append('q', currentFilters.query)
      if (currentFilters.country) params.append('country', currentFilters.country.join(','))
      if (currentFilters.genres) params.append('genres', currentFilters.genres.join(','))
      if (currentFilters.status) params.append('status', currentFilters.status.join(','))
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy)
      if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder)
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())

      const response = await api.get(`/novels?${params.toString()}`)
      return response.data
    }
  )

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...currentFilters, ...newFilters, page: 1 }
    
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) params.append(key, value.join(','))
        } else {
          params.append(key, value.toString())
        }
      }
    })
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
    const title = novel.title[isRTL ? 'ar' : 'en']
    const author = novel.author[isRTL ? 'ar' : 'en']
    const description = novel.description[isRTL ? 'ar' : 'en']

    if (viewMode === 'list') {
      return (
        <Card hover className="flex space-x-4 rtl:space-x-reverse">
          <div className="w-24 h-32 flex-shrink-0">
            <img
              src={novel.coverImage}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{author}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="badge badge-primary text-xs">
                  {t(`countries.${novel.country}`)}
                </span>
                <span className="badge badge-secondary text-xs">
                  {t(`status.${novel.status}`)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {novel.views.toLocaleString()} {t('novels.views')}
              </div>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card hover className="group">
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
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {novel.views.toLocaleString()}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('novels.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'اكتشف مجموعة واسعة من الروايات الإلكترونية من جميع أنحاء العالم'
              : 'Discover a wide range of electronic novels from around the world'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={currentFilters.query || ''}
                onChange={(e) => updateFilters({ query: e.target.value })}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('search.filters')}
            </Button>
          </div>

          {/* Filters */}
          {(showFilters || window.innerWidth >= 1024) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('novels.country')}
                </label>
                <select
                  value={currentFilters.country?.[0] || ''}
                  onChange={(e) => updateFilters({ 
                    country: e.target.value ? [e.target.value] : undefined 
                  })}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع البلدان' : 'All Countries'}</option>
                  <option value="korean">{t('countries.korean')}</option>
                  <option value="chinese">{t('countries.chinese')}</option>
                  <option value="japanese">{t('countries.japanese')}</option>
                  <option value="other">{t('countries.other')}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('novels.status')}
                </label>
                <select
                  value={currentFilters.status?.[0] || ''}
                  onChange={(e) => updateFilters({ 
                    status: e.target.value ? [e.target.value] : undefined 
                  })}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="ongoing">{t('status.ongoing')}</option>
                  <option value="completed">{t('status.completed')}</option>
                  <option value="hiatus">{t('status.hiatus')}</option>
                  <option value="dropped">{t('status.dropped')}</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('search.sortBy')}
                </label>
                <select
                  value={currentFilters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                  className="input"
                >
                  <option value="createdAt">{t('search.date')}</option>
                  <option value="title">{t('search.title')}</option>
                  <option value="rating">{t('search.rating')}</option>
                  <option value="views">{t('search.views')}</option>
                  <option value="favorites">{t('search.favorites')}</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الترتيب' : 'Order'}
                </label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant={currentFilters.sortOrder === 'asc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ sortOrder: 'asc' })}
                    className="flex-1"
                  >
                    <SortAsc className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={currentFilters.sortOrder === 'desc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ sortOrder: 'desc' })}
                    className="flex-1"
                  >
                    <SortDesc className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(currentFilters.query || currentFilters.country || currentFilters.status) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
              </Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'النتائج' : 'Results'}
            </h2>
            {novelsData && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL 
                  ? `تم العثور على ${novelsData.pagination.total} رواية`
                  : `Found ${novelsData.pagination.total} novels`
                }
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Novels Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : novelsData?.data?.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'
                : 'space-y-4'
            }>
              {novelsData.data.map((novel: Novel) => (
                <NovelCard key={novel._id} novel={novel} />
              ))}
            </div>

            {/* Pagination */}
            {novelsData.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!novelsData.pagination.hasPrev}
                    onClick={() => updateFilters({ page: currentFilters.page! - 1 })}
                  >
                    {t('common.previous')}
                  </Button>
                  
                  <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentFilters.page} / {novelsData.pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!novelsData.pagination.hasNext}
                    onClick={() => updateFilters({ page: currentFilters.page! + 1 })}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('search.noResults')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isRTL 
                ? 'جرب تغيير المرشحات أو البحث بكلمات مختلفة'
                : 'Try changing the filters or searching with different keywords'
              }
            </p>
            <Button onClick={clearFilters}>
              {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NovelsPage