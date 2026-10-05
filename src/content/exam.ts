/** OPI practice prompts and curated exam resources. */

export interface OpiQuestion {
  ko: string;
  en: string;
}

/** Interview prompts grouped by the ILR speaking level they probe. */
export const OPI_QUESTIONS: Record<1 | 2 | 3, { focus: string; seconds: number; questions: OpiQuestion[] }> = {
  1: {
    focus: "Warm-up & level 1: answer simple questions about yourself in full sentences.",
    seconds: 30,
    questions: [
      { ko: "자기소개를 해 주세요.", en: "Please introduce yourself." },
      { ko: "어디에서 왔어요? 고향은 어떤 곳이에요?", en: "Where are you from? What is your hometown like?" },
      { ko: "가족에 대해 말해 주세요.", en: "Tell me about your family." },
      { ko: "주말에 보통 뭐 해요?", en: "What do you usually do on weekends?" },
      { ko: "좋아하는 음식이 뭐예요? 왜 좋아해요?", en: "What's your favorite food? Why?" },
      { ko: "오늘 아침에 무엇을 했어요?", en: "What did you do this morning?" },
    ],
  },
  2: {
    focus: "Level 2: narrate in the past, describe in detail, handle a situation with a complication.",
    seconds: 60,
    questions: [
      { ko: "지난 휴가 때 무엇을 했는지 자세히 이야기해 주세요.", en: "Describe in detail what you did on your last vacation." },
      { ko: "지금 하는 일을 처음 듣는 사람에게 설명해 주세요.", en: "Explain your current job to someone hearing about it for the first time." },
      { ko: "고향을 처음 방문하는 사람에게 소개해 주세요.", en: "Introduce your hometown to someone visiting for the first time." },
      { ko: "기억에 남는 실수에 대해 이야기해 주세요. 어떻게 해결했어요?", en: "Tell me about a memorable mistake. How did you resolve it?" },
      { ko: "롤플레이: 식당에서 주문한 음식이 잘못 나왔습니다. 직원에게 말해 보세요.", en: "Role-play: the restaurant brought the wrong dish. Explain it to the server." },
      { ko: "부대나 회사에서 하루 일과가 어떻게 되는지 순서대로 말해 주세요.", en: "Walk me through a typical day at your unit or workplace, in order." },
    ],
  },
  3: {
    focus: "Level 3: support an opinion, discuss abstract topics, handle hypotheticals.",
    seconds: 90,
    questions: [
      { ko: "저출산 문제를 해결하려면 정부가 무엇을 해야 한다고 생각하세요?", en: "What should the government do to address the low birth rate?" },
      { ko: "만약 국방 예산을 크게 줄인다면 어떤 영향이 있을까요?", en: "If the defense budget were cut sharply, what effects would that have?" },
      { ko: "인공지능이 군대에 미칠 영향에 대해 의견을 말해 주세요.", en: "Give your opinion on how AI will affect the military." },
      { ko: "남북 관계가 앞으로 어떻게 변할 것이라고 생각하세요? 이유도 말해 주세요.", en: "How do you think inter-Korean relations will change? Give reasons." },
      { ko: "사이버 안보가 왜 중요한지 설명하고 해결책을 제시해 주세요.", en: "Explain why cybersecurity matters and propose solutions." },
      { ko: "기후 변화가 한국 사회에 주는 영향을 장단점과 함께 설명해 주세요.", en: "Explain climate change's impact on Korean society, with pros and cons of responses." },
    ],
  },
};

export interface Resource {
  title: string;
  url: string;
  note: string;
}

export const DLPT_RESOURCES: Resource[] = [
  {
    title: "DLPT5 Korean familiarization guide (DLIFLC)",
    url: "https://www.dliflc.edu/resources/dlpt-guides/kpdlpt5famguidemc",
    note: "Official format, timing and sample lower- and upper-range passages. Start here.",
  },
  {
    title: "GLOSS — Global Language Online Support System",
    url: "https://gloss.dliflc.edu/",
    note: "Free DLI reading & listening lessons sorted by ILR level, on DLPT topics (politics, economy, culture…).",
  },
  {
    title: "ILR listening skill level descriptions",
    url: "https://govtilr.org/Skills/Listening.htm",
    note: "What each DLPT score level actually means — useful for knowing what to aim for.",
  },
  {
    title: "Your Quizlet set: Korean DLPT 1–100",
    url: "https://quizlet.com/712290586/1-korean-dlpt-1-100-flash-cards/",
    note: "Pair with this app's DLPT vocabulary set in Study.",
  },
  {
    title: "Easy Korean News (쉬운 한국어 뉴스) app",
    url: "https://apps.apple.com/us/app/-/id1441601041",
    note: "Daily news in simplified Korean (incl. VOA Korean) — good bridge to authentic news. Paste articles into News → Paste.",
  },
  {
    title: "KBS World Korean",
    url: "https://world.kbs.co.kr/",
    note: "Clear broadcast Korean for listening practice at DLPT-like speed.",
  },
];

export const OPI_RESOURCES: Resource[] = [
  {
    title: "ILR speaking skill level descriptions",
    url: "https://www.govtilr.org/Skills/Speaking%20Revisions.pdf",
    note: "The rubric OPI raters use. Read the level you're targeting and the one above it.",
  },
  {
    title: "How a military OPI is run (DLIELC)",
    url: "https://dlielc.edu/testing/opi_test.php",
    note: "Two certified raters; warm-up → level checks → probes → wind-down. Written for English OPIs, same structure.",
  },
];

export const OPI_TIPS = [
  "Answer in paragraphs, not single sentences — raters look for connected discourse at level 2+.",
  "Narrate past events in order with time words: 먼저, 그다음에, 그 후에, 마지막으로.",
  "For opinions, give a claim, two reasons and an example: 제 생각에는… 왜냐하면… 예를 들어…",
  "If you don't know a word, talk around it instead of stopping (circumlocution counts in your favor).",
  "Use the formal -습니다 style in role-plays with officials and polite -아요/어요 in casual ones.",
];
