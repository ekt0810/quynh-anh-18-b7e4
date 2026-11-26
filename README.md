# Quỳnh Anh · Hello tuổi 18

Trang sinh nhật cá nhân với ảnh gốc, hộp quà 3D, bánh kem hai tầng, nến số 18, bóng bay, pháo giấy, lời chúc và bài PHONECERT (Vietnamese Version) của Hoàng Dũng qua trình phát YouTube chính thức.

## Chạy trên máy

```sh
npm ci
npm run dev
```

## Tạo bản website

```sh
npm run build
npm run preview
```

Thư mục `dist` chứa bản tĩnh hoàn chỉnh, có thể phục vụ bằng bất kỳ máy chủ HTTP nào. Trang không cần backend. Không mở `index.html` trực tiếp bằng giao thức file; dùng máy chủ hoặc link GitHub Pages.

## Nội dung và module

- `src/state.js`: câu chúc, thư, trạng thái và chuyển bước.
- `src/world.js`: ánh sáng, sân khấu, bóng bay và vật trang trí.
- `src/cake.js`: bánh kem, nến 18, ngọn lửa.
- `src/gift.js`: hộp quà, nắp và nơ.
- `src/portrait.js`: khung ảnh; ảnh gốc nằm tại `public/quynh-anh.png`.
- `src/cameras.js`: khung hình điện thoại và máy tính.
- `src/effects.js`: pháo giấy theo chuyển động vật lý và hạt sáng.
- `src/music.js`: trình phát chính thức, tự phát, bật/tắt và phát sau thao tác.
- `src/ui.js`: nút điều khiển, thư và lời chúc.
- `src/main.js`: khởi tạo và vòng lặp 3D.

Trang thử tự phát nhạc có tiếng. Nếu trình duyệt chặn, thao tác Mở quà sẽ thử bật lại; người xem cũng có thể chạm Play trong trình phát. Nhạc cần kết nối được YouTube. Đóng trình phát sẽ dừng nhạc.

Ảnh cá nhân do người dùng cung cấp; không cấp quyền tái sử dụng ảnh. Bài hát được nhúng từ kênh nghệ sĩ, không lưu hoặc phân phối file âm thanh.
