import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Genre, Novel } from '../models/Novel'
import Chapter from '../models/Chapter'
import User from '../models/User'

// Load environment variables
dotenv.config()

// Sample genres data
const genresData = [
  {
    name: { ar: 'خيال', en: 'Fantasy' },
    slug: 'fantasy',
    description: { ar: 'روايات الخيال والسحر', en: 'Fantasy and magic novels' },
    color: '#3b82f6'
  },
  {
    name: { ar: 'رومانسية', en: 'Romance' },
    slug: 'romance',
    description: { ar: 'روايات الحب والرومانسية', en: 'Love and romance novels' },
    color: '#ec4899'
  },
  {
    name: { ar: 'أكشن', en: 'Action' },
    slug: 'action',
    description: { ar: 'روايات الأكشن والمغامرة', en: 'Action and adventure novels' },
    color: '#ef4444'
  },
  {
    name: { ar: 'فنون قتالية', en: 'Martial Arts' },
    slug: 'martial-arts',
    description: { ar: 'روايات الفنون القتالية والكونغ فو', en: 'Martial arts and kung fu novels' },
    color: '#f59e0b'
  },
  {
    name: { ar: 'تطوير', en: 'Cultivation' },
    slug: 'cultivation',
    description: { ar: 'روايات التطوير والتدريب', en: 'Cultivation and training novels' },
    color: '#10b981'
  },
  {
    name: { ar: 'خيال صيني', en: 'Xuanhuan' },
    slug: 'xuanhuan',
    description: { ar: 'روايات الخيال الصيني التقليدي', en: 'Traditional Chinese fantasy novels' },
    color: '#8b5cf6'
  },
  {
    name: { ar: 'ووشيا', en: 'Wuxia' },
    slug: 'wuxia',
    description: { ar: 'روايات الووشيا الصينية', en: 'Chinese wuxia novels' },
    color: '#06b6d4'
  },
  {
    name: { ar: 'عوالم متعددة', en: 'Isekai' },
    slug: 'isekai',
    description: { ar: 'روايات العوالم المتعددة والانتقال', en: 'Isekai and world transfer novels' },
    color: '#84cc16'
  },
  {
    name: { ar: 'تناسخ', en: 'Reincarnation' },
    slug: 'reincarnation',
    description: { ar: 'روايات التناسخ والولادة من جديد', en: 'Reincarnation and rebirth novels' },
    color: '#f97316'
  },
  {
    name: { ar: 'نظام', en: 'System' },
    slug: 'system',
    description: { ar: 'روايات النظام والواجهة', en: 'System and interface novels' },
    color: '#6366f1'
  }
]

// Sample novels data (155 novels)
const novelsData = [
  // Korean Novels (60)
  {
    title: { ar: 'لورد الغوامض', en: 'Lord of the Mysteries' },
    description: { 
      ar: 'رواية خيالية كورية تحكي قصة شاب ينتقل إلى عالم غامض مليء بالأسرار والقوى الخارقة',
      en: 'A Korean fantasy novel about a young man who travels to a mysterious world full of secrets and supernatural powers'
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    country: 'korean',
    genres: ['fantasy', 'mystery'],
    status: 'ongoing',
    rating: 4.8,
    totalRatings: 1250,
    views: 50000,
    favorites: 3200,
    tags: ['خيال', 'غموض', 'قوى خارقة'],
    year: 2023,
    isPopular: true,
    isFeatured: true,
    slug: 'lord-of-the-mysteries'
  },
  {
    title: { ar: 'البداية بعد النهاية', en: 'The Beginning After The End' },
    description: { 
      ar: 'رواية خيالية كورية عن ملك سابق يعيد ولادته في عالم جديد',
      en: 'A Korean fantasy novel about a former king who is reborn in a new world'
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    country: 'korean',
    genres: ['fantasy', 'reincarnation'],
    status: 'ongoing',
    rating: 4.7,
    totalRatings: 980,
    views: 45000,
    favorites: 2800,
    tags: ['خيال', 'تناسخ', 'ملك'],
    year: 2022,
    isPopular: true,
    isFeatured: true,
    slug: 'the-beginning-after-the-end'
  },
  {
    title: { ar: 'طائفة جبل هوا', en: 'Mount Hua Sect' },
    description: { 
      ar: 'رواية فنون قتالية كورية عن شاب ينضم إلى طائفة جبل هوا',
      en: 'A Korean martial arts novel about a young man who joins the Mount Hua sect'
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    country: 'korean',
    genres: ['martial-arts', 'cultivation'],
    status: 'ongoing',
    rating: 4.6,
    totalRatings: 750,
    views: 38000,
    favorites: 2100,
    tags: ['فنون قتالية', 'تطوير', 'طائفة'],
    year: 2023,
    isPopular: true,
    isFeatured: false,
    slug: 'mount-hua-sect'
  },
  {
    title: { ar: 'نظره قارئ محيط بكل شيء', en: 'Omniscient Reader\'s Viewpoint' },
    description: { 
      ar: 'رواية خيالية كورية عن قارئ يعرف كل شيء عن العالم',
      en: 'A Korean fantasy novel about a reader who knows everything about the world'
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop',
    country: 'korean',
    genres: ['fantasy', 'system'],
    status: 'completed',
    rating: 4.9,
    totalRatings: 2100,
    views: 75000,
    favorites: 4500,
    tags: ['خيال', 'نظام', 'قارئ'],
    year: 2021,
    isPopular: true,
    isFeatured: true,
    slug: 'omniscient-readers-viewpoint'
  },
  {
    title: { ar: 'القس المجنون', en: 'The Mad Priest' },
    description: { 
      ar: 'رواية خيال مظلم كورية عن قس مجنون في عالم مليء بالشر',
      en: 'A Korean dark fantasy novel about a mad priest in a world full of evil'
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    country: 'korean',
    genres: ['fantasy', 'action'],
    status: 'ongoing',
    rating: 4.5,
    totalRatings: 650,
    views: 32000,
    favorites: 1800,
    tags: ['خيال مظلم', 'قس', 'شر'],
    year: 2023,
    isPopular: false,
    isFeatured: false,
    slug: 'the-mad-priest'
  },
  // Add more Korean novels...
  ...Array.from({ length: 55 }, (_, i) => ({
    title: { 
      ar: `رواية كورية ${i + 6}`, 
      en: `Korean Novel ${i + 6}` 
    },
    description: { 
      ar: `وصف الرواية الكورية رقم ${i + 6}`,
      en: `Description for Korean novel number ${i + 6}`
    },
    author: { ar: 'كاتب كوري', en: 'Korean Author' },
    coverImage: `https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=400&fit=crop`,
    country: 'korean',
    genres: ['fantasy', 'action'],
    status: i % 4 === 0 ? 'completed' : 'ongoing',
    rating: 4.0 + Math.random() * 1.0,
    totalRatings: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 50000) + 1000,
    favorites: Math.floor(Math.random() * 3000) + 100,
    tags: ['كورية', 'خيال'],
    year: 2020 + Math.floor(Math.random() * 4),
    isPopular: Math.random() > 0.7,
    isFeatured: Math.random() > 0.8,
    slug: `korean-novel-${i + 6}`
  })),

  // Chinese Novels (60)
  {
    title: { ar: 'قمة الفنون القتالية', en: 'Martial Peak' },
    description: { 
      ar: 'رواية فنون قتالية صينية عن شاب يسعى للوصول إلى قمة الفنون القتالية',
      en: 'A Chinese martial arts novel about a young man seeking to reach the peak of martial arts'
    },
    author: { ar: 'كاتب صيني', en: 'Chinese Author' },
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
    country: 'chinese',
    genres: ['martial-arts', 'cultivation'],
    status: 'ongoing',
    rating: 4.6,
    totalRatings: 1800,
    views: 65000,
    favorites: 3800,
    tags: ['فنون قتالية', 'تطوير', 'قمة'],
    year: 2022,
    isPopular: true,
    isFeatured: true,
    slug: 'martial-peak'
  },
  {
    title: { ar: 'مكتبة طريق السماء', en: 'Library of Heaven\'s Path' },
    description: { 
      ar: 'رواية خيال صيني عن مكتبة تحتوي على جميع المعارف في الكون',
      en: 'A Chinese fantasy novel about a library containing all knowledge in the universe'
    },
    author: { ar: 'كاتب صيني', en: 'Chinese Author' },
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    country: 'chinese',
    genres: ['xuanhuan', 'cultivation'],
    status: 'completed',
    rating: 4.7,
    totalRatings: 1200,
    views: 55000,
    favorites: 3200,
    tags: ['خيال صيني', 'مكتبة', 'معرفة'],
    year: 2021,
    isPopular: true,
    isFeatured: true,
    slug: 'library-of-heavens-path'
  },
  {
    title: { ar: 'أنا ساحر الملك', en: 'I Am the Sorcerer King' },
    description: { 
      ar: 'رواية خيال صيني عن ساحر يصبح ملكاً',
      en: 'A Chinese fantasy novel about a sorcerer who becomes a king'
    },
    author: { ar: 'كاتب صيني', en: 'Chinese Author' },
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    country: 'chinese',
    genres: ['fantasy', 'action'],
    status: 'ongoing',
    rating: 4.4,
    totalRatings: 900,
    views: 42000,
    favorites: 2500,
    tags: ['ساحر', 'ملك', 'خيال'],
    year: 2023,
    isPopular: true,
    isFeatured: false,
    slug: 'i-am-the-sorcerer-king'
  },
  // Add more Chinese novels...
  ...Array.from({ length: 57 }, (_, i) => ({
    title: { 
      ar: `رواية صينية ${i + 4}`, 
      en: `Chinese Novel ${i + 4}` 
    },
    description: { 
      ar: `وصف الرواية الصينية رقم ${i + 4}`,
      en: `Description for Chinese novel number ${i + 4}`
    },
    author: { ar: 'كاتب صيني', en: 'Chinese Author' },
    coverImage: `https://images.unsplash.com/photo-${1600000000000 + i}?w=300&h=400&fit=crop`,
    country: 'chinese',
    genres: ['martial-arts', 'cultivation'],
    status: i % 4 === 0 ? 'completed' : 'ongoing',
    rating: 4.0 + Math.random() * 1.0,
    totalRatings: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 50000) + 1000,
    favorites: Math.floor(Math.random() * 3000) + 100,
    tags: ['صينية', 'فنون قتالية'],
    year: 2020 + Math.floor(Math.random() * 4),
    isPopular: Math.random() > 0.7,
    isFeatured: Math.random() > 0.8,
    slug: `chinese-novel-${i + 4}`
  })),

  // Japanese Novels (20)
  {
    title: { ar: 'برج الله', en: 'Tower of God' },
    description: { 
      ar: 'رواية خيالية يابانية عن برج يحتوي على جميع الرغبات',
      en: 'A Japanese fantasy novel about a tower containing all desires'
    },
    author: { ar: 'كاتب ياباني', en: 'Japanese Author' },
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    country: 'japanese',
    genres: ['fantasy', 'action'],
    status: 'ongoing',
    rating: 4.8,
    totalRatings: 1500,
    views: 60000,
    favorites: 3500,
    tags: ['برج', 'خيال', 'رغبات'],
    year: 2022,
    isPopular: true,
    isFeatured: true,
    slug: 'tower-of-god'
  },
  {
    title: { ar: 'سولو ليفلينج', en: 'Solo Leveling' },
    description: { 
      ar: 'رواية خيالية يابانية عن صياد ضعيف يصبح الأقوى',
      en: 'A Japanese fantasy novel about a weak hunter who becomes the strongest'
    },
    author: { ar: 'كاتب ياباني', en: 'Japanese Author' },
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop',
    country: 'japanese',
    genres: ['fantasy', 'system'],
    status: 'completed',
    rating: 4.9,
    totalRatings: 2500,
    views: 80000,
    favorites: 5000,
    tags: ['صياد', 'نظام', 'قوة'],
    year: 2021,
    isPopular: true,
    isFeatured: true,
    slug: 'solo-leveling'
  },
  // Add more Japanese novels...
  ...Array.from({ length: 18 }, (_, i) => ({
    title: { 
      ar: `رواية يابانية ${i + 3}`, 
      en: `Japanese Novel ${i + 3}` 
    },
    description: { 
      ar: `وصف الرواية اليابانية رقم ${i + 3}`,
      en: `Description for Japanese novel number ${i + 3}`
    },
    author: { ar: 'كاتب ياباني', en: 'Japanese Author' },
    coverImage: `https://images.unsplash.com/photo-${1700000000000 + i}?w=300&h=400&fit=crop`,
    country: 'japanese',
    genres: ['fantasy', 'action'],
    status: i % 4 === 0 ? 'completed' : 'ongoing',
    rating: 4.0 + Math.random() * 1.0,
    totalRatings: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 50000) + 1000,
    favorites: Math.floor(Math.random() * 3000) + 100,
    tags: ['يابانية', 'خيال'],
    year: 2020 + Math.floor(Math.random() * 4),
    isPopular: Math.random() > 0.7,
    isFeatured: Math.random() > 0.8,
    slug: `japanese-novel-${i + 3}`
  })),

  // Other Novels (15)
  ...Array.from({ length: 15 }, (_, i) => ({
    title: { 
      ar: `رواية أخرى ${i + 1}`, 
      en: `Other Novel ${i + 1}` 
    },
    description: { 
      ar: `وصف الرواية الأخرى رقم ${i + 1}`,
      en: `Description for other novel number ${i + 1}`
    },
    author: { ar: 'كاتب آخر', en: 'Other Author' },
    coverImage: `https://images.unsplash.com/photo-${1800000000000 + i}?w=300&h=400&fit=crop`,
    country: 'other',
    genres: ['fantasy', 'romance'],
    status: i % 4 === 0 ? 'completed' : 'ongoing',
    rating: 4.0 + Math.random() * 1.0,
    totalRatings: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 50000) + 1000,
    favorites: Math.floor(Math.random() * 3000) + 100,
    tags: ['أخرى', 'خيال'],
    year: 2020 + Math.floor(Math.random() * 4),
    isPopular: Math.random() > 0.7,
    isFeatured: Math.random() > 0.8,
    slug: `other-novel-${i + 1}`
  }))
]

// Sample chapters data
const generateChapters = (novelId: string, novelTitle: string, count: number = 50) => {
  return Array.from({ length: count }, (_, i) => ({
    novelId,
    title: {
      ar: `الفصل ${i + 1}: ${novelTitle}`,
      en: `Chapter ${i + 1}: ${novelTitle}`
    },
    content: {
      ar: `هذا هو محتوى الفصل ${i + 1} من الرواية "${novelTitle}". المحتوى هنا طويل ومفصل ويحتوي على أحداث مثيرة ومشوقة تجعل القارئ يريد المتابعة.`,
      en: `This is the content of chapter ${i + 1} of the novel "${novelTitle}". The content here is long and detailed, containing exciting and interesting events that make the reader want to continue.`
    },
    chapterNumber: i + 1,
    wordCount: Math.floor(Math.random() * 2000) + 1000,
    isPublished: true,
    publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    views: Math.floor(Math.random() * 5000) + 100
  }))
}

// Sample admin user
const adminUser = {
  username: 'admin',
  email: 'admin@novelreader.com',
  password: 'admin123456',
  role: 'admin',
  preferences: {
    language: 'ar',
    theme: 'auto',
    readingSettings: {
      fontSize: 'medium',
      fontFamily: 'arabic',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      lineHeight: 1.6,
      maxWidth: 800
    },
    notifications: {
      email: true,
      push: true,
      newChapters: true,
      updates: true
    }
  }
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-reader')
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Genre.deleteMany({})
    await Novel.deleteMany({})
    await Chapter.deleteMany({})
    await User.deleteMany({})
    console.log('✅ Cleared existing data')

    // Create genres
    const genres = await Genre.insertMany(genresData)
    console.log(`✅ Created ${genres.length} genres`)

    // Create admin user
    const admin = await User.create(adminUser)
    console.log('✅ Created admin user')

    // Create novels
    const novels = []
    for (const novelData of novelsData) {
      // Get genre IDs
      const genreIds = novelData.genres.map(genreSlug => 
        genres.find(g => g.slug === genreSlug)?._id
      ).filter(Boolean)

      const novel = await Novel.create({
        ...novelData,
        genres: genreIds
      })
      novels.push(novel)
    }
    console.log(`✅ Created ${novels.length} novels`)

    // Create chapters for each novel
    let totalChapters = 0
    for (const novel of novels) {
      const chapterCount = Math.floor(Math.random() * 100) + 20 // 20-120 chapters
      const chapters = generateChapters(novel._id, novel.title.ar, chapterCount)
      await Chapter.insertMany(chapters)
      totalChapters += chapters.length

      // Update novel with chapter IDs
      const chapterIds = chapters.map(ch => ch._id)
      await Novel.findByIdAndUpdate(novel._id, { chapters: chapterIds })
    }
    console.log(`✅ Created ${totalChapters} chapters`)

    console.log('🎉 Database seeded successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Genres: ${genres.length}`)
    console.log(`   - Novels: ${novels.length}`)
    console.log(`   - Chapters: ${totalChapters}`)
    console.log(`   - Users: 1 (admin)`)
    console.log(`   - Admin credentials: admin@novelreader.com / admin123456`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.connection.close()
    console.log('✅ Database connection closed')
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase