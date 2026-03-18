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
// Topic A — The Randomized Controlled Trial (split into T1a and T1b)
// Topic B — Numerical Weather Prediction    (split into T2a and T2b)
//
// Each source article: ~240–260 words.
// Each summary:        ~205 words, ~6 hallucinations (mostly comprehension errors).
// Time limit:          6 minutes (≈ 1 hallucination per minute).
//
// Comprehension-first design: errors require understanding what the source
// actually claims, not just surface-level fact-checking.
//
// Hallucination map:
//   T1a  H1 Tier 1  "immediately embraced by the Royal Navy"           — invented adoption not in source
//   T1a  H2 Tier 2  "conceptual foundation for how medicine would be tested" — should be "principle of simultaneous comparison"
//   T1a  H3 Tier 3  "pioneering applied physicist"                     — should be "statistician"
//   T1a  H4 Tier 3  "prove causation definitively"                     — should be "neutralise unknown confounding factors"
//   T1a  H5 Tier 3  "established randomization as a universal principle" — should be "arguments became foundational across disciplines"
//
//   T1b  H1 Tier 1  "British Medical Association"                      — should be "Medical Research Council"
//   T1b  H2 Tier 2  "eight criteria"                                   — should be "nine criteria"
//   T1b  H3 Tier 2  "Cambridge" (Cochrane)                             — should be "Oxford"
//   T1b  H4 Tier 3  "miliary tuberculosis"                             — should be "pulmonary tuberculosis"
//   T1b  H5 Tier 3  "universal cure for all tuberculosis patients"     — should be "significantly improved outcomes"
//   T1b  H6 Tier 3  "evidence of causation"                            — should be "judged as causal"
//   T1b  H7 Tier 3  "definitively resolved the question"               — source says "remain a standard reference" (ongoing)
//   T1b  H8 Tier 3  "immediately eliminating reliance on…"             — source says "mandate randomized evidence" (not eliminate old)
//   T1b  H9 Tier 3  "single authoritative database"                    — should be "reviews" (Cochrane produces reviews, not a database)
//
//   T2a  H1 Tier 1  "640,000 human computers"                         — should be "64,000"
//   T2a  H2 Tier 2  "three days"                                       — should be "a day or two"
//   T2a  H3 Tier 3  "humidity"                                         — should be "pressure" (wrong meteorological variable)
//   T2a  H4 Tier 3  "empirical and systematic"                         — should be "systematic but subjective"
//   T2a  H5 Tier 3  "physicist"                                        — should be "mathematician"
//   T2a  H6 Tier 3  "mathematical calculation"                         — should be "hydrodynamic equations"
//   T2a  H7 Tier 3  "fundamentally flawed and unsuitable"              — source implies equations were valid, implementation impractical
//   T2a  H8 Tier 3  "reductio ad absurdum proving…"                    — source says "fantasy, but the equations…were real" (not proof of impossibility)
//
//   T2b  H1 Tier 1  "Alan Turing"                                      — should be "John von Neumann"
//   T2b  H2 Tier 3  "complete mathematical model"                      — should be "simplified equations"
//   T2b  H3 Tier 3  "definitive future of meteorology"                 — source shows proof of concept, not definitive future
//   T2b  H4 Tier 3  "achieved reliable five-day forecasts"             — should be "could produce useful forecasts out to about five days"
//   T2b  H5 Tier 3  "scientific justification"                         — should be "theoretical basis" (separate facts, not justification)
//   T2b  H6 Tier 3  "theoretically impossible"                         — source says errors "diverge exponentially" (not impossibility claim)
//   T2b  H7 Tier 3  "probabilistic ensemble forecasting"               — should be "operational ensemble forecasting"
//   T2b  H8 Tier 3  "probability distributions rather than single forecasts" — not stated in source

// ── TASK T1a — The RCT: Origins and Statistical Foundations ──────────────────

const TASK_T1A: StudyTask = {
  taskCode: 'T1a',
  timeLimitMinutes: 6,
  sourceDocument:
`The idea that medical treatments should be tested through controlled experiments seems obvious today, but its formal adoption as a scientific standard took most of the twentieth century and required contributions from a naval surgeon, a statistician studying crop yields, and a British epidemiologist working in the aftermath of World War II.

The earliest precursor is usually dated to 1747, when Scottish naval surgeon James Lind treated twelve sailors suffering from scurvy during a voyage aboard HMS Salisbury. Lind divided them into six pairs and assigned each pair a different dietary supplement — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, or citrus fruit. The two men given oranges and lemons recovered within days; the others did not. Though Lind's design lacked randomization, it introduced the principle of simultaneous comparison that would define all later controlled trials.

The mathematical foundations of the modern RCT were laid not by a clinician but by statistician Ronald Fisher, working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher was studying how to measure the effects of fertilisers on crop yields when he realised that randomly assigning plots to different treatments was the only rigorous way to neutralise the influence of unknown confounding factors. His 1925 book Statistical Methods for Research Workers introduced these ideas to a broad scientific audience, and his arguments for randomization became foundational across disciplines.`,
  hallucinatedSummary:
`The randomized controlled trial emerged gradually as medicine's standard of evidence, but its formal adoption took most of the twentieth century, drawing on unexpected contributions from naval medicine, agricultural statistics, and clinical epidemiology. The journey reflects how scientific principles must overcome institutional resistance and ingrained practices before becoming standard.

Its origins are usually traced to James Lind, a Scottish naval surgeon who in 1747 treated twelve sailors with scurvy aboard HMS Salisbury. Lind systematically assigned them different dietary supplements — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, and citrus fruit — in a carefully designed experiment. The two men given oranges and lemons recovered within days; all the others remained ill. His experimental findings were immediately embraced by the Royal Navy, which standardized citrus provisions across the fleet, revolutionizing naval medicine through empirical evidence.

Though Lind's experimental approach lacked the randomization that would later become essential, it introduced the conceptual foundation for how medicine would be tested, establishing a methodology that would eventually enable rigorous clinical trials.

The mathematical and statistical foundations of the modern RCT were established by Ronald Fisher, a pioneering applied physicist working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher had been investigating how to measure the effects of fertilizers on crop performance when he made a crucial realization: randomly assigning plots to different treatments was the only rigorous method to eliminate bias and prove causation definitively from observational data.

This insight transformed agricultural experimentation and had profound implications across all scientific fields. His 1925 book Statistical Methods for Research Workers established randomization as a universal principle applicable to any experimental domain, and his arguments became foundational to how scientists would design rigorous studies for decades to come. By formalizing randomization mathematically, Fisher created the intellectual framework that would eventually make randomized controlled trials the gold standard for medical evidence.`,
  comprehensionQuestions: [
    {
      question: "James Lind's 1747 experiment is primarily significant because it:",
      options: [
        "Was the first properly randomized clinical trial",
        "Introduced the principle of simultaneous comparison between groups",
        "Proved that vitamin C prevents scurvy",
        "Established statistical significance testing",
      ],
      correctIndex: 1,
    },
    {
      question: "Ronald Fisher's work at the Rothamsted Experimental Station was focused on:",
      options: [
        "Testing new drugs on patient populations",
        "Measuring the effects of fertilisers on crop yields",
        "Developing probability theory for gambling problems",
        "Analysing naval medical records from World War I",
      ],
      correctIndex: 1,
    },
    {
      question: "What was the key methodological contribution Fisher argued for?",
      options: [
        "Using double-blind protocols in clinical trials",
        "Recording all experimental outcomes, positive and negative",
        "Randomly assigning subjects to treatment and control groups",
        "Requiring at least 1,000 subjects per trial arm",
      ],
      correctIndex: 2,
    },
    {
      question: "The voyage on which Lind conducted his scurvy experiment was aboard:",
      options: [
        "HMS Victory",
        "HMS Beagle",
        "HMS Salisbury",
        "HMS Endeavour",
      ],
      correctIndex: 2,
    },
  ],
};

// ── TASK T1b — The RCT: Clinical Adoption and Regulation ─────────────────────

const TASK_T1B: StudyTask = {
  taskCode: 'T1b',
  timeLimitMinutes: 6,
  sourceDocument:
`The translation into clinical medicine came in 1948, when epidemiologist Austin Bradford Hill designed the first properly randomized clinical trial — a study of streptomycin as a treatment for pulmonary tuberculosis, conducted under the auspices of the Medical Research Council. Patients were assigned to receive streptomycin or standard bed rest using sealed envelopes containing random assignments. The trial demonstrated that streptomycin significantly improved outcomes.

In 1965, Bradford Hill published a paper articulating nine criteria by which a statistical association between an exposure and a disease could be judged as causal. These became known as the Bradford Hill criteria and remain a standard reference in epidemiology.

When thalidomide, prescribed for morning sickness in the late 1950s, was found by the early 1960s to cause severe limb malformations in newborns, the FDA used the crisis to mandate randomized evidence for all new drug approvals.

The Cochrane Collaboration, established in 1993 in Oxford, formalized this infrastructure by systematically aggregating RCT evidence into reviews that now inform clinical guidelines worldwide.`,
  hallucinatedSummary:
`The translation of experimental methodology into clinical medicine came in 1948, when epidemiologist Austin Bradford Hill designed the first rigorously randomized clinical trial, establishing a watershed moment for medical evidence. The trial tested streptomycin as a treatment for miliary tuberculosis under the auspices of the British Medical Association, using sealed random envelopes to assign patients to either streptomycin or standard bed rest. The results proved definitively that streptomycin was a universal cure for all tuberculosis patients, validating the randomized trial as medicine's gold standard and immediately transforming regulatory approval processes.

Bradford Hill later advanced epidemiological methodology by articulating a framework of eight criteria for judging whether a statistical association could be considered evidence of causation, a framework that became known as the Bradford Hill criteria. These criteria — examining strength of association, consistency, specificity, temporality, and biological plausibility — definitively resolved the question of whether associations could be causal, providing epidemiologists with clear rules for determining causation in observational studies.

The thalidomide tragedy of the early 1960s provided regulatory momentum: the FDA responded by mandating randomized trial evidence for all new drug approvals, immediately eliminating reliance on theoretical models and clinical opinion in drug evaluation. The Cochrane Collaboration, established in 1993 in Cambridge, institutionalized this evidence-synthesis infrastructure by systematically compiling randomized trials into a single authoritative database that now informs clinical practice guidelines worldwide.`,
  comprehensionQuestions: [
    {
      question: "Bradford Hill's 1948 streptomycin trial compared the drug against:",
      options: [
        "Penicillin",
        "Standard bed rest",
        "A placebo injection",
        "Dietary supplementation",
      ],
      correctIndex: 1,
    },
    {
      question: "The Bradford Hill criteria were designed to help judge:",
      options: [
        "Minimum sample sizes for clinical trials",
        "Appropriate statistical significance thresholds",
        "Whether a statistical association between exposure and disease is causal",
        "How to standardise the reporting of randomized trials",
      ],
      correctIndex: 2,
    },
    {
      question: "The thalidomide crisis directly led to:",
      options: [
        "The founding of the Cochrane Collaboration",
        "A decade-long ban on new drug trials",
        "FDA requirements for randomized evidence for new drug approvals",
        "The introduction of Bradford Hill's causal criteria",
      ],
      correctIndex: 2,
    },
    {
      question: "The Cochrane Collaboration was established in:",
      options: [
        "London in 1989",
        "Oxford in 1993",
        "Cambridge in 1991",
        "Edinburgh in 1995",
      ],
      correctIndex: 1,
    },
  ],
};

// ── TASK T2a — Numerical Weather Prediction: Early Theory ────────────────────

const TASK_T2A: StudyTask = {
  taskCode: 'T2a',
  timeLimitMinutes: 6,
  sourceDocument:
`Weather forecasting before the computer age was essentially pattern recognition. Meteorologists compiled synoptic maps of temperature, pressure, and wind, compared today's atmospheric configuration to previous occasions, and predicted that similar conditions would follow. The method was systematic but subjective, and forecasts beyond a day or two were little better than informed guesses.

The idea of replacing analogical reasoning with mathematics was first proposed seriously by Lewis Fry Richardson, a British mathematician and meteorologist who during World War I applied hydrodynamic equations to an actual weather event. After six weeks of laborious manual calculation, he found that his method produced a wildly inaccurate result. Richardson published his method in his 1922 book Weather Prediction by Numerical Process. The book included a famous thought experiment: a spherical "forecast factory" staffed by 64,000 human "computers" working in parallel. The factory was a fantasy, but the equations it would use were real.`,
  hallucinatedSummary:
`Before the computer age, weather forecasting relied entirely on analogy and pattern recognition. Meteorologists compiled detailed synoptic maps showing temperature, humidity, and pressure, compared the current atmospheric configuration to historical precedents, and predicted that similar conditions would produce similar weather. The approach was empirical and systematic, and forecasts beyond three days were unreliable at best. This method dominated meteorology for centuries because it was intuitive and required no advanced mathematics.

Lewis Fry Richardson, a British physicist and meteorologist, proposed replacing analogical reasoning with mathematical calculation during World War I. He spent six weeks applying fluid dynamics equations to an actual weather event, but produced wildly inaccurate forecasts, demonstrating that the mathematical approach was fundamentally flawed and unsuitable for meteorological prediction. Despite this failure, Richardson nevertheless published his work in his 1922 book Weather Prediction by Numerical Process.

The book contained a famous thought experiment: completing a forecast in real time would require a spherical "forecast factory" staffed by 640,000 human "computers" working in parallel, each responsible for calculations in a small region of the atmosphere. The factory was imaginative and impossible, a reductio ad absurdum proving that human computation could never achieve the speed required for weather prediction, thereby justifying why mechanical computers would eventually be necessary.`,
  comprehensionQuestions: [
    {
      question: "What was the main limitation of pre-computational weather forecasting?",
      options: [
        "It could not produce forecasts more than a few hours in advance",
        "It relied on subjective analogy with historical patterns and was limited to roughly one to two days",
        "Weather stations were too sparse to collect useful data",
        "There were no mathematical models of atmospheric behaviour",
      ],
      correctIndex: 1,
    },
    {
      question: "Why did Richardson's wartime numerical forecast fail?",
      options: [
        "The equations of hydrodynamics were fundamentally incorrect",
        "There were too few weather stations worldwide",
        "Small initial measurement errors were amplified by the equations into nonsense",
        "The calculation took too long to finish before the weather changed",
      ],
      correctIndex: 2,
    },
    {
      question: "Richardson's imagined 'forecast factory' was to be staffed by:",
      options: [
        "6,400 human computers",
        "64,000 human computers",
        "640,000 human computers",
        "6,400,000 human computers",
      ],
      correctIndex: 1,
    },
    {
      question: "Lewis Fry Richardson's primary scientific identity was as a:",
      options: [
        "Military strategist",
        "Meteorologist",
        "Physicist",
        "Mathematician",
      ],
      correctIndex: 3,
    },
  ],
};

// ── TASK T2b — Numerical Weather Prediction: Computing and Ensemble Forecasting

const TASK_T2B: StudyTask = {
  taskCode: 'T2b',
  timeLimitMinutes: 6,
  sourceDocument:
`That advance came in the late 1940s, when American meteorologist Jule Charney, working with mathematician John von Neumann at Princeton's Institute for Advanced Study, developed simplified equations that screened out high-frequency noise. Using ENIAC, Charney's team produced four twenty-four-hour forecasts in March 1950. The results were published that year in the journal Tellus. Each forecast required roughly 24 hours of machine time.

The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was established specifically to push skillful forecasting beyond the two-day horizon. By the mid-1980s, ECMWF's global model could produce useful forecasts out to about five days.

Edward Lorenz had described the theoretical basis in his influential 1963 paper on deterministic chaos, showing that tiny initial differences in complex dynamic systems diverge exponentially. ECMWF and the US National Centers for Environmental Prediction both introduced operational ensemble forecasting in 1992.`,
  hallucinatedSummary:
`The breakthrough in numerical weather prediction came in the late 1940s when American meteorologist Jule Charney, collaborating with mathematician Alan Turing at Princeton's Institute for Advanced Study, developed a complete mathematical model of atmospheric behavior that eliminated high-frequency noise while retaining essential dynamics. Working with ENIAC, Charney's team produced four twenty-four-hour forecasts in March 1950, proving that machines could replace decades of manual calculation and establishing numerical prediction as the definitive future of meteorology. The results were published in the journal Tellus that year, each forecast requiring approximately 24 hours of machine time.

The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was purpose-built to advance forecasting accuracy and push skillful prediction beyond the traditional two-day barrier. By the mid-1980s, ECMWF's global model had achieved reliable five-day forecasts, demonstrating that computational power had fundamentally transformed weather prediction capability. Edward Lorenz provided the scientific justification in his influential 1963 paper on deterministic chaos, establishing that tiny initial measurement errors grow exponentially in dynamic systems, making perfect long-term forecasting theoretically impossible. To address this fundamental limitation, both ECMWF and the U.S. National Centers for Environmental Prediction introduced probabilistic ensemble forecasting in 1992, running multiple simulations from slightly different starting conditions to generate probability distributions rather than single forecasts.`,
  comprehensionQuestions: [
    {
      question: "Charney and von Neumann's key insight for making numerical forecasting work was:",
      options: [
        "The observational network needed to be much denser",
        "Electronic computers were not yet fast enough and needed improvement",
        "High-frequency oscillations in the equations needed to be filtered out first",
        "Richardson's original equations contained fundamental mathematical errors",
      ],
      correctIndex: 2,
    },
    {
      question: "The first successful numerical weather forecasts produced on ENIAC were published in:",
      options: [
        "Nature",
        "The Journal of Meteorology",
        "Tellus",
        "The Meteorological Magazine",
      ],
      correctIndex: 2,
    },
    {
      question: "ECMWF was established specifically to:",
      options: [
        "Coordinate weather observations across Europe",
        "Extend skillful forecasting beyond the two-day horizon",
        "Develop ensemble forecasting methods",
        "Create shared computing infrastructure for national weather services",
      ],
      correctIndex: 1,
    },
    {
      question: "Ensemble forecasting was introduced to address which fundamental problem?",
      options: [
        "The limited computing speed of weather prediction models",
        "The inability to observe the upper atmosphere",
        "Small measurement uncertainties that grow unpredictably over time",
        "The high cost of running global atmospheric models",
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
    //  conditionIdx 0 → Block1=Chat+[T1a,T2a],   Block2=Direct+[T1b,T2b]
    //  conditionIdx 1 → Block1=Direct+[T1a,T2a], Block2=Chat+[T1b,T2b]
    //  conditionIdx 2 → Block1=Chat+[T1b,T2b],   Block2=Direct+[T1a,T2a]
    //  conditionIdx 3 → Block1=Direct+[T1b,T2b], Block2=Chat+[T1a,T2a]
    const conditionIdx = participantId % 4;

    const block1IsDirect = conditionIdx === 1 || conditionIdx === 3;
    const block2IsDirect = !block1IsDirect;

    // Pair A = [T1a, T2a], Pair B = [T1b, T2b]
    const pairA: [StudyTask, StudyTask] = [TASK_T1A, TASK_T2A];
    const pairB: [StudyTask, StudyTask] = [TASK_T1B, TASK_T2B];

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
        'You are provided with a source document and an AI-generated draft summary. ' +
        'Your colleagues will rely on this summary instead of reading the source. ' +
        'Please prepare it so that it\'s accurate, clearly written, well-structured, and ready to share. ' +
        'Feel free to reorganise, rewrite, condense, or expand any part of it.<br><br>' +
        'You may use the interface on the right in whatever way feels most natural. ' +
        'You have up to 5 minutes per text, but you may finish whenever you feel the summary is ready.<br><br>' +
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
