// 抓本週＋下週一到五午餐菜單，輸出 lunch.json
// ponytail: 20 次 sequential fetch，一天跑一次，不需要 parallel
import { writeFileSync } from 'fs';

const API = 'https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/';
const SID = '64736910';
const post = body => fetch(API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
}).then(r => r.json());

const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 算出本週一
const now = new Date();
const mon = new Date(now);
mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));

const result = {};
for (let i = 0; i < 10; i++) {  // 本週 0-4 + 下週 5-9（週五晚上 7 點後前端會顯示下週一）
  const d = new Date(mon);
  d.setDate(mon.getDate() + (i < 5 ? i : i + 2)); // 跳過週末
  const dateStr = fmtDate(d);
  try {
    const r1 = await post({ method: 'customerQueryKitchenBySchoolAndDate', args: { sid: SID, date: dateStr } });
    const kitchen = r1?.result_content?.kitchen;
    if (!kitchen?.length) { result[dateStr] = null; continue; }
    const r2 = await post({ method: 'customerQueryMenuDetailInfo', args: { mid: kitchen[0].mid } });
    const c = r2?.result_content;
    if (!c) { result[dateStr] = null; continue; }
    result[dateStr] = {
      dishes: (c.lunchContent || []).filter(d => d.foodName !== '調味料').map(d => d.foodName),
      calories: c.nutrition?.calories || null,
      supplier: c.supplierInfo?.supplierName || null,
      dietitian: c.supplierInfo?.dietitians || null,
    };
  } catch { result[dateStr] = null; }
}

writeFileSync('lunch.json', JSON.stringify(result, null, 2) + '\n');
console.log('lunch.json written:', Object.keys(result).join(', '));
