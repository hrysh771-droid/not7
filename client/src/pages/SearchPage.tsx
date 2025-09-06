import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { Search, Filter, X, BookOpen, Star, Eye, Heart } from 'lucide-react'
import api from '../utils/api'
import { Novel } from '@shared/types'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    country: searchParams.get('country')?.split(',') || [],
    genres: searchParams.get('genres')?.split(',') || [],
    status: searchParams.get('status')?.split(',') || [],
    sortBy: searchParams.get('sortBy') || 'relevance',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })

  // Search novels
  const { data: searchResults, isLoading } = useQuery(
    ['search', query, filters],
    async () => {
      if (!query.trim()) return null
      
      const params = new URLSearchParams()
      params.append('q', query.trim())
      
      if (filters.country.length > 0) params.append('country', filters.country.join(','))
      if (filters.genres.length > 0) params.append('genres', filters.genres.join(','))
      if (filters.status.length > 0) params.append('status', filters.status.join(','))
      if (filters.sortBy !== 'relevance') params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)

      const response = await api.get(`/novels/search?${params.toString()}`)
      return response.data
    },
    {
      enabled: !!query.trim()
    }
  )

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.append('q', query.trim())
    if (filters.country.length > 0) params.append('country', filters.country.join(','))
    if (filters.genres.length > 0) params.append('genres', filters.genres.join(','))
    if (filters.status.length > 0) params.append('status', filters.status.join(','))
    if (filters.sortBy !== 'relevance') params.append('sortBy', filters.sortBy)
    if (filters.sortOrder !== 'desc') params.append('sortOrder', filters.sortOrder)
    
    setSearchParams(params)
  }, [query, filters, setSearchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Search is triggered automatically by the query
    }
  }

  const clearFilters = () => {
    setFilters({
      country: [],
      genres: [],
      status: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }

  const toggleFilter = (type: 'country' | 'genres' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
    const title = novel.title[isRTL ? 'ar' : 'en']
    const author = novel.author[isRTL ? 'ar' : 'en']
    const description = novel.description[isRTL ? 'ar' : 'en']

    return (
      <Card hover className="group">
        <div className="flex space-x-4 rtl:space-x-reverse">
          <div className="w-20 h-28 flex-shrink-0">
            <img
              src={novel.coverImage}
              alt={title}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
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
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                  <span>{novel.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Eye className="w-3 h-3" />
                  <span>{novel.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Heart className="w-3 h-3" />
                  <span>{novel.favorites.toLocaleString()}</span>
                </div>
              </div>
            </div>
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
            {t('search.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'ابحث عن الروايات والمؤلفين والكلمات المفتاحية'
              : 'Search for novels, authors, and keywords'
            }
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button type="submit" className="lg:w-auto">
                {t('search.title')}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.country.includes('korean') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('country', 'korean')}
              >
                {t('countries.korean')}
              </Button>
              <Button
                variant={filters.country.includes('chinese') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('country', 'chinese')}
              >
                {t('countries.chinese')}
              </Button>
              <Button
                variant={filters.country.includes('japanese') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('country', 'japanese')}
              >
                {t('countries.japanese')}
              </Button>
              <Button
                variant={filters.status.includes('ongoing') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('status', 'ongoing')}
              >
                {t('status.ongoing')}
              </Button>
              <Button
                variant={filters.status.includes('completed') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('status', 'completed')}
              >
                {t('status.completed')}
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('search.filters')}
              </Button>

              {(filters.country.length > 0 || filters.genres.length > 0 || filters.status.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('novels.country')}
                  </label>
                  <div className="space-y-2">
                    {['korean', 'chinese', 'japanese', 'other'].map((country) => (
                      <label key={country} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.country.includes(country)}
                          onChange={() => toggleFilter('country', country)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="mr-2 rtl:mr-0 rtl:ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {t(`countries.${country}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('novels.status')}
                  </label>
                  <div className="space-y-2">
                    {['ongoing', 'completed', 'hiatus', 'dropped'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter('status', status)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="mr-2 rtl:mr-0 rtl:ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {t(`status.${status}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('search.sortBy')}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="input"
                  >
                    <option value="relevance">{t('search.relevance')}</option>
                    <option value="title">{t('search.title')}</option>
                    <option value="rating">{t('search.rating')}</option>
                    <option value="views">{t('search.views')}</option>
                    <option value="favorites">{t('search.favorites')}</option>
                    <option value="date">{t('search.date')}</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Search Results */}
        {query.trim() && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isRTL ? 'نتائج البحث' : 'Search Results'}
              </h2>
              {searchResults && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL 
                    ? `تم العثور على ${searchResults.pagination.total} نتيجة`
                    : `Found ${searchResults.pagination.total} results`
                  }
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchResults?.data?.length > 0 ? (
              <div className="space-y-4">
                {searchResults.data.map((novel: Novel) => (
                  <NovelCard key={novel._id} novel={novel} />
                ))}
              </div>
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
                    ? 'لم نتمكن من العثور على أي روايات تطابق بحثك'
                    : 'We couldn\'t find any novels matching your search'
                  }
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {isRTL ? 'جرب:' : 'Try:'}
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
                    <li>• {isRTL ? 'استخدام كلمات مختلفة' : 'Using different keywords'}</li>
                    <li>• {isRTL ? 'التحقق من الإملاء' : 'Checking your spelling'}</li>
                    <li>• {isRTL ? 'استخدام كلمات أكثر عمومية' : 'Using more general terms'}</li>
                    <li>• {isRTL ? 'تقليل عدد المرشحات' : 'Reducing the number of filters'}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!query.trim() && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isRTL ? 'ابدأ البحث' : 'Start Searching'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isRTL 
                ? 'ابحث عن الروايات والمؤلفين والكلمات المفتاحية'
                : 'Search for novels, authors, and keywords'
              }
            </p>
            
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {isRTL ? 'اقتراحات البحث:' : 'Search Suggestions:'}
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {['خيال', 'رومانسية', 'أكشن', 'فنون قتالية', 'تطوير', 'عوالم متعددة'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage