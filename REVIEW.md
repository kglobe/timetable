# 課表專案審查筆記

## 速度問題（已修）

### GSAP 同步載入阻塞內容渲染

**問題：** 四個頁面都用 `<script src="gsap.min.js"></script>` 同步載入 GSAP CDN。所有頁面內容靠 JS 生成，排在 GSAP 後面——CDN 慢的話，使用者看到的是空殼骨架（min-height 撐位），等 GSAP 下載完才冒出內容。

**修法：**
- GSAP 改 `<script async crossorigin onload="_onGsap()">` 非同步載入
- 內容生成邏輯移到 GSAP 之前執行，`canAnim` 初始為 `false`
- 動畫設定包進 `_onGsap()` callback，GSAP 載入後再跑
- `root.classList.remove("preanim")` 提前到內容生成後立刻執行
- 行事曆捲動進場（`io-hidden` → `io-in`）只用 CSS transition + IntersectionObserver，不依賴 GSAP

**效果：** 內容即時渲染，動畫（跑步小女孩、now-line 光暈、點心頁裝飾）在 GSAP 背景載入後補上。CDN 掛掉也不影響內容顯示。

**代價：** 進場 stagger 動畫拿掉了（元素直接顯示），保留運行時動畫。

### Google Fonts 阻塞首次渲染

**修法：** `<link rel="stylesheet" media="print" onload="this.media='all'">` 讓字體 CSS 非同步載入。Space Grotesk 本來就有 `display=swap`，文字用系統字型先出來再換。

---

## Bug（已修）

### school.html 缺 `color-scheme: light`

其他三頁都有 `:root[data-theme="light"]{color-scheme:light}`，school.html 漏了。影響瀏覽器原生元件（滾動條、select）在淺色模式的樣式。

### school.html hover 缺觸控防護

`.themetog:hover` 沒包 `@media(hover:hover)and(pointer:fine)`，觸控裝置點了之後 hover 狀態會黏住。其他三頁都有這個防護。

### school.html 落地動畫不自然

女孩旋轉跳落地用 `ease:"bounce.out"`，整個下墜過程等速減速，看起來像漂浮。index.html 已經改成多步驟：`power2.in` 加速墜落 → 小回彈 → 再落地。已同步修正。

---

## 小觀察（未修，資料量太小不值得）

- **calendar.html / snack.html 月份計數 O(n²)：** `render()` 裡每個月份 header 都 `list.filter(...)` 重新掃一次。資料只有 20-30 筆，完全不痛。資料量破百再改成 Map 先統計。
- **`skipIntro` 變數：** async 改造後進場動畫已拿掉，`skipIntro` 的 sessionStorage 讀寫變成死碼。留著無害，要清可以清。
