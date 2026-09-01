# Timetable bug and loading fixes design

## Goal

修正假日仍顯示一般課表、失效的對比檢查、學生姓名外露，以及外部動畫套件造成的首次載入等待。

## Decisions

- `events.js` 提供假日查詢與下一個上課日計算，首頁和狀態更新共用同一套規則。
- 假日首頁顯示放假原因，課表區預覽下一個非週末、非假日的上課日。
- 只移除學生姓名；學校、班級、導師與班級電話保留。
- 保留目前工作區的非同步字型與 GSAP 載入修改，但移除會搶下載優先權的 GSAP preload。
- `calendar.html` 不使用動畫套件；已過開學日的 `school.html` 也不再下載 GSAP。
- `index.html` 與 `snack.html` 的內容先顯示，GSAP 載入失敗時仍可完整使用。點心裝飾動畫離開畫面或分頁隱藏時暫停。

## Verification

- Node 測試覆蓋單日假日、連續假日與週末後的下一個上課日。
- 對比腳本直接執行並以結束碼判斷結果。
- 靜態頁面測試確認學生姓名不存在，也沒有同步 GSAP 或 GSAP preload。
- 四頁以 Headless Chrome 載入，檢查 console、連結、深淺色與篩選操作。

