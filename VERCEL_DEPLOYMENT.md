# Hướng dẫn Deploy lên Vercel

## Backend Environment Variables

Vào Vercel Dashboard → Project Settings → Environment Variables và thêm:

```
PORT=4000
MONGODB_URI=mongodb+srv://daithang_db:minhanh2014@todolist.4j2ifq6.mongodb.net/todolist?retryWrites=true&w=majority
JWT_SECRET=daithang_jwt_secret_key_2026
SESSION_SECRET=daithang_session_secret_key_2026
NODE_ENV=production
CORS_ORIGIN=https://to-do-list-web-app-frontend-delta.vercel.app,https://todolist-webapp.vercel.app
```

**Lưu ý**: Có thể set `CORS_ORIGIN=*` để cho phép tất cả origins (không khuyến khích cho production)

## Frontend Environment Variables

Frontend đã được cấu hình tự động qua file `.env.production`:
```
VITE_API_BASE_URL=https://to-do-list-web-app-egwi.vercel.app/api
```

## Sau khi cập nhật

1. **Commit và push code** lên GitHub
2. **Redeploy** trên Vercel (hoặc tự động deploy nếu đã kết nối GitHub)
3. **Kiểm tra** console log để đảm bảo không còn lỗi CORS

## Kiểm tra nhanh

Test CORS từ browser console:
```javascript
fetch('https://to-do-list-web-app-egwi.vercel.app/api/auth/guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clientId: 'test-123' })
})
.then(r => r.json())
.then(console.log)
```
