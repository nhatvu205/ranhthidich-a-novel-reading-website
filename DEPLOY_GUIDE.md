# 🚀 HƯỚNG DẪN DEPLOY WEBSITE LÊN VERCEL

## ✨ Tại Sao Chọn Vercel?

- ✅ **100% MIỄN PHÍ** cho personal projects
- ✅ **Tự động deploy** khi push code lên GitHub
- ✅ **SSL/HTTPS miễn phí** tự động
- ✅ **Domain miễn phí**: `ten-ban.vercel.app`
- ✅ **Tốc độ cao** - CDN toàn cầu
- ✅ **Không giới hạn** bandwidth cho hobby plan

---

## 📋 CHUẨN BỊ TRƯỚC KHI DEPLOY

### ✅ Checklist:

- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Supabase (đang dùng)
- [ ] Code đang chạy tốt ở local
- [ ] Đã test tất cả chức năng

---

## 🔧 BƯỚC 1: TẠO FILE .ENV.EXAMPLE

Tạo file `.env.example` để hướng dẫn người khác setup:

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

**File này KHÔNG chứa thông tin thật, chỉ là template!**

---

## 🔧 BƯỚC 2: PUSH CODE LÊN GITHUB

### 2.1. Tạo Repository Mới

1. Vào https://github.com
2. Click **"New repository"**
3. Đặt tên: `ranhthidich` (hoặc tên bạn muốn)
4. Chọn **Public** hoặc **Private** (đều OK)
5. **KHÔNG** check "Initialize with README"
6. Click **"Create repository"**

### 2.2. Push Code

Mở terminal trong VS Code và chạy:

```bash
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Liên kết với GitHub
git remote add origin https://github.com/YOUR_USERNAME/ranhthidich.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

**Thay `YOUR_USERNAME` bằng username GitHub của bạn!**

---

## 🚀 BƯỚC 3: DEPLOY LÊN VERCEL

### 3.1. Tạo Tài Khoản Vercel

1. Vào https://vercel.com
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"** (dễ nhất)
4. Authorize Vercel truy cập GitHub

### 3.2. Import Project

1. Trên dashboard Vercel, click **"Add New"** → **"Project"**
2. Chọn repository **`ranhthidich`** từ danh sách
3. Click **"Import"**

### 3.3. Configure Project

**Framework Preset:** Vite (Vercel tự detect)

**Build Settings:** (để mặc định)
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Environment Variables:** Click **"Add"** và thêm:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | (Copy từ Supabase Dashboard) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (Copy từ Supabase Dashboard) |

**Lấy Supabase credentials:**
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3.4. Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút...
3. ✅ **DONE!** Website đã live!

---

## 🌐 BƯỚC 4: TRUY CẬP WEBSITE

### URL mặc định:
```
https://ranhthidich.vercel.app
```
hoặc
```
https://ranhthidich-YOUR_USERNAME.vercel.app
```

### Test ngay:
1. Mở URL trong trình duyệt
2. Trang home phải hiển thị
3. Đăng nhập với admin account
4. Test các chức năng

---

## 🎨 BƯỚC 5: ĐỔI TÊN DOMAIN (Tùy Chọn)

### 5.1. Đổi subdomain Vercel (Miễn phí)

1. Vào project trong Vercel Dashboard
2. Settings → Domains
3. Thêm domain mới: `ten-ban-thich.vercel.app`
4. Save

### 5.2. Custom Domain (Nếu có domain riêng)

**Nếu bạn mua domain từ các nhà cung cấp:**
- GoDaddy, Namecheap, CloudFlare, etc.

**Bước làm:**
1. Vercel Settings → Domains
2. Add domain: `yourdomain.com`
3. Vercel sẽ cho DNS records
4. Vào nhà cung cấp domain, thêm DNS records
5. Đợi 24-48h để DNS propagate

---

## 🔄 BƯỚC 6: TỰ ĐỘNG DEPLOY (CI/CD)

**Đã tự động setup rồi!** 🎉

Mỗi khi bạn push code mới lên GitHub:
```bash
git add .
git commit -m "Update features"
git push
```

→ Vercel tự động build & deploy! (~2 phút)

### Xem Deployment Status:

1. Vào Vercel Dashboard
2. Click vào project
3. Tab **"Deployments"**
4. Xem status: Building → Success/Failed

---

## ⚙️ CẤU HÌNH SUPABASE CHO PRODUCTION

### 6.1. Update Redirect URLs

**Quan trọng!** Phải config để auth hoạt động:

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** `https://ranhthidich.vercel.app`
3. **Redirect URLs:** Thêm:
   ```
   https://ranhthidich.vercel.app/**
   https://ranhthidich.vercel.app/auth
   ```
4. Save

### 6.2. Enable RLS Policies

Đảm bảo tất cả tables đã enable RLS:
```sql
-- Check trong Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Tất cả phải có `rowsecurity = true`!

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Build Failed"

**Kiểm tra:**
1. Code có chạy được ở local không? (`npm run build`)
2. Dependencies trong `package.json` đã đủ chưa?
3. Check build logs trong Vercel

**Fix:**
```bash
# Test build ở local trước
npm run build

# Nếu OK, push lại
git add .
git commit -m "Fix build"
git push
```

### Lỗi: "Environment Variables Not Found"

**Fix:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Check lại `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Redeploy: Deployments → Click dấu 3 chấm → "Redeploy"

### Lỗi: "Auth Not Working"

**Fix:**
1. Check Supabase redirect URLs (Bước 6.1)
2. Clear browser cache
3. Test ở incognito mode

### Lỗi: "Admin Can't Login"

**Fix:**
1. Check email trong whitelist (`src/contexts/AuthContext.tsx`)
2. Email phải viết **thường** và **đúng chính tả**
3. Redeploy sau khi sửa

---

## 📊 MONITOR WEBSITE

### Vercel Analytics (Miễn phí)

1. Project Settings → Analytics → Enable
2. Xem:
   - Số lượt visit
   - Page views
   - Performance

### Supabase Monitoring

1. Supabase Dashboard → Database
2. Xem:
   - Số users
   - API requests
   - Storage usage

---

## 💰 CHI PHÍ

### ✅ HOÀN TOÀN MIỄN PHÍ:

- **Vercel Hobby Plan:**
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic SSL
  - 1 team member

- **Supabase Free Tier:**
  - 500 MB database
  - 1 GB file storage
  - 2 GB bandwidth/month
  - 50,000 monthly active users

**Đủ cho website nhỏ với vài trăm users!**

### Khi Nào Cần Upgrade?

- Vercel: Khi > 100 GB bandwidth/month
- Supabase: Khi > 500 MB data hoặc > 50K users

---

## 🎯 CHECKLIST HOÀN TẤT

- [ ] Code đã push lên GitHub
- [ ] Vercel project đã tạo và deploy thành công
- [ ] Environment variables đã setup đúng
- [ ] Website truy cập được qua URL Vercel
- [ ] Auth hoạt động (login/logout)
- [ ] Admin có thể truy cập trang admin
- [ ] Supabase redirect URLs đã update
- [ ] Test tất cả chức năng trên production
- [ ] RLS policies đã enable

---

## 📝 LƯU Ý QUAN TRỌNG

### 🔒 Bảo Mật

1. **KHÔNG BAO GIỜ** commit file `.env` lên GitHub!
2. File `.gitignore` đã chặn `.env` rồi
3. Chỉ dùng environment variables trong Vercel

### 🔄 Update Code

Mỗi khi sửa code:
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```
→ Vercel auto deploy!

### 📈 Performance

- Vercel tự optimize: minify JS/CSS, compress images
- CDN toàn cầu: website nhanh ở mọi nơi
- HTTP/2, Brotli compression mặc định

---

## 🆘 CẦN TRỢ GIÚP?

### Tài liệu:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

### Community:
- Vercel Discord: https://vercel.com/discord
- Supabase Discord: https://discord.supabase.com

---

## 🎉 CHÚC MỪNG!

Website của bạn đã live trên Internet! 🌐

**Share link với bạn bè:**
`https://ranhthidich.vercel.app`

**Next steps:**
- Thêm Google Analytics (nếu muốn)
- Setup custom domain (nếu có)
- Promote website trên social media!

---

**Happy Deploying! 🚀**

