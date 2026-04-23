# Gaon Temple - Frontend

Static frontend for Shree Samga Devi Mandir website, designed for deployment on Vercel.

## 🚀 Quick Start

### Local Development
```bash
# Option 1: Simple HTTP server
cd gaon-frontend
python -m http.server 8000
# Visit: http://localhost:8000

# Option 2: Using Node.js
npx http-server .
# Visit: http://localhost:8080

# Option 3: Using PHP
php -S localhost:8000
# Visit: http://localhost:8000
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd gaon-frontend
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? gaon-frontend
# - Directory? ./
# - Want to override settings? N

# After deployment, update the API URL:
# 1. Go to Vercel dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Add: API_BASE_URL = https://your-backend-domain.com/api
```

## 📁 Project Structure

```
gaon-frontend/
├── index.html              # Main homepage
├── assets/
│   ├── css/
│   │   └── styles.css     # All styles
│   └── js/
│       ├── config.js      # API configuration
│       └── script.js      # App logic + API calls
├── ebook/                  # E-book section
│   ├── index.html
│   ├── view.html
│   └── ...
└── vercel.json            # Vercel config
```

## ⚙️ Configuration

### API Base URL

Edit `assets/js/config.js`:

```javascript
// For local testing
const PRODUCTION_API_URL = 'http://localhost/gaon-backend/api';

// For production (update after deploying backend)
const PRODUCTION_API_URL = 'https://your-backend-domain.com/api';
```

### Environment Variables (Vercel)

In Vercel dashboard, set:
- `API_BASE_URL` = Your backend API URL

## 🔗 Backend Connection

This frontend connects to the backend via REST APIs:

- **Content API**: `/api/content.php` - All website content
- **Books API**: `/api/books.php` - E-books data
- **Auth API**: `/api/auth.php` - User authentication

All API calls use CORS, so the backend can be on a different domain.

## ✨ Features

- ✅ Pure static HTML/CSS/JS
- ✅ No server-side rendering needed
- ✅ API-driven content loading
- ✅ Responsive design
- ✅ E-book reader
- ✅ Donation integration ready
- ✅ Social media embeds
- ✅ Live temple status

## 🛠️ Development

### Updating Content

Content is loaded from the backend API. To update:
1. Login to admin panel: `http://localhost/gaon-backend/admin/`
2. Update content in admin dashboard
3. Frontend will automatically fetch updated content

### Adding New Pages

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Page</title>
  <link rel="stylesheet" href="../assets/css/styles.css">
  <script src="../assets/js/config.js"></script>
  <script src="../assets/js/script.js"></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

## 📝 Notes

- All image paths are absolute URLs from backend
- No PHP files in this project (pure static)
- API calls handle CORS automatically
- Works offline with cached content

## 🎯 Deployment Checklist

Before deploying to Vercel:

- [ ] Update `API_BASE_URL` in `config.js`
- [ ] Test all API endpoints work
- [ ] Verify CORS is enabled on backend
- [ ] Test locally with `vercel dev`
- [ ] Set environment variables in Vercel
- [ ] Deploy and test live site

## 📞 Support

For issues or questions, check the backend README or contact the development team.
