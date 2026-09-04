# 校園食材登錄平臺 — 午餐菜單 API

端點：`POST https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/`

Content-Type: `application/json`

## 鎮昌國小固定參數

| 欄位 | 值 |
|------|-----|
| 系統 ID (sid) | `64736910` |
| 學校代碼 | `593611` |

## 流程：兩步取得當日菜單

### Step 1 — 查當天供餐 ID

```json
{
  "method": "customerQueryKitchenBySchoolAndDate",
  "args": { "sid": "64736910", "date": "2026-09-07" }
}
```

回傳：

```json
{
  "result_content": {
    "kitchen": [
      { "mid": 1788342187029782, "kitchenName": "佳琪食品股份有限公司" }
    ]
  }
}
```

- `kitchen` 為空陣列 `[]` → 當天無供餐（週末、假日、寒暑假）
- `mid` 每天不同，是下一步查菜單的 key

### Step 2 — 用 mid 取菜單明細

```json
{
  "method": "customerQueryMenuDetailInfo",
  "args": { "mid": 1788342187029782 }
}
```

回傳重點欄位：

```json
{
  "result_content": {
    "schoolName": "高雄市前鎮區鎮昌國小",
    "date": "20260907",
    "nutrition": {
      "calories": "742",
      "mainFood": "4.32",
      "vegetable": "1.68",
      "meatBeans": "2.97",
      "oil": "2.52",
      "milk": "0.52",
      "fruit": "0"
    },
    "supplierInfo": {
      "supplierName": "佳琪食品股份有限公司",
      "supplierPhone": "07-7329555",
      "dietitians": "蔡承勲"
    },
    "lunchContent": [
      { "category": "主食一", "foodName": "白飯", "dishid": 1409536908137445 },
      { "category": "主菜",   "foodName": "鐵路豬排", "dishid": ... },
      { "category": "主菜一", "foodName": "三杯鮑菇豆干", "dishid": ... },
      { "category": "主菜二", "foodName": "調味料", "dishid": ... },
      { "category": "蔬菜",   "foodName": "木耳豆芽菜", "dishid": ... },
      { "category": "湯品",   "foodName": "蘿蔔黑輪湯", "dishid": ... },
      { "category": "附餐一", "foodName": "香蕉", "dishid": ... }
    ],
    "foodInfo": [ "... 每道菜的食材來源、供應商、有效日期等" ]
  }
}
```

- `lunchContent` 是菜單列表，`foodName` 為菜名
- `category` 為類別：主食、主菜、蔬菜、湯品、附餐
- `"調味料"` 是固定項目，前端顯示時過濾掉
- 每道菜有 `image` 路徑，格式：`/cateringservice/file/SHOW/dishId|{supplierId}|{dishid}|130|150`

## 限制

| 項目 | 說明 |
|------|------|
| 查詢粒度 | **一天一筆**，沒有批次或日期範圍 API |
| 一週菜單 | 需 loop 5 天 × 2 次 = 10 次 request |
| 未來資料 | 只有當週或下週（廠商登錄到哪查到哪） |
| 歷史資料 | 至少回溯到 2025 年以前 |
| 無資料 | 回傳 `kitchen: []`，不是錯誤 |
| 其他 method | 測試過加 `endDate`、`sdate/edate` 等參數都會 500 |

## 另一套 API（開放資料下載）

`GET /cateringservice/web/openapi_doc/v1/index.html`

這是整個縣市、按月的 CSV 資料集批量下載，需 email 註冊拿 accesscode，跟上面的即時單校查詢是不同系統。目前未使用。
