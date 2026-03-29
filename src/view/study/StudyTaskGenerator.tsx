export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface StudyTask {
  taskCode: string;
  sourceDocument: string;
  hallucinatedSummary: string;
  timeLimitMinutes: number;
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface StudyCondition {
  type: "text";
  task: StudyTask;
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
// Short texts (3-minute limit, 2–3 hallucinations):
//   T_NORMAN   — The Norman Door Problem
//   T_FRANCHES — Franches-Montagnes
//
// Long texts (6-minute limit, 5–7 hallucinations):
//   T_FERIA    — Feria de Sevilla
//   T_WINTER   — Winter Olympic Ice Skating
//
// Each short source article: ~140–150 words.
// Each long source article:  ~240–260 words.
// Hallucinations consist of subtly incorrect factual claims, including
// manipulated statistics, inverted facts, and incorrect dates. Correction
// requires matching claims in the summary to the facts in the source document.
//
// Hallucination map:
//   NORMAN  H1 Tier 1  "1986"                              — should be "1988"
//   NORMAN  H2 Tier 2  "The Psychology of Everyday Objects" — should be "The Psychology of Everyday Things"
//   NORMAN  H3 Tier 3  "flat plate affords pulling; cylindrical handle affords pushing" — should be reversed
//
//   FRANCHES H1 Tier 1  "canton of Bern"                   — should be "canton of Jura"
//   FRANCHES H2 Tier 2  "Arabian and English thoroughbred"  — should be "Norman and English thoroughbred"
//   FRANCHES H3 Tier 2  "located at Berne, in the canton of Bern" — should be "Avenches, in the canton of Vaud"
//
//   FERIA   H1 Tier 1  "1851"                              — should be "1847"
//   FERIA   H2 Tier 1  "east bank"                         — should be "west bank"
//   FERIA   H3 Tier 2  "Francisco Bonaplata"               — should be "Narciso Bonaplata"
//   FERIA   H4 Tier 2  "five days"                         — should be "six days"
//   FERIA   H5 Tier 3  "open to any visitor"               — should be "entry by invitation only"
//   FERIA   H6 Tier 3  "dark-coloured"                     — should be "brightly coloured"
//   FERIA   H7 Tier 3  "seventeenth century"               — should be "eighteenth century"
//
//   WINTER  H1 Tier 1  "1904 St. Louis Games"              — should be "1908 London Games"
//   WINTER  H2 Tier 2  "Chelsea"                           — should be "Knightsbridge"
//   WINTER  H3 Tier 2  "1964 Innsbruck Games"              — should be "1960 Squaw Valley Games"
//   WINTER  H4 Tier 2  "91.14 metres"                      — should be "111.12 metres"
//   WINTER  H5 Tier 3  "1984 Sarajevo Games"               — should be "1988 Calgary Games"
//   WINTER  H6 Tier 3  "1980 Lake Placid Games"            — should be "1976 Innsbruck Games"
//   WINTER  H7 Tier 3  "Alexei Mishin"                     — should be "Alexandr Gorshkov"

// ── TASK NORMAN — The Norman Door Problem ────────────────────────────────────

const TASK_NORMAN: StudyTask = {
  taskCode: 'Norman',
  timeLimitMinutes: 3,
  sourceDocument:
`The term "Norman door" refers to any door whose design fails to communicate clearly how it should be operated. The concept was popularized by cognitive scientist Don Norman in his 1988 book The Design of Everyday Things, originally published under the title The Psychology of Everyday Things. Norman used poorly designed doors as an accessible example of a broader principle: that objects should signal their correct operation through their physical form.

In Norman's framework, good design communicates through two properties: affordances, which suggest what actions are possible, and signifiers, which indicate where and how to perform them. A flat plate affords pushing; a cylindrical handle affords pulling. A Norman door violates this correspondence — for instance, by placing a pull-style handle on a door that opens by pushing — forcing users to rely on guesswork or written instructions rather than intuitive form.

The concept has been widely adopted in user experience design and human-computer interaction as shorthand for any artefact that works against the user's reasonable expectations.`,
  hallucinatedSummary:
`The term "Norman door" describes any door that fails to communicate clearly how it should be operated. The concept was introduced by cognitive scientist Don Norman in his 1986 book The Design of Everyday Things, originally published under the title The Psychology of Everyday Objects. Norman used poorly designed doors to illustrate a broader design principle: that the physical form of an object should communicate its correct operation without the need for instructions.

Norman's framework identifies two key properties through which good design communicates. Affordances suggest what actions are possible; signifiers indicate where and how those actions should be performed. A flat plate affords pulling; a cylindrical handle affords pushing. A Norman door violates this correspondence — such as a push door fitted with a handle that invites pulling — leaving users no choice but to guess or read a sign.

The concept has been widely adopted in user experience design and human-computer interaction as a label for any designed object that works against its user's natural expectations.`,
  comprehensionQuestions: [
    {
      question: "Don Norman's book was originally published under the title:",
      options: [
        "The Design of Everyday Things",
        "The Psychology of Everyday Objects",
        "The Psychology of Everyday Things",
        "Usability Engineering",
      ],
      correctIndex: 2,
    },
    {
      question: "In Norman's framework, 'affordances' refer to:",
      options: [
        "Labels and instructions attached to an object",
        "The visual style and colour of a designed object",
        "Cues indicating where and how an action should be performed",
        "Properties of an object that suggest what actions are possible",
      ],
      correctIndex: 3,
    },
    {
      question: "According to Norman's framework, what does a cylindrical handle signify?",
      options: [
        "Pushing",
        "Sliding",
        "Pulling",
        "Rotating",
      ],
      correctIndex: 2,
    },
    {
      question: "A Norman door is one that:",
      options: [
        "Lacks any visible handles or signifiers",
        "Creates a mismatch between its design signals and its actual operation",
        "Is designed to meet accessibility requirements",
        "Requires a key or code to operate",
      ],
      correctIndex: 1,
    },
  ],
};

// ── TASK FRANCHES — Franches-Montagnes ───────────────────────────────────────

const TASK_FRANCHES: StudyTask = {
  taskCode: 'Franches',
  timeLimitMinutes: 3,
  sourceDocument:
`Franches-Montagnes is a district in the canton of Jura in northwestern Switzerland, situated on a plateau at approximately 1,000 metres above sea level. The name translates roughly as "free mountains," a reference to the tax exemptions historically granted to settlers who cleared the forested plateau during medieval colonisation.

The district is internationally known as the origin of the Franches-Montagnes horse, also called the Freiberger. Developed during the second half of the nineteenth century by crossing local mares with imported stallions of Norman and English thoroughbred descent, the Freiberger was selectively bred to meet the requirements of the Swiss army, which needed a sturdy, sure-footed horse capable of operating in mountainous terrain. The breed combines draft and light-horse characteristics and remains the most numerous horse breed in Switzerland. The principal stud farm for the breed is located at Avenches, in the canton of Vaud.`,
  hallucinatedSummary:
`Franches-Montagnes is a district in the canton of Bern in northwestern Switzerland, occupying a plateau at approximately 1,000 metres above sea level. The name translates loosely as "free mountains," recalling the tax exemptions granted to settlers who cleared the forested plateau during medieval colonisation.

The district is best known internationally as the origin of the Franches-Montagnes horse, also referred to as the Freiberger. The breed was developed during the second half of the nineteenth century by crossing native mares with imported stallions of Arabian and English thoroughbred descent, in response to the demands of the Swiss army for a tough, sure-footed mountain horse. It combines draft and light-horse characteristics and is today the most numerous horse breed in Switzerland. The main stud farm is located at Berne, in the canton of Bern.`,
  comprehensionQuestions: [
    {
      question: "Franches-Montagnes is located in which Swiss canton?",
      options: [
        "Bern",
        "Vaud",
        "Neuchâtel",
        "Jura",
      ],
      correctIndex: 3,
    },
    {
      question: "What does the name 'Franches-Montagnes' refer to historically?",
      options: [
        "The free-ranging horse herds of the plateau",
        "Tax exemptions granted to early settlers",
        "Open mountain pastures used for communal grazing",
        "The politically independent status of the region",
      ],
      correctIndex: 1,
    },
    {
      question: "The Freiberger was developed by crossing local mares with stallions of which descent?",
      options: [
        "Arabian and English thoroughbred",
        "Andalusian and Norman",
        "Norman and English thoroughbred",
        "Lipizzaner and draft horse",
      ],
      correctIndex: 2,
    },
    {
      question: "Where is the principal stud farm for the Freiberger breed located?",
      options: [
        "Berne",
        "Avenches",
        "Delémont",
        "Porrentruy",
      ],
      correctIndex: 1,
    },
  ],
};

// ── TASK FERIA — Feria de Sevilla ─────────────────────────────────────────────

const TASK_FERIA: StudyTask = {
  taskCode: 'Feria',
  timeLimitMinutes: 6,
  sourceDocument:
`The Feria de Abril — April Fair — is an annual festival held in Seville, in the Andalusian region of southern Spain. It takes place each spring, typically two weeks after Easter Sunday, and lasts six days.

The fair originated in 1847, when two city councillors, Narciso Bonaplata and José María Ybarra, proposed a livestock market on the banks of the Guadalquivir river. The event drew traders from across Andalusia and evolved rapidly from a commercial market into a social celebration. By the early twentieth century, the livestock element had largely disappeared, and the fair had become primarily a cultural and recreational event.

The fairground, known as the Real de la Feria, is located in the Los Remedios neighbourhood on the west bank of the Guadalquivir. It is lined with hundreds of casetas — temporary canvas structures, each decorated in distinctive colour schemes — that serve as private social clubs for families, businesses, and associations. Entry to most casetas is by invitation only.

During the fair, women traditionally wear the traje de flamenca — brightly coloured flounced dresses — and men wear the traje corto, a short riding jacket with high-waisted trousers. Horse-drawn carriages and riders on horseback parade along the central avenue, the Paseo de Caballos.

The fair opens each evening with a lighting ceremony. Bullfighting events are held daily at the nearby Plaza de Toros de la Maestranza, one of the oldest bullrings in Spain, built in the eighteenth century.`,
  hallucinatedSummary:
`The Feria de Abril — the April Fair — is an annual festival in Seville, in the Andalusian region of southern Spain. Held each spring, typically two weeks after Easter, it runs for five days.

The fair traces its origins to 1851, when city councillors Francisco Bonaplata and José María Ybarra proposed a livestock market on the banks of the Guadalquivir river. The event rapidly outgrew its commercial purpose, attracting traders from across Andalusia, and by the early twentieth century the livestock trade had given way to a predominantly cultural and social celebration.

The fairground, the Real de la Feria, is situated in the Los Remedios neighbourhood on the east bank of the Guadalquivir. It is lined with hundreds of casetas — gaily decorated canvas structures open to any visitor — which function as social gathering spaces for families, businesses, and neighbourhood associations throughout the week.

Traditional dress is an essential feature of the fair. Women wear the traje de flamenca, a dark-coloured flounced dress, while men appear in the traje corto, a short jacket worn with high-waisted trousers. Horse-drawn carriages and mounted riders parade along the Paseo de Caballos.

Each evening opens with a lighting ceremony. Bullfighting takes place daily at the Plaza de Toros de la Maestranza, one of Spain's most historic bullrings, originally constructed in the seventeenth century.`,
  comprehensionQuestions: [
    {
      question: "In what year was the Feria de Abril first held?",
      options: [
        "1843",
        "1847",
        "1851",
        "1865",
      ],
      correctIndex: 1,
    },
    {
      question: "The fairground Real de la Feria is located on which bank of the Guadalquivir?",
      options: [
        "East bank",
        "North bank",
        "South bank",
        "West bank",
      ],
      correctIndex: 3,
    },
    {
      question: "Access to most casetas during the fair is:",
      options: [
        "Open to all visitors",
        "By invitation only",
        "Ticketed and paid",
        "Restricted to Seville residents",
      ],
      correctIndex: 1,
    },
    {
      question: "The Plaza de Toros de la Maestranza was built in which century?",
      options: [
        "Sixteenth century",
        "Seventeenth century",
        "Eighteenth century",
        "Nineteenth century",
      ],
      correctIndex: 2,
    },
  ],
};

// ── TASK WINTER — Winter Olympic Ice Skating ──────────────────────────────────

const TASK_WINTER: StudyTask = {
  taskCode: 'Winter',
  timeLimitMinutes: 6,
  sourceDocument:
`Ice skating events have been part of the Olympic programme longer than the Winter Games themselves. Figure skating made its Olympic debut at the 1908 London Games, contested indoors at the Prince's Skating Club in Knightsbridge, making it one of the first indoor Olympic events. It returned at the 1920 Antwerp Games before the Winter Olympics were established as a separate programme at Chamonix in 1924.

Speed skating was included in the inaugural 1924 Winter Olympics, with events open only to men. Women's speed skating events were added at the 1960 Squaw Valley Games.

Short track speed skating, in which multiple competitors race simultaneously around a smaller oval of 111.12 metres, developed as a discipline in North America during the 1970s and 1980s as an adaptation for indoor rinks too small to accommodate long track competition. It was introduced as a demonstration sport at the 1988 Calgary Games and became a full medal sport at the 1992 Albertville Games.

Ice dance, a discipline of figure skating that prioritises choreography and musical interpretation over jumps, was added to the Olympic programme at the 1976 Innsbruck Games. The inaugural gold medal was won by Soviet skaters Lyudmila Pakhomova and Alexandr Gorshkov.

Synchronized skating, performed by teams of sixteen skaters executing choreographed formations, is among the most widely practised forms of the sport globally but has not yet been included in the Olympic programme.`,
  hallucinatedSummary:
`Ice skating has featured in the Olympic programme since before the Winter Games existed as a separate event. Figure skating made its Olympic debut at the 1904 St. Louis Games, held indoors at the Prince's Skating Club in Chelsea, making it one of the earliest indoor Olympic events. The sport returned at the 1920 Antwerp Games and was included in the inaugural Winter Olympics at Chamonix in 1924.

Speed skating was part of the 1924 Winter Olympics from the outset, initially restricted to male competitors. Women's events in speed skating were introduced at the 1964 Innsbruck Games.

Short track speed skating — in which competitors race simultaneously around a compact oval measuring 91.14 metres — emerged in North America during the 1970s and 1980s as a solution for facilities too small for the standard long track format. It was showcased as a demonstration sport at the 1984 Sarajevo Games before gaining full medal status at the 1992 Albertville Games.

Ice dance was incorporated into the Olympic programme at the 1980 Lake Placid Games, with the first gold medal awarded to Soviet pair Lyudmila Pakhomova and Alexei Mishin.

Synchronized skating, performed by teams of sixteen skaters in coordinated formations, is one of the most widely practised competitive disciplines in the sport worldwide but remains outside the Olympic programme.`,
  comprehensionQuestions: [
    {
      question: "Figure skating made its Olympic debut at:",
      options: [
        "The 1900 Paris Games",
        "The 1904 St. Louis Games",
        "The 1908 London Games",
        "The 1924 Chamonix Games",
      ],
      correctIndex: 2,
    },
    {
      question: "Women's speed skating events were first held at the Olympics at:",
      options: [
        "The 1956 Cortina d'Ampezzo Games",
        "The 1960 Squaw Valley Games",
        "The 1964 Innsbruck Games",
        "The 1968 Grenoble Games",
      ],
      correctIndex: 1,
    },
    {
      question: "Short track speed skating became a full medal sport at:",
      options: [
        "The 1988 Calgary Games",
        "The 1992 Albertville Games",
        "The 1994 Lillehammer Games",
        "The 1998 Nagano Games",
      ],
      correctIndex: 1,
    },
    {
      question: "Who won the first Olympic gold medal in ice dance?",
      options: [
        "Jayne Torvill and Christopher Dean",
        "Marina Klimova and Sergei Ponomarenko",
        "Lyudmila Pakhomova and Alexandr Gorshkov",
        "Natalia Mishkutenok and Artur Dmitriev",
      ],
      correctIndex: 2,
    },
  ],
};

// ─── Step generator ──────────────────────────────────────────────────────────

export class StudyTaskGenerator {

  static generateSteps(participantId: number): StudyStep[] {
    const steps: StudyStep[] = [];

    // 4-condition Latin square — counterbalances interface order and task-pair
    // assignment:
    //  conditionIdx 0 → Block1=Chat+[Norman,Feria],   Block2=Direct+[Franches,Winter]
    //  conditionIdx 1 → Block1=Direct+[Norman,Feria], Block2=Chat+[Franches,Winter]
    //  conditionIdx 2 → Block1=Chat+[Franches,Winter], Block2=Direct+[Norman,Feria]
    //  conditionIdx 3 → Block1=Direct+[Franches,Winter], Block2=Chat+[Norman,Feria]
    const conditionIdx = participantId % 4;

    const block1IsDirect = conditionIdx === 1 || conditionIdx === 3;
    const block2IsDirect = !block1IsDirect;

    // Pair A = [Norman (short), Feria (long)], Pair B = [Franches (short), Winter (long)]
    const pairA: [StudyTask, StudyTask] = [TASK_NORMAN, TASK_FERIA];
    const pairB: [StudyTask, StudyTask] = [TASK_FRANCHES, TASK_WINTER];

    const block1Tasks = (conditionIdx === 0 || conditionIdx === 1) ? pairA : pairB;
    const block2Tasks = block1Tasks === pairA ? pairB : pairA;

    // Stage 1 — Briefing, Consent, and Task Description
    steps.push({
      type: 'message',
      message:
        '<b>Briefing and Consent</b><br><br>' +
        'Welcome, and thank you for participating in this study. ' +
        'The session will be recorded (audio and screen). Please do not use any external resources during the tasks.<br><br>' +
        '<b>Your task (repeated for four texts):</b><br><br>' +
        'You are provided with a source document and an AI-generated summary. ' +
        'The summary contains hallucinations — subtly incorrect factual claims. ' +
        'Your task is to find and correct them by checking the summary against the source document. ' +
        'You will be asked at the end of each task how many hallucinations you encountered.<br><br>' +
        'You may use the interface on the right in whatever way feels most natural. ' +
        'Try to identify and correct as many hallucinations as possible within the time limit.<br><br>' +
        'You will complete this task four times: two texts with one interface, then two texts with a different interface.<br><br>' +
        'After clicking Next, you will be asked to grant microphone and screen-sharing permissions. ' +
        'These are needed only once for the entire session.<br><br>' +
        'By clicking Next you confirm that you have read the information sheet and consent to participate.',
    });

    // Block 1 — two tasks, same interface
    if (block1IsDirect) {
      steps.push({
        type: 'video',
        video: (process.env.PUBLIC_URL || '') + '/study/tuto/text_direct.mp4',
      });
    }

    steps.push({
      type: 'condition',
      condition: { type: 'text', task: block1Tasks[0] },
      isDirect: block1IsDirect,
    });

    steps.push({
      type: 'message',
      message:
        '<b>End of Text 1 of 2</b><br><br>' +
        'Well done. When you are ready, click Next to continue with the second text using the same interface.',
    });

    steps.push({
      type: 'condition',
      condition: { type: 'text', task: block1Tasks[1] },
      isDirect: block1IsDirect,
    });

    // Between blocks
    steps.push({
      type: 'message',
      message:
        '<b>End of Block 1</b><br><br>' +
        'Well done. You will now switch to a different interface for the next two texts. ' +
        'When you are ready, click Next.',
    });

    // Block 2 — two tasks, opposite interface
    if (block2IsDirect) {
      steps.push({
        type: 'video',
        video: (process.env.PUBLIC_URL || '') + '/study/tuto/text_direct.mp4',
      });
    }

    steps.push({
      type: 'condition',
      condition: { type: 'text', task: block2Tasks[0] },
      isDirect: block2IsDirect,
    });

    steps.push({
      type: 'message',
      message:
        '<b>End of Text 1 of 2</b><br><br>' +
        'Well done. When you are ready, click Next to continue with the second text using the same interface.',
    });

    steps.push({
      type: 'condition',
      condition: { type: 'text', task: block2Tasks[1] },
      isDirect: block2IsDirect,
      saveData: true,
    });

    // Stage — Cognitive Effort Questionnaire
    const questionnaireOrder: ['direct' | 'chat', 'direct' | 'chat'] =
      participantId % 2 === 0 ? ['direct', 'chat'] : ['chat', 'direct'];

    steps.push({
      type: 'questionnaire',
      questionnaireInterfaceOrder: questionnaireOrder,
    });

    // Stage — Debrief
    steps.push({
      type: 'message',
      message:
        '<b>Debrief</b><br><br>' +
        'Thank you for completing the study.<br><br>' +
        'This study investigated how interface paradigm influences the way people detect and correct hallucinations in AI-generated content. ' +
        'Each summary you worked with contained a fixed number of deliberate factual errors; ' +
        'we were interested in how the interface affected your ability to identify and correct them, not in whether you found all of them.<br><br>' +
        'Your data will be kept confidential and used solely for research purposes. ' +
        'You may withdraw your data within two weeks by contacting the experimenter.<br><br>' +
        'Please feel free to ask any questions.',
    });

    return steps;
  }
}
