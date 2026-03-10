# 📅 Quản Lý Lịch Hẹn - Hướng Dẫn Nhanh

## ⚡ 5-Minute Quick Start

### 1️⃣ Truy Cập
```
Dashboard → Click "📅 Quản Lý Bookings"
hoặc: /dashboard/bookings
```

### 2️⃣ Xem Lịch Hẹn
- **Card View** (📋): Được tổ chức theo trạng thái
- **Table View** (📊): Dạng bảng dễ quét

### 3️⃣ Lọc Lịch Hẹn
| Nút | Nghĩa |
|-----|-------|
| Tất Cả | Tất cả lịch hẹn |
| Hôm Nay | Chỉ hôm nay (+picker) |
| Tuần Này | Tuần hiện tại |
| Tháng Này | Tháng hiện tại |

### 4️⃣ Hành Động Nhanh
| Nút | Chức Năng |
|-----|----------|
| 👁️ Chi Tiết | Xem toàn bộ thông tin |
| ✅ Xác Nhận | Phê duyệt lịch hẹn |
| ❌ Hủy | Hủy lịch hẹn |

### 5️⃣ Hiểu Trạng Thái
```
⏳ Chờ Xác Nhận  → Cần phê duyệt ngay
✅ Đã Xác Nhận   → Sẵn sàng phục vụ
❌ Đã Hủy        → Đã hủy, không xử lý
```

## 📊 Bảng Thống Kê

Tại đầu trang, bạn sẽ thấy 4 số liệu:

```
📅 Hôm Nay: [n] bookings      → Tổng cộng hôm nay
⏳ Chờ Xác Nhận: [n] bookings  → Cần xác nhận (ĐỎ)
✅ Đã Xác Nhận: [n] bookings   → Đã phê duyệt
💰 Tổng Doanh Thu: [amount]₫   → Revenue từ bookings đã thanh toán
```

## 🎯 Công Việc Hàng Ngày

### Buổi Sáng
```
1. Mở /dashboard/bookings
2. Chọn lọc "Hôm Nay"
3. Xem có mấy bookings
4. Xác nhận tất cả các bookings cần thiết
5. Lưu ý các bookings khác trong tuần
```

### Phục Vụ Khách
```
1. Khách hàng đến (xem chi tiết booking)
2. Thực hiện dịch vụ
3. Nhập thanh toán (nếu cần)
4. Booking tự động chuyển thành "Hoàn Thành"
```

### Cuối Ngày
```
1. Kiểm tra toàn bộ bookings
2. Xem doanh thu hôm nay
3. Lập kế hoạch cho ngày mai
```

## 💡 Mẹo & Thủ Thuật

### Xem Nhanh Thông Tin
- Click nút **👁️ Chi Tiết** để xem số điện thoại khách, ghi chú, v.v.
- Thông tin khách sẽ hiện trong popup

### Chuyển Đổi Chế Độ Xem
- **📋 Thẻ**: Tốt khi bạn muốn xem chi tiết
- **📊 Bảng**: Tốt khi muốn quét nhanh nhiều bookings

### Lọc Thêm
- Nếu chọn "Hôm Nay", sẽ có khung nhập ngày
- Chọn ngày khác nếu cần xem bookings ngày khác

### Xác Nhận Hàng Loạt
- Nếu có nhiều bookings pending
- Xác nhận từng cái một hoặc sử dụng bulk (sắp có)

## ⚠️ Lưu Ý Quan Trọng

### PHẢI LÀM
✅ Xác nhận bookings sớm (khách sẽ biết)  
✅ Kiểm tra trạng thái thanh toán  
✅ Xem ghi chú khách (nếu có)  
✅ Hủy bookings nếu không serve được  

### KHÔNG NÊN
❌ Quên xác nhận → Khách không biết  
❌ Để bookings pending quá lâu → Khách chán  
❌ Hủy sau khi xác nhận → Ảnh hưởng uy tín  

## 🎨 Màu Sắc & Ký Hiệu

### Trạng Thái Booking
| Màu | Trạng Thái | Hành Động |
|-----|-----------|----------|
| 🟡 Yellow | Pending | Xác nhận hoặc Hủy |
| 🟢 Green | Confirmed | Không cần hành động |
| 🔴 Red | Cancelled | Lịch sử, không xử lý |

### Trạng Thái Thanh Toán
| Badge | Nghĩa | Hành Động |
|-------|-------|----------|
| 🟡 Chờ | Chưa thanh toán | Đợi khách thanh toán |
| 🟢 Đã | Thanh toán xong | OK, hoàn tất |
| 🔴 Thất Bại | Thanh toán lỗi | Liên hệ khách |

## 📱 Trên Điện Thoại

✅ **Hoạt động tốt trên mobile**
- Thẻ sắp xếp 1 cột
- Nút lớn, dễ bấm
- Bảng scroll ngang (nếu cần)

## 🆘 Vấn Đề Thường Gặp

### "Không thấy booking mới"
→ Refresh page (Lịch hẹn sẽ cập nhật real-time)  
→ Kiểm tra lọc ngày "Hôm Nay" vs "Tất Cả"  

### "Nút Xác Nhận không hoạt động"
→ Đợi 2-3 giây, thử lại  
→ Refresh page  
→ Kiểm tra booking không bị hủy  

### "Không thấy số điện thoại khách"
→ Click 👁️ Chi Tiết → Sẽ thấy số điện thoại  

### "Booking biến mất"
→ Có thể đã bị hủy (xem "Đã Hủy")  
→ Hoặc lộn sang business khác  

## 📞 Liên Hệ Hỗ Trợ

- **Hỏi đáp**: [PROVIDER_BOOKING_MANAGEMENT_GUIDE.md](PROVIDER_BOOKING_MANAGEMENT_GUIDE.md)
- **Chi tiết kỹ thuật**: [PROVIDER_BOOKING_MANAGEMENT_IMPLEMENTATION.md](PROVIDER_BOOKING_MANAGEMENT_IMPLEMENTATION.md)
- **Dashboard tổng quát**: [DASHBOARD_NAVIGATION_GUIDE.md](DASHBOARD_NAVIGATION_GUIDE.md)

---

**Thời gian học**: ~ 5 phút  
**Kỹ năng**: Quản lý bookings hiệu quả  
**Status**: ✅ Sẵn sàng dùng ngay
