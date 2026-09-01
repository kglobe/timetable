// 鎮昌國小 115 學年度第 1 學期行事曆（115 學年=2026；1 月屬 2027）
// 欄位：[開始日, 結束日或 null, 事件名稱, 是否放假, 專屬色標記（可省略）]
const EVENTS = [
  ["2026-08-31",null,"開學日・新生始業典禮・課後照顧班正式上課",false],
  ["2026-09-07","2026-09-18","身高體重、視力及頭蝨檢查",false],
  ["2026-09-09",null,"國民體育日",false],
  ["2026-09-14","2026-09-18","疾病防治週宣導（傳染病防治方法）",false],
  ["2026-09-16",null,"地震避難演練及校園人為災害演練",false],
  ["2026-09-21",null,"國家防災日",false],
  ["2026-09-23",null,"牙齒檢查 (1)",false],
  ["2026-09-25",null,"中秋節放假 1 天",true],
  ["2026-09-28",null,"教師節放假 1 天",true],
  ["2026-09-30",null,"牙齒檢查 (2)",false],
  ["2026-10-01",null,"學扶班開始上課、學生尿液及蟯蟲檢查（市立小港醫院・上午 8:40 到校收檢體）",false],
  ["2026-10-05","2026-10-09","防制學生藥物濫用宣導",false],
  ["2026-10-09",null,"國慶日補假 1 天",true],
  ["2026-10-14",null,"施打公費流感疫苗（阮綜合醫療團隊・同意書線上填寫，無紙本）",false],
  ["2026-10-16",null,"親職教育講座",false],
  ["2026-10-20","2026-10-22","國小體促會躲避球賽（暫定）",false],
  ["2026-10-23",null,"第一次學生週會",false],
  ["2026-10-26",null,"臺灣光復暨金門古寧頭大捷紀念日補假 1 天",true],
  ["2026-10-28",null,"學生理學健康檢查（市立小港醫院）",false],
  ["2026-11-02","2026-11-06","第 1 次定期評量週（期中考）、急救教育訓練及基本救命術課程",false],
  ["2026-12-05",null,"運動會",false,"sport"],
  ["2026-12-07",null,"運動會補休",true],
  ["2026-12-11",null,"親職教育講座",false],
  ["2026-12-14","2026-12-18","班際體育競賽週",false],
  ["2026-12-18",null,"第二次學生週會",false],
  ["2026-12-25",null,"行憲紀念日放假 1 天",true],
  ["2027-01-01",null,"開國紀念日放假 1 天",true],
  ["2027-01-11","2027-01-15","第 2 次定期評量週（期末考）",false],
  ["2027-01-19",null,"跳蚤市場（資源回收及理財教育）",false],
  ["2027-01-20",null,"第一學期課程結束",false],
];

const schoolDateKey=date=>{
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};

function holidayEventOn(date){
  const key=schoolDateKey(date);
  return EVENTS.find(ev=>ev[3]&&ev[0]<=key&&(ev[1]||ev[0])>=key)||null;
}

function nextSchoolDay(date){
  const next=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  do{ next.setDate(next.getDate()+1); }
  while(next.getDay()===0||next.getDay()===6||holidayEventOn(next));
  return next;
}
