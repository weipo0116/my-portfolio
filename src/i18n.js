// src/i18n.js
// UI strings + Traditional Chinese overrides for siteData.
// English lives in data.js; zh only lists fields that differ (arrays merge by index).
import { siteData as baseData } from "./data.js";

export const LANGS = ["en", "zh"];

export const ui = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      education: "Education",
      experience: "Experience",
      others: "Others",
      projects: "Work",
      lab: "Lab",
    },
    navAria: "Main navigation",
    menuToggle: "Toggle menu",
    langToggle: "切換為中文",
    langShort: "中",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    viewWork: "View Work",
    downloadResume: "Download resume",
    downloadMyResume: "Download my Resume",
    educationPhotoAlt: "Receiving my M.S. diploma at the 2026 NCCU commencement",
    sections: {
      about: "About Me",
      education: "Education",
      experience: "Experience",
      projects: "Work",
      lab: "Lab",
      others: "Other Experience",
    },
    rows: { projects: "Research & projects", activities: "Activities" },
    work: {
      kicker: "Lab",
      title: "What I'm building now",
      intro:
        "Small AI tools for my own workflow — from systems I use every day to early experiments.",
      backToProfile: "Back to profile",
    },
    lab: { problem: "The Riddle", approach: "The Spell", tryIt: "Cast it" },
    labStatus: { Brewing: "Brewing", Wandering: "Wandering" },
    checkOnGithub: "Check on GitHub",
    unreleased: "Unreleased",
    viewPoster: "View full poster",
    more: "more",
    relatedSite: "Related Site",
    prev: "Previous",
    next: "Next",
    goToSlide: (n) => `Go to slide ${n}`,
    slides: "Slides",
    closeProject: "Close project preview",
    closeDetails: "Close details",
    prevExperience: "Previous experience",
    nextExperience: "Next experience",
    backToTop: "Back to top",
    letsConnect: "Let's Connect",
    techStack: "Website tech stack",
    rights: "All rights reserved.",
    links: {
      bio: "M.S. CS @ NCCU. I turn data and ideas into tools people actually use.",
      portfolio: "Portfolio",
      portfolioSub: "Background, experience & work",
      work: "Lab",
      workSub: "AI tools I'm building now",
      resume: "Resume",
      resumeSub: "One-page PDF",
      contact: "Contact",
      mainLinks: "Main links",
      now: "Now",
      nowText: "Building SI, an AI project workspace",
    },
  },
  zh: {
    nav: {
      home: "首頁",
      about: "關於",
      education: "學歷",
      experience: "經歷",
      others: "其他",
      projects: "作品",
      lab: "Lab",
    },
    navAria: "主選單",
    menuToggle: "開關選單",
    langToggle: "Switch to English",
    langShort: "EN",
    themeToLight: "切換為淺色模式",
    themeToDark: "切換為深色模式",
    viewWork: "看作品",
    downloadResume: "下載履歷",
    downloadMyResume: "下載我的履歷",
    educationPhotoAlt: "2026 年政大畢業典禮，領取碩士學位證書",
    sections: {
      about: "關於我",
      education: "學歷",
      experience: "經歷",
      projects: "作品",
      lab: "Lab",
      others: "其他經歷",
    },
    rows: { projects: "研究與專題", activities: "活動與其他經歷" },
    work: {
      kicker: "Lab",
      title: "我正在做的事",
      intro: "為自己的工作流程打造的小型 AI 工具——有每天在用的系統，也有早期的實驗。",
      backToProfile: "回到個人介紹",
    },
    lab: { problem: "謎題", approach: "咒語", tryIt: "施展" },
    labStatus: { Brewing: "熬煮魔藥中", Wandering: "遊歷探索中" },
    checkOnGithub: "在 GitHub 查看",
    unreleased: "尚未公開",
    viewPoster: "查看完整海報",
    more: "更多",
    relatedSite: "相關網站",
    prev: "上一頁",
    next: "下一頁",
    goToSlide: (n) => `前往第 ${n} 頁`,
    slides: "頁面",
    closeProject: "關閉作品預覽",
    closeDetails: "關閉詳細內容",
    prevExperience: "上一個經歷",
    nextExperience: "下一個經歷",
    backToTop: "回到頂端",
    letsConnect: "保持聯絡",
    techStack: "網站使用技術",
    rights: "版權所有。",
    links: {
      bio: "政大資訊科學碩士。我把資料與想法，做成真正有人在用的工具。",
      portfolio: "個人介紹",
      portfolioSub: "背景、經歷與作品",
      work: "Lab",
      workSub: "正在打造的 AI 工具",
      resume: "履歷",
      resumeSub: "一頁 PDF（英文）",
      contact: "聯絡方式",
      mainLinks: "主要連結",
      now: "最近在做",
      nowText: "SI — AI 專案工作台",
    },
  },
};

const zhData = {
  title: "AI MA（儲備幹部）",
  location: "台灣 · 台北",
  avatarAlt: "Webber Lai 的照片",
  heroHighlights: [
    "第一銀行 數位通路處 AI MA（儲備幹部）。",
    "政大資訊科學碩士，專攻電腦圖學與資料視覺化。",
    "從頭到尾打造互動式視覺與資料體驗（React、D3.js、Power BI）。",
  ],
  about: {
    intro:
      "嗨，我是 Webber。2026 年 1 月取得政治大學資訊科學碩士，並於 2026 年 8 月加入第一銀行數位通路處，擔任 AI MA（儲備幹部）。",
  },
  education: [
    {
      degree: "碩士｜資訊科學系",
      school: "國立政治大學",
      period: "2023.09 – 2026.01",
      note: "論文：大型空拍場景之 3D Gaussian Splatting 互動式語意分割。\n指導教授：紀明德。",
    },
    {
      degree: "學士｜巨量資料管理（資料科學）",
      school: "東吳大學",
      period: "2019.09 – 2023.06",
      note: "畢業專題：「覓」境 — Instagram 餐廳查詢 LINE Bot\n產學合作：玉山證券「個人投資風險管家」聊天機器人，獲優勝（2021）",
    },
    {
      degree: "交換學生｜大數據學院",
      school: "復旦大學",
      period: "2021.09 – 2022.01",
    },
  ],
  experience: [
    {
      role: "AI MA（儲備幹部）｜數位通路處",
      company: "第一商業銀行",
      period: "2026.08 – 至今",
      summary: [
        "2026 年 8 月 10 日加入 AI MA 計畫，於數位通路處輪調。",
        "以 Python 前處理資料，建置每月警示帳戶 Power BI 報表，協助主管掌握趨勢、快速找出增加來源。",
        "比較多家台灣銀行的數位開戶流程（UI、身分驗證、資料補件），並以 Figma 向主管報告重點發現。",
        "將客戶旅程的觀察轉化為具體建議，降低開戶流失。",
      ],
    },
    {
      role: "計畫專任助理｜華語文教學中心（CLC）",
      company: "國立政治大學",
      period: "2026.05 – 2026.07",
      summary: [
        "承辦教育部「華語文能力精進計畫」三場華語教師增能講座：講者邀請、場地與實體＋線上混合規劃、宣傳，到活動當天主持統籌。",
        "發起「華語學伴計畫」，與國合處合作媒合政大學生與境外生，陪伴境外生練習生活華語。",
        "統籌三位老師分別講授的華語教學課程。",
      ],
    },
    {
      role: "商業開發實習生｜社群內容 BD 團隊",
      company: "台灣連線股份有限公司（LINE Taiwan）",
      period: "2022.10 – 2023.08",
      summary: [
        "協助社群內容的商業開發與成效成長，負責每月成效與整體流量報告，將數據轉化為管理層可採取行動的洞察。",
        "透過內容與版位優化，讓 LINE VOOM 首屏 VTR 提升約 100%。",
        "追蹤 5 個以上大型 BD 專案的成效與執行，包括 UBA、大嘻哈時代 2、P. LEAGUE+、MAMA 及 LINE VOOM 創作者大賽。",
        "與數據團隊整合多份報表為集中式儀表板，每天省下約 1 小時人工作業。",
        "評估創作者提案，並為 10 位以上合作創作者提供客製化的成效建議。",
      ],
    },
    {
      role: "資料科學顧問實習生",
      company: "析數智慧股份有限公司（AAT）",
      period: "2022.04 – 2022.09",
      summary: [
        "研究並整理 KNIME 前端開發流程，涵蓋 HTML、CSS、JavaScript、Bootstrap 與可重複使用的 Web 節點。",
        "測試 KNIME 的互動網頁功能，包括 jQuery UI、DataTables、輪播與燈箱整合。",
        "為金融與半導體情境打造儀表板式網頁模板與工作流程，將資料產出轉為互動式視覺呈現。",
        "製作內部參考文件與示範，協助日後的 KNIME 網頁開發與實驗。",
      ],
    },
  ],
  otherExperiences: [
    {
      title: "Pacific Graphics 國際研討會",
      subtitle: "技術組組長",
      caption: [
        "負責混合式議程的線上直播，透過 Microsoft Teams 串連現場與遠端講者及觀眾。",
        "處理會前準備，包括安排講者參與方式、收集簡報檔案。",
        "統籌現場設備操作與人力配置，讓議程與換場順利進行。",
      ],
    },
    {
      title: "政大宿舍輔導員（RA）",
      caption: [
        "負責宿舍夜間值班，處理鑰匙櫃台、訪客登記與包裹收發。",
        "定期巡檢熱水器、用電與公共空間設備。",
        "協助住宿生釐清問題，並聯繫相關單位後續處理。",
      ],
    },
    {
      title: "政大振聲合唱團",
      subtitle: "男高音",
      caption: [
        "碩士期間擔任男高音團員。",
        "參與音樂會《謠遠》，於誠品表演廳演出。",
      ],
    },
    {
      title: "個人作品集網站",
      subtitle: "（就是這個網站）",
      caption: [
        "打造具自訂區塊導覽的互動式作品集。",
        "實作響應式版面、輪播互動與資料驅動的內容呈現。",
      ],
    },
  ],
  lab: {
    intro: "為自己的工作流程打造的小型 AI 工具——有每天在用的系統，也有早期的實驗。",
    items: [
      {
        name: "SI — AI 專案工作台",
        problem: "想法冒出來的速度比執行快，而在不同 AI 工具間切換又會遺失脈絡。",
        approach:
          "用 Notion 想法收件匣讓 AI 轉成任務、執行，再用三行摘要回報。每個任務依需求分派給雲端 AI、本機瀏覽器或本機程式代理。",
      },
      {
        name: "螢幕錄影 → 步驟擷取",
        problem: "從螢幕錄影比較 App 流程，得一格一格手動拉影片。",
        approach: "自動偵測關鍵畫面，把錄影轉成有標註、依序排列的步驟清單，設計成完全在本機執行。",
      },
      {
        name: "履歷與作品集同步",
        problem: "履歷和網站分開更新，內容越來越不一致。",
        approach: "以單一資料來源，同時產生 PDF 履歷與網站內容。",
      },
      {
        name: "Astra Dies — 每日星盤",
        problem: "每日星座運勢太籠統，我想看得出依據的行星位置，再用白話解讀。",
        approach: "在瀏覽器內計算真實的行星黃經、相位與月相，以古羅馬天文儀風格呈現，並附簡短解讀。",
      },
      {
        name: "Five Elements — 五行穿搭",
        problem: "每天穿什麼要同時考慮天氣、場合與顏色，卻沒有固定邏輯。",
        approach: "由農曆算出當日五行，讀取台北天氣，依場合生成三套大膽的時裝秀風格穿搭。",
      },
    ],
  },
  projects: [
    {
      description:
        "針對大型空拍場景的事後 3DGS 語意編輯，無需重新訓練；支援互動式標註、開放詞彙查詢與即時渲染。",
      role: "研究（碩士論文）",
    },
    {
      description: "以梵谷畫作為主題的互動式視覺化，利用影像特徵降維將畫作分群，幫助使用者發現風格相近的作品。",
      role: "全端（資料處理＋互動視覺化）",
    },
    {
      name: "「覓」境 — Instagram 餐廳查詢 LINE Bot",
      description:
        "大學畢業專題（5 人團隊）。以 Selenium 爬取約 4,000 篇 #台北美食 Instagram 貼文，經 Google Maps 驗證篩出 65 間台北餐廳；結合貼文情緒（CKIP＋CopeOpi）、Google 評論情緒（SnowNLP）與星等加權計算推薦分數，再透過 LINE Bot（Flask、Railway PostgreSQL、Dialogflow 閒聊）提供查詢與推薦。",
      role: "大學畢業專題（團隊，2022）",
    },
    {
      description: "電商交易詐欺偵測的機器學習專題，運用顧客與交易資料標記高風險行為。",
      role: "資料科學（建模＋評估）",
    },
    {
      name: "個人投資風險管家 — 玉山證券產學合作",
      description:
        "觀察違約交割案例多發生在投資新手，因此打造給股市小白的 LINE 聊天機器人：查詢當日台股資訊、用白話解釋開盤價、本益比等名詞，並適時提醒風險。跨校團隊於玉山證券產學合作中獲得優勝（2021）。",
      role: "團隊專題 — 優勝（2021）",
    },
    {
      description: "垃圾偵測的電腦視覺專題，包含模型訓練、評估與可直接使用的推論流程。",
      role: "電腦視覺（微調＋評估）",
    },
    {
      description: "以人機互動為主題的購物網站，運用眼動追蹤概念探索「感知注意力」的介面設計。",
      role: "後端／HCI 原型",
    },
  ],
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const mergeDeep = (base, override) => {
  if (override === undefined) return base;
  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((item, index) => mergeDeep(item, override[index]));
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const result = { ...base };
    Object.keys(override).forEach((key) => {
      result[key] = mergeDeep(base[key], override[key]);
    });
    return result;
  }
  return override;
};

const cache = {};
export const getSiteData = (lang) => {
  if (lang !== "zh") return baseData;
  cache.zh ??= mergeDeep(baseData, zhData);
  return cache.zh;
};
