import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import api from '../utils/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminNovels: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch novels for admin
  const { data: novelsData, isLoading, refetch } = useQuery(
    ['admin-novels', searchQuery, selectedCountry, selectedStatus, page],
    async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCountry) params.append('country', selectedCountry)
      if (selectedStatus) params.append('status', selectedStatus)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await api.get(`/admin/novels?${params.toString()}`)
      return response.data
    }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCountry('')
    setSelectedStatus('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('admin.novels')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL 
                ? 'إدارة الروايات والفصول'
                : 'Manage novels and chapters'
              }
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {isRTL ? 'إضافة رواية' : 'Add Novel'}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث في الروايات...' : 'Search novels...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع البلدان' : 'All Countries'}</option>
                  <option value="korean">{t('countries.korean')}</option>
                  <option value="chinese">{t('countries.chinese')}</option>
                  <option value="japanese">{t('countries.japanese')}</option>
                  <option value="other">{t('countries.other')}</option>
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="ongoing">{t('status.ongoing')}</option>
                  <option value="completed">{t('status.completed')}</option>
                  <option value="hiatus">{t('status.hiatus')}</option>
                  <option value="dropped">{t('status.dropped')}</option>
                </select>
                
                <Button type="submit">
                  {t('search.title')}
                </Button>
              </div>
            </div>

            {(searchQuery || selectedCountry || selectedStatus) && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Novels Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الرواية' : 'Novel'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('novels.author')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('novels.country')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('novels.status')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('novels.views')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('novels.favorites')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {novelsData?.data?.map((novel: any) => (
                    <tr key={novel._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-12 h-16 flex-shrink-0">
                            <img
                              src={novel.coverImage}
                              alt={novel.title[isRTL ? 'ar' : 'en']}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {novel.title[isRTL ? 'ar' : 'en']}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              {novel.chapters?.length || 0} {t('novels.chapters')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {novel.author[isRTL ? 'ar' : 'en']}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-primary text-xs">
                          {t(`countries.${novel.country}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge text-xs ${
                          novel.status === 'ongoing' ? 'badge-success' :
                          novel.status === 'completed' ? 'badge-primary' :
                          novel.status === 'hiatus' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {t(`status.${novel.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {novel.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {novel.favorites.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {novelsData?.pagination?.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!novelsData.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!novelsData.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isRTL ? (
                      <>
                        عرض <span className="font-medium">{((page - 1) * 20) + 1}</span> إلى{' '}
                        <span className="font-medium">
                          {Math.min(page * 20, novelsData.pagination.total)}
                        </span>{' '}
                        من <span className="font-medium">{novelsData.pagination.total}</span> نتائج
                      </>
                    ) : (
                      <>
                        Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(page * 20, novelsData.pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{novelsData.pagination.total}</span> results
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!novelsData.pagination.hasPrev}
                      onClick={() => setPage(page - 1)}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!novelsData.pagination.hasNext}
                      onClick={() => setPage(page + 1)}
                    >
                      {t('common.next')}
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminNovels