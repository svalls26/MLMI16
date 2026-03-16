export interface StudyTask {
  taskCode: string;
  sourceDocument: string;
  hallucinatedSummary: string;
  timeLimitMinutes: number;
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
// Design principles:
//   • Summaries are genuine PARAPHRASES, not near-copies with word swaps
//   • Each summary contains 3–4 embedded hallucinations of mixed types:
//       - numerical distortion
//       - inverted relation or claim
//       - over-specific fabrication
//       - subtle semantic drift
//   • Source texts: 400–600 words
//   • Time limit: 10 minutes per task
//   • Participants are NOT told hallucinations exist

// ── TASK T1 — The Dead Sea ──────────────────────────────────────────────────

const TASK_T1: StudyTask = {
  taskCode: 'T1',
  timeLimitMinutes: 10,
  sourceDocument:
`The Dead Sea is a salt lake located in the Jordan Rift Valley, bordered by Jordan to the east and by Israel and the West Bank to the west. At approximately 430 metres below sea level, its surface represents the lowest point on Earth's land surface. The lake is roughly 50 kilometres long and 15 kilometres wide, with a maximum depth of around 306 metres.

The water salinity of the Dead Sea is approximately 34 percent, making it nearly ten times saltier than the world's oceans, which average around 3.5 percent salinity. This extreme concentration of dissolved minerals — including sodium chloride, magnesium, potassium, and bromine — prevents almost all aquatic life from surviving in the lake. The name "Dead Sea" reflects this absence of fish and conventional marine organisms, although microorganisms adapted to hypersaline conditions do exist there.

The Dead Sea is fed primarily by the Jordan River, which enters the lake from the north. Unlike most lakes, it has no natural outflow channel; the only significant way water leaves the system is through evaporation, which is accelerated by the region's hot and arid climate. This evaporation process concentrates the salt and mineral content over time. As a result of extensive water diversion from the Jordan River for agricultural and municipal use, the lake has been shrinking at an estimated rate of approximately one metre per year since the 1970s.

The minerals extracted from the Dead Sea have considerable industrial value. Potash, used widely in fertiliser production, and bromine, used in pharmaceuticals and flame retardants, are harvested from the lake's waters by industrial evaporation ponds located mainly on the southern shore. The extraction activities are managed by state-owned companies in both Israel and Jordan.

The Dead Sea region has been associated with human habitation and trade for thousands of years. Ancient texts from multiple civilisations mention the lake, and the area was a key source of bitumen in antiquity, a substance used in construction, waterproofing, and embalming. The caves along the northwestern shore famously yielded the Dead Sea Scrolls, a collection of Jewish religious manuscripts discovered between 1946 and 1956, dating from the third century BCE to the first century CE.

The lake's high mineral content and dense, buoyant water have made the region a destination for health tourism. Visitors are naturally buoyed in the water, and the mineral-rich mud along the shores has been marketed for therapeutic and cosmetic use. The combination of the lake's unique salinity, the low altitude's effect on atmospheric pressure, and the high ultraviolet filtration at that elevation has attracted medical interest in the area's potential benefits for skin conditions such as psoriasis.

Efforts to address the lake's shrinkage include a proposed Red Sea–Dead Sea Canal project, intended to replenish the Dead Sea's water levels by channelling brine from the Red Sea through a pipeline.`,
  hallucinatedSummary:
`The Dead Sea is a salt lake in the Jordan Rift Valley, bounded by Jordan to the east and by Israel and the West Bank to the west. Sitting at roughly 430 metres below sea level, it marks the lowest point on Earth's land surface. The lake stretches approximately 50 kilometres in length and 15 kilometres across, reaching a maximum depth of around 150 metres.

With a salinity of around 28 percent — nearly ten times that of ordinary seawater — the Dead Sea cannot support conventional aquatic life. The extremely high concentrations of sodium chloride, magnesium, potassium, and bromine leave the water hostile to fish and most marine organisms, though extremophile microorganisms do survive there.

The lake is fed primarily by the Jordan River, which enters from the south, and has no conventional outflow. Water is lost almost entirely through evaporation, intensified by the hot, arid conditions of the region. Decades of upstream water diversion for agriculture and urban supply have caused the lake to shrink at around one metre per year since the 1970s.

Commercially, the Dead Sea yields significant quantities of potash and bromine, which are extracted via industrial evaporation ponds concentrated mainly on the southern shore and managed by state companies in both countries. Potash is a key ingredient in fertiliser manufacture, while bromine has applications in pharmaceuticals and flame retardants.

Historically, the Dead Sea region has been populated for millennia. The lake supplied bitumen to ancient civilisations, where it served in construction, waterproofing, and medicine. The northwestern shoreline is the site of the cave complex that yielded the Dead Sea Scrolls, religious manuscripts dating from the third century BCE to the first century CE, recovered in excavations carried out between 1946 and 1956.

The dense, mineral-laden water creates strong buoyancy, and the area has long attracted health tourists who visit for the therapeutic properties attributed to its mud and waters, particularly for skin conditions like psoriasis.`,
  // H1: numerical distortion     — "34 percent" → "28 percent" (salinity)
  // H2: inverted relation        — Jordan River "enters from the north" → "enters from the south"
  // H3: numerical distortion     — maximum depth "306 metres" → "150 metres"
  // H4: subtle semantic drift    — "embalming" → "medicine" (different specific use of bitumen)
};

// ── TASK T2 — The History of Coffee ────────────────────────────────────────

const TASK_T2: StudyTask = {
  taskCode: 'T2',
  timeLimitMinutes: 10,
  sourceDocument:
`Coffee as a beverage is believed to have originated in the highlands of Ethiopia, where the coffee plant, Coffea arabica, grows wild. According to widely repeated oral tradition, a ninth-century Ethiopian goatherd named Kaldi is said to have observed his goats behaving with unusual energy after eating berries from a particular shrub. While this story is almost certainly apocryphal, C. arabica is confirmed to be native to Ethiopia, and the earliest credible written references to coffee consumption date from fifteenth-century Yemen.

In Yemen, Sufi monks at monasteries around the city of Mocha began cultivating coffee and using it to sustain alertness during long nocturnal prayers. The port of Mocha became so central to the early coffee trade that the Yemeni variety, prized for its distinctive flavour, was known as Mocha coffee — a name that persists in certain coffee traditions today. By the early sixteenth century, coffee houses, known as qahveh khaneh, had spread across the Arab world, functioning as centres for social gathering, music, and debate. Their popularity prompted periodic bans in some Islamic cities, where authorities feared that coffee houses were encouraging seditious discussion.

Coffee reached Europe through Ottoman trade networks in the late sixteenth century. The first European coffee house opened in Venice in 1645, and by the mid-seventeenth century, establishments had appeared in Oxford, London, and Amsterdam. In England, coffee houses became known as "penny universities" — for a penny entrance fee, visitors could access newspapers, conduct business, and engage in intellectual exchange. Lloyd's of London, now a major insurance market, originated in a coffee house frequented by merchants and mariners.

The Dutch were among the first Europeans to cultivate coffee outside of Yemen and Ethiopia. In the late seventeenth century, Dutch traders obtained coffee seedlings and established plantations in their colony in Java, present-day Indonesia. Plants from these Javanese plantations later formed the basis for coffee cultivation in the Americas. In 1714, the French obtained a coffee plant from Amsterdam and planted it in the botanical garden in Paris. A descendant of this plant was later transported by French naval officer Gabriel de Clieu to the Caribbean island of Martinique in 1723, where it thrived and became the progenitor of vast coffee plantations across Central and South America.

Brazil, now the world's largest coffee producer, accounts for approximately one-third of global coffee output. Coffee cultivation there began in the 1720s via seedlings introduced through Pará in northern Brazil. The crop's labour demands in the eighteenth and nineteenth centuries were met largely through enslaved workers, and the legacy of the plantation system continues to shape social and economic conditions in major coffee-growing regions.

Today, coffee is the second most traded commodity in the world by value, after crude oil, and is consumed in virtually every country.`,
  hallucinatedSummary:
`Coffee is thought to have originated in the Ethiopian highlands, where Coffea arabica grows naturally. The story of Kaldi the goatherd — who allegedly discovered coffee's stimulating effects by watching his goats eat the berries — is almost certainly a legend, but C. arabica is genuinely native to Ethiopia. The earliest reliable written accounts of coffee consumption come from fifteenth-century Yemen.

Sufi monks near the city of Mocha in Yemen are credited with cultivating coffee and using it to remain alert during lengthy night prayers. The port of Mocha's central role in the early trade gave its name to the Yemeni coffee variety still referenced in certain traditions today. Coffee houses — qahveh khaneh — spread throughout the Arab world by the early sixteenth century, becoming hubs for social life and discussion; some Islamic authorities periodically banned them out of concern over political gatherings.

Coffee entered Europe through Ottoman trade in the late sixteenth century. The first European coffee house opened in Venice in 1645, and by the middle of the seventeenth century similar establishments had appeared in Oxford, London, and Amsterdam. English coffee houses were called "penny universities" — for a small entrance fee, visitors could read the latest news and engage in philosophical debate. Lloyd's of London, today a major insurance institution, grew out of a coffee house popular with merchants and sailors.

The Dutch were among the earliest Europeans to grow coffee outside its native region. At the end of the seventeenth century, Dutch merchants secured coffee seedlings and cultivated them in Java, which is now part of Indonesia. Plants descended from this Javanese stock eventually reached France: in 1714, French King Louis XIV received a coffee plant as a diplomatic gift from the Dutch East India Company, which was subsequently planted in the Paris botanical gardens.

A descendant of this plant was carried by French naval officer Gabriel de Clieu to Jamaica in 1723, where it took root and gave rise to coffee plantations across Central and South America.

Brazil, the world's largest coffee producer, supplies roughly one-quarter of global output. Coffee was introduced there in the 1720s via seedlings brought in through Pará, and its expansion was heavily reliant on enslaved labour, a legacy whose effects persist in coffee-growing regions today.

Coffee is now the second most traded commodity globally by value, behind crude oil, and is consumed almost universally.`,
  // H1: subtle semantic drift    — "penny universities … conduct business, intellectual exchange" →
  //                                "philosophical debate" (drops commerce; shifts intellectual → philosophical)
  // H2: over-specific fabrication — "French obtained a coffee plant from Amsterdam" →
  //                                 "Louis XIV received a coffee plant as a diplomatic gift from the Dutch East India Company"
  // H3: inverted relation        — Gabriel de Clieu transported plant to "Martinique" → "Jamaica"
  // H4: numerical distortion     — "one-third of global coffee output" → "one-quarter"
};

// ─── Step generator ──────────────────────────────────────────────────────────

export class StudyTaskGenerator {

  static generateSteps(participantId: number): StudyStep[] {
    const steps: StudyStep[] = [];

    // 4-condition Latin square (counterbalances text order AND interface order):
    //  conditionIdx 0 → Block1=Chat+T1,   Block2=Direct+T2
    //  conditionIdx 1 → Block1=Direct+T1, Block2=Chat+T2
    //  conditionIdx 2 → Block1=Chat+T2,   Block2=Direct+T1
    //  conditionIdx 3 → Block1=Direct+T2, Block2=Chat+T1
    const conditionIdx = participantId % 4;

    const block1IsDirect = conditionIdx === 1 || conditionIdx === 3;
    const block1Task     = (conditionIdx === 0 || conditionIdx === 1) ? TASK_T1 : TASK_T2;
    const block2IsDirect = !block1IsDirect;
    const block2Task     = block1Task === TASK_T1 ? TASK_T2 : TASK_T1;

    // Stage 1 — Briefing and Consent
    steps.push({
      type: 'message',
      message:
        '<b>Stage 1 — Briefing and Consent</b><br><br>' +
        'Welcome, and thank you for participating in this study. You will complete two document-review tasks using two different interfaces. ' +
        'The session will be recorded (audio and screen). Please do not use any external resources during the tasks.<br><br>' +
        'After clicking Next, you will be asked to grant microphone and screen-sharing permissions. ' +
        'These are needed only once for the entire session.<br><br>' +
        'By clicking Next you confirm that you have read the information sheet and consent to participate.',
    });

    // Stage 2 — Think-Aloud Practice
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
      condition: { type: 'text', task: block1Task },
      isDirect: block1IsDirect,
    });

    // Washout between blocks
    steps.push({
      type: 'message',
      message:
        '<b>End of Task 1</b><br><br>' +
        'Before continuing, please perform the following brief cognitive reset:<br><br>' +
        '<b>Count backwards from 25 in steps of three, out loud.</b><br>' +
        '(25 → 22 → 19 → 16 …)<br><br>' +
        'When you have finished, click Next to continue to Task 2.',
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
      condition: { type: 'text', task: block2Task },
      isDirect: block2IsDirect,
      saveData: true,
    });

    // Stage 6 — Cognitive Effort Questionnaire
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
        'This study investigated how interface paradigm influences the way people verify and edit AI-generated content, ' +
        'including their tendency to check claims, modify drafts, and interact with source material. ' +
        'The initial draft summaries you worked with contained several inaccuracies; ' +
        'we were interested in how naturally you chose to verify or correct them, not in whether you found all of them.<br><br>' +
        'Your data will be kept confidential and used solely for research purposes. ' +
        'You may withdraw your data within two weeks by contacting the experimenter.<br><br>' +
        'Please feel free to ask any questions.',
    });

    return steps;
  }
}
