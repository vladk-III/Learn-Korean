/**
 * Learner dictionary. One entry per line:
 *   lemma | pos | level | English gloss | irregular surface forms (comma-separated, optional)
 *
 * pos: n noun, v verb, a adjective/descriptive verb, adv adverb, pron pronoun,
 *      num number, cnt counter, det determiner, int interjection, exp expression,
 *      prop proper noun
 * level: 1=A1 2=A2 3=B1 4=B2 5=C1 (used for placement + difficulty analysis)
 *
 * Regular conjugations and particles are handled by the analyzer, so only
 * irregular or ambiguous forms need listing.
 */
const RAW = `
가격|n|2|price
가구|n|3|household; furniture
가까이|adv|3|nearly; close by
가다|v|1|to go
가장|adv|2|most
가전제품|n|4|home appliance
가정|n|3|household; home
가져가다|v|2|to take (with you)
간단하다|a|2|to be simple
갈아타다|v|2|to transfer (vehicles)
감사하다|v|1|to thank (감사합니다 = thank you)
강남|prop|1|Gangnam (district in Seoul)
강남역|prop|1|Gangnam Station
강원도|prop|3|Gangwon Province
강조하다|v|4|to emphasize; stress
강하다|a|2|to be strong; resistant
같이|adv|1|together
건강|n|2|health
검토하다|v|4|to review; examine
것|n|1|thing; (turns a clause into a noun)
겪다|v|3|to experience; go through
경제|n|3|economy
계란|n|1|egg
계산하다|v|2|to pay; to calculate
계속|adv|2|continuously; keep (doing)
계속되다|v|3|to continue
계획|n|2|plan
고객|n|3|customer; passenger
공부|n|1|study
공부하다|v|1|to study
공원|n|1|park
공장|n|2|factory
관광객|n|3|tourist
괜찮다|a|1|to be okay; fine
그동안|adv|3|all this time; meanwhile
그러나|adv|2|however
그리고|adv|1|and; and then
긍정적|n|4|positive (긍정적인 = positive ~)
기능|n|3|feature; function
기다리다|v|1|to wait
기대하다|v|3|to expect; look forward to
기본|n|2|basic; base
기쁘다|a|2|to be glad; happy|기뻐요,기뻐,기뻤어요,기쁜
기온|n|3|temperature (weather)
기후|n|4|climate
길|n|1|road; way; directions
김|n|2|gim (dried seaweed sheet)
김밥|n|1|gimbap (seaweed rice roll)
김장|n|4|kimjang (making kimchi for winter)
꺼리다|v|5|to be reluctant; avoid
꼭|adv|1|surely; be sure to; tightly
꼭꼭|adv|3|tightly; firmly
끌다|v|3|to pull; draw (인기를 끌다 = to gain popularity)
끝|n|1|end; done
나오다|v|1|to come out
날씨|n|1|weather
낮|n|2|daytime
낮추다|v|3|to lower
내리다|v|1|to get off; to fall (rain/snow)
내일|n|1|tomorrow
년|cnt|1|year
넘다|v|2|to exceed; cross
넣다|v|1|to put in; add
네|int|1|yes
농가|n|5|farm household
농업|n|4|agriculture
눈|n|1|snow; eye
눈사람|n|2|snowman
늘다|v|2|to increase; grow
늘리다|v|3|to increase (something); expand
늘어나다|v|3|to increase; grow in number
다르다|a|1|to be different|달라요,달라
다섯|num|1|five
다음|n|1|next
달|n|1|month; moon
달러|n|2|dollar
당근|n|2|carrot
대|cnt|2|counter for machines/vehicles; (age) -s, e.g. 이십 대 = one's twenties
대폭|adv|5|substantially; drastically
대학생|n|1|university student
더|adv|1|more
더위|n|3|heat; hot weather
데|n|3|place; (-는 데) in doing ~
도|cnt|2|degree(s)
도시락|n|2|lunch box (dosirak)
도움|n|2|help
돈|n|1|money
동영상|n|2|video
되다|v|1|to become
두|det|1|two (before a counter)
두껍다|a|2|to be thick|두꺼운,두꺼워요,두꺼워
드라마|n|1|TV drama series
드시다|v|2|to eat / drink (honorific)
들다|v|2|to cost (money/effort); to hold|든다고,든다,드는,든,듭니다
따뜻하다|a|1|to be warm
따르다|v|2|to follow (에 따르면 = according to; 이에 따라 = accordingly)|따라,따른,따라서
때|n|1|time; when ~
때문|n|2|because of; reason (때문에 / 때문이다)
라면|n|1|ramyeon (instant noodles)
마을|n|2|village
만나다|v|1|to meet
만들다|v|1|to make
많다|a|1|to be many; a lot
많아지다|v|2|to become many; increase
많이|adv|1|a lot; much
말다|v|2|(-지 말다) don't; to roll (up)|말라고
말하다|v|1|to say; speak
맑다|a|2|to be clear (sky)
맛|n|1|taste; flavor
맛보다|v|2|to taste; try (food)
맛있다|a|1|to be delicious
맵다|a|1|to be spicy|매운,매워요,매워
매일|adv|1|every day
먹다|v|1|to eat
먼저|adv|1|first; before
메뉴|n|1|menu
메시지|n|1|message
모르다|v|1|to not know|몰라도,몰라요,몰라,몰랐어요,모르는
목소리|n|2|voice
묻다|v|2|to ask|물을,물어요,물어,물었다,물어봐요
문|n|1|door (문을 열다 = to open for business)
문제|n|2|problem
문화|n|2|culture
물건|n|2|thing; belongings
미국|prop|1|the United States
민수|prop|1|Minsu (a name)
바닷가|n|2|seaside; beach
바라다|v|2|to hope; wish (~기 바랍니다 = please ~)
바람|n|1|wind
바로|adv|2|right away; directly; right (there)
밥|n|1|rice; meal
반갑다|a|1|to be glad (to meet)|반가워요,반가워,반갑습니다
반기다|v|4|to welcome; greet gladly
방문객|n|3|visitor
방문하다|v|3|to visit
방송되다|v|3|to be broadcast; air
방안|n|5|measure; plan; way
배|n|3|times (multiple); pear; ship; belly
배우다|v|1|to learn
배추|n|3|napa cabbage
백만|num|3|one million
버스|n|1|bus
번역|n|3|translation
번역하다|v|3|to translate
변화|n|3|change
보급|n|5|spread; adoption; supply
보내다|v|1|to send; spend (time)
보다|v|1|to see; watch; (-어 보다) try ~ing
보이다|v|2|to be seen; be visible|보여요,보여,보입니다
봄|n|1|spring (season)
봉투|n|2|bag; envelope
부담|n|4|burden
부산|prop|1|Busan
부족|n|3|shortage; lack
부족하다|a|3|to be lacking; insufficient
불다|v|2|to blow (wind)
불편|n|3|inconvenience; discomfort
비|n|1|rain
사람|n|1|person; people
사용|n|2|use; usage
사용하다|v|2|to use
사진|n|1|photo
살다|v|1|to live|사는,산다,삽니다,산
삼분|n|3|three parts (삼분의 일 = one third)
삼천|num|1|three thousand
새|det|1|new
새롭다|a|2|to be new|새로운,새로워요
생각|n|1|thought; opinion
생산량|n|5|production volume; output
서늘하다|a|4|to be cool (weather)
서비스|n|2|service
서울|prop|1|Seoul
서울시|prop|2|Seoul (city government)
설명하다|v|2|to explain
설치하다|v|4|to install
성장|n|4|growth
세|det|1|three (before a counter)
세계|n|2|world
센터|n|2|center
소금|n|2|salt
소음|n|4|noise
수출|n|3|export(s)
스마트폰|n|1|smartphone
시|cnt|1|o'clock; hour
시간|n|1|time; hour(s)
시민|n|3|citizen
시설|n|4|facility
시장|n|3|market
시키다|v|2|to order (food); make someone do
시험|n|2|test; trial; exam
식당|n|1|restaurant
실례하다|v|1|to be rude (실례합니다 = excuse me)
십|num|1|ten
싸다|a|1|to be cheap
쓰다|v|1|to use; to write
쓰레기|n|2|trash; garbage
쓰레기통|n|2|trash can
아니다|a|1|to not be
아니요|int|1|no
아메리카노|n|1|americano (coffee)
아이|n|1|child
아이스|n|1|iced; ice
아주|adv|1|very
아침|n|1|morning; breakfast
아파트|n|1|apartment
안내|n|3|guidance; information
안녕하세요|exp|1|hello
않다|v|1|not (after -지: -지 않다)
앞|n|1|front
앞으로|adv|2|in the future; from now on
앱|n|1|app
약하다|a|2|to be weak; vulnerable
얇다|a|3|to be thin
어디|pron|1|where
어서|adv|1|quickly (어서 오세요 = welcome)
어제|n|1|yesterday
억|num|2|hundred million (10억 = one billion)
얻다|v|2|to gain; obtain
얼마|n|1|how much (price)
얼마나|adv|1|how much; how long
없다|a|1|to not exist; not have
업계|n|5|industry; the trade
여덟|num|1|eight
여름|n|1|summer
여행|n|1|trip; travel
여행하다|v|2|to travel
역|n|1|station
열다|v|1|to open
영상|n|2|video; footage
영향|n|4|influence; effect
예상하다|v|3|to expect; predict
예정|n|3|plan; schedule (-ㄹ 예정이다 = be scheduled to)
오늘|n|1|today
오다|v|1|to come; (rain/snow) to fall
오르다|v|2|to rise; go up|올라요,올라,올랐다,올랐습니다,올랐어요,오른
오른쪽|n|1|right (side)
올리다|v|2|to raise; put on top
올해|n|1|this year
옷|n|1|clothes
왼쪽|n|1|left (side)
외국인|n|2|foreigner
요금|n|2|fare; fee; charge
요리|n|1|cooking; dish
요즘|n|1|these days
우리|pron|1|we; our
우산|n|1|umbrella
운전|n|2|driving
운전자|n|3|driver
원|cnt|1|won (Korean currency)
위|n|1|top; above; on
위하다|v|3|to be for (을 위해 / 을 위한 = for the sake of)
유튜브|prop|1|YouTube
은행|n|1|bank
음식|n|1|food
이|det|1|this (이에 따라 = accordingly; 이로 인해 = because of this)
이거|pron|1|this (thing)
이런|det|2|this kind of; such
이름|n|1|name
이번|n|2|this (time); this coming
이십|num|1|twenty
이십삼|num|1|twenty-three
이용하다|v|2|to use; make use of
이제|adv|2|now
인|cnt|3|person (counter, e.g. 1인 = one person)
인기|n|2|popularity
인사말|n|3|greeting
인하다|v|5|to be caused (로 인해 = due to)
일|n|1|one; work; thing; matter; day
일부|n|3|some; part
읽다|v|1|to read
입다|v|1|to wear (clothes)
있다|v|1|to exist; to have; (-고 있다) be ~ing
자다|v|1|to sleep
자라다|v|2|to grow (up)
자르다|v|2|to cut|잘라요,잘라
자연스럽다|a|3|to be natural|자연스러운,자연스러워요
자주|adv|1|often
작년|n|2|last year
작다|a|1|to be small
잔|cnt|1|cup; glass (counter)
잘|adv|1|well
잠|n|1|sleep
잠시만|adv|2|just a moment
장거리|n|4|long distance
장기적|n|5|long-term (장기적으로 = in the long run)
재배하다|v|5|to cultivate; grow (crops)
저|pron|1|I; me (humble)
저기|pron|1|over there
저녁|n|1|evening; dinner
적응하다|v|4|to adapt
전|n|1|before (-기 전에 = before ~ing)
전국|n|3|nationwide; the whole country
전기차|n|4|electric vehicle
전문가|n|3|expert
전체|n|3|whole; entire; all
정말|adv|1|really
정부|n|3|government
정책|n|4|policy
정확하다|a|3|to be accurate
제|pron|1|my (humble)
조금|adv|1|a little
조사|n|3|survey; investigation
조언하다|v|3|to advise
좋다|a|1|to be good; nice
좋아지다|v|2|to get better; improve
좋아하다|v|1|to like
주다|v|1|to give; (-어 주다) do for someone|줄
주로|adv|2|mainly; mostly
주문하다|v|1|to order
주민|n|3|resident
주인|n|2|owner
주인공|n|3|main character
주차장|n|2|parking lot
준비하다|v|2|to prepare
줄다|v|3|to decrease; shrink
중국|prop|1|China
중요하다|a|2|to be important
즐거워지다|v|3|to become enjoyable
증가하다|v|3|to increase
지난해|n|3|last year
지역|n|3|region; local area
지적되다|v|5|to be pointed out
지하철|n|1|subway
지하철역|n|1|subway station
진짜|adv|1|really; truly
짓다|v|2|to build; make|지을,지어요,지었다,지어,짓는
찍다|v|1|to take (a photo)
참기름|n|3|sesame oil
찾다|v|1|to look for; to visit (a place)
채소|n|2|vegetable
처음|n|2|first time; beginning (처음으로 = for the first time)
첫눈|n|2|first snow (of the season)
촬영지|n|4|filming location
최고|n|2|highest; best
최근|n|3|recently; recent
춥다|a|1|to be cold|추워요,추워,추운,추웠어요,추웠다
충전|n|4|charging
충전기|n|4|charger
충전소|n|4|charging station
챙기다|v|2|to take; pack; look after
취미|n|1|hobby
치킨|n|1|fried chicken
친구|n|1|friend
카드|n|1|card
카페|n|1|café
커지다|v|3|to grow bigger
커피|n|1|coffee
크기|n|3|size
크다|a|1|to be big
타다|v|1|to ride; take (transport)
통계|n|4|statistics
특히|adv|2|especially
팔리다|v|2|to be sold; sell
판매|n|3|sales
퍼센트|n|2|percent
펴다|v|3|to spread; unfold
편의점|n|1|convenience store
평균|n|3|average
프랑스|prop|1|France
품종|n|5|variety; breed (of crop)
필요하다|a|2|to be needed; necessary
하다|v|1|to do
하루|n|1|a day; one day
하지만|adv|1|but; however
학교|n|1|school
학생|n|1|student
한|det|1|one; a (certain)
한강|prop|1|the Han River
한국|prop|1|Korea
한국어|n|1|Korean (language)
함께|adv|2|together
항상|adv|2|always
햄|n|1|ham
호선|cnt|2|subway line number (2호선 = Line 2)
혼밥|n|3|eating alone (honbap)
혼자|adv|1|alone
확대하다|v|4|to expand
회사|n|1|company
후|n|2|after (-ㄴ 후 = after ~ing)
휴대폰|n|1|cell phone
`;

export type Pos = "n" | "v" | "a" | "adv" | "pron" | "num" | "cnt" | "det" | "int" | "exp" | "prop";

export interface DictEntry {
  ko: string;
  pos: Pos;
  level: number;
  en: string;
  forms: string[];
}

export const POS_LABEL: Record<Pos, string> = {
  n: "noun",
  v: "verb",
  a: "adjective",
  adv: "adverb",
  pron: "pronoun",
  num: "number",
  cnt: "counter",
  det: "determiner",
  int: "interjection",
  exp: "expression",
  prop: "proper noun",
};

export const DICTIONARY: DictEntry[] = RAW.trim()
  .split("\n")
  .map((line) => {
    const [ko, pos, level, en, forms] = line.split("|");
    return {
      ko,
      pos: pos as Pos,
      level: Number(level),
      en,
      forms: forms ? forms.split(",") : [],
    };
  });
