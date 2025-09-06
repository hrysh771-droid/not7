# دليل إعداد وتشغيل منصة قراءة الروايات الإلكترونية

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت المتطلبات التالية:

- **Node.js** (الإصدار 18 أو أحدث)
- **MongoDB** (الإصدار 5 أو أحدث)
- **npm** أو **yarn**

## خطوات الإعداد

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd novel-reader-platform
```

### 2. تثبيت التبعيات

```bash
# تثبيت تبعيات المشروع الرئيسي
npm install

# تثبيت جميع التبعيات (العميل والخادم)
npm run install:all
```

### 3. إعداد قاعدة البيانات

تأكد من تشغيل MongoDB على المنفذ الافتراضي (27017):

```bash
# على Windows
mongod

# على macOS/Linux
sudo systemctl start mongod
# أو
mongod --dbpath /path/to/your/db
```

### 4. إعداد متغيرات البيئة

#### الخادم (Server)
```bash
cd server
cp .env.example .env
```

قم بتعديل ملف `.env` حسب الحاجة:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/novel-reader
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

#### العميل (Client)
```bash
cd client
cp .env.example .env
```

ملف `.env` للعميل:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Novel Reader Platform
VITE_APP_VERSION=1.0.0
```

### 5. إضافة البيانات النموذجية

```bash
cd server
npm run seed
```

هذا الأمر سيقوم بإنشاء:
- 10 تصنيفات للروايات
- 155 رواية متنوعة (60 كورية، 60 صينية، 20 يابانية، 15 أخرى)
- آلاف الفصول
- مستخدم إداري (admin@novelreader.com / admin123456)

### 6. تشغيل المشروع

#### تشغيل في وضع التطوير (Development)
```bash
# من المجلد الرئيسي
npm run dev
```

هذا الأمر سيشغل:
- الخادم على `http://localhost:5000`
- العميل على `http://localhost:3000`

#### تشغيل منفصل
```bash
# تشغيل الخادم فقط
npm run server:dev

# تشغيل العميل فقط
npm run client:dev
```

## الوصول إلى المنصة

### الواجهة الأمامية
- **الرابط**: http://localhost:3000
- **اللغة الافتراضية**: العربية
- **دعم RTL**: نعم

### API الخادم
- **الرابط**: http://localhost:5000
- **الوثائق**: http://localhost:5000/health
- **نقاط النهاية**: `/api/*`

### بيانات الدخول الافتراضية

#### مستخدم إداري
- **البريد الإلكتروني**: admin@novelreader.com
- **كلمة المرور**: admin123456
- **الصلاحيات**: إدارة كاملة

#### مستخدم تجريبي
- **البريد الإلكتروني**: demo@novelreader.com
- **كلمة المرور**: demo123
- **الصلاحيات**: مستخدم عادي

## المميزات المتاحة

### للمستخدمين العاديين
- ✅ تصفح الروايات
- ✅ البحث والتصفية
- ✅ قراءة الفصول
- ✅ تخصيص إعدادات القراءة
- ✅ إضافة الروايات للمفضلة
- ✅ تتبع تقدم القراءة
- ✅ التعليق والتقييم

### للإدارة
- ✅ إدارة الروايات والفصول
- ✅ إدارة المستخدمين
- ✅ إدارة التعليقات
- ✅ إحصائيات شاملة
- ✅ إدارة التصنيفات

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ في الاتصال بقاعدة البيانات
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**الحل**: تأكد من تشغيل MongoDB

#### 2. خطأ في المنافذ
```
Error: listen EADDRINUSE :::5000
```
**الحل**: غير المنفذ في ملف `.env` أو أوقف العملية التي تستخدم المنفذ

#### 3. خطأ في التبعيات
```
Module not found
```
**الحل**: قم بتشغيل `npm install` في المجلد المناسب

#### 4. خطأ في البناء
```
TypeScript compilation error
```
**الحل**: تأكد من تثبيت TypeScript والإصدارات الصحيحة

### سجلات الأخطاء

#### الخادم
```bash
cd server
npm run dev
# ستعرض السجلات في الطرفية
```

#### العميل
```bash
cd client
npm run dev
# ستعرض السجلات في الطرفية
```

## البناء للإنتاج

### 1. بناء المشروع
```bash
npm run build
```

### 2. تشغيل الإنتاج
```bash
npm start
```

### 3. متغيرات البيئة للإنتاج
تأكد من تحديث ملفات `.env` للإنتاج:
- استخدام JWT secrets قوية
- تحديث MongoDB URI
- تحديث CORS origins
- تفعيل HTTPS

## الدعم والمساعدة

### الملفات المهمة
- `README.md` - وثائق المشروع الرئيسية
- `SETUP.md` - دليل الإعداد (هذا الملف)
- `package.json` - تبعيات المشروع
- `.env.example` - مثال على متغيرات البيئة

### الروابط المفيدة
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### التواصل
إذا واجهت أي مشاكل أو لديك أسئلة:
1. تحقق من هذا الدليل أولاً
2. راجع ملف README.md
3. تحقق من سجلات الأخطاء
4. ابحث في issues المشروع

---

**ملاحظة**: هذا المشروع مخصص للأغراض التعليمية والتطوير. يرجى احترام حقوق الملكية الفكرية للمحتوى المترجم.