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

const TASK_A: StudyTask = {
  timeLimitMinutes: 3,
  expectedHallucinations: 3,
  sourceDocument:
`The Norman door problem is named after cognitive scientist Don Norman, who described the phenomenon in his 1988 book "The Design of Everyday Things." A Norman door is any door whose design misleads users about how to operate it — for example, a door with a handle that implies pulling when it actually requires pushing. Such design failures arise when visual affordances (features that signal possible actions) and signifiers (perceptible cues that communicate where and how to act) contradict the door's actual mechanism.

The concept has since been adopted widely in user-experience design and human–computer interaction as a canonical example of how design can fail to communicate its own operation. According to Norman, good design shifts cognitive burden onto the object's physical form, not onto the user.`,
  hallucinatedSummary:
`The Norman door problem is named after industrial designer Don Norman, who described the phenomenon in his 1990 book "The Design of Everyday Things." A Norman door is any door whose design misleads users about how to operate it — for example, a door with a handle that implies pulling when it actually requires pushing. Such design failures arise when visual affordances and signifiers contradict the door's actual mechanism.

The concept has since been adopted widely in user-experience design as a canonical example of how design can fail to communicate its own operation. According to Norman, good design shifts cognitive burden onto the designer rather than the user.`,
  comprehensionQuestions: [
    {
      question: "According to the source document, in which year was \"The Design of Everyday Things\" published?",
      options: ["1985", "1988", "1990", "1992"],
      correctIndex: 1,
    },
    {
      question: "What term describes features that signal possible actions in design?",
      options: ["Signifiers", "Affordances", "Mappings", "Feedback"],
      correctIndex: 1,
    },
    {
      question: "According to the source document, onto what does good design shift cognitive burden?",
      options: [
        "The user",
        "The designer",
        "Labels such as Push or Pull",
        "The object's physical form",
      ],
      correctIndex: 3,
    },
  ],
};

const TASK_B: StudyTask = {
  timeLimitMinutes: 3,
  expectedHallucinations: 3,
  sourceDocument:
`Franches-Montagnes is a district in the canton of Jura in northwestern Switzerland. The district covers approximately 714 square kilometres of the Jura plateau, at elevations between 900 and 1,100 metres above sea level. The regional capital is Saignelégier.

The region is internationally recognised for the Franches-Montagnes horse, bred locally from the seventeenth century as a draught and working animal. The Marché-Concours national de chevaux, an annual horse fair held in Saignelégier every August since 1897, draws tens of thousands of visitors. Its population is approximately 20,000, predominantly French-speaking.`,
  hallucinatedSummary:
`Franches-Montagnes is a district in the canton of Bern in northwestern Switzerland. The district covers approximately 714 square kilometres of the Jura plateau, at elevations between 900 and 1,100 metres above sea level. The regional capital is Saignelégier.

The region is internationally recognised for the Franches-Montagnes horse, bred locally from the seventeenth century as a draught and working animal. The Marché-Concours national de chevaux, an annual horse fair held in Saignelégier every August since 1912, draws tens of thousands of visitors. Its population is approximately 30,000, predominantly French-speaking.`,
  comprehensionQuestions: [
    {
      question: "In which Swiss canton is the Franches-Montagnes district located?",
      options: ["Bern", "Neuchâtel", "Jura", "Fribourg"],
      correctIndex: 2,
    },
    {
      question: "In which year was the Marché-Concours national de chevaux first held?",
      options: ["1847", "1897", "1912", "1923"],
      correctIndex: 1,
    },
    {
      question: "What is the approximate population of the Franches-Montagnes district?",
      options: ["10,000", "20,000", "30,000", "50,000"],
      correctIndex: 1,
    },
  ],
};

const TASK_C: StudyTask = {
  timeLimitMinutes: 6,
  expectedHallucinations: 6,
  sourceDocument:
`The Feria de Abril de Sevilla is one of Spain's most celebrated annual festivals, held in Seville. It takes place two weeks after Easter, lasting six days. The fair originated in 1847 as a livestock market organised by two city councillors, José María Ybarra and Narciso Bonaplata, and over time shifted into a predominantly social and festive celebration.

The fairground (Real de la Feria) is situated in the Los Remedios neighbourhood. Its grounds are lined with casetas — private tents belonging to families, clubs, and political parties. Inside, guests dance the Sevillanas, a traditional four-part folk dance, and consume fino sherry and a drink called rebujito, made by mixing fino sherry with lemon-flavoured soft drink. The Feria de Abril attracts over one million visitors each year.`,
  hallucinatedSummary:
`The Feria de Abril de Sevilla is one of Spain's most celebrated annual festivals, held in Seville. It takes place two weeks after Easter, lasting six days. The fair originated in 1853 as a livestock market organised by two city councillors, José María Ybarra and Carlos Larios, and over time shifted into a predominantly social and festive celebration.

The fairground (Real de la Feria) is situated in the Triana neighbourhood. Its grounds are lined with casetas — private tents belonging to families, clubs, and political parties. Inside, guests dance the Sevillanas, a traditional three-part folk dance, and consume fino sherry and a drink called rebujito, made by mixing fino sherry with cola. The Feria de Abril attracts over two million visitors each year.`,
  comprehensionQuestions: [
    {
      question: "According to the source document, in which year did the Feria de Abril originate?",
      options: ["1820", "1847", "1853", "1875"],
      correctIndex: 1,
    },
    {
      question: "In which neighbourhood of Seville is the Real de la Feria located?",
      options: ["Triana", "El Arenal", "Los Remedios", "Santa Cruz"],
      correctIndex: 2,
    },
    {
      question: "How many parts does the Sevillanas folk dance have?",
      options: ["Two", "Three", "Four", "Six"],
      correctIndex: 2,
    },
    {
      question: "What is rebujito made from?",
      options: [
        "Red wine and lemonade",
        "Fino sherry and cola",
        "Fino sherry and lemon-flavoured soft drink",
        "Brandy and orange juice",
      ],
      correctIndex: 2,
    },
  ],
};

const TASK_D: StudyTask = {
  timeLimitMinutes: 6,
  expectedHallucinations: 5,
  sourceDocument:
`Ice skating events have been part of the Winter Olympic Games since their inaugural edition in Chamonix, France, in 1924. The programme features three main disciplines: figure skating, speed skating (long track and short track), and ice hockey.

Figure skating made its Olympic debut at the 1908 Summer Games in London. The discipline includes four events: men's singles, women's singles, pair skating, and ice dance. Ice dance was added in 1976 at the Innsbruck Winter Games. Scoring was overhauled following a judging scandal that affected the pairs competition at the 2002 Salt Lake City Games, when the International Skating Union replaced the 6.0 system with the Code of Points (IJS). Short track speed skating was introduced as a demonstration event at the 1988 Calgary Games and became a full medal event at the 1992 Albertville Games.`,
  hallucinatedSummary:
`Ice skating events have been part of the Winter Olympic Games since their inaugural edition in Chamonix, France, in 1928. The programme features three main disciplines: figure skating, speed skating (long track and short track), and ice hockey.

Figure skating made its Olympic debut at the 1912 Summer Games in Stockholm. The discipline includes four events: men's singles, women's singles, pair skating, and ice dance. Ice dance was added in 1980 at the Lake Placid Winter Games. Scoring was overhauled following a judging scandal that affected the ice dance competition at the 2002 Salt Lake City Games, when the International Skating Union replaced the 6.0 system with the Code of Points (IJS). Short track speed skating was introduced as a demonstration event at the 1984 Sarajevo Games and became a full medal event at the 1992 Albertville Games.`,
  comprehensionQuestions: [
    {
      question: "In which city were the first Winter Olympic Games held?",
      options: ["Oslo", "St. Moritz", "Chamonix", "Garmisch-Partenkirchen"],
      correctIndex: 2,
    },
    {
      question: "At which Games did ice dance become a full Olympic discipline?",
      options: ["Sapporo 1972", "Innsbruck 1976", "Lake Placid 1980", "Sarajevo 1984"],
      correctIndex: 1,
    },
    {
      question: "Which competition was affected by the judging scandal at the 2002 Salt Lake City Games?",
      options: ["Men's singles", "Ice dance", "Pairs skating", "Short track relay"],
      correctIndex: 2,
    },
    {
      question: "At which Games did short track speed skating become a full medal event?",
      options: ["Calgary 1988", "Albertville 1992", "Lillehammer 1994", "Nagano 1998"],
      correctIndex: 1,
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
        'The session will be recorded. Please do not use any external resources during the tasks.<br><br>' +
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
      // Show DirectGPT tutorial before first encounter
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
      // Show DirectGPT tutorial before first encounter
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

    // Stage 6 — Cognitive Effort Questionnaire
    // Counterbalance interface order in questionnaire by participant parity
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
        'The summaries you fact-checked contained deliberately embedded errors (manipulated statistics, inverted facts, and incorrect dates).<br><br>' +
        'Your data will be kept confidential and used solely for research purposes. ' +
        'You may withdraw your data within two weeks by contacting the experimenter.<br><br>' +
        'Please feel free to ask any questions.',
    });

    return steps;
  }
}
