// Life Points — dream dataset.
// All numbers are editorial estimates, not science: edit freely.
//
//   id         unique kebab-case key
//   zh / en    display names (Traditional Chinese, Taiwan usage / English)
//   cat        "travel" | "physical" | "creative" | "personal"
//   latestAge  recommended latest age to still do it comfortably (45-90)
//   demand     physical demand, 1 (easy) to 5 (very hard)
//   cost       cost tier, 1 (cheap) to 4 (very expensive)
//   stepZh/En  one small first step doable this week (zh max 20 chars / en max 56)
//   icon       inner SVG markup for a 24x24 viewBox; the wrapper must set
//              fill="none" stroke="currentColor" stroke-width="1.5"
//              stroke-linecap="round" stroke-linejoin="round"

export const DREAMS = [
  // ---- travel (9) ----
  {
    id: "northern-lights", zh: "看一次極光", en: "See the Northern Lights",
    cat: "travel", latestAge: 75, demand: 2, cost: 3,
    stepZh: "查九月到三月的極光季，挑一個新月週", stepEn: "Look up aurora season and pick a new-moon week",
    icon: '<path d="M3 6c3-3 6 3 9 0s6 3 9 0"/><path d="M3 11c3-3 6 3 9 0s6 3 9 0"/><polyline points="3 20 8 15 12 19 16 14 21 20"/>',
  },
  {
    id: "iceland-ring-road", zh: "環遊冰島一圈", en: "Drive Iceland's Ring Road",
    cat: "travel", latestAge: 75, demand: 2, cost: 3,
    stepZh: "打開地圖，把冰島一圈拆成幾天看看", stepEn: "Open a map and split the ring road into day stretches",
    icon: '<circle cx="12" cy="12" r="9"/><polyline points="6.5 16 10 10 13 14 15 12 17.5 16"/>',
  },
  {
    id: "machu-picchu", zh: "登上馬丘比丘", en: "Visit Machu Picchu",
    cat: "travel", latestAge: 70, demand: 3, cost: 3,
    stepZh: "翻翻馬丘比丘的歷史，挑想看的景點", stepEn: "Skim its history and pick the spots you most want to see",
    icon: '<polyline points="2 20 2 17 6 17 6 14 10 14 10 11 14 11 14 8 20 20"/><line x1="2" y1="20" x2="22" y2="20"/>',
  },
  {
    id: "african-safari", zh: "去非洲看野生動物", en: "Go on an African safari",
    cat: "travel", latestAge: 75, demand: 2, cost: 4,
    stepZh: "看一部野生動物紀錄片，記下最想見的動物", stepEn: "Watch a wildlife documentary and note your top animal",
    icon: '<line x1="12" y1="21" x2="12" y2="12"/><path d="M4 12c0-3 4-4 8-4s8 1 8 4c-4-1-12-1-16 0z"/><line x1="8" y1="21" x2="16" y2="21"/>',
  },
  {
    id: "camino-de-santiago", zh: "走一趟朝聖之路", en: "Walk the Camino de Santiago",
    cat: "travel", latestAge: 70, demand: 4, cost: 2,
    stepZh: "讀一篇朝聖之路的步行日記", stepEn: "Read one walker's diary from the Camino",
    icon: '<path d="M12 21 5 10a8 8 0 0 1 14 0z"/><line x1="12" y1="21" x2="12" y2="6"/><line x1="12" y1="21" x2="8.5" y2="7.5"/><line x1="12" y1="21" x2="15.5" y2="7.5"/>',
  },
  {
    id: "kyoto-cherry-blossoms", zh: "賞京都櫻花", en: "See Kyoto's cherry blossoms",
    cat: "travel", latestAge: 80, demand: 2, cost: 2,
    stepZh: "查京都櫻花的花期，圈出最想去的一週", stepEn: "Check bloom season and circle your ideal week",
    icon: '<path d="M3 21c6-2 10-7 13-14"/><circle cx="17" cy="5.5" r="2"/><circle cx="11.5" cy="10" r="2"/><circle cx="7.5" cy="16" r="2"/>',
  },
  {
    id: "antarctica", zh: "登上南極大陸", en: "Set foot on Antarctica",
    cat: "travel", latestAge: 75, demand: 2, cost: 4,
    stepZh: "找一支南極影片來看，感受一下那片白", stepEn: "Find a short Antarctica film and soak in the white",
    icon: '<path d="M4 15 9 7l3 5 3-8 5 11z"/><path d="M2 19c2.5 2 4.5-2 7 0s4.5 2 7 0 3.5 0 6 0"/>',
  },
  {
    id: "trans-siberian", zh: "搭火車橫跨歐亞", en: "Ride the Trans-Siberian",
    cat: "travel", latestAge: 75, demand: 2, cost: 3,
    stepZh: "在地圖上描出橫跨歐亞的鐵道路線", stepEn: "Trace the railway route across the map",
    icon: '<rect x="6" y="3" width="12" height="14" rx="3"/><line x1="6" y1="9" x2="18" y2="9"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/><line x1="8" y1="21" x2="9.5" y2="17"/><line x1="16" y1="21" x2="14.5" y2="17"/>',
  },
  {
    id: "parents-trip", zh: "帶爸媽去旅行", en: "Take my parents on a trip",
    cat: "travel", latestAge: 60, demand: 1, cost: 2,
    stepZh: "約爸媽吃飯，問問他們最想去哪裡", stepEn: "Ask your parents over a meal where they'd love to go",
    icon: '<circle cx="9" cy="6" r="2.5"/><path d="M4 21v-4a5 5 0 0 1 10 0v4"/><circle cx="18" cy="11" r="2"/><path d="M15.5 21v-2a2.5 2.5 0 0 1 5 0v2"/>',
  },

  // ---- physical (8) ----
  {
    id: "run-marathon", zh: "跑完一場馬拉松", en: "Run a marathon",
    cat: "physical", latestAge: 60, demand: 5, cost: 1,
    stepZh: "穿上球鞋，輕鬆慢跑二十分鐘", stepEn: "Lace up and jog easy for twenty minutes",
    icon: '<line x1="6" y1="3" x2="6" y2="21"/><path d="M6 4h12l-3 4 3 4H6"/>',
  },
  {
    id: "scuba-diving", zh: "去潛水看海底", en: "Go scuba diving",
    cat: "physical", latestAge: 65, demand: 3, cost: 2,
    stepZh: "搜尋離家近的潛水體驗課，看看簡介", stepEn: "Browse intro dive courses near you and read the outline",
    icon: '<path d="M3 11a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-3l-1.5-2h-3L9 16H6a3 3 0 0 1-3-3z"/><circle cx="18" cy="4.5" r="1.2"/>',
  },
  {
    id: "climb-fuji", zh: "攀登富士山", en: "Climb Mt. Fuji",
    cat: "physical", latestAge: 65, demand: 4, cost: 2,
    stepZh: "標出富士山開山的月份，放進月曆", stepEn: "Mark the climbing season on your calendar",
    icon: '<path d="M3 20 9 7h6l6 13z"/><polyline points="7.5 11 10 13 12 11 14 13 16.5 11"/><circle cx="19" cy="4.5" r="1.5"/>',
  },
  {
    id: "cycle-taiwan", zh: "單車環島一圈", en: "Cycle around Taiwan",
    cat: "physical", latestAge: 65, demand: 4, cost: 1,
    stepZh: "騎上單車繞社區一圈，看看順不順", stepEn: "Ride a loop around your block and see how it feels",
    icon: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l3.5-7h5.5l3 7"/><line x1="9.5" y1="9" x2="12.5" y2="16"/>',
  },
  {
    id: "learn-surfing", zh: "學會衝浪", en: "Learn to surf",
    cat: "physical", latestAge: 60, demand: 4, cost: 2,
    stepZh: "收藏一段衝浪入門影片，學站起來的動作", stepEn: "Save a beginner surf video and study the pop-up",
    icon: '<path d="M7 17C7 10 10 6 17 6c0 7-4 11-10 11z"/><line x1="7" y1="17" x2="17" y2="6"/><path d="M3 21c2-1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/>',
  },
  {
    id: "skydiving", zh: "跳一次傘", en: "Go skydiving",
    cat: "physical", latestAge: 70, demand: 2, cost: 2,
    stepZh: "觀賞一支高空跳傘的第一人稱影片", stepEn: "Watch a first-person skydive video",
    icon: '<path d="M3 11a9 9 0 0 1 18 0c-3-2-6-2-9 0-3-2-6-2-9 0z"/><line x1="3" y1="11" x2="12" y2="19"/><line x1="21" y1="11" x2="12" y2="19"/><circle cx="12" cy="20.5" r="1.3"/>',
  },
  {
    id: "everest-base-camp", zh: "健行聖母峰基地營", en: "Trek to Everest Base Camp",
    cat: "physical", latestAge: 60, demand: 5, cost: 3,
    stepZh: "翻翻基地營健行的照片，挑最心動的一張", stepEn: "Browse trek photos and pick the one that moves you",
    icon: '<polyline points="2 20 9 7 13 13 16 9 22 20"/><line x1="2" y1="20" x2="22" y2="20"/><path d="M9 7V3h4"/>',
  },
  {
    id: "learn-freediving", zh: "學會自由潛水", en: "Learn to freedive",
    cat: "physical", latestAge: 60, demand: 3, cost: 2,
    stepZh: "讀一篇自由潛水的入門介紹", stepEn: "Read a beginner's introduction to freediving",
    icon: '<path d="M3 6c2-1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><line x1="12" y1="10" x2="12" y2="21"/><polyline points="8 17 12 21 16 17"/>',
  },

  // ---- creative (6) ----
  {
    id: "write-book", zh: "寫一本書", en: "Write a book",
    cat: "creative", latestAge: 85, demand: 1, cost: 1,
    stepZh: "計時十分鐘，寫下書的第一段話", stepEn: "Set a ten-minute timer and write the opening lines",
    icon: '<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z"/><line x1="12" y1="6" x2="12" y2="20"/>',
  },
  {
    id: "learn-instrument", zh: "學會一種樂器", en: "Learn a musical instrument",
    cat: "creative", latestAge: 85, demand: 1, cost: 1,
    stepZh: "選一種想學的樂器，找首入門曲來聽", stepEn: "Pick an instrument and listen to a beginner piece",
    icon: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  },
  {
    id: "release-song", zh: "發行一首自己的歌", en: "Release my own song",
    cat: "creative", latestAge: 85, demand: 1, cost: 2,
    stepZh: "用手機錄下哼過的旋律，存起來", stepEn: "Hum a melody into your phone and save it",
    icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/>',
  },
  {
    id: "make-short-film", zh: "拍一部短片", en: "Make a short film",
    cat: "creative", latestAge: 80, demand: 1, cost: 2,
    stepZh: "用手機拍十秒鐘身邊的小畫面", stepEn: "Shoot ten seconds of something small around you",
    icon: '<rect x="3" y="10" width="18" height="10" rx="1.5"/><path d="M3 10l.5-4 17-3 .5 4z"/><line x1="9" y1="8.5" x2="10" y2="4.8"/><line x1="14.5" y1="7.5" x2="15.5" y2="3.8"/>',
  },
  {
    id: "hold-exhibition", zh: "辦一場個展", en: "Hold a solo exhibition",
    cat: "creative", latestAge: 80, demand: 1, cost: 2,
    stepZh: "列出三件想展出的作品", stepEn: "List three pieces you'd want to show",
    icon: '<rect x="3" y="4" width="18" height="14" rx="1"/><polyline points="3 15 8 10 12 14 15 11 21 16"/><circle cx="16.5" cy="8" r="1.2"/><line x1="8" y1="21" x2="16" y2="21"/>',
  },
  {
    id: "cook-family-recipes", zh: "學會家傳菜", en: "Learn my family's recipes",
    cat: "creative", latestAge: 85, demand: 1, cost: 1,
    stepZh: "傳訊息問家人，最想學哪一道菜", stepEn: "Message a relative about the one dish you want to learn",
    icon: '<path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><line x1="2" y1="11" x2="22" y2="11"/><path d="M9 3c-1 1.5 1 2.5 0 4"/><path d="M15 3c-1 1.5 1 2.5 0 4"/>',
  },

  // ---- personal (7) ----
  {
    id: "live-abroad", zh: "到國外生活一年", en: "Live abroad for a year",
    cat: "personal", latestAge: 65, demand: 1, cost: 3,
    stepZh: "列出三個想住住看的城市和原因", stepEn: "Write down three cities you'd live in, and why",
    icon: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/>',
  },
  {
    id: "learn-language", zh: "學會一種新語言", en: "Learn a new language",
    cat: "personal", latestAge: 85, demand: 1, cost: 1,
    stepZh: "挑一個想學的語言，聽十分鐘入門課", stepEn: "Pick a language and try a ten-minute intro lesson",
    icon: '<path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H11l-4 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><line x1="7" y1="8.5" x2="17" y2="8.5"/><line x1="7" y1="12" x2="13" y2="12"/>',
  },
  {
    id: "start-small-business", zh: "開一間自己的店", en: "Start a small business",
    cat: "personal", latestAge: 70, demand: 1, cost: 3,
    stepZh: "把開店的點子寫成一句話", stepEn: "Write your shop idea as a single sentence",
    icon: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><rect x="10" y="15" width="4" height="5"/>',
  },
  {
    id: "friends-reunion", zh: "和老朋友重聚", en: "Reunite with old friends",
    cat: "personal", latestAge: 80, demand: 1, cost: 1,
    stepZh: "傳訊息給一位老朋友，約個時間聊聊", stepEn: "Text one old friend and suggest catching up",
    icon: '<circle cx="12" cy="7" r="2.5"/><path d="M7 20v-3a5 5 0 0 1 10 0v3"/><circle cx="5" cy="10" r="2"/><path d="M2 19v-1.5A3.5 3.5 0 0 1 5.5 14"/><circle cx="19" cy="10" r="2"/><path d="M22 19v-1.5a3.5 3.5 0 0 0-3.5-3.5"/>',
  },
  {
    id: "adopt-pet", zh: "領養一個毛孩", en: "Adopt a pet",
    cat: "personal", latestAge: 75, demand: 1, cost: 2,
    stepZh: "逛逛認養網站，看看毛孩的故事", stepEn: "Browse adoption listings and read a few pets' stories",
    icon: '<path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 2-2 1-4 0-4-2z"/><circle cx="5.5" cy="11" r="1.5"/><circle cx="9" cy="6.5" r="1.5"/><circle cx="15" cy="6.5" r="1.5"/><circle cx="18.5" cy="11" r="1.5"/>',
  },
  {
    id: "plant-garden", zh: "種一座小花園", en: "Plant a small garden",
    cat: "personal", latestAge: 85, demand: 2, cost: 1,
    stepZh: "找一個日照好的角落，量量大小", stepEn: "Find a sunny corner and measure the space",
    icon: '<line x1="12" y1="21" x2="12" y2="12"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 14c0-3 2-5 6-5 0 3-2 5-6 5z"/><line x1="6" y1="21" x2="18" y2="21"/>',
  },
  {
    id: "volunteer-abroad", zh: "出國當志工", en: "Volunteer abroad",
    cat: "personal", latestAge: 70, demand: 2, cost: 2,
    stepZh: "瀏覽一個國際志工計畫的介紹", stepEn: "Read about one international volunteer program",
    icon: '<path d="M12 11s-5-2.8-5-6.2A2.8 2.8 0 0 1 12 3.5a2.8 2.8 0 0 1 5 1.3C17 8.2 12 11 12 11z"/><path d="M2 15h4l4 3h6a2 2 0 0 0 0-4h-3"/><path d="M16 14l4-2.5"/>',
  },
];
