import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Settings, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Home,
  List,
  Maximize,
  Minimize,
  Print,
  Bookmark,
  BookmarkCheck,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  fontFamily: 'arabic' | 'english' | 'mono'
  backgroundColor: string
  textColor: string
  lineHeight: number
  maxWidth: number
}

const ReadingPage: React.FC = () => {
  const { novelId, chapterId } = useParams<{ novelId: string; chapterId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isRTL = i18n.language === 'ar'

  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    fontSize: 'medium',
    fontFamily: 'arabic',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    lineHeight: 1.6,
    maxWidth: 800
  })

  // Fetch chapter content
  const { data: chapterData, isLoading: chapterLoading } = useQuery(
    ['chapter', chapterId],
    async () => {
      const response = await api.get(`/chapters/${chapterId}/content?language=${i18n.language}`)
      return response.data.data
    },
    {
      enabled: !!chapterId
    }
  )

  // Fetch novel chapters for table of contents
  const { data: chaptersData } = useQuery(
    ['novel-chapters', novelId],
    async () => {
      const response = await api.get(`/chapters/novel/${novelId}`)
      return response.data.data
    },
    {
      enabled: !!novelId
    }
  )

  // Update reading progress mutation
  const updateProgressMutation = useMutation(
    async (progress: number) => {
      const response = await api.post(`/chapters/${chapterId}/progress`, { progress })
      return response.data
    }
  )

  // Load user's reading settings
  useEffect(() => {
    if (user?.preferences?.readingSettings) {
      setReadingSettings(user.preferences.readingSettings)
    }
  }, [user])

  // Save reading settings
  const saveReadingSettings = (newSettings: Partial<ReadingSettings>) => {
    const updatedSettings = { ...readingSettings, ...newSettings }
    setReadingSettings(updatedSettings)
    
    // Save to user preferences if logged in
    if (user) {
      // This would typically call an API to save user preferences
      console.log('Saving reading settings:', updatedSettings)
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chapterData?.title,
          text: `Read "${chapterData?.title}" on Novel Reader Platform`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('common.success'))
    }
  }

  // Handle reading progress
  const handleReadingProgress = (progress: number) => {
    if (user) {
      updateProgressMutation.mutate(progress)
    }
  }

  // Navigate to chapter
  const navigateToChapter = (chapterNumber: number) => {
    const chapter = chaptersData?.find((ch: any) => ch.chapterNumber === chapterNumber)
    if (chapter) {
      navigate(`/novels/${novelId}/chapters/${chapter._id}`)
    }
  }

  if (chapterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!chapterData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('errors.chapterNotFound')}
          </h2>
          <Link to="/novels">
            <Button>{t('navigation.novels')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentChapterIndex = chaptersData?.findIndex((ch: any) => ch._id === chapterId) || 0
  const hasNextChapter = currentChapterIndex < (chaptersData?.length || 0) - 1
  const hasPrevChapter = currentChapterIndex > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to={`/novels/${novelId}`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('common.back')}
                </Button>
              </Link>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chapterData.novel.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('chapters.chapter')} {chapterData.chapterNumber}: {chapterData.title}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTableOfContents(!showTableOfContents)}
              >
                <List className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
              >
                <Print className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Table of Contents Sidebar */}
        {showTableOfContents && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('chapters.tableOfContents')}
              </h3>
              <div className="space-y-2">
                {chaptersData?.map((chapter: any) => (
                  <button
                    key={chapter._id}
                    onClick={() => navigateToChapter(chapter.chapterNumber)}
                    className={`w-full text-right rtl:text-right ltr:text-left p-3 rounded-lg transition-colors ${
                      chapter._id === chapterId
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-medium">
                      {t('chapters.chapter')} {chapter.chapterNumber}
                    </div>
                    <div className="text-sm opacity-75 line-clamp-2">
                      {chapter.title[isRTL ? 'ar' : 'en']}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Reading Settings Panel */}
          {showSettings && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="container-custom">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('reading.settings')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.fontSize')}
                    </label>
                    <select
                      value={readingSettings.fontSize}
                      onChange={(e) => saveReadingSettings({ fontSize: e.target.value as any })}
                      className="input"
                    >
                      <option value="small">{t('reading.small')}</option>
                      <option value="medium">{t('reading.medium')}</option>
                      <option value="large">{t('reading.large')}</option>
                      <option value="xlarge">{t('reading.xlarge')}</option>
                    </select>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.fontFamily')}
                    </label>
                    <select
                      value={readingSettings.fontFamily}
                      onChange={(e) => saveReadingSettings({ fontFamily: e.target.value as any })}
                      className="input"
                    >
                      <option value="arabic">{t('reading.arabic')}</option>
                      <option value="english">{t('reading.english')}</option>
                      <option value="mono">{t('reading.mono')}</option>
                    </select>
                  </div>

                  {/* Line Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.lineHeight')}
                    </label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.5"
                      step="0.1"
                      value={readingSettings.lineHeight}
                      onChange={(e) => saveReadingSettings({ lineHeight: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {readingSettings.lineHeight}
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.backgroundColor')}
                    </label>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {['#ffffff', '#f8f9fa', '#fff8e1', '#1a1a1a', '#2d3748'].map((color) => (
                        <button
                          key={color}
                          onClick={() => saveReadingSettings({ backgroundColor: color })}
                          className={`w-8 h-8 rounded-full border-2 ${
                            readingSettings.backgroundColor === color
                              ? 'border-primary-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.textColor')}
                    </label>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {['#000000', '#374151', '#6b7280', '#ffffff', '#e5e7eb'].map((color) => (
                        <button
                          key={color}
                          onClick={() => saveReadingSettings({ textColor: color })}
                          className={`w-8 h-8 rounded-full border-2 ${
                            readingSettings.textColor === color
                              ? 'border-primary-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Max Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reading.maxWidth')}
                    </label>
                    <input
                      type="range"
                      min="400"
                      max="1200"
                      step="50"
                      value={readingSettings.maxWidth}
                      onChange={(e) => saveReadingSettings({ maxWidth: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {readingSettings.maxWidth}px
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reading Content */}
          <div className="reading-container py-8">
            <div
              className="reading-content mx-auto"
              style={{
                fontFamily: readingSettings.fontFamily === 'arabic' ? 'Cairo, Arial, sans-serif' :
                           readingSettings.fontFamily === 'english' ? 'Inter, Arial, sans-serif' :
                           'JetBrains Mono, monospace',
                fontSize: readingSettings.fontSize === 'small' ? '14px' :
                         readingSettings.fontSize === 'medium' ? '16px' :
                         readingSettings.fontSize === 'large' ? '18px' : '20px',
                lineHeight: readingSettings.lineHeight,
                color: readingSettings.textColor,
                backgroundColor: readingSettings.backgroundColor,
                maxWidth: `${readingSettings.maxWidth}px`,
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h1 className="text-3xl font-bold mb-6 text-center">
                {chapterData.title}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                {chapterData.content.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                disabled={!hasPrevChapter}
                onClick={() => {
                  if (hasPrevChapter) {
                    const prevChapter = chaptersData?.[currentChapterIndex - 1]
                    if (prevChapter) {
                      navigateToChapter(prevChapter.chapterNumber)
                    }
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('chapters.previousChapter')}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('chapters.chapter')} {chapterData.chapterNumber} / {chaptersData?.length || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {chapterData.wordCount.toLocaleString()} {t('novels.wordCount')}
                </p>
              </div>

              <Button
                variant="outline"
                disabled={!hasNextChapter}
                onClick={() => {
                  if (hasNextChapter) {
                    const nextChapter = chaptersData?.[currentChapterIndex + 1]
                    if (nextChapter) {
                      navigateToChapter(nextChapter.chapterNumber)
                    }
                  }
                }}
              >
                {t('chapters.nextChapter')}
                <ChevronRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReadingPage