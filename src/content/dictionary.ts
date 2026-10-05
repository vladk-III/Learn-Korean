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
가계|n|4|household (finances) (가계 부채 = household debt)
가구|n|3|household; furniture
가까이|adv|3|nearly; close by
가다|v|1|to go
가뭄|n|4|drought
가장|adv|2|most
가전제품|n|4|home appliance
가정|n|3|household; home
가져가다|v|2|to take (with you)
가족|n|1|family
가지다|v|1|to have; to hold (회담을 가지다 = to hold talks)|가졌습니다,가졌다,가져요
간단하다|a|2|to be simple
간소화하다|v|5|to simplify
갈아타다|v|2|to transfer (vehicles)
감사하다|v|1|to thank (감사합니다 = thank you)
감시|n|4|surveillance; monitoring
강남|prop|1|Gangnam (district in Seoul)
강남역|prop|1|Gangnam Station
강원도|prop|3|Gangwon Province
강조하다|v|4|to emphasize; stress
강하다|a|2|to be strong; resistant
강화하다|v|4|to strengthen; reinforce
갖추다|v|3|to have; be equipped with
같이|adv|1|together
개발|n|3|development
개발하다|v|3|to develop
개인|n|3|individual; person
건강|n|2|health
검토|n|4|review; examination
검토하다|v|4|to review; examine
것|n|1|thing; (turns a clause into a noun)
겨냥하다|v|5|to target; aim at
겪다|v|3|to experience; go through
결정하다|v|3|to decide
경계|n|4|vigilance; guard duty; boundary
경기|n|3|the economy (business conditions); game; match
경제|n|3|economy
경치|n|3|scenery; view
계란|n|1|egg
계산하다|v|2|to pay; to calculate
계속|adv|2|continuously; keep (doing)
계속되다|v|3|to continue
계속하다|v|2|to continue (doing)
계절|n|2|season
계획|n|2|plan
고객|n|3|customer; passenger
고치다|v|2|to fix; repair
곡물|n|5|grain
공격|n|4|attack
공공기관|n|4|public institution
공군|n|4|air force
공동|n|3|joint; common
공부|n|1|study
공부하다|v|1|to study
공원|n|1|park
공유하다|v|4|to share
공장|n|2|factory
관계|n|2|relationship; relations
관광객|n|3|tourist
관심|n|2|interest
괜찮다|a|1|to be okay; fine
교류|n|4|exchange (of people, culture)
교통|n|2|traffic; transportation
구하다|v|3|to seek; ask for (양해를 구하다 = to ask for understanding)
국가|n|3|country; nation; state
국가안전보장회의|prop|5|National Security Council (NSC)
국방부|prop|3|Ministry of National Defense
국제기구|n|5|international organization
국회|n|3|National Assembly
국회의원|n|3|member of the National Assembly
군|n|3|the military; armed forces
군대|n|2|army; military
군용|n|5|military-use
궤도|n|5|orbit; track
규탄하다|v|5|to condemn
그동안|adv|3|all this time; meanwhile
그래야|adv|3|only then; that way
그러나|adv|2|however
그리고|adv|1|and; and then
긍정적|n|4|positive (긍정적인 = positive ~)
기간|n|3|period; duration
기능|n|3|feature; function
기다리다|v|1|to wait
기대하다|v|3|to expect; look forward to
기본|n|2|basic; base
기쁘다|a|2|to be glad; happy|기뻐요,기뻐,기뻤어요,기쁜
기상청|prop|4|Korea Meteorological Administration
기술|n|3|technology; skill
기온|n|3|temperature (weather)
기자회견|n|4|press conference
기준금리|n|5|base interest rate
기후|n|4|climate
긴밀히|adv|5|closely
긴장|n|4|tension
길|n|1|road; way; directions
김|n|2|gim (dried seaweed sheet)
김밥|n|1|gimbap (seaweed rice roll)
김장|n|4|kimjang (making kimchi for winter)
꺼리다|v|5|to be reluctant; avoid
꼭|adv|1|surely; be sure to; tightly
꼭꼭|adv|3|tightly; firmly
끌다|v|3|to pull; draw (인기를 끌다 = to gain popularity)
끝|n|1|end; done
나누다|v|2|to share; divide; hand out|나눠,나눠요
나빠지다|v|3|to get worse
나오다|v|1|to come out
날|n|1|day
날씨|n|1|weather
남부|n|3|southern part; the south
낮|n|2|daytime
낮아지다|v|3|to become lower
낮추다|v|3|to lower
내리다|v|1|to get off; to fall (rain/snow)
내수|n|5|domestic demand
내일|n|1|tomorrow
넘다|v|2|to exceed; cross
넣다|v|1|to put in; add
네|int|1|yes
년|cnt|1|year
노인|n|3|elderly person; senior
논의|n|4|discussion
논의하다|v|4|to discuss
농가|n|5|farm household
농업|n|4|agriculture
높다|a|1|to be high
높이다|v|3|to raise; heighten
눈|n|1|snow; eye
눈사람|n|2|snowman
늘다|v|2|to increase; grow
늘리다|v|3|to increase (something); expand
늘어나다|v|3|to increase; grow in number
능력|n|3|ability; capability
다르다|a|1|to be different|달라요,달라
다섯|num|1|five
다시|adv|1|again
다음|n|1|next
단계|n|3|stage; step
단어|n|1|word; vocabulary
단체|n|3|group; organization
달|n|1|month; moon
달러|n|2|dollar
답하다|v|3|to answer; respond
당국|n|4|authorities
당근|n|2|carrot
당부하다|v|5|to urge; ask earnestly
대|cnt|2|counter for machines/vehicles; (age) -s, e.g. 이십 대 = one's twenties
대응|n|4|response; countermeasure
대중교통|n|3|public transportation
대통령|n|3|president
대폭|adv|5|substantially; drastically
대피하다|v|4|to evacuate; take shelter
대하다|v|3|(에 대해 / 에 대한) about; regarding|대한,대해,대해서
대학생|n|1|university student
더|adv|1|more
더위|n|3|heat; hot weather
데|n|3|place; (-는 데) in doing ~
도|cnt|2|degree(s)
도로|n|2|road
도시락|n|2|lunch box (dosirak)
도움|n|2|help
도전하다|v|3|to challenge; attempt
독자|n|5|independent; one's own (독자 기술 = homegrown technology)
돈|n|1|money
동안|n|1|during; for (a period)
동영상|n|2|video
동해상|n|5|East Sea area (동해 = East Sea)
되다|v|1|to become
두|det|1|two (before a counter)
두껍다|a|2|to be thick|두꺼운,두꺼워요,두꺼워
뒤|n|1|after; behind
드라마|n|1|TV drama series
드리다|v|2|to give (humble); (-어 드리다) to do for (polite)|드려서,드리겠습니다,드릴게요,드려요
드시다|v|2|to eat / drink (honorific)
들다|v|2|to cost (money/effort); to hold; (예를 들어) for example|든다고,든다,드는,든,듭니다
등|n|3|etc.; and so on
등산|n|2|hiking; mountain climbing
따뜻하다|a|1|to be warm
따르다|v|2|to follow (에 따르면 = according to; 이에 따라 = accordingly)|따라,따른,따라서
때|n|1|time; when ~
때문|n|2|because of; reason (때문에 / 때문이다)
떨어지다|v|2|to fall; drop
또|adv|1|again; also; another
또한|adv|3|also; in addition
라면|n|1|ramyeon (instant noodles)
로봇|n|2|robot
마을|n|2|village
마이클|prop|1|Michael (a name)
마치다|v|2|to finish
만|num|2|ten thousand
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
매일|adv|1|every day
맵다|a|1|to be spicy|매운,매워요,매워
먹다|v|1|to eat
먼저|adv|1|first; before
메뉴|n|1|menu
메시지|n|1|message
명|cnt|1|people (counter)
모두|n|1|everyone; all
모든|det|2|all; every
모르다|v|1|to not know|몰라도,몰라요,몰라,몰랐어요,모르는
목소리|n|2|voice
목표|n|3|goal; target
못하다|v|2|cannot (-지 못하다)
무기|n|4|weapon
무너지다|v|4|to collapse
무인|n|5|unmanned
문|n|1|door (문을 열다 = to open for business)
문제|n|2|problem
문화|n|2|culture
묻다|v|2|to ask|물을,물어요,물어,물었다,물어봐요
물|n|1|water
물가|n|3|prices; cost of living
물건|n|2|thing; belongings
미국|prop|1|the United States
미사일|n|3|missile
민수|prop|1|Minsu (a name)
바꾸다|v|1|to change; exchange|바꿔,바꿔요
바다|n|1|sea
바닷가|n|2|seaside; beach
바라다|v|2|to hope; wish (~기 바랍니다 = please ~)
바람|n|1|wind
바로|adv|2|right away; directly; right (there)
반갑다|a|1|to be glad (to meet)|반가워요,반가워,반갑습니다
반기다|v|4|to welcome; greet gladly
반도체|n|4|semiconductor
반발하다|v|5|to protest; push back
발|cnt|4|round (counter for shots, missiles)
발사|n|4|launch; firing
발사체|n|5|launch vehicle; rocket
발사하다|v|4|to launch; fire
발생하다|v|4|to occur; break out
발전하다|v|3|to develop; advance
발표하다|v|3|to announce
밝히다|v|3|to state; reveal; make clear
밤|n|1|night
밥|n|1|rice; meal
방|n|1|room
방문객|n|3|visitor
방문하다|v|3|to visit
방송되다|v|3|to be broadcast; air
방식|n|3|method; way
방안|n|5|measure; plan; way
방어적|n|5|defensive (방어적인 = defensive)
배|n|3|times (multiple); pear; ship; belly
배우다|v|1|to learn
배추|n|3|napa cabbage
백만|num|3|one million
버스|n|1|bus
번역|n|3|translation
번역하다|v|3|to translate
변화|n|3|change
병력|n|5|troops; military strength
보고하다|v|3|to report
보급|n|5|spread; adoption; supply
보내다|v|1|to send; spend (time)
보다|v|1|to see; watch; (-어 보다) try ~ing
보안|n|4|security (information, cyber)
보완하다|v|5|to supplement; make up for
보이다|v|2|to be seen; be visible|보여요,보여,보입니다
보통|adv|1|usually
복무|n|5|(military) service
복습하다|v|2|to review (study)
봄|n|1|spring (season)
봉투|n|2|bag; envelope
부담|n|4|burden
부산|prop|1|Busan
부족|n|3|shortage; lack
부족하다|a|3|to be lacking; insufficient
부족해지다|v|4|to become insufficient
부진하다|a|5|to be sluggish
부채|n|5|debt
북한|prop|1|North Korea
분석하다|v|4|to analyze
분야|n|3|field; area
불다|v|2|to blow (wind)
불편|n|3|inconvenience; discomfort
비|n|1|rain
비밀번호|n|2|password
비용|n|3|cost; expense
비자|n|2|visa
비판하다|v|4|to criticize
비행하다|v|3|to fly
사격|n|5|shooting; marksmanship
사람|n|1|person; people
사무실|n|1|office
사용|n|2|use; usage
사용하다|v|2|to use
사이버|n|3|cyber
사전|n|3|advance; beforehand (사전 투표 = early voting); dictionary
사정|n|4|situation; circumstances
사진|n|1|photo
살다|v|1|to live|사는,산다,삽니다,산
삼분|n|3|three parts (삼분의 일 = one third)
삼십|num|1|thirty
삼천|num|1|three thousand
상당수|n|5|a considerable number
상승|n|4|rise; increase
상승률|n|5|rate of increase (물가 상승률 = inflation rate)
상황|n|3|situation
새|det|1|new
새롭다|a|2|to be new|새로운,새로워요
생각|n|1|thought; opinion
생산량|n|5|production volume; output
서늘하다|a|4|to be cool (weather)
서비스|n|2|service
서울|prop|1|Seoul
서울시|prop|2|Seoul (city government)
선거|n|3|election
설명하다|v|2|to explain
설치하다|v|4|to install
성격|n|3|character; nature
성공|n|3|success
성공하다|v|3|to succeed
성장|n|4|growth
세|det|1|three (before a counter)
세계|n|2|world
센터|n|2|center
소금|n|2|salt
소음|n|4|noise
소행|n|5|(someone's) doing; act
수|n|2|number; (-ㄹ 수 있다) can
수준|n|3|level; standard
수천|num|3|thousands
수출|n|3|export(s)
수치|n|5|figure; numerical value
수칙|n|5|rules; guidelines
쉬다|v|1|to rest
스마트폰|n|1|smartphone
시|cnt|1|o'clock; hour
시간|n|1|time; hour(s)
시민|n|3|citizen
시설|n|4|facility
시작하다|v|1|to start
시장|n|3|market
시키다|v|2|to order (food); make someone do
시험|n|2|test; trial; exam
식당|n|1|restaurant
식량|n|4|food (supply)
식사|n|2|meal
식수|n|4|drinking water
신중하다|a|4|to be careful; prudent
실례하다|v|1|to be rude (실례합니다 = excuse me)
실시되다|v|4|to be carried out; held
실시하다|v|4|to conduct; carry out
십|num|1|ten
싶다|a|1|(-고 싶다) to want to
싸다|a|1|to be cheap
쓰다|v|1|to use; to write
쓰레기|n|2|trash; garbage
쓰레기통|n|2|trash can
아니다|a|1|to not be
아니요|int|1|no
아름답다|a|2|to be beautiful|아름다웠습니다,아름다운,아름다워요,아름다웠어요
아메리카노|n|1|americano (coffee)
아이|n|1|child
아이스|n|1|iced; ice
아주|adv|1|very
아직|adv|1|still; yet
아침|n|1|morning; breakfast
아파트|n|1|apartment
악성|n|5|malicious; malignant
안|adv|1|not
안내|n|3|guidance; information
안녕하세요|exp|1|hello
안보|n|4|(national) security
안전보장이사회|prop|5|(UN) Security Council
않다|v|1|not (after -지: -지 않다)
알려지다|v|3|to become known (것으로 알려졌다 = reportedly)
앞|n|1|front
앞으로|adv|2|in the future; from now on
앱|n|1|app
약|det|3|about; approximately
약하다|a|2|to be weak; vulnerable
얇다|a|3|to be thin
양국|n|4|both countries
양해|n|5|understanding (양해를 구하다 = to ask for understanding)
어느|det|1|which; some (어느 정도 = to some extent)
어디|pron|1|where
어떻게|adv|1|how
어서|adv|1|quickly (어서 오세요 = welcome)
어제|n|1|yesterday
억|num|2|hundred million (10억 = one billion)
얻다|v|2|to gain; obtain
얼마|n|1|how much (price)
얼마나|adv|1|how much; how long
업계|n|5|industry; the trade
없다|a|1|to not exist; not have
없이|adv|2|without
에어컨|n|1|air conditioner
여덟|num|1|eight
여름|n|1|summer
여섯|num|1|six
여성|n|3|woman; female
여전히|adv|3|still; as before
여행|n|1|trip; travel
여행하다|v|2|to travel
역|n|1|station
역사|n|2|history
연합|n|4|combined; allied; union
열다|v|1|to open
열두|num|1|twelve
열흘|n|3|ten days
영상|n|2|video; footage
영향|n|4|influence; effect
영화|n|1|movie
예|n|3|example (예를 들어 = for example); yes
예상하다|v|3|to expect; predict
예정|n|3|plan; schedule (-ㄹ 예정이다 = be scheduled to)
오늘|n|1|today
오다|v|1|to come; (rain/snow) to fall
오르다|v|2|to rise; go up|올라요,올라,올랐다,올랐습니다,올랐어요,오른
오른쪽|n|1|right (side)
오백|num|1|five hundred
오전|n|1|morning; a.m.
오후|n|1|afternoon; p.m.
올라가다|v|2|to go up; climb
올려놓다|v|4|to put on; place onto
올리다|v|2|to raise; put on top
올해|n|1|this year
옷|n|1|clothes
왜|adv|1|why
외국인|n|2|foreigner
왼쪽|n|1|left (side)
요금|n|2|fare; fee; charge
요리|n|1|cooking; dish
요즘|n|1|these days
우리|pron|1|we; our
우산|n|1|umbrella
우주|n|3|space; universe
운동|n|1|exercise
운영|n|4|operation; running
운전|n|2|driving
운전자|n|3|driver
원|cnt|1|won (Korean currency)
위|n|1|top; above; on
위하다|v|3|to be for (을 위해 / 을 위한 = for the sake of)
유권자|n|5|voter
유엔|prop|2|the UN
유지하다|v|4|to maintain; keep
유튜브|prop|1|YouTube
육군|n|4|army (ground forces)
은행|n|1|bank
음식|n|1|food
의견|n|3|opinion
의도|n|4|intention
의사|n|3|intention; will; doctor
이|det|1|this (이에 따라 = accordingly; 이로 인해 = because of this)
이거|pron|1|this (thing)
이동|n|3|movement
이런|det|2|this kind of; such
이름|n|1|name
이메일|n|1|email
이번|n|2|this (time); this coming
이상|n|2|above; (이상입니다) that is all
이십|num|1|twenty
이십삼|num|1|twenty-three
이용하다|v|2|to use; make use of
이제|adv|2|now
이천|num|1|two thousand
인|cnt|3|person (counter, e.g. 1인 = one person)
인공위성|n|4|artificial satellite
인기|n|2|popularity
인도적|n|5|humanitarian
인력|n|4|personnel; manpower
인사말|n|3|greeting
인상|n|4|increase (price/fare hike); impression
인원|n|4|personnel; number of people
인하다|v|5|to be caused (로 인해 = due to)
일|n|1|one; work; thing; matter; day
일본|prop|1|Japan
일부|n|3|some; part
일어나다|v|1|to get up; happen
일정|n|3|schedule
읽다|v|1|to read
임기|n|5|term of office
임무|n|4|mission; duty
입다|v|1|to wear (clothes)
입대하다|v|4|to enlist (in the military)
있다|v|1|to exist; to have; (-고 있다) be ~ing
자기소개|n|1|self-introduction
자다|v|1|to sleep
자라다|v|2|to grow (up)
자르다|v|2|to cut|잘라요,잘라
자연스럽다|a|3|to be natural|자연스러운,자연스러워요
자주|adv|1|often
자체|n|4|itself; one's own
작년|n|2|last year
작다|a|1|to be small
작동하다|v|4|to operate; work (machine)
잔|cnt|1|cup; glass (counter)
잘|adv|1|well
잠|n|1|sleep
잠기다|v|4|to be submerged; to be locked
잠시만|adv|2|just a moment
장거리|n|4|long distance
장기적|n|5|long-term (장기적으로 = in the long run)
장병|n|5|soldiers; service members
장비|n|4|equipment
재배하다|v|5|to cultivate; grow (crops)
저|pron|1|I; me (humble)
저기|pron|1|over there
저녁|n|1|evening; dinner
저출산|n|4|low birth rate
적응하다|v|4|to adapt
전|n|1|before (-기 전에 = before ~ing)
전국|n|3|nationwide; the whole country
전기차|n|4|electric vehicle
전문가|n|3|expert
전체|n|3|whole; entire; all
절차|n|4|procedure
점검|n|4|inspection; check
정도|n|2|degree; about (2년 정도 = about two years)
정례|n|5|regular; routine
정리하다|v|3|to tidy up; clear; sort out
정말|adv|1|really
정보|n|3|information; intelligence
정부|n|3|government
정상|n|3|summit; top; head of state
정상회담|n|4|summit meeting
정찰기|n|5|reconnaissance aircraft (무인 정찰기 = drone)
정책|n|4|policy
정확하다|a|3|to be accurate
정확히|adv|3|exactly; precisely
제|pron|1|my (humble)
제도|n|3|system; institution
제안|n|3|proposal; offer
제주도|prop|1|Jeju Island
조금|adv|1|a little
조사|n|3|survey; investigation
조언하다|v|3|to advise
조직|n|4|organization; group
좋다|a|1|to be good; nice
좋아지다|v|2|to get better; improve
좋아하다|v|1|to like
죄송하다|a|1|to be sorry
주다|v|1|to give; (-어 주다) do for someone|줄
주로|adv|2|mainly; mostly
주말|n|1|weekend
주문하다|v|1|to order
주민|n|3|resident
주의|n|3|caution; attention
주인|n|2|owner
주인공|n|3|main character
주차장|n|2|parking lot
준비하다|v|2|to prepare
줄다|v|3|to decrease; shrink
줄어들다|v|3|to decrease; shrink
중국|prop|1|China
중심|n|3|center (중심으로 = centered on; led by)
중요하다|a|2|to be important
즐거워지다|v|3|to become enjoyable
증가하다|v|3|to increase
지|n|3|since (-ㄴ 지 = since doing)
지금|n|1|now
지나가다|v|2|to pass (by)
지난|det|2|last; past
지난해|n|3|last year
지방|n|3|region; province
지역|n|3|region; local area
지원|n|3|support; aid
지적되다|v|5|to be pointed out
지켜보다|v|3|to watch; observe
지키다|v|2|to keep; protect; follow (rules)
지하철|n|1|subway
지하철역|n|1|subway station
직원|n|2|employee; staff
진짜|adv|1|really; truly
집|n|1|house; home
짓다|v|2|to build; make|지을,지어요,지었다,지어,짓는
찍다|v|1|to take (a photo)
차량|n|3|vehicle
참가하다|v|3|to participate
참기름|n|3|sesame oil
참여|n|3|participation
찾다|v|1|to look for; to visit (a place)
채소|n|2|vegetable
챙기다|v|2|to take; pack; look after
처음|n|2|first time; beginning (처음으로 = for the first time)
첨단|n|4|cutting-edge; advanced
첫날|n|2|first day
첫눈|n|2|first snow (of the season)
청년|n|3|young people; youth
체계|n|4|system
총재|n|5|governor (of a central bank)
촬영지|n|4|filming location
최고|n|2|highest; best
최근|n|3|recently; recent
춥다|a|1|to be cold|추워요,추워,추운,추웠어요,추웠다
충분하다|a|3|to be sufficient
충전|n|4|charging
충전기|n|4|charger
충전소|n|4|charging station
취미|n|1|hobby
치킨|n|1|fried chicken
친구|n|1|friend
칠십|num|1|seventy
카드|n|1|card
카페|n|1|café
커지다|v|3|to grow bigger
커피|n|1|coffee
크기|n|3|size
크다|a|1|to be big
킬로미터|cnt|2|kilometer
타다|v|1|to ride; take (transport)
탄도미사일|n|5|ballistic missile
탐사|n|5|exploration
태풍|n|3|typhoon
통계|n|4|statistics
통역|n|3|interpretation; interpreter
통일부|prop|4|Ministry of Unification
퇴근하다|v|2|to leave work
투입하다|v|5|to deploy; put in
투표|n|3|vote; voting
투표율|n|4|voter turnout
특히|adv|2|especially
판단하다|v|4|to judge
판매|n|3|sales
팔리다|v|2|to be sold; sell
퍼뜨리다|v|5|to spread
퍼센트|n|2|percent
펴다|v|3|to spread; unfold
편의점|n|1|convenience store
평가하다|v|4|to evaluate; assess
평균|n|3|average
품종|n|5|variety; breed (of crop)
프랑스|prop|1|France
프로그램|n|2|program
피해|n|3|damage
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
한국은행|prop|3|Bank of Korea
한라산|prop|3|Hallasan (mountain on Jeju)
할인|n|2|discount
함께|adv|2|together
합동참모본부|prop|5|Joint Chiefs of Staff (JCS)
합의하다|v|4|to agree; reach an agreement
항상|adv|2|always
해군|n|4|navy
해외|n|3|overseas
해커|n|4|hacker
햄|n|1|ham
현재|n|3|present; current
협력|n|4|cooperation
혜택|n|4|benefit
호선|cnt|2|subway line number (2호선 = Line 2)
호텔|n|1|hotel
혼밥|n|3|eating alone (honbap)
혼자|adv|1|alone
홍수|n|3|flood
확대하다|v|4|to expand
활용하다|v|4|to make use of
회담|n|4|talks; meeting
회복세|n|5|recovery trend
회사|n|1|company
후|n|2|after (-ㄴ 후 = after ~ing)
훈련|n|3|training; (military) exercise
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
