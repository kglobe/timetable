# Timetable 修正工作交接

## 目標

完成原先列出的 1～4 項修正，並處理近期出現的載入變慢問題：

1. 放假日不可顯示成一般上課日。
2. `check-contrast.py` 不可再讀取已刪除的 `firstday.html`。
3. 公開頁面只移除學生姓名；教師、班級與電話保留。
4. GSAP 不可阻塞首屏，非必要頁面應完全移除。

## 已完成

- 已查 Git 紀錄。載入退化主要來自 `9df9640`：頁面先套用 `.preanim .reveal{opacity:0}`，但同步載入外部 GSAP；CDN 慢時，內容會維持隱藏。`7a57133` 最早引入 GSAP，`865cf35` 改善動畫執行期效能，但沒有解決首次載入被外部腳本卡住的問題。
- 設計與執行計畫已提交為 `cdbf2c6`。請直接看：
  - `D:\GitHub\timetable\docs\superpowers\specs\2026-09-01-timetable-fixes-design.md`
  - `D:\GitHub\timetable\docs\superpowers\plans\2026-09-01-timetable-fixes.md`
- `events.js` 已加入 `holidayEventOn()`、`nextSchoolDay()` 與日期鍵值函式。
- `index.html` 已在放假日顯示假日名稱，並預覽下一個上課日；週課表會標亮實際預覽的星期。
- `check-contrast.py` 已移除 `firstday.html` 檢查項目。
- 正式頁面與舊瀏覽器快照內的學生姓名均已移除；教師、班級與電話未動。
- `calendar.html`、`school.html` 已完全移除 GSAP。
- `index.html`、`snack.html` 的 GSAP 改成非阻塞載入；`snack.html` 的循環動畫在分頁隱藏或區塊離開畫面時會暫停。
- 新增 `tests/timetable.test.mjs`，目前 5 項測試全數通過。

## 驗證結果

最後一次執行：

```powershell
node --test tests/timetable.test.mjs
```

結果：5 passed、0 failed。測試涵蓋假日查詢、連假後下一個上課日、色彩對比腳本、學生姓名掃描與 GSAP 載入方式。

`git diff --check` 沒有空白錯誤，只有 Git 提示日後可能把 LF 轉成 CRLF。全專案姓名掃描目前沒有命中。

## 尚未完成

1. 用 Chrome Headless 實際開啟四個頁面，並封鎖 `cdnjs.cloudflare.com`，確認 CDN 無法連線時內容仍會立即顯示。上一個指令在 JavaScript 字串解析階段失敗，Chrome 尚未執行；沒有留下瀏覽器暫存資料。臨時 HTTP server 已停止。
2. 再跑一次完整驗證：

```powershell
node --test tests/timetable.test.mjs
python check-contrast.py
git diff --check
rg -n --hidden --glob '!.git/**' '學生姓名原字串' .
```

3. 檢查 `git diff` 後決定如何提交。不要直接提交所有 HTML 差異，因為開始處理前 `calendar.html`、`index.html`、`school.html`、`snack.html` 已經有使用者尚未提交的修改；目前差異混在一起。
4. 完成後追加工作紀錄到 `D:\0-icsc_project\work-log\2026-W36.md`。

## 目前工作樹

```text
 M calendar.html
 M check-contrast.py
 M events.js
 M index.html
 M school.html
 M snack.html
?? .playwright-mcp/
?? tests/
```

`.playwright-mcp/` 原本就是未追蹤資料夾，本次只把其中一份舊快照的學生姓名改成「今日課表」。不要整個刪除。

## 接手時先做

1. 先跑 `git diff`，確認現有內容沒有被其他工作覆蓋。
2. 跑上述 5 項 Node 測試。
3. 完成四頁 Chrome Headless 驗證；若都能在 GSAP CDN 被封鎖時顯示主要標題，再補工作紀錄並回報。

## 建議 skills

- `verification-before-completion`：完成瀏覽器與命令列驗證後才能宣告修正完成。
- `test-driven-development`：若瀏覽器驗證發現新問題，先補會失敗的測試再修。
- `humanizer-zh`：撰寫最後回報與工作紀錄時使用。

