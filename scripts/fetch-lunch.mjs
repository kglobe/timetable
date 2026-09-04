// 抓本週＋下週一到五午餐菜單，輸出 lunch.json
// ponytail: 20 次 sequential fetch，一天跑一次，不需要 parallel
import { writeFileSync, existsSync, readFileSync } from 'fs';

const API = 'https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/';
const SID = '64736910';
const post = async body => {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text().catch(() => '')}`);
  return r.json();
};

const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 算出本週一（用 UTC 避免時區問題）
const now = new Date();
const mon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));

const result = {};
let ok = 0;
for (let i = 0; i < 10; i++) {
  const d = new Date(mon);
  d.setUTCDate(mon.getUTCDate() + (i < 5 ? i : i + 2));
  const dateStr = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
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
    ok++;
  } catch (e) {
    console.error(`${dateStr}: ${e.message}`);
    result[dateStr] = null;
  }
}

// 如果全部失敗（API 被擋），保留原有 lunch.json 不覆蓋
if (ok === 0 && existsSync('lunch.json')) {
  console.log('All fetches failed, keeping existing lunch.json');
  process.exit(0);
}

writeFileSync('lunch.json', JSON.stringify(result, null, 2) + '\n');
console.log(`lunch.json written: ${ok}/${Object.keys(result).length} days with data`);
