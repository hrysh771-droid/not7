import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Heart, 
  Star, 
  Eye, 
  BookOpen, 
  Calendar,
  User,
  Tag,
  ChevronRight,
  Play,
  Bookmark,
  Share2,
  MessageSquare
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const NovelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isRTL = i18n.language === 'ar'

  const [activeTab, setActiveTab] = useState<'chapters' | 'comments' | 'reviews'>('chapters')

  // Fetch novel details
  const { data: novel, isLoading: novelLoading } = useQuery(
    ['novel', id],
    async () => {
      const response = await api.get(`/novels/${id}`)
      return response.data.data
    },
    {
      enabled: !!id
    }
  )

  // Fetch novel chapters
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery(
    ['novel-chapters', id],
    async () => {
      const response = await api.get(`/chapters/novel/${id}`)
      return response.data.data
    },
    {
      enabled: !!id
    }
  )

  // Fetch novel comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery(
    ['novel-comments', id],
    async () => {
      const response = await api.get(`/comments/novel/${id}`)
      return response.data.data
    },
    {
      enabled: !!id && activeTab === 'comments'
    }
  )

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    async () => {
      const response = await api.post(`/novels/${id}/favorite`)
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success(data.message)
        queryClient.invalidateQueries(['novel', id])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t('common.error'))
      }
    }
  )

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login')
      return
    }
    toggleFavoriteMutation.mutate()
  }

  const handleStartReading = () => {
    if (chaptersData?.length > 0) {
      const firstChapter = chaptersData[0]
      navigate(`/novels/${id}/chapters/${firstChapter._id}`)
    }
  }

  const handleChapterClick = (chapterId: string) => {
    navigate(`/novels/${id}/chapters/${chapterId}`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: novel?.title[isRTL ? 'ar' : 'en'],
          text: novel?.description[isRTL ? 'ar' : 'en'],
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('common.success'))
    }
  }

  if (novelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('errors.novelNotFound')}
          </h2>
          <Button onClick={() => navigate('/novels')}>
            {t('navigation.novels')}
          </Button>
        </div>
      </div>
    )
  }

  const title = novel.title[isRTL ? 'ar' : 'en']
  const author = novel.author[isRTL ? 'ar' : 'en']
  const description = novel.description[isRTL ? 'ar' : 'en']
  const isFavorite = user?.favorites?.includes(novel._id) || false

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Novel Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
              <img
                src={novel.coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Novel Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Author */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-lg text-gray-600 dark:text-gray-400">
                  <User className="w-5 h-5" />
                  <span>{author}</span>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {novel.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    ({novel.totalRatings} {isRTL ? 'تقييم' : 'ratings'})
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse text-gray-600 dark:text-gray-400">
                  <Eye className="w-5 h-5" />
                  <span>{novel.views.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse text-gray-600 dark:text-gray-400">
                  <Heart className="w-5 h-5" />
                  <span>{novel.favorites.toLocaleString()}</span>
                </div>
              </div>

              {/* Genres and Tags */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('novels.genres')}:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {novel.genres?.map((genre: any) => (
                    <span key={genre._id} className="badge badge-primary">
                      {genre.name[isRTL ? 'ar' : 'en']}
                    </span>
                  ))}
                </div>
                
                {novel.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {novel.tags.map((tag: string) => (
                      <span key={tag} className="badge badge-secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Novel Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {t('novels.country')}:
                  </span>
                  <span className="mr-2 rtl:mr-0 rtl:ml-2 font-medium text-gray-900 dark:text-white">
                    {t(`countries.${novel.country}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {t('novels.status')}:
                  </span>
                  <span className="mr-2 rtl:mr-0 rtl:ml-2 font-medium text-gray-900 dark:text-white">
                    {t(`status.${novel.status}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {t('novels.chapters')}:
                  </span>
                  <span className="mr-2 rtl:mr-0 rtl:ml-2 font-medium text-gray-900 dark:text-white">
                    {novel.chapters?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {t('novels.year')}:
                  </span>
                  <span className="mr-2 rtl:mr-0 rtl:ml-2 font-medium text-gray-900 dark:text-white">
                    {novel.year || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleStartReading}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Play className="w-4 h-4" />
                  <span>{t('novels.startReading')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                  className={`flex items-center space-x-2 rtl:space-x-reverse ${
                    isFavorite ? 'text-red-600 border-red-600' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>
                    {isFavorite ? t('novels.removeFromFavorites') : t('novels.addToFavorites')}
                  </span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('common.share')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('novels.description')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
              {[
                { id: 'chapters', label: t('chapters.title'), icon: BookOpen },
                { id: 'comments', label: t('comments.title'), icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chapters' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('chapters.title')} ({chaptersData?.length || 0})
              </h2>
            </div>

            {chaptersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : chaptersData?.length > 0 ? (
              <div className="space-y-2">
                {chaptersData.map((chapter: any) => (
                  <button
                    key={chapter._id}
                    onClick={() => handleChapterClick(chapter._id)}
                    className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right rtl:text-right ltr:text-left"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {chapter.chapterNumber}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {chapter.title[isRTL ? 'ar' : 'en']}
                        </h3>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-500">
                          <span>{chapter.wordCount.toLocaleString()} {t('novels.wordCount')}</span>
                          <span>•</span>
                          <span>{chapter.views.toLocaleString()} {t('novels.views')}</span>
                          {chapter.publishedAt && (
                            <>
                              <span>•</span>
                              <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'لا توجد فصول متاحة' : 'No chapters available'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL 
                    ? 'لم يتم نشر أي فصول لهذه الرواية بعد'
                    : 'No chapters have been published for this novel yet'
                  }
                </p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'comments' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('comments.title')} ({commentsData?.length || 0})
              </h2>
            </div>

            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : commentsData?.length > 0 ? (
              <div className="space-y-4">
                {commentsData.map((comment: any) => (
                  <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.userId?.username || 'Unknown User'}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
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
                          </div>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('comments.noComments')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('comments.beFirstToComment')}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default NovelDetailPage