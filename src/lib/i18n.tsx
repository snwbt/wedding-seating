import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "zh";

const translations = {
  findYourSeat: { en: "Find Your Seat", zh: "找到你的座位" },
  table: { en: "Table", zh: "桌" },
  seat: { en: "Seat", zh: "座位" },
  entrance: { en: "Entrance / Registration", zh: "入口 / 签到处" },
  entranceHelper: { en: "You are entering from here ↑", zh: "从此处入场 ↑" },
  searchPlaceholder: { en: "Search your name...", zh: "搜索你的名字..." },
  searchButton: { en: "Search", zh: "搜索" },
  fullVenue: { en: "Full Venue", zh: "全场" },
  yourSeatAssignment: { en: "Your seat assignment", zh: "你的座位安排" },
  seatedWithYou: { en: "Seated with you", zh: "与你同桌" },
  welcomeTagline: { en: "A Dinner Celebration", zh: "晚宴庆典" },
  welcomeButton: { en: "Find Your Seat", zh: "找到你的座位" },
  welcomeSubtext: { en: "Welcome to the celebration", zh: "欢迎来到庆典" },
  noResults: { en: "We couldn't find that name.", zh: "找不到该名字。" },
  askUsher: {
    en: "Please check the spelling or ask an usher for help.",
    zh: "请检查拼写或向工作人员求助。",
  },
  group: { en: "Group", zh: "关系" },
  side: { en: "Side", zh: "方" },
  brideSide: { en: "Bride's Side", zh: "新娘方" },
  groomSide: { en: "Groom's Side", zh: "新郎方" },
  dietary: { en: "Dietary", zh: "饮食" },
  backToSearch: { en: "Search", zh: "搜索" },
  youAreSeatedHere: { en: "You are seated here", zh: "你在这里就座" },
  solemnisation: { en: "Solemnisation", zh: "注册仪式" },
  wayfindingMessage: {
    en: "Hi {name}, you're seated at Table {table}, Seat {seat}. Follow the highlighted path from the entrance.",
    zh: "你好{name}，你的座位在桌{table}，座位{seat}。请沿着高亮路线从入口前行。",
  },
  findingYourSeat: { en: "Finding your seat...", zh: "正在寻找你的座位..." },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextValue {
  language: Language;
  toggle: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  toggle: () => {},
  t: (key, params) => {
    let text: string = translations[key].en;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return text;
  },
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggle = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text: string = translations[key][language];
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return text;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
