# Quỳnh Anh · Hello tuổi 18

Trang sinh nhật cá nhân với ảnh gốc, hộp quà 3D, bánh kem hai tầng, nến số 18, bóng bay, pháo giấy, lời chúc và bản cắt 64 giây PHONECERT (Vietnamese Version) của Hoàng Dũng, phát trực tiếp bằng HTML Audio.

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

Trang thử tự phát nhạc có tiếng. Nếu trình duyệt chặn, chạm Mở quà hoặc nút nhạc sẽ bật nhạc. Nhạc lặp lại, có fade vào/ra, không cần kết nối YouTube và không có khung video. Nút nhạc bật/tắt âm thanh.

Ảnh cá nhân do người dùng cung cấp. Nhạc được cắt theo yêu cầu từ liên kết https://www.youtube.com/watch?v=WO7qdqdXeBU, đoạn 00:24–01:28, giữ nguyên tốc độ và cao độ, fade vào 1,2 giây và fade ra 2,5 giây. Bản MP3 stereo 44,1 kHz / 160 kbps nằm tại `public/phonecert-birthday.mp3`. Quyền đối với ảnh và bài hát thuộc các chủ sở hữu tương ứng; dự án không cấp quyền tái sử dụng các tài sản này.
