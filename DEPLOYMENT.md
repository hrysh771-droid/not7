# دليل النشر | Deployment Guide

هذا الدليل يوضح كيفية نشر منصة قراءة الروايات الإلكترونية في بيئات مختلفة.

## خيارات النشر

### 1. النشر المحلي مع Docker

#### المتطلبات
- Docker
- Docker Compose

#### خطوات النشر
```bash
# استنساخ المشروع
git clone <repository-url>
cd novel-reader-platform

# تشغيل الخدمات
docker-compose up -d

# التحقق من الحالة
docker-compose ps
```

#### الوصول
- **المنصة**: http://localhost
- **API**: http://localhost/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 2. النشر على VPS/Server

#### المتطلبات
- Ubuntu 20.04+ أو CentOS 8+
- Node.js 18+
- MongoDB 5+
- Nginx
- SSL Certificate

#### خطوات النشر

##### 1. إعداد الخادم
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# تثبيت Nginx
sudo apt install nginx -y

# تثبيت PM2
sudo npm install -g pm2
```

##### 2. إعداد المشروع
```bash
# استنساخ المشروع
git clone <repository-url>
cd novel-reader-platform

# تثبيت التبعيات
npm run install:all

# إعداد متغيرات البيئة
cp server/.env.example server/.env
cp client/.env.example client/.env

# تعديل ملفات البيئة
nano server/.env
nano client/.env
```

##### 3. بناء المشروع
```bash
# بناء المشروع
npm run build

# إضافة البيانات النموذجية
npm run seed
```

##### 4. إعداد Nginx
```bash
# إنشاء ملف التكوين
sudo nano /etc/nginx/sites-available/novel-reader

# محتوى الملف
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/novel-reader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

##### 5. إعداد SSL
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# اختبار التجديد التلقائي
sudo certbot renew --dry-run
```

##### 6. تشغيل التطبيق
```bash
# تشغيل مع PM2
cd server
pm2 start dist/index.js --name "novel-reader"

# حفظ إعدادات PM2
pm2 save
pm2 startup
```

### 3. النشر على Cloud Platforms

#### Heroku

##### 1. إعداد Heroku
```bash
# تثبيت Heroku CLI
npm install -g heroku

# تسجيل الدخول
heroku login

# إنشاء التطبيق
heroku create novel-reader-platform

# إضافة MongoDB
heroku addons:create mongolab:sandbox
```

##### 2. إعداد متغيرات البيئة
```bash
# إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set JWT_EXPIRE=7d
```

##### 3. النشر
```bash
# إضافة Heroku remote
git remote add heroku https://git.heroku.com/novel-reader-platform.git

# النشر
git push heroku main

# تشغيل البيانات النموذجية
heroku run npm run seed
```

#### DigitalOcean App Platform

##### 1. إعداد المشروع
```yaml
# .do/app.yaml
name: novel-reader-platform
services:
- name: web
  source_dir: /
  github:
    repo: your-username/novel-reader-platform
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-secret-key
  - key: MONGODB_URI
    value: ${db.DATABASE_URL}
databases:
- name: db
  engine: MONGODB
  version: "5"
```

##### 2. النشر
```bash
# رفع الكود إلى GitHub
git add .
git commit -m "Deploy to DigitalOcean"
git push origin main

# النشر عبر DigitalOcean Dashboard
```

#### AWS EC2

##### 1. إعداد EC2 Instance
```bash
# الاتصال بالخادم
ssh -i your-key.pem ubuntu@your-ec2-ip

# تثبيت المتطلبات
sudo apt update
sudo apt install nodejs npm mongodb nginx -y
```

##### 2. إعداد المشروع
```bash
# استنساخ المشروع
git clone <repository-url>
cd novel-reader-platform

# تثبيت التبعيات
npm run install:all

# بناء المشروع
npm run build
```

##### 3. إعداد PM2
```bash
# تثبيت PM2
sudo npm install -g pm2

# تشغيل التطبيق
pm2 start server/dist/index.js --name "novel-reader"

# حفظ الإعدادات
pm2 save
pm2 startup
```

### 4. النشر مع Kubernetes

#### إعداد Kubernetes
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: novel-reader

---
# k8s/mongodb.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: novel-reader
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: "password123"

---
# k8s/app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: novel-reader-app
  namespace: novel-reader
spec:
  replicas: 3
  selector:
    matchLabels:
      app: novel-reader-app
  template:
    metadata:
      labels:
        app: novel-reader-app
    spec:
      containers:
      - name: app
        image: novel-reader-platform:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          value: "mongodb://admin:password123@mongodb:27017/novel-reader?authSource=admin"

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: novel-reader-service
  namespace: novel-reader
spec:
  selector:
    app: novel-reader-app
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

#### النشر
```bash
# تطبيق التكوينات
kubectl apply -f k8s/

# التحقق من الحالة
kubectl get pods -n novel-reader
kubectl get services -n novel-reader
```

## إعدادات الإنتاج

### متغيرات البيئة المهمة
```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@host:port/database

# Security
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### تحسينات الأداء
```bash
# إعداد Redis للتخزين المؤقت
npm install redis

# إعداد PM2 Cluster Mode
pm2 start server/dist/index.js -i max --name "novel-reader"

# إعداد Nginx Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### مراقبة التطبيق
```bash
# مراقبة مع PM2
pm2 monit

# مراقبة مع PM2 Plus
pm2 plus

# مراقبة مع New Relic
npm install newrelic
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
mongodump --db novel-reader --out /backup/$(date +%Y%m%d)

# نسخ احتياطي للملفات
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz uploads/

# نسخ احتياطي تلقائي
0 2 * * * /path/to/backup-script.sh
```

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ في الاتصال بقاعدة البيانات**
   - تحقق من MONGODB_URI
   - تأكد من تشغيل MongoDB

2. **خطأ في SSL**
   - تحقق من شهادة SSL
   - تأكد من تكوين Nginx

3. **خطأ في الذاكرة**
   - زيادة memory limit
   - تحسين الكود

4. **خطأ في الأداء**
   - إضافة Redis
   - تحسين استعلامات قاعدة البيانات

### سجلات الأخطاء
```bash
# سجلات PM2
pm2 logs novel-reader

# سجلات Nginx
tail -f /var/log/nginx/error.log

# سجلات MongoDB
tail -f /var/log/mongodb/mongod.log
```

## الأمان

### إعدادات الأمان
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# إعداد Firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# إعداد Fail2Ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### مراقبة الأمان
```bash
# مراقبة محاولات الدخول
sudo tail -f /var/log/auth.log

# مراقبة اتصالات الشبكة
sudo netstat -tulpn

# فحص الملفات المشبوهة
sudo find / -name "*.php" -type f -exec grep -l "eval\|base64_decode" {} \;
```

---

**ملاحظة**: تأكد من تحديث جميع كلمات المرور والمفاتيح السرية في بيئة الإنتاج.