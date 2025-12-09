# Authentication & Refresh Token Flow

## Tổng quan

Hệ thống sử dụng JWT với access token và refresh token:
- **Access Token**: Lưu trong localStorage, gửi kèm mỗi request (Bearer token)
- **Refresh Token**: Lưu trong httpOnly cookie, tự động gửi kèm requests

## Flow đăng nhập

1. User đăng nhập qua `authApi.login()` hoặc `authApi.register()`
2. Backend trả về:
   - `accessToken`: Lưu vào localStorage
   - `refreshToken`: Set vào httpOnly cookie tự động
   - `user`: Thông tin user
3. Frontend lưu `accessToken` và `user` vào localStorage

## Flow tự động refresh token

Khi một API request gặp lỗi 401 (Unauthorized):

1. **Phát hiện 401**: `apiClient` phát hiện response status 401
2. **Kiểm tra điều kiện**: 
   - Request có `requireAuth !== false` (cần auth)
   - Chưa retry quá 1 lần
3. **Gọi refresh token**: 
   - Gọi `authApi.refresh()` (refresh token tự động gửi từ cookie)
   - Sử dụng lock để tránh multiple refresh calls đồng thời
4. **Cập nhật token**: 
   - Lưu access token mới vào localStorage
   - Giữ nguyên user info
5. **Retry request**: 
   - Gửi lại request ban đầu với token mới
   - Chỉ retry 1 lần để tránh loop vô hạn

## Lock mechanism

Để tránh race condition khi nhiều requests cùng gặp 401:

```typescript
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
```

- Nếu đang refresh, các requests khác sẽ đợi promise hiện tại
- Chỉ có 1 refresh call được thực hiện tại một thời điểm

## Error handling

### Refresh thành công
- Token mới được lưu
- Request được retry và trả về kết quả

### Refresh thất bại
- Clear localStorage (xóa access token và user)
- Throw error với message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
- User cần đăng nhập lại

## Authorization headers

### Tự động thêm header
- Mặc định: `requireAuth: true` (tự động thêm Authorization header)
- Nếu `requireAuth: false`: Không thêm header

### Các API không cần auth
- `authApi.login()` - `requireAuth: false`
- `authApi.register()` - `requireAuth: false`
- `authApi.refresh()` - `requireAuth: false`
- `authApi.logout()` - `requireAuth: false`
- `productApi.getAll()` - `requireAuth: false` (public)
- `productApi.getById()` - `requireAuth: false` (public)
- `productApi.search()` - `requireAuth: false` (public)
- `reviewApi.findAll()` - `requireAuth: false` (public)
- `reviewApi.findOne()` - `requireAuth: false` (public)

### Các API cần auth
- Tất cả `userApi.*` - `requireAuth: true`
- Tất cả `cartApi.*` - `requireAuth: true`
- `productApi.create()` - `requireAuth: true` (seller)
- `productApi.update()` - `requireAuth: true` (seller)
- `productApi.remove()` - `requireAuth: true` (seller)
- `reviewApi.create()` - `requireAuth: true`
- `reviewApi.update()` - `requireAuth: true`
- `reviewApi.remove()` - `requireAuth: true`
- Tất cả `orderApi.*` - `requireAuth: true`
- Tất cả `mediaApi.*` - `requireAuth: true`
- Tất cả `sellerAnalyticsApi.*` - `requireAuth: true`

## Best practices

1. **Luôn sử dụng try-catch** khi gọi API:
```typescript
try {
  const products = await productApi.getAll();
} catch (error: any) {
  if (error.status === 401) {
    // Token đã hết hạn và refresh cũng thất bại
    // Redirect to login
  }
  toast.error(error.message);
}
```

2. **Không cần gọi refresh token thủ công**: Hệ thống tự động xử lý

3. **Kiểm tra user state**: Sau khi refresh thất bại, clear state và redirect:
```typescript
if (error.status === 401) {
  authStorage.clear();
  // Redirect to login page
}
```

## Testing

Để test refresh token flow:

1. Đăng nhập và lấy token
2. Đợi token hết hạn (hoặc manually expire token)
3. Gọi một API cần auth
4. Kiểm tra:
   - Refresh token được gọi tự động
   - Request được retry với token mới
   - Kết quả trả về thành công

