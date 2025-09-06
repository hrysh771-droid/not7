import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { 
  Search,
  Filter,
  MoreVertical,
  User,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldX
} from 'lucide-react'
import api from '../utils/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [page, setPage] = useState(1)
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch users for admin
  const { data: usersData, isLoading, refetch } = useQuery(
    ['admin-users', searchQuery, selectedRole, page],
    async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedRole) params.append('role', selectedRole)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await api.get(`/admin/users?${params.toString()}`)
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
    setSelectedRole('')
    setPage(1)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-red-600" />
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'badge-danger'
      case 'moderator':
        return 'badge-primary'
      default:
        return 'badge-secondary'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.users')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'إدارة المستخدمين والأذونات'
              : 'Manage users and permissions'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث في المستخدمين...' : 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
                  <option value="user">{isRTL ? 'مستخدم' : 'User'}</option>
                  <option value="moderator">{isRTL ? 'مشرف' : 'Moderator'}</option>
                  <option value="admin">{isRTL ? 'مدير' : 'Admin'}</option>
                </select>
                
                <Button type="submit">
                  {t('search.title')}
                </Button>
              </div>
            </div>

            {(searchQuery || selectedRole) && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Users Table */}
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
                      {isRTL ? 'المستخدم' : 'User'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('auth.email')}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الدور' : 'Role'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'آخر نشاط' : 'Last Activity'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right rtl:text-right ltr:text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {usersData?.data?.map((user: any) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getRoleIcon(user.role)}
                          <span className={`badge text-xs ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : isRTL ? 'لم يسجل دخول' : 'Never logged in'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge text-xs ${
                          user.isActive ? 'badge-success' : 'badge-danger'
                        }`}>
                          {user.isActive 
                            ? (isRTL ? 'نشط' : 'Active')
                            : (isRTL ? 'غير نشط' : 'Inactive')
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
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
          {usersData?.pagination?.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!usersData.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!usersData.pagination.hasNext}
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
                          {Math.min(page * 20, usersData.pagination.total)}
                        </span>{' '}
                        من <span className="font-medium">{usersData.pagination.total}</span> نتائج
                      </>
                    ) : (
                      <>
                        Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(page * 20, usersData.pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{usersData.pagination.total}</span> results
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!usersData.pagination.hasPrev}
                      onClick={() => setPage(page - 1)}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!usersData.pagination.hasNext}
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

export default AdminUsers