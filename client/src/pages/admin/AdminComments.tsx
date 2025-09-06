import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Search,
  Check,
  X,
  Trash2,
  MessageSquare,
  User,
  BookOpen,
  Calendar
} from 'lucide-react'
import api from '../utils/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminComments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const isRTL = i18n.language === 'ar'

  // Fetch comments for admin
  const { data: commentsData, isLoading, refetch } = useQuery(
    ['admin-comments', searchQuery, selectedStatus, page],
    async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedStatus) params.append('isApproved', selectedStatus)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await api.get(`/admin/comments?${params.toString()}`)
      return response.data
    }
  )

  // Approve comment mutation
  const approveCommentMutation = useMutation(
    async (commentId: string) => {
      const response = await api.put(`/admin/comments/${commentId}/approve`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success(t('admin.approve'))
        queryClient.invalidateQueries(['admin-comments'])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('common.error'))
      }
    }
  )

  // Reject comment mutation
  const rejectCommentMutation = useMutation(
    async (commentId: string) => {
      const response = await api.put(`/admin/comments/${commentId}/reject`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success(t('admin.reject'))
        queryClient.invalidateQueries(['admin-comments'])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('common.error'))
      }
    }
  )

  // Delete comment mutation
  const deleteCommentMutation = useMutation(
    async (commentId: string) => {
      const response = await api.delete(`/admin/comments/${commentId}`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success(t('common.delete'))
        queryClient.invalidateQueries(['admin-comments'])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('common.error'))
      }
    }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('')
    setPage(1)
  }

  const handleApprove = (commentId: string) => {
    approveCommentMutation.mutate(commentId)
  }

  const handleReject = (commentId: string) => {
    rejectCommentMutation.mutate(commentId)
  }

  const handleDelete = (commentId: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return <span className="badge badge-success text-xs">{t('admin.approved')}</span>
    } else {
      return <span className="badge badge-warning text-xs">{t('admin.pending')}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.comments')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL 
              ? 'إدارة التعليقات والمراجعات'
              : 'Manage comments and reviews'
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
                  placeholder={isRTL ? 'البحث في التعليقات...' : 'Search comments...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="true">{t('admin.approved')}</option>
                  <option value="false">{t('admin.pending')}</option>
                </select>
                
                <Button type="submit">
                  {t('search.title')}
                </Button>
              </div>
            </div>

            {(searchQuery || selectedStatus) && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : commentsData?.data?.length > 0 ? (
            commentsData.data.map((comment: any) => (
              <Card key={comment._id} className="p-6">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.userId?.username || 'Unknown User'}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {comment.userId?.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {getStatusBadge(comment.isApproved)}
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'على رواية:' : 'On novel:'} {comment.novelId?.title?.[isRTL ? 'ar' : 'en'] || 'Unknown Novel'}
                        </span>
                      </div>
                      {comment.rating && (
                        <div className="flex items-center space-x-1 rtl:space-x-reverse mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 dark:text-gray-500 ml-2 rtl:ml-0 rtl:mr-2">
                            ({comment.rating}/5)
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {comment.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {isRTL ? 'الإعجابات:' : 'Likes:'} {comment.likes}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {isRTL ? 'عدم الإعجاب:' : 'Dislikes:'} {comment.dislikes}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {!comment.isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(comment._id)}
                            loading={approveCommentMutation.isLoading}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                            {t('admin.approve')}
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(comment._id)}
                          loading={rejectCommentMutation.isLoading}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <X className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {t('admin.reject')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(comment._id)}
                          loading={deleteCommentMutation.isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {t('common.delete')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isRTL ? 'لا توجد تعليقات' : 'No comments found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL 
                  ? 'لم يتم العثور على أي تعليقات تطابق معايير البحث'
                  : 'No comments found matching the search criteria'
                }
              </p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {commentsData?.pagination?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                disabled={!commentsData.pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                {t('common.previous')}
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {page} / {commentsData.pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!commentsData.pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminComments