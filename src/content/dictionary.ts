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
가게|n|1|store; shop
가격|n|2|price
가계|n|4|household (finances) (가계 부채 = household debt)
가구|n|3|household; furniture
가까이|adv|3|nearly; close by
가능성|n|3|possibility
가다|v|1|to go
가뭄|n|4|drought
가방|n|1|bag
가볍다|a|2|to be light (in weight or degree)|가벼운,가볍다며,가벼워
가운데|n|3|among; the middle
가장|adv|2|most
가전제품|n|4|home appliance
가정|n|3|household; home
가져가다|v|2|to take (with you)
가족|n|1|family
가지다|v|1|to have; to hold (회담을 가지다 = to hold talks)|가졌습니다,가졌다,가져요
가해|n|5|harm done to others (가해 학생 = student who bullies)
간단하다|a|2|to be simple
간소화되다|v|5|to be simplified
간소화하다|v|5|to simplify
갈라지다|v|4|to crack; to split
갈아타다|v|2|to transfer (vehicles)
감사하다|v|1|to thank (감사합니다 = thank you)
감시|n|4|surveillance; monitoring
강남|prop|1|Gangnam (district in Seoul)
강남역|prop|1|Gangnam Station
강력히|adv|4|strongly; firmly
강원도|prop|3|Gangwon Province
강조하다|v|4|to emphasize; stress
강진|n|5|strong earthquake
강하다|a|2|to be strong; resistant
강화하다|v|4|to strengthen; reinforce
갖추다|v|3|to have; be equipped with
같다|a|2|to be the same; like (~와 같은 = such as)
같이|adv|1|together
개|cnt|1|counter for things
개발|n|3|development
개발하다|v|3|to develop
개인|n|3|individual; person
개통되다|v|4|to open (a new line or road)
객차|n|5|passenger car (train)
걱정하다|v|2|to worry
건강|n|2|health
건강보험공단|n|5|National Health Insurance Service
건너다|v|2|to cross
건널목|n|4|crosswalk; railroad crossing
건물|n|2|building
건설|n|3|construction
걸리다|v|2|to take (time); to be caught
검거|n|5|arrest; roundup (검거 작전 = arrest operation)
검거하다|v|5|to arrest; to round up
검다|a|2|to be black|검은
검사|n|3|test; examination; prosecutor
검진|n|4|medical checkup (건강 검진)
검찰|n|4|prosecutors; the prosecution
검토|n|4|review; examination
검토하다|v|4|to review; examine
것|n|1|thing; (turns a clause into a noun)
겨냥하다|v|5|to target; aim at
겪다|v|3|to experience; go through
결과|n|3|result (조사 결과 = investigation result)
결식아동|n|5|undernourished child (child going without meals)
결정하다|v|3|to decide
경계|n|4|vigilance; guard duty; boundary
경고|n|4|warning (경고 사격 = warning shots)
경고하다|v|4|to warn
경기|n|3|the economy (business conditions); game; match
경보|n|4|alert; warning (alarm)
경영|n|4|management; running a business
경쟁률|n|5|competition rate (입시 경쟁률 = admission competition ratio)
경제|n|3|economy
경찰|n|2|police
경치|n|3|scenery; view
경험하다|v|3|to experience
계곡|n|4|valley; mountain stream
계란|n|1|egg
계산하다|v|2|to pay; to calculate
계속|adv|2|continuously; keep (doing)
계속되다|v|3|to continue
계속하다|v|2|to continue (doing)
계절|n|2|season
계획|n|2|plan
고객|n|3|customer; passenger
고등학교|n|2|high school
고령|n|5|advanced age; elderly
고발|n|5|accusation; whistleblowing (reporting to authorities)
고아원|n|4|orphanage
고액|n|5|large sum; high-priced
고치다|v|2|to fix; repair
고학력|n|5|highly educated (고학력 실업자 = educated unemployed)
곡물|n|5|grain
곧|adv|2|soon
곳|n|2|place; (counter) places
곳곳|n|4|everywhere; here and there
공개하다|v|4|to make public; to release
공격|n|4|attack
공공기관|n|4|public institution
공공장소|n|4|public place
공교육|n|5|public education
공군|n|4|air force
공급하다|v|4|to supply
공동|n|3|joint; common
공무원|n|3|civil servant
공부|n|1|study
공부하다|v|1|to study
공사|n|4|construction work
공원|n|1|park
공유하다|v|4|to share
공장|n|2|factory
공직자|n|5|public official
공항|n|2|airport
공휴일|n|3|public holiday
과수원|n|4|orchard
과외|n|4|private tutoring
관계|n|2|relationship; relations
관광객|n|3|tourist
관광명소|n|4|tourist attraction
관광비자|n|4|tourist visa
관리비|n|4|maintenance fee
관심|n|2|interest
괜찮다|a|1|to be okay; fine
괴롭힘|n|4|bullying; harassment (집단 괴롭힘 = group bullying)
괴한|n|5|unidentified man; assailant
교권|n|5|teachers' rights and authority
교류|n|4|exchange (of people, culture)
교사|n|3|teacher
교육|n|3|education
교육부|n|4|Ministry of Education
교육열|n|5|passion for education
교육청|n|5|(local) education office
교통|n|2|traffic; transportation
교통사고|n|3|traffic accident
구간|n|4|section (of a route)
구속영장|n|5|arrest warrant
구십|num|2|ninety
구조|n|4|rescue; structure
구조대|n|4|rescue team
구조되다|v|4|to be rescued
구토|n|4|vomiting
구하다|v|3|to seek; ask for (양해를 구하다 = to ask for understanding)
국가|n|3|country; nation; state
국가안전보장회의|prop|5|National Security Council (NSC)
국내|n|3|domestic; within the country
국방부|prop|3|Ministry of National Defense
국제기구|n|5|international organization
국회|n|3|National Assembly
국회의원|n|3|member of the National Assembly
군|n|3|the military; armed forces
군대|n|2|army; military
군사분계선|n|5|Military Demarcation Line (MDL)
군용|n|5|military-use
궤도|n|5|orbit; track
귀금속|n|5|precious metals; jewelry
규모|n|4|scale; size; magnitude
규탄하다|v|5|to condemn
그|det|1|that; he
그걸로|exp|2|with that one (그것으로)
그대로|adv|3|as it is; just like that
그동안|adv|3|all this time; meanwhile
그래도|adv|3|even so; still
그래야|adv|3|only then; that way
그러나|adv|2|however
그럼|adv|2|then; in that case
그리고|adv|1|and; and then
그림|n|1|picture; drawing
금강산|prop|4|Mount Kumgang (in North Korea)
금방|adv|2|soon; right away
급식|n|4|school meals; meal service
급증하다|v|5|to surge; to increase sharply
긍정적|n|4|positive (긍정적인 = positive ~)
기간|n|3|period; duration
기능|n|3|feature; function
기다리다|v|1|to wait
기대하다|v|3|to expect; look forward to
기록하다|v|3|to record
기름지다|a|4|to be greasy; fatty
기본|n|2|basic; base
기부하다|v|4|to donate
기쁘다|a|2|to be glad; happy|기뻐요,기뻐,기뻤어요,기쁜
기상|n|4|weather (기상 악화 = bad weather)
기상청|prop|4|Korea Meteorological Administration
기술|n|3|technology; skill
기억하다|v|2|to remember
기업|n|3|company; business
기온|n|3|temperature (weather)
기자회견|n|4|press conference
기준금리|n|5|base interest rate
기증|n|5|donation (장기 기증 = organ donation)
기한|n|4|deadline; time limit (유통 기한 = expiration date)
기후|n|4|climate
긴급|n|4|emergency; urgent
긴급히|adv|4|urgently
긴밀히|adv|5|closely
긴장|n|4|tension
길|n|1|road; way; directions
길어지다|v|3|to get longer; to drag on
김|n|2|gim (dried seaweed sheet)
김밥|n|1|gimbap (seaweed rice roll)
김장|n|4|kimjang (making kimchi for winter)
꺼리다|v|5|to be reluctant; avoid
꼭|adv|1|surely; be sure to; tightly
꼭꼭|adv|3|tightly; firmly
꼼꼼하다|a|4|to be meticulous
꼽다|v|4|to cite; to count among
꾸준히|adv|3|steadily; consistently
끊기다|v|4|to be cut off (연락이 끊기다 = to lose touch)|끊겼던,끊겼다
끌다|v|3|to pull; draw (인기를 끌다 = to gain popularity)
끝|n|1|end; done
끝나다|v|1|to end; to finish
나누다|v|2|to share; divide; hand out|나눠,나눠요
나다|v|2|to break out; to occur (불이 나다 = a fire breaks out)|나,났다,났습니다
나머지|n|3|the rest
나빠지다|v|3|to get worse
나서다|v|4|to step forward; to set out (수사에 나서다 = to open an investigation)|나섰습니다,나섰다
나오다|v|1|to come out
나타나다|v|3|to appear; to show (in results)|나타났습니다,나타났다
날|n|1|day
날씨|n|1|weather
남|n|3|others; other people (남을 돕다 = to help others)
남부|n|3|southern part; the south
남북|n|4|North and South (Korea); inter-Korean
남성|n|3|man; male
남자|n|1|man
남해|prop|3|South Sea (off Korea's south coast)
납치하다|v|5|to abduct; to kidnap
낮|n|2|daytime
낮아지다|v|3|to become lower
낮추다|v|3|to lower
내다|v|2|to cause (사고를 내다 = to cause an accident); to pay
내다보다|v|4|to predict; to look out|내다봤습니다,내다봤다
내려지다|v|4|to be issued (경보가 내려지다 = an alert is issued)|내려졌습니다,내려졌다
내륙|n|5|inland
내리다|v|1|to get off; to fall (rain/snow)
내부|n|4|inside; internal
내수|n|5|domestic demand
내일|n|1|tomorrow
너무|adv|1|too; very
넉넉하다|a|4|to be ample; roomy
넘다|v|2|to exceed; cross
넣다|v|1|to put in; add
네|int|1|yes
년|cnt|1|year
년째|cnt|3|for ~ years now (몇 년째 = for several years)
노력|n|3|effort
노력하다|v|3|to make an effort; to try hard
노선|n|4|route; line (subway, bus)
노숙자|n|5|homeless person
노약자|n|5|the elderly and infirm
노인|n|3|elderly person; senior
노조|n|5|labor union
논의|n|4|discussion
논의하다|v|4|to discuss
농가|n|5|farm household
농경지|n|5|farmland
농업|n|4|agriculture
농장|n|3|farm (주말 농장 = weekend farm)
높다|a|1|to be high
높이다|v|3|to raise; heighten
뇌물|n|5|bribe
누명|n|5|false accusation (누명을 쓰다 = to be falsely accused)
눈|n|1|snow; eye
눈물|n|2|tears (눈물을 흘리다 = to shed tears)
눈사람|n|2|snowman
늘다|v|2|to increase; grow
늘리다|v|3|to increase (something); expand
늘어나다|v|3|to increase; grow in number
능력|n|3|ability; capability
다르다|a|1|to be different|달라요,달라
다리|n|1|leg; bridge
다섯|num|1|five
다시|adv|1|again
다음|n|1|next
다치다|v|2|to get hurt|다쳤습니다,다쳤지만,다쳤다
다행히|adv|3|fortunately
단계|n|3|stage; step
단속|n|5|crackdown (특별 단속 = special crackdown)
단속하다|v|5|to crack down on
단어|n|1|word; vocabulary
단점|n|3|weak point; drawback
단체|n|3|group; organization
단풍|n|3|autumn foliage
달|n|1|month; moon
달러|n|2|dollar
달아나다|v|4|to flee; to run away|달아났습니다,달아났다
답하다|v|3|to answer; respond
당국|n|4|authorities
당근|n|2|carrot
당뇨병|n|4|diabetes
당부하다|v|5|to urge; ask earnestly
당하다|v|3|to suffer; to undergo (소매치기를 당하다 = to be pickpocketed)
대|cnt|2|counter for machines/vehicles; (age) -s, e.g. 이십 대 = one's twenties
대가|n|4|price; compensation (~의 대가로 = in exchange for)
대기오염|n|4|air pollution
대낮|n|4|broad daylight
대비하다|v|4|to prepare for
대사관|n|3|embassy
대상|n|4|target; those eligible
대응|n|4|response; countermeasure
대중교통|n|3|public transportation
대책|n|4|(counter)measure
대통령|n|3|president
대폭|adv|5|substantially; drastically
대피하다|v|4|to evacuate; take shelter
대하다|v|3|(에 대해 / 에 대한) about; regarding|대한,대해,대해서
대학|n|2|university; college
대학생|n|1|university student
대학원|n|3|graduate school
더|adv|1|more
더위|n|3|heat; hot weather
데|n|3|place; (-는 데) in doing ~
도|cnt|2|degree(s)
도난|n|5|theft (도난 사건 = theft case)
도로|n|2|road
도발|n|5|provocation
도시락|n|2|lunch box (dosirak)
도심|n|4|downtown; city center
도움|n|2|help
도전하다|v|3|to challenge; attempt
독자|n|5|independent; one's own (독자 기술 = homegrown technology)
돈|n|1|money
돌아가다|v|2|to go back; to return|돌아갔습니다,돌아갔다
돕다|v|2|to help|돕기,도와,도왔다
동생|n|1|younger sibling
동안|n|1|during; for (a period)
동영상|n|2|video
동해상|n|5|East Sea area (동해 = East Sea)
되다|v|1|to become
두|det|1|two (before a counter)
두껍다|a|2|to be thick|두꺼운,두꺼워요,두꺼워
두통|n|3|headache
뒤|n|1|after; behind
드라마|n|1|TV drama series
드러나다|v|4|to be revealed; to emerge|드러났습니다,드러났다
드리다|v|2|to give (humble); (-어 드리다) to do for (polite)|드려서,드리겠습니다,드릴게요,드려요
드시다|v|2|to eat / drink (honorific)
들다|v|2|to cost (money/effort); to hold; (예를 들어) for example|든다고,든다,드는,든,듭니다
들여오다|v|4|to bring in; to import|들여온,들여왔다
등|n|3|etc.; and so on
등산|n|2|hiking; mountain climbing
등산객|n|4|hiker
따다|v|3|to pick (fruit)
따뜻하다|a|1|to be warm
따르다|v|2|to follow (에 따르면 = according to; 이에 따라 = accordingly)|따라,따른,따라서
때|n|1|time; when ~
때문|n|2|because of; reason (때문에 / 때문이다)
떠나다|v|2|to leave (세상을 떠나다 = to pass away)|떠났습니다,떠났다
떠내려가다|v|5|to be swept away
떨어지다|v|2|to fall; drop
또|adv|1|again; also; another
또한|adv|3|also; in addition
라면|n|1|ramyeon (instant noodles)
로봇|n|2|robot
마감|n|4|deadline (마감 시간 = deadline)
마련하다|v|4|to prepare; to arrange
마스크|n|2|mask
마시다|v|1|to drink
마약|n|4|drugs; narcotics
마을|n|2|village
마음|n|2|heart; mind (마음에 들다 = to like)
마이클|prop|1|Michael (a name)
마치다|v|2|to finish
막다|v|3|to block; to prevent
만|num|2|ten thousand
만나다|v|1|to meet
만들다|v|1|to make
많다|a|1|to be many; a lot
많아지다|v|2|to become many; increase
많이|adv|1|a lot; much
말다|v|2|(-지 말다) don't; to roll (up)|말라고
말씀하다|v|2|to speak (honorific)
말하다|v|1|to say; speak
맑다|a|2|to be clear (sky)
맛|n|1|taste; flavor
맛보다|v|2|to taste; try (food)
맛있다|a|1|to be delicious
맞다|v|2|to be right; to greet; to welcome (~을 맞아 = on the occasion of)|맞아
맞벌이|n|4|dual income (맞벌이 부부 = dual-income couple)
맡기다|v|3|to entrust; to assign
맡다|v|3|to take charge of
매매|n|5|buying and selling; trade (장기 매매 = organ trafficking)
매우|adv|2|very
매일|adv|1|every day
맵다|a|1|to be spicy|매운,매워요,매워
먹다|v|1|to eat
먼저|adv|1|first; before
메뉴|n|1|menu
메시지|n|1|message
면허|n|4|license (운전 면허 = driver's license)
명|cnt|1|people (counter)
명단|n|4|list of names
명문|n|5|prestigious (명문 대학 = top university)
명예퇴직|n|5|voluntary early retirement
몇|det|1|how many; several
모금|n|5|fundraising
모금되다|v|5|to be raised (funds)
모두|n|1|everyone; all
모든|det|2|all; every
모르다|v|1|to not know|몰라도,몰라요,몰라,몰랐어요,모르는
모으다|v|3|to collect; to gather|모아,모았다
모자|n|2|hat; cap
목격자|n|5|witness
목격하다|v|5|to witness
목소리|n|2|voice
목표|n|3|goal; target
몰래|adv|4|secretly
몰리다|v|4|to flock; to crowd
못하다|v|2|cannot (-지 못하다)
무기|n|4|weapon
무너지다|v|4|to collapse
무료|n|2|free of charge
무사히|adv|4|safely; without incident
무엇|pron|1|what
무인|n|5|unmanned
문|n|1|door (문을 열다 = to open for business)
문제|n|2|problem
문화|n|2|culture
묻다|v|2|to ask|물어요,물어,물었다,물어봐요
물|n|1|water
물가|n|3|prices; cost of living
물건|n|2|thing; belongings
물론|adv|3|of course
미국|prop|1|the United States
미끄러지다|v|3|to slip; to skid
미사일|n|3|missile
미세먼지|n|4|fine dust (particulate pollution)
민방위|n|5|civil defense (민방위 훈련 = civil defense drill)
민수|prop|1|Minsu (a name)
밀수|n|5|smuggling
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
받다|v|1|to receive; to get (치료를 받다 = to receive treatment)
받아들이다|v|4|to accept|받아들이기
발|cnt|4|round (counter for shots, missiles)
발급받다|v|4|to be issued (a document)|발급받으셔야
발사|n|4|launch; firing
발사체|n|5|launch vehicle; rocket
발사하다|v|4|to launch; fire
발생하다|v|4|to occur; break out
발전하다|v|3|to develop; advance
발표하다|v|3|to announce
밝혀지다|v|4|to be revealed; to turn out|밝혀졌습니다,밝혀졌다
밝히다|v|3|to state; reveal; make clear
밤|n|1|night
밤새|adv|3|all night
밥|n|1|rice; meal
방|n|1|room
방문객|n|3|visitor
방문하다|v|3|to visit
방송|n|3|broadcast
방송되다|v|3|to be broadcast; air
방식|n|3|method; way
방안|n|5|measure; plan; way
방어적|n|5|defensive (방어적인 = defensive)
방지|n|5|prevention (재발 방지 = preventing a recurrence)
방화|n|5|arson
배|n|3|times (multiple); pear; ship; belly
배상|n|5|compensation (손해 배상 = compensation for damages)
배우다|v|1|to learn
배추|n|3|napa cabbage
배치하다|v|5|to deploy; to station
배회하다|v|5|to loiter; to wander about
백만|num|3|one million
백여|num|3|about a hundred; a hundred-odd
백팔십|num|3|one hundred eighty
버스|n|1|bus
번|cnt|1|time(s) (한 번 = once)
번역|n|3|translation
번역하다|v|3|to translate
벌이다|v|4|to carry out; to launch (an activity)
범인|n|4|culprit; criminal
범죄|n|4|crime
범행|n|5|crime; criminal act
법|n|3|law
법원|n|4|court (of law)
변화|n|3|change
병력|n|5|troops; military strength
병원|n|1|hospital
보건|n|4|health (보건 당국 = health authorities)
보고하다|v|3|to report
보급|n|5|spread; adoption; supply
보내다|v|1|to send; spend (time)
보다|v|1|to see; watch; (-어 보다) try ~ing
보안|n|4|security (information, cyber)
보완하다|v|5|to supplement; make up for
보이다|v|2|to be seen; be visible|보여요,보여,보입니다
보통|adv|1|usually
복구|n|5|restoration; recovery (피해 복구 = damage recovery)
복무|n|5|(military) service
복습하다|v|2|to review (study)
복용하다|v|5|to take (medicine)
복지|n|4|welfare
복통|n|4|stomachache
봄|n|1|spring (season)
봉사|n|4|service; volunteering
봉투|n|2|bag; envelope
부담|n|4|burden
부대|n|4|(military) unit
부모|n|2|parents
부부|n|3|married couple
부산|prop|1|Busan
부상|n|4|injury (부상을 당하다 = to be injured)
부작용|n|4|side effect
부정행위|n|5|misconduct; wrongdoing
부족|n|3|shortage; lack
부족하다|a|3|to be lacking; insufficient
부족해지다|v|4|to become insufficient
부진하다|a|5|to be sluggish
부채|n|5|debt
부탁하다|v|2|to ask (a favor); to request
북한|prop|1|North Korea
북한군|n|4|North Korean military
분|cnt|1|minute(s); (honorific) person
분석하다|v|4|to analyze
분실|n|4|loss (분실 신고 = lost-item report)
분야|n|3|field; area
불|n|1|fire (불이 나다 = a fire breaks out; 불을 지르다 = to set fire)
불다|v|2|to blow (wind)
불법|n|4|illegal (불법 체류자 = illegal immigrant)
불우|n|5|needy (불우 이웃 = neighbors in need)
불편|n|3|inconvenience; discomfort
불편하다|a|2|to be uncomfortable; inconvenient (어디가 불편하세요? = what's bothering you?)
불황|n|5|recession; slump
붐비다|v|3|to be crowded|붐볐습니다,붐볐다
붕괴되다|v|5|to collapse
붙잡다|v|3|to catch; to seize
붙잡히다|v|4|to be caught|붙잡혔습니다,붙잡혔다
블랙박스|n|4|dashcam (car black box)
비|n|1|rain
비리|n|5|corruption; irregularities
비만아|n|5|obese child
비무장지대|n|5|Demilitarized Zone (DMZ)
비밀번호|n|2|password
비용|n|3|cost; expense
비자|n|2|visa
비축|n|5|stockpile; reserve
비판하다|v|4|to criticize
비행기|n|1|airplane
비행하다|v|3|to fly
빙판길|n|5|icy road
빚|n|4|debt
뺑소니|n|5|hit-and-run
사건|n|3|incident; case
사격|n|5|shooting; marksmanship
사고|n|2|accident
사과|n|1|apple; apology
사교육|n|5|private education (tutoring)
사교육비|n|5|private education costs
사다|v|1|to buy|사
사람|n|1|person; people
사망자|n|4|fatality; the dead
사무실|n|1|office
사업|n|3|business; project
사용|n|2|use; usage
사용하다|v|2|to use
사이버|n|3|cyber
사전|n|3|advance; beforehand (사전 투표 = early voting); dictionary
사정|n|4|situation; circumstances
사진|n|1|photo
사회|n|3|society
사흘|n|3|three days
살다|v|1|to live|사는,산다,삽니다,산
살아오다|v|3|to have lived (until now)|살아왔습니다
삼|num|1|three
삼분|n|3|three parts (삼분의 일 = one third)
삼십|num|1|thirty
삼천|num|1|three thousand
상담|n|4|counseling; consultation
상당수|n|5|a considerable number
상봉|n|5|reunion (이산가족 상봉 = separated-family reunion)
상승|n|4|rise; increase
상승률|n|5|rate of increase (물가 상승률 = inflation rate)
상점|n|3|store; shop
상태|n|3|condition; state
상황|n|3|situation
새|det|1|new
새롭다|a|2|to be new|새로운,새로워요
새벽|n|2|early morning; dawn
생각|n|1|thought; opinion
생기다|v|2|to occur; to come about
생명|n|3|life (생명에 지장이 없다 = not life-threatening)
생사|n|5|life or death (생사가 확인되지 않다 = fate unknown)
생산량|n|5|production volume; output
생존자|n|5|survivor
생필품|n|5|daily necessities
생활비|n|3|living expenses
서늘하다|a|4|to be cool (weather)
서로|adv|2|each other
서비스|n|2|service
서울|prop|1|Seoul
서울시|prop|2|Seoul (city government)
석|num|3|three (석 달 = three months)
선거|n|3|election
선고하다|v|5|to sentence; to pronounce (a verdict)
선로|n|5|railway track
선택|n|3|choice
설득하다|v|4|to persuade
설명하다|v|2|to explain
설사|n|4|diarrhea
설악산|prop|3|Seoraksan (mountain)
설치하다|v|4|to install
성격|n|3|character; nature
성공|n|3|success
성공하다|v|3|to succeed
성수기|n|5|peak season
성장|n|4|growth
성적|n|3|grades; results
성행하다|v|5|to be widespread; prevalent
세|det|1|three (before a counter)
세계|n|2|world
세상|n|3|world (세상을 떠나다 = to pass away)
센터|n|2|center
소금|n|2|salt
소득|n|4|income
소매치기|n|4|pickpocket; pickpocketing
소방|n|4|firefighting (소방 당국 = fire authorities)
소비자|n|4|consumer
소음|n|4|noise
소행|n|5|(someone's) doing; act
속|n|2|inside; in
속이다|v|4|to deceive; to trick|속여
손해|n|4|damage; loss (손해 배상 = compensation for damages)
수|n|2|number; (-ㄹ 수 있다) can
수도권|n|4|capital area (greater Seoul)
수백만|num|4|several million
수사|n|5|(criminal) investigation
수상하다|a|4|to be suspicious
수색|n|5|search (operation)
수송하다|v|5|to transport
수십|num|3|dozens; tens of
수억|num|5|hundreds of millions
수준|n|3|level; standard
수천|num|3|thousands
수출|n|3|export(s)
수치|n|5|figure; numerical value
수칙|n|5|rules; guidelines
수해|n|5|flood damage
숙박|n|4|lodging
순식간|n|4|an instant (순식간에 = in an instant)
숨기다|v|3|to hide|숨겨,숨겼다
숨지다|v|5|to die (in news) (숨지게 하다 = to kill)
쉬다|v|1|to rest
스마트폰|n|1|smartphone
스무|num|2|twenty (before counters)
스스로|adv|3|by oneself; voluntarily
습도|n|4|humidity
승객|n|3|passenger
시|cnt|1|o'clock; hour
시간|n|1|time; hour(s)
시내버스|n|3|city bus
시민|n|3|citizen
시설|n|4|facility
시작되다|v|2|to begin
시작하다|v|1|to start
시장|n|3|market
시키다|v|2|to order (food); make someone do
시행하다|v|5|to enforce; to implement
시험|n|2|test; trial; exam
식당|n|1|restaurant
식량|n|4|food (supply)
식사|n|2|meal
식수|n|4|drinking water
식중독|n|5|food poisoning
식후|n|3|after a meal
신고|n|4|report (to the authorities)
신고하다|v|4|to report (to the police)
신도시|n|4|new town (planned suburb)
신분증|n|3|ID card
신장|n|5|kidney; height
신중하다|a|4|to be careful; prudent
신청자|n|4|applicant
신청하다|v|3|to apply for; to request
실례하다|v|1|to be rude (실례합니다 = excuse me)
실시되다|v|4|to be carried out; held
실시하다|v|4|to conduct; carry out
실업자|n|4|unemployed person
실제|n|3|actual; reality
실종자|n|5|missing person
심각하다|a|4|to be serious
심리적|n|5|psychological
심장|n|4|heart (organ)
심하다|a|2|to be severe; bad
심해지다|v|3|to get worse
십|num|1|ten
십만|num|2|one hundred thousand
싶다|a|1|(-고 싶다) to want to
싸다|a|1|to be cheap
쏘다|v|3|to shoot; to fire
쓰다|v|1|to use; to write; to wear (a hat, mask) (누명을 쓰다 = to be falsely accused)
쓰레기|n|2|trash; garbage
쓰레기통|n|2|trash can
쓰이다|v|3|to be used
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
악화|n|5|worsening (기상 악화 = deteriorating weather)
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
야외|n|4|outdoors
약|det|3|about; approximately
약하다|a|2|to be weak; vulnerable
약해지다|v|3|to weaken
얇다|a|3|to be thin
양국|n|4|both countries
양해|n|5|understanding (양해를 구하다 = to ask for understanding)
어느|det|1|which; some (어느 정도 = to some extent)
어디|pron|1|where
어떤|det|2|what kind of; which
어떻게|adv|1|how
어려움|n|3|difficulty
어렵다|a|2|to be difficult|어려워,어렵다는,어려운
어린이|n|1|child
어색하다|a|3|to be awkward
어서|adv|1|quickly (어서 오세요 = welcome)
어제|n|1|yesterday
어젯밤|n|2|last night
억|num|2|hundred million (10억 = one billion)
언제|pron|1|when
얻다|v|2|to gain; obtain
얼마|n|1|how much (price)
얼마나|adv|1|how much; how long
업계|n|5|industry; the trade
업체|n|4|company; contractor
없다|a|1|to not exist; not have
없애다|v|3|to get rid of; to destroy
없어지다|v|2|to disappear; to go missing|없어졌어요,없어졌다
없이|adv|2|without
에어컨|n|1|air conditioner
여객선|n|4|passenger ship; ferry
여권|n|2|passport
여덟|num|1|eight
여러|det|2|several; various
여름|n|1|summer
여섯|num|1|six
여성|n|3|woman; female
여전히|adv|3|still; as before
여행|n|1|trip; travel
여행하다|v|2|to travel
역|n|1|station
역대|n|5|all-time (역대 최고 = record high)
역사|n|2|history
연결하다|v|3|to connect
연락|n|3|contact (연락이 끊기다 = to lose touch)
연락드리다|v|3|to contact (humble)
연말|n|3|year end
연일|adv|5|day after day
연착되다|v|5|to be delayed (arrival)
연합|n|4|combined; allied; union
열다|v|1|to open
열다섯|num|2|fifteen
열두|num|1|twelve
열리다|v|2|to be held; to open|열렸습니다,열렸다
열차|n|3|train
열흘|n|3|ten days
영상|n|2|video; footage
영향|n|4|influence; effect
영화|n|1|movie
예|n|3|example (예를 들어 = for example); yes
예고하다|v|5|to give advance notice; to announce
예년|n|5|an average year (예년보다 = than usual)
예상하다|v|3|to expect; predict
예정|n|3|plan; schedule (-ㄹ 예정이다 = be scheduled to)
오늘|n|1|today
오다|v|1|to come; (rain/snow) to fall
오래|adv|2|for a long time
오래되다|a|2|to be old (long-standing)
오랫동안|adv|3|for a long time
오르다|v|2|to rise; go up|올라요,올라,올랐다,올랐습니다,올랐어요,오른,올랐지만
오른쪽|n|1|right (side)
오백|num|1|five hundred
오백만|num|3|five million
오염|n|4|pollution (환경 오염 = environmental pollution)
오전|n|1|morning; a.m.
오후|n|1|afternoon; p.m.
오히려|adv|4|rather; on the contrary
온난화|n|5|warming (지구 온난화 = global warming)
올라가다|v|2|to go up; climb
올려놓다|v|4|to put on; place onto
올리다|v|2|to raise; put on top
올해|n|1|this year
옮겨지다|v|4|to be moved; to be taken (to hospital)|옮겨져,옮겨졌다
옷|n|1|clothes
왕따|n|4|outcast; ostracism (slang)
왜|adv|1|why
왜냐하면|adv|3|because (starts an explanation)
외국인|n|2|foreigner
외출|n|3|going out
외출하다|v|3|to go out
왼쪽|n|1|left (side)
요구|n|4|demand
요구하다|v|3|to demand
요금|n|2|fare; fee; charge
요리|n|1|cooking; dish
요즘|n|1|these days
용의자|n|5|suspect
우리|pron|1|we; our
우산|n|1|umbrella
우선순위|n|5|priority
우울증|n|5|depression
우주|n|3|space; universe
운동|n|1|exercise
운영|n|4|operation; running
운전|n|2|driving
운전기사|n|3|driver (of a bus or taxi)
운전자|n|3|driver
운행|n|4|operation (of vehicles); service
운행하다|v|4|to run (trains, buses)
원|cnt|1|won (Korean currency)
원인|n|3|cause
월급|n|2|monthly salary
위|n|1|top; above; on
위독하다|a|5|to be in critical condition
위반하다|v|5|to violate
위하다|v|3|to be for (을 위해 / 을 위한 = for the sake of)
위협하다|v|5|to threaten
유괴범|n|5|kidnapper
유권자|n|5|voter
유리하다|a|4|to be advantageous
유엔|prop|2|the UN
유인하다|v|5|to lure
유족|n|5|bereaved family
유지하다|v|4|to maintain; keep
유통|n|5|distribution (유통 기한 = expiration date)
유튜브|prop|1|YouTube
유학|n|3|studying abroad (조기 유학 = early study abroad)
육군|n|4|army (ground forces)
은행|n|1|bank
음식|n|1|food
음주|n|4|drinking (alcohol) (음주 운전 = drunk driving)
의견|n|3|opinion
의도|n|4|intention
의도적|n|5|intentional (의도적인 = deliberate)
의무화되다|v|5|to become mandatory
의사|n|3|intention; will; doctor
의식|n|4|consciousness (의식을 잃다 = to lose consciousness)
이|det|1|this (이에 따라 = accordingly; 이로 인해 = because of this)
이거|pron|1|this (thing)
이동|n|3|movement
이런|det|2|this kind of; such
이루다|v|4|to achieve; to form (절정을 이루다 = to reach a peak)
이륙하다|v|4|to take off
이름|n|1|name
이메일|n|1|email
이백|num|2|two hundred
이번|n|2|this (time); this coming
이산가족|n|5|separated families
이상|n|2|above; (이상입니다) that is all
이식|n|5|transplant
이십|num|1|twenty
이십삼|num|1|twenty-three
이용하다|v|2|to use; make use of
이웃|n|2|neighbor
이제|adv|2|now
이천|num|1|two thousand
인|cnt|3|person (counter, e.g. 1인 = one person)
인공위성|n|4|artificial satellite
인근|n|4|nearby; vicinity
인기|n|2|popularity
인내심|n|4|patience
인도적|n|5|humanitarian
인력|n|4|personnel; manpower
인명|n|5|human life (인명 피해 = casualties)
인사말|n|3|greeting
인상|n|4|increase (price/fare hike); impression
인원|n|4|personnel; number of people
인질|n|5|hostage
인질극|n|5|hostage situation
인하다|v|5|to be caused (로 인해 = due to)
일|n|1|one; work; thing; matter; day
일본|prop|1|Japan
일부|n|3|some; part
일사병|n|5|heatstroke; sunstroke
일어나다|v|1|to get up; happen
일자리|n|3|job
일정|n|3|schedule
일치하다|v|4|to match; to agree
일회용|n|4|disposable; single-use
일회용품|n|4|disposable products
읽다|v|1|to read
잃다|v|3|to lose|잃은
잃어버리다|v|2|to lose|잃어버려서,잃어버리셨어요,잃어버렸다
임금|n|4|wages
임기|n|5|term of office
임무|n|4|mission; duty
입다|v|1|to wear (clothes)
입대하다|v|4|to enlist (in the military)
입시|n|4|entrance exam(s)
입장|n|4|position; stance; entrance
잇다|v|4|to follow; to continue (~에 이어 = following)|이어
잇따라|adv|5|one after another
있다|v|1|to exist; to have; (-고 있다) be ~ing
자격증|n|4|certificate; license
자기소개|n|1|self-introduction
자녀|n|3|children (sons and daughters)
자다|v|1|to sleep
자라다|v|2|to grow (up)
자르다|v|2|to cut|잘라요,잘라
자리|n|2|seat; place (자리를 잡다 = to settle down)
자백하다|v|5|to confess
자세히|adv|3|in detail
자신|n|3|oneself
자연스럽다|a|3|to be natural|자연스러운,자연스러워요
자원봉사|n|4|volunteer work
자원봉사자|n|4|volunteer
자제하다|v|5|to refrain from
자주|adv|1|often
자체|n|4|itself; one's own
작년|n|2|last year
작다|a|1|to be small
작동하다|v|4|to operate; work (machine)
작업|n|3|work; operation (구조 작업 = rescue operation)
작전|n|4|operation (military, police)
잔|cnt|1|cup; glass (counter)
잘|adv|1|well
잠|n|1|sleep
잠기다|v|4|to be submerged; to be locked
잠시만|adv|2|just a moment
잡다|v|2|to catch; to hold (인질로 잡다 = to take hostage; 자리를 잡다 = to settle down)|잡을,잡고
장거리|n|4|long distance
장기|n|4|organ (body); long-term (장기적으로 = in the long run)
장기적|n|5|long-term (장기적으로 = in the long run)
장난감|n|2|toy
장병|n|5|soldiers; service members
장비|n|4|equipment
장점|n|3|strong point; merit
장학금|n|3|scholarship
잦아지다|v|5|to become more frequent
재료|n|3|ingredient; material
재발|n|5|recurrence
재배하다|v|5|to cultivate; grow (crops)
저|pron|1|I; me (humble)
저기|pron|1|over there
저녁|n|1|evening; dinner
저소득|n|5|low income
저지르다|v|4|to commit (a crime)|저질렀으며,저질렀다
저출산|n|4|low birth rate
적응하다|v|4|to adapt
전|n|1|before (-기 전에 = before ~ing)
전과자|n|5|person with a criminal record
전국|n|3|nationwide; the whole country
전기차|n|4|electric vehicle
전달되다|v|4|to be delivered; to be passed on
전망|n|4|outlook; forecast (~ㄹ 전망이다 = is expected to)
전망하다|v|4|to forecast
전문|n|4|specialty; professional
전문가|n|3|expert
전세|n|5|charter (전세 버스 = chartered bus); jeonse lease
전체|n|3|whole; entire; all
절정|n|4|peak; climax
절차|n|4|procedure
점검|n|4|inspection; check
점심|n|1|lunch
접경|n|5|border (접경 지역 = border area)
정기적|n|4|regular (정기적으로 = regularly)
정도|n|2|degree; about (2년 정도 = about two years)
정례|n|5|regular; routine
정례화하다|v|5|to make regular
정리하다|v|3|to tidy up; clear; sort out
정말|adv|1|really
정면|n|4|front (정면 충돌 = head-on collision)
정보|n|3|information; intelligence
정부|n|3|government
정상|n|3|summit; top; head of state
정상회담|n|4|summit meeting
정성|n|4|sincerity; devotion
정전|n|5|armistice; power outage (정전 협정 = armistice agreement)
정찰기|n|5|reconnaissance aircraft (무인 정찰기 = drone)
정책|n|4|policy
정체|n|4|congestion (교통 정체 = traffic jam)
정하다|v|3|to decide; to set
정확하다|a|3|to be accurate
정확히|adv|3|exactly; precisely
제|pron|1|my (humble)
제공하다|v|4|to provide
제도|n|3|system; institution
제안|n|3|proposal; offer
제주도|prop|1|Jeju Island
제한|n|4|restriction; limit
제한되다|v|4|to be restricted
조금|adv|1|a little
조기|n|5|early stage (조기 유학 = early study abroad)
조명탄|n|5|flare (illumination round)
조사|n|3|survey; investigation
조언하다|v|3|to advise
조직|n|4|organization; group
조직원|n|5|member (of a gang or ring)
졸업|n|2|graduation
졸업하다|v|2|to graduate
좋다|a|1|to be good; nice
좋아지다|v|2|to get better; improve
좋아하다|v|1|to like
죄송하다|a|1|to be sorry
주다|v|1|to give; (-어 주다) do for someone|줄
주로|adv|2|mainly; mostly
주말|n|1|weekend
주문하다|v|1|to order
주민|n|3|resident
주범|n|5|ringleader; main culprit
주변|n|3|surroundings; nearby
주요|det|3|main; major
주의|n|3|caution; attention
주인|n|2|owner
주인공|n|3|main character
주장하다|v|4|to claim; to insist
주차장|n|2|parking lot
주최|n|5|hosting; organizing (주최 측 = organizers)
준비하다|v|2|to prepare
줄다|v|3|to decrease; shrink
줄어들다|v|3|to decrease; shrink
줄이다|v|3|to reduce
중|n|2|among; during; middle
중국|prop|1|China
중단되다|v|4|to be suspended; to stop
중상|n|5|serious injury
중시하다|v|5|to value; to consider important
중심|n|3|center (중심으로 = centered on; led by)
중요하다|a|2|to be important
중태|n|5|serious (critical) condition
즐거워지다|v|3|to become enjoyable
증가하다|v|3|to increase
증거|n|4|evidence
증세|n|5|symptom
증편하다|v|5|to add more runs (flights, trains)
지|n|3|since (-ㄴ 지 = since doing)
지갑|n|2|wallet
지구|n|3|the earth
지금|n|1|now
지급하다|v|5|to pay; to provide
지나가다|v|2|to pass (by)
지난|det|2|last; past
지난해|n|3|last year
지뢰|n|5|landmine
지르다|v|4|to set (fire) (불을 지르다 = to set fire)|지른,질렀다
지방|n|3|region; province
지방자치단체|n|5|local government
지속되다|v|4|to continue; to last
지역|n|3|region; local area
지연되다|v|4|to be delayed
지원|n|3|support; aid
지원하다|v|3|to support; to apply
지장|n|5|hindrance (생명에 지장이 없다 = not life-threatening)
지적되다|v|5|to be pointed out
지적하다|v|4|to point out
지진|n|3|earthquake
지켜보다|v|3|to watch; observe
지키다|v|2|to keep; protect; follow (rules)
지하|n|3|underground; basement
지하철|n|1|subway
지하철역|n|1|subway station
직업|n|2|occupation; job (직업 훈련 = vocational training)
직원|n|2|employee; staff
직전|n|4|just before
직후|n|4|right after
진술하다|v|5|to state; to testify
진압되다|v|5|to be put out; to be suppressed
진짜|adv|1|really; truly
진학하다|v|4|to go on to (higher education)
진행되다|v|3|to proceed; to take place
집|n|1|house; home
집단|n|4|group; mass (집단 식중독 = mass food poisoning)
집중호우|n|5|torrential rain
짓다|v|2|to build; make|지을,지어요,지었다,지어,짓는
징역형|n|5|prison sentence
찍다|v|1|to take (a photo)
찍히다|v|4|to be photographed; to be captured (on camera)
차|n|1|car; tea
차량|n|3|vehicle
차별|n|4|discrimination
착용하다|v|4|to wear
착의|n|5|clothing (인상 착의 = physical description)
참가하다|v|3|to participate
참기름|n|3|sesame oil
참석하다|v|3|to attend
참여|n|3|participation
찾다|v|1|to look for; to visit (a place)
채|cnt|4|counter for buildings and houses
채소|n|2|vegetable
채용|n|4|hiring; employment
책임감|n|4|sense of responsibility
챙기다|v|2|to take; pack; look after
처음|n|2|first time; beginning (처음으로 = for the first time)
철도|n|3|railway
철저히|adv|4|thoroughly
첨단|n|4|cutting-edge; advanced
첫날|n|2|first day
첫눈|n|2|first snow (of the season)
청년|n|3|young people; youth
체계|n|4|system
체류자|n|5|person staying (불법 체류자 = illegal immigrant)
체육관|n|3|gym
체포되다|v|4|to be arrested
체험|n|4|hands-on experience
초등학생|n|2|elementary school student
초중고|n|4|elementary, middle and high school
총재|n|5|governor (of a central bank)
촬영지|n|4|filming location
최고|n|2|highest; best
최근|n|3|recently; recent
추격|n|5|chase; pursuit
추적하다|v|4|to track; to trace
출근|n|2|going to work (출근 시간 = rush hour)
출근길|n|3|commute to work
출동시키다|v|5|to dispatch
출동하다|v|4|to be dispatched; to respond (police, fire)
출발|n|2|departure
춥다|a|1|to be cold|추워요,추워,추운,추웠어요,추웠다
충격|n|4|shock
충돌|n|4|collision; clash (정면 충돌 = head-on collision)
충분하다|a|3|to be sufficient
충분히|adv|3|enough; sufficiently
충전|n|4|charging
충전기|n|4|charger
충전소|n|4|charging station
취득|n|5|acquisition (자격증 취득 = getting a certification)
취미|n|1|hobby
취소|n|3|cancellation (면허 취소 = license revocation)
취업난|n|5|tough job market
측|n|4|side; party (주최 측 = the organizers)
치다|v|2|to hit; to strike|쳤습니다,쳤다
치료|n|3|treatment
치킨|n|1|fried chicken
친구|n|1|friend
친해지다|v|2|to become close|친해졌습니다,친해졌다
칠십|num|1|seventy
침몰하다|v|5|to sink
침입하다|v|5|to break in; to invade
침투하다|v|5|to infiltrate
카드|n|1|card
카페|n|1|café
커지다|v|3|to grow bigger
커피|n|1|coffee
컵|n|1|cup
크기|n|3|size
크다|a|1|to be big
키|n|1|height (키가 크다 = to be tall); key
킬로미터|cnt|2|kilometer
타다|v|1|to ride; take (transport)
탄도미사일|n|5|ballistic missile
탈북|n|5|defection from North Korea
탈북자|n|5|North Korean defector
탈선하다|v|5|to derail
탐사|n|5|exploration
탑승자|n|5|passenger (on board)
태세|n|5|posture; readiness (경계 태세 = alert posture)
태우다|v|3|to carry (passengers); to give a ride; to burn
태풍|n|3|typhoon
통계|n|4|statistics
통역|n|3|interpretation; interpreter
통일부|prop|4|Ministry of Unification
통제하다|v|4|to control; to seal off
통하다|v|3|to go through (~을 통해 = through)|통해
퇴근하다|v|2|to leave work
투입하다|v|5|to deploy; put in
투표|n|3|vote; voting
투표율|n|4|voter turnout
투항하다|v|5|to surrender
특공대|n|5|special forces; SWAT team
특별|n|3|special (특별 단속 = special crackdown)
특히|adv|2|especially
파업|n|4|strike (labor)
판결|n|5|ruling; judgment
판단하다|v|4|to judge
판매|n|3|sales
판사|n|4|judge
팔리다|v|2|to be sold; sell
퍼뜨리다|v|5|to spread
퍼센트|n|2|percent
펴다|v|3|to spread; unfold
편의점|n|1|convenience store
평가하다|v|4|to evaluate; assess
평균|n|3|average
평소|n|3|usual times (평소처럼 = as usual)
폐기물|n|5|waste
폐쇄|n|5|closure (폐쇄 회로 = closed circuit, CCTV)
포함되다|v|3|to be included
폭발|n|4|explosion
폭염|n|4|heat wave
폭우|n|4|heavy rain
품|n|4|arms; embrace (가족의 품 = the family's arms)
품종|n|5|variety; breed (of crop)
프랑스|prop|1|France
프로그램|n|2|program
피고인|n|5|defendant
피서객|n|5|summer vacationer
피서철|n|5|summer vacation season
피하다|v|3|to avoid
피해|n|3|damage
피해자|n|4|victim
필요하다|a|2|to be needed; necessary
하다|v|1|to do
하루|n|1|a day; one day
하지만|adv|1|but; however
하행선|n|5|outbound (southbound) line
학교|n|1|school
학력|n|4|educational background
학부모|n|4|parents of students
학생|n|1|student
학원|n|3|private academy; cram school
한|det|1|one; a (certain)
한강|prop|1|the Han River
한국|prop|1|Korea
한국어|n|1|Korean (language)
한국은행|prop|3|Bank of Korea
한낮|n|4|midday
한라산|prop|3|Hallasan (mountain on Jeju)
할인|n|2|discount
함께|adv|2|together
함정|n|5|naval vessel; trap
합동참모본부|prop|5|Joint Chiefs of Staff (JCS)
합의하다|v|4|to agree; reach an agreement
항공편|n|4|flight
항구|n|4|port
항상|adv|2|always
항소하다|v|5|to appeal (a ruling)
해경|n|5|coast guard
해군|n|4|navy
해수욕장|n|3|beach (swimming)
해외|n|3|overseas
해커|n|4|hacker
햄|n|1|ham
행동|n|3|action; behavior
행사|n|3|event
헬기|n|4|helicopter
현금|n|3|cash
현재|n|3|present; current
혐의|n|5|charge; suspicion (~ 혐의로 = on charges of)
협력|n|4|cooperation
협정|n|5|agreement; accord
형량|n|5|sentence (length of a penalty)
혜택|n|4|benefit
호선|cnt|2|subway line number (2호선 = Line 2)
호텔|n|1|hotel
혼란|n|4|confusion; chaos
혼밥|n|3|eating alone (honbap)
혼자|adv|1|alone
홀몸|n|5|living alone (홀몸 노인 = senior living alone)
홍수|n|3|flood
화면|n|3|screen (폐쇄 회로 화면 = CCTV footage)
화물|n|4|cargo; freight
화상|n|5|video (화상 상봉 = video reunion); burn
화재|n|3|fire (blaze)
확대하다|v|4|to expand
확인되다|v|3|to be confirmed
환경|n|3|environment
환자|n|3|patient
활동|n|3|activity
활용하다|v|4|to make use of
회담|n|4|talks; meeting
회로|n|5|circuit
회복|n|4|recovery (경기 회복 = economic recovery)
회복세|n|5|recovery trend
회사|n|1|company
회의|n|2|meeting
후|n|2|after (-ㄴ 후 = after ~ing)
훈련|n|3|training; (military) exercise
훔치다|v|3|to steal
휴대폰|n|1|cell phone
흉기|n|5|deadly weapon
흘리다|v|3|to shed; to spill
희망자|n|4|applicant; volunteer (기증 희망자 = registered donor)
힘|n|2|strength; power
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
