export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface StudyTask {
  sourceDocument: string;
  hallucinatedSummary: string;
  timeLimitMinutes: number;
  expectedHallucinations: number;
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface StudyCondition {
  type: "text";
  tasks: StudyTask[];
}

export interface StudyStep {
  type: 'condition' | 'message' | 'video' | 'questionnaire' | 'warmup';
  video?: string;
  message?: string;
  condition?: StudyCondition;
  isDirect?: boolean;
  saveData?: boolean;
  questionnaireInterfaceOrder?: ['direct' | 'chat', 'direct' | 'chat'];
  warmupImage?: string;
  warmupDurationSeconds?: number;
}

// ─── Source documents and hallucinated summaries ─────────────────────────────
//
// Design principles (per protocol §2):
//   • Summaries are genuine PARAPHRASES, not near-copies with word swaps
//   • Hallucinations are primarily MEANING-based: inverted facts, role swaps,
//     relationship reversals, misattributions — with occasional numbers
//   • Short tasks (A, B): ~90-100 word source, 3 hallucinations, 3 min
//   • Long  tasks (C, D): ~250-280 word source, 5-6 hallucinations, 6 min

// ── SHORT TASK A — Norman Door Problem ─────────────────────────────────────

const TASK_A: StudyTask = {
  timeLimitMinutes: 3,
  expectedHallucinations: 3,
  sourceDocument:
`The Norman door problem is named after cognitive scientist Don Norman, who described the phenomenon in his 1988 book "The Design of Everyday Things." A Norman door is any door whose design misleads users about how to operate it — for example, a handle that implies pulling when pushing is required. These failures arise when visual affordances and signifiers contradict the door's actual mechanism. According to Norman, good design shifts cognitive burden onto the object's physical form so that users do not need to think about how to interact with it. The concept has become a canonical example in user-experience design and human–computer interaction research.`,
  hallucinatedSummary:
`Cognitive scientist Don Norman introduced the idea of "Norman doors" in his 1988 work "The Design of Everyday Things," referring to doors that communicate their operation poorly — like a handle that invites pulling when the door must be pushed. The problem occurs when a door's visual affordances and signifiers reinforce its actual mechanism, leaving users with no clear signal of what to do. Norman argued that effective design places cognitive burden on the user, who should learn the correct interaction through practice. The idea is now widely referenced in user-experience research and industrial engineering.`,
  // H1: "reinforce its actual mechanism" vs source "contradict the door's actual mechanism" (meaning reversal)
  // H2: "places cognitive burden on the user" vs source "shifts burden onto the object's physical form" (target inversion)
  // H3: "industrial engineering" vs source "human–computer interaction" (field swap)
  comprehensionQuestions: [
    {
      question: "According to the source, what happens when a door's affordances and signifiers contradict its mechanism?",
      options: [
        "The door becomes physically damaged",
        "Users are misled about how to operate it",
        "The door opens automatically",
        "Signifiers stop being visible",
      ],
      correctIndex: 1,
    },
    {
      question: "What does Norman say good design should do with cognitive burden?",
      options: [
        "Place it on the user through training",
        "Shift it onto the object's physical form",
        "Eliminate it through written instructions",
        "Transfer it to the manufacturer",
      ],
      correctIndex: 1,
    },
    {
      question: "In which academic fields has the Norman door concept been adopted?",
      options: [
        "Mechanical engineering and architecture",
        "User-experience design and human–computer interaction",
        "Industrial engineering and ergonomics",
        "Behavioural economics and marketing",
      ],
      correctIndex: 1,
    },
  ],
};

// ── SHORT TASK B — Franches-Montagnes ──────────────────────────────────────

const TASK_B: StudyTask = {
  timeLimitMinutes: 3,
  expectedHallucinations: 3,
  sourceDocument:
`Franches-Montagnes is a district in the canton of Jura in northwestern Switzerland, covering roughly 200 square kilometres of the Jura plateau at elevations between 900 and 1,100 metres. Its capital is Saignelégier. The district is known internationally for the Franches-Montagnes horse, bred locally since the seventeenth century as a draught and working animal. The Marché-Concours national de chevaux, an annual horse fair held in Saignelégier every August since 1897, draws tens of thousands of visitors. The local population numbers approximately 20,000 and is predominantly French-speaking.`,
  hallucinatedSummary:
`Located in northwestern Switzerland, Franches-Montagnes belongs to the canton of Jura and spans about 200 square kilometres of the Jura plateau, sitting between 900 and 1,100 metres above sea level. Saignelégier serves as its capital. The area is celebrated for the Franches-Montagnes horse, a breed developed locally since the seventeenth century primarily for riding and competitive sport. The Marché-Concours national de chevaux, an annual horse fair in Saignelégier running every May since 1897, attracts large crowds. Its population of about 20,000 is predominantly German-speaking.`,
  // H1: "riding and competitive sport" vs source "draught and working animal" (purpose inversion)
  // H2: "every May" vs source "every August" (month swap)
  // H3: "German-speaking" vs source "French-speaking" (language swap)
  comprehensionQuestions: [
    {
      question: "What was the Franches-Montagnes horse originally bred for?",
      options: [
        "Riding and competitive sport",
        "Draught work and as a working animal",
        "Military cavalry service",
        "Mountain rescue operations",
      ],
      correctIndex: 1,
    },
    {
      question: "In which month is the Marché-Concours horse fair held?",
      options: [
        "May",
        "June",
        "August",
        "October",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the predominant language spoken in the Franches-Montagnes district?",
      options: [
        "German",
        "Italian",
        "French",
        "Romansh",
      ],
      correctIndex: 2,
    },
  ],
};

// ── LONG TASK C — Feria de Abril de Sevilla ────────────────────────────────

const TASK_C: StudyTask = {
  timeLimitMinutes: 6,
  expectedHallucinations: 6,
  sourceDocument:
`The Feria de Abril de Sevilla is one of Spain's most celebrated annual festivals, held in the city of Seville. It takes place two weeks after Easter and lasts six days. The fair originated in 1847 as a livestock market organised by two city councillors, José María Ybarra and Narciso Bonaplata, and over time evolved from a commercial event into a predominantly social and festive celebration.

The fairground, known as the Real de la Feria, is situated in the Los Remedios neighbourhood on the west bank of the Guadalquivir river. The grounds are lined with over a thousand casetas — decorated marquees and tents belonging to prominent families, social clubs, trade unions, and political parties. Entry to most casetas is by invitation only, reflecting the event's deeply rooted social hierarchies.

Inside the casetas, guests dance the Sevillanas, a traditional four-part folk dance performed in pairs, and consume local specialities including fino sherry and rebujito, a popular mixed drink made by combining fino sherry with lemon-flavoured soft drink. The atmosphere is characterised by flamenco-inspired attire: women wear elaborate traje de flamenca dresses while men often appear in short jackets and flat-brimmed hats.

The Feria opens at midnight on Monday with a ceremonial lighting of the main gateway — an elaborate temporary structure that changes design each year — and officially closes the following Sunday with a fireworks display. Over the course of the week, the Feria de Abril attracts more than one million visitors, making it one of the largest public gatherings in Europe.`,
  hallucinatedSummary:
`Seville's Feria de Abril ranks among Spain's best-known annual celebrations. Held two weeks after Easter and spanning six days, the fair began in 1847 as a livestock market set up by councillors José María Ybarra and Narciso Bonaplata before gradually becoming a social occasion.

The fairground (the Real de la Feria) occupies a site in the Triana neighbourhood along the Guadalquivir. Over a thousand casetas — elaborately decorated tents belonging to families, clubs, unions, and political parties — line its avenues. Most casetas are open to the general public, contributing to the event's inclusive character.

Guests inside the casetas dance the Sevillanas, a traditional three-part folk dance performed in pairs, and enjoy fino sherry alongside rebujito, made by mixing sherry with tonic water. Women wear elaborate traje de flamenca dresses while men often appear in short jackets and flat-brimmed hats.

The fair opens at midnight on Monday when the main gateway — a temporary structure redesigned each year — is ceremonially lit, and closes the following Sunday with fireworks. Over the week it draws more than one million visitors. The Feria is widely considered one of the largest private gatherings in Europe.`,
  // H1: "Triana neighbourhood" vs source "Los Remedios neighbourhood" (location swap)
  // H2: "open to the general public" vs source "entry … by invitation only" (access reversal)
  // H3: "three-part folk dance" vs source "four-part folk dance" (detail swap)
  // H4: "tonic water" vs source "lemon-flavoured soft drink" (ingredient swap)
  // H5: "private gatherings" vs source "public gatherings" (meaning inversion)
  // H6: omits "on the west bank of the Guadalquivir" — minor, not counted; but "Triana" IS west bank
  comprehensionQuestions: [
    {
      question: "According to the source, who can enter most casetas at the Feria?",
      options: [
        "Anyone — they are open to the general public",
        "Only those with an invitation",
        "Residents of the Los Remedios neighbourhood",
        "Only members of political parties",
      ],
      correctIndex: 1,
    },
    {
      question: "How many parts does the Sevillanas folk dance have?",
      options: [
        "Two",
        "Three",
        "Four",
        "Six",
      ],
      correctIndex: 2,
    },
    {
      question: "What is rebujito made from, according to the source?",
      options: [
        "Red wine and lemonade",
        "Fino sherry and tonic water",
        "Fino sherry and lemon-flavoured soft drink",
        "Brandy and orange juice",
      ],
      correctIndex: 2,
    },
    {
      question: "In which neighbourhood is the Real de la Feria located?",
      options: [
        "Triana",
        "Santa Cruz",
        "Los Remedios",
        "El Arenal",
      ],
      correctIndex: 2,
    },
  ],
};

// ── LONG TASK D — Winter Olympic Ice Skating ───────────────────────────────

const TASK_D: StudyTask = {
  timeLimitMinutes: 6,
  expectedHallucinations: 6,
  sourceDocument:
`Ice skating events have been part of the Winter Olympic Games since their inaugural edition in Chamonix, France, in 1924. The Olympic programme features three main skating disciplines: figure skating, speed skating (divided into long track and short track events), and ice hockey.

Figure skating is the oldest of the three, having made its Olympic debut not at the Winter Games but at the 1908 Summer Olympics in London. The discipline currently comprises four events: men's singles, women's singles, pair skating, and ice dance. Ice dance was the last to be added, becoming a medal event at the 1976 Innsbruck Winter Games. The scoring system was overhauled following a judging scandal that affected the pairs competition at the 2002 Salt Lake City Games, when the International Skating Union replaced the traditional 6.0 system with the International Judging System, commonly known as the Code of Points.

Speed skating has been contested at every Winter Olympics since 1924 for men, with women's events added in 1960. Short track speed skating, a variant raced on a smaller oval with closer physical contact between competitors, was introduced as a demonstration sport at the 1988 Calgary Games and became a full medal event at the 1992 Albertville Games. Unlike long track, where skaters race in pairs against the clock, short track competitors race directly against each other in heats, making tactics and positioning as important as raw speed.`,
  hallucinatedSummary:
`Skating has featured in the Winter Olympics since their first edition in Chamonix, France, in 1924. Three disciplines make up the Olympic skating programme: figure skating, speed skating (long track and short track), and ice hockey.

Figure skating entered the Olympics earlier than any other skating discipline, appearing at the 1908 Summer Olympics in London. Today it includes four events — men's singles, women's singles, pair skating, and ice dance. Ice dance was the final addition, gaining medal status at the 1976 Innsbruck Winter Games. Judging rules were reformed after a scandal involving the ice dance competition at the 2002 Salt Lake City Games, when the International Skating Union adopted the International Judging System in place of the older 6.0 system.

Speed skating has been on the Winter Olympic programme since 1924 for men, with women competing from the very first Games alongside men. Short track speed skating — raced on a smaller oval with close physical contact — debuted as a demonstration sport at the 1988 Calgary Games before gaining full medal status at the 1992 Albertville Games. In short track, competitors race individually against the clock in staggered time trials, making endurance as important as raw speed. In long track, by contrast, skaters race directly against one another to determine placement.`,
  // H1: "ice dance competition" vs source "pairs competition" (event swap in scandal)
  // H2: "women competing from the very first Games" vs source "women's events added in 1960" (timeline reversal)
  // H3: "individually against the clock in staggered time trials" vs source "directly against each other in heats" (format reversal for short track)
  // H4: "endurance" vs source "tactics and positioning" (attribute swap)
  // H5: "skaters race directly against one another" vs source "race in pairs against the clock" (format reversal for long track)
  // H6: The short/long track racing format descriptions are swapped: short track described as clock-based when it's head-to-head, long track as head-to-head when it's clock-based
  comprehensionQuestions: [
    {
      question: "Which competition was affected by the judging scandal at the 2002 Salt Lake City Games?",
      options: [
        "Men's singles",
        "Ice dance",
        "Pair skating",
        "Short track relay",
      ],
      correctIndex: 2,
    },
    {
      question: "When were women's speed skating events first included in the Winter Olympics?",
      options: [
        "1924, at the inaugural Games",
        "1948, at the St. Moritz Games",
        "1960",
        "1976, alongside ice dance",
      ],
      correctIndex: 2,
    },
    {
      question: "How do short track competitors race, compared to long track?",
      options: [
        "Individually against the clock, like long track",
        "In staggered time trials with no direct contact",
        "Directly against each other in heats, unlike long track's pairs against the clock",
        "In the same format as long track but on a shorter oval",
      ],
      correctIndex: 2,
    },
    {
      question: "Besides raw speed, what does short track racing emphasise according to the source?",
      options: [
        "Endurance and stamina",
        "Balance and flexibility",
        "Tactics and positioning",
        "Artistic expression",
      ],
      correctIndex: 2,
    },
  ],
};

// Text set AC: Norman door (short) + Feria de Sevilla (long)
const TEXT_SET_AC: StudyTask[] = [TASK_A, TASK_C];
// Text set BD: Franches-Montagnes (short) + Winter Olympic ice skating (long)
const TEXT_SET_BD: StudyTask[] = [TASK_B, TASK_D];

// ─── Step generator ──────────────────────────────────────────────────────────

export class StudyTaskGenerator {

  static generateSteps(participantId: number): StudyStep[] {
    const steps: StudyStep[] = [];

    // 4-condition 2×2 Latin square:
    //  conditionIdx 0 → Block1=Chat+AC,     Block2=Direct+BD
    //  conditionIdx 1 → Block1=Chat+BD,     Block2=Direct+AC
    //  conditionIdx 2 → Block1=Direct+AC,   Block2=Chat+BD
    //  conditionIdx 3 → Block1=Direct+BD,   Block2=Chat+AC
    const conditionIdx = participantId % 4;

    const block1IsDirect = conditionIdx >= 2;
    const block1Tasks = (conditionIdx === 0 || conditionIdx === 2) ? TEXT_SET_AC : TEXT_SET_BD;
    const block2IsDirect = !block1IsDirect;
    const block2Tasks = block1Tasks === TEXT_SET_AC ? TEXT_SET_BD : TEXT_SET_AC;

    // Stage 1 — Briefing and Consent
    steps.push({
      type: 'message',
      message:
        '<b>Stage 1 — Briefing and Consent</b><br><br>' +
        'Welcome, and thank you for participating in this study. You will complete two fact-checking tasks using two different interfaces. ' +
        'The session will be recorded (audio and screen). Please do not use any external resources during the tasks.<br><br>' +
        'After clicking Next, you will be asked to grant microphone and screen-sharing permissions. ' +
        'These are needed only once for the entire session.<br><br>' +
        'By clicking Next you confirm that you have read the information sheet and consent to participate.',
    });

    // Stage 2 — Think-Aloud Practice with image warm-up
    steps.push({
      type: 'warmup',
      warmupImage: (process.env.PUBLIC_URL || '') + '/study/warmup.jpg',
      warmupDurationSeconds: 30,
    });

    // Block 1
    if (block1IsDirect) {
      steps.push({
        type: 'video',
        video: (process.env.PUBLIC_URL || '') + '/study/tuto/text_direct.mp4',
      });
    }

    steps.push({
      type: 'condition',
      condition: { type: 'text', tasks: block1Tasks },
      isDirect: block1IsDirect,
    });

    // Stage 4 — Washout between blocks
    steps.push({
      type: 'message',
      message:
        '<b>End of Block 1</b><br><br>' +
        'Before continuing, please perform the following cognitive reset task:<br><br>' +
        '<b>Count backwards from 25 in steps of three, out loud.</b><br>' +
        '(25 → 22 → 19 → 16 …)<br><br>' +
        'When you have finished, click Next to continue to Block 2.',
    });

    // Block 2
    if (block2IsDirect) {
      steps.push({
        type: 'video',
        video: (process.env.PUBLIC_URL || '') + '/study/tuto/text_direct.mp4',
      });
    }

    steps.push({
      type: 'condition',
      condition: { type: 'text', tasks: block2Tasks },
      isDirect: block2IsDirect,
      saveData: true,
    });

    // Stage 6 — Cognitive Effort Questionnaire (3 items per protocol §3)
    const questionnaireOrder: ['direct' | 'chat', 'direct' | 'chat'] =
      participantId % 2 === 0 ? ['direct', 'chat'] : ['chat', 'direct'];

    steps.push({
      type: 'questionnaire',
      questionnaireInterfaceOrder: questionnaireOrder,
    });

    // Stage 7 — Debrief
    steps.push({
      type: 'message',
      message:
        '<b>Stage 7 — Debrief</b><br><br>' +
        'Thank you for completing the study.<br><br>' +
        'This study investigated whether interface paradigm influences hallucination detection and critical evaluation of LLM-generated content. ' +
        'The summaries you fact-checked contained deliberately embedded errors (inverted facts, misattributions, and relationship reversals).<br><br>' +
        'Your data will be kept confidential and used solely for research purposes. ' +
        'You may withdraw your data within two weeks by contacting the experimenter.<br><br>' +
        'Please feel free to ask any questions.',
    });

    return steps;
  }
}
