# Timetable bug and loading fixes implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正審查項目 1 至 4，並消除 9df9640 之後外部 GSAP 讓內容長時間隱藏的載入回歸。

**Architecture:** `events.js` 負責日期規則，`index.html` 只負責顯示狀態。外部動畫改成可選的漸進增強，不能阻塞內容。

**Tech Stack:** 靜態 HTML、原生 JavaScript、Node.js 內建測試、Python 3、Headless Chrome。

## Global constraints

- 保留目前 4 個 HTML 的未提交修改。
- 只移除學生姓名，其他班級資訊保留。
- 不加入新的執行期相依套件。

---

### Task 1: Regression tests

**Files:**
- Create: `tests/timetable.test.mjs`

**Interfaces:**
- Consumes: `events.js`, `check-contrast.py`, four HTML pages
- Produces: `holidayEventOn(date)`, `nextSchoolDay(date)` 的行為契約

- [ ] 寫入假日、下一上課日、對比檢查、個資與非阻塞資源測試。
- [ ] 執行 `node --test tests/timetable.test.mjs`，確認因缺少日期函式、舊對比項目與 GSAP preload 而失敗。

### Task 2: Holiday and privacy behavior

**Files:**
- Modify: `events.js`
- Modify: `index.html`
- Modify: `school.html`

**Interfaces:**
- Produces: `holidayEventOn(Date): Array|null`
- Produces: `nextSchoolDay(Date): Date`

- [ ] 在 `events.js` 實作假日查詢與跳過週末、假日的日期計算。
- [ ] 在 `index.html` 顯示假日狀態並預覽下一個上課日。
- [ ] 從 `index.html` 與 `school.html` 移除學生姓名。
- [ ] 執行 Node 測試，確認日期與個資測試通過。

### Task 3: Contrast and loading fixes

**Files:**
- Modify: `check-contrast.py`
- Modify: `index.html`
- Modify: `calendar.html`
- Modify: `school.html`
- Modify: `snack.html`

**Interfaces:**
- Consumes: 目前工作區的 async GSAP 載入流程
- Produces: 不阻塞內容的外部資源載入

- [ ] 刪除 `firstday.html` 的失效對比檢查。
- [ ] 移除四頁的 GSAP preload。
- [ ] 從 `calendar.html` 與 `school.html` 移除不再使用的 GSAP。
- [ ] 讓 `snack.html` 的裝飾動畫依可見狀態暫停與恢復。
- [ ] 執行 Node 測試與 `python check-contrast.py`。

### Task 4: Browser verification

**Files:**
- Verify: all changed files

**Interfaces:**
- Consumes: 完成後的靜態網站
- Produces: 瀏覽器驗證結果

- [ ] 以 Headless Chrome 載入四頁並檢查 console。
- [ ] 檢查 `git diff --check`、本機連結與動態點心圖片。
- [ ] 檢查最終 diff，只保留本次需求與原有未提交效能修改。

