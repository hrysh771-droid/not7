import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Eye, 
  TrendingUp,
  Clock,
  Star,
  MessageSquare
} from 'lucide-react'
import api from '../utils/api'
import Card from '../../components/UI/Card'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery(
    'admin-dashboard-stats',
    async () => {
      const response = await api.get('/admin/dashboard')
      return response.data.data
    }
  )

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    change?: string
  }> = ({ title, value, icon, color, change }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  )

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'نظرة عامة على إحصائيات المنصة'
              : 'Overview of platform statistics'
            }
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('admin.totalUsers')}
            value={stats?.totalUsers?.toLocaleString() || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            change="+12% هذا الشهر"
          />
          <StatCard
            title={t('admin.totalNovels')}
            value={stats?.totalNovels?.toLocaleString() || 0}
            icon={<BookOpen className="w-6 h-6 text-white" />}
            color="bg-green-500"
            change="+5% هذا الشهر"
          />
          <StatCard
            title={t('admin.totalChapters')}
            value={stats?.totalChapters?.toLocaleString() || 0}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            change="+8% هذا الشهر"
          />
          <StatCard
            title={t('admin.totalViews')}
            value={stats?.totalViews?.toLocaleString() || 0}
            icon={<Eye className="w-6 h-6 text-white" />}
            color="bg-orange-500"
            change="+15% هذا الشهر"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('admin.recentUsers')}
            </h2>
            {stats?.recentUsers?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {isRTL ? 'لا يوجد مستخدمين جدد' : 'No recent users'}
              </p>
            )}
          </Card>

          {/* Popular Novels */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('admin.popularNovels')}
            </h2>
            {stats?.popularNovels?.length > 0 ? (
              <div className="space-y-4">
                {stats.popularNovels.map((novel: any) => (
                  <div key={novel._id} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-12 h-16 flex-shrink-0">
                      <img
                        src={novel.coverImage}
                        alt={novel.title[isRTL ? 'ar' : 'en']}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {novel.title[isRTL ? 'ar' : 'en']}
                      </p>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {novel.views.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {novel.favorites.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {isRTL ? 'لا توجد روايات شائعة' : 'No popular novels'}
              </p>
            )}
          </Card>
        </div>

        {/* Recent Comments */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t('admin.recentComments')}
          </h2>
          {stats?.recentComments?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentComments.map((comment: any) => (
                <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.userId?.username || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {isRTL ? 'على رواية:' : 'On novel:'} {comment.novelId?.title?.[isRTL ? 'ar' : 'en'] || 'Unknown Novel'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {isRTL ? 'لا توجد تعليقات حديثة' : 'No recent comments'}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard