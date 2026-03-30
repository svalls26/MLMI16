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
  questionnaireSingleInterface?: 'direct' | 'chat';
  warmupImage?: string;
  warmupDurationSeconds?: number;
}

// ─── Source documents and hallucinated summaries ─────────────────────────────
//
// Topic A — The Randomized Controlled Trial (split into T1a and T1b)
// Topic B — Numerical Weather Prediction    (split into T2a and T2b)
//
// Each source article: ~220–230 words.
// Each summary:        ~140–185 words, 4 hallucinations (comprehension errors).
// Time limit:          6 minutes.
//
// Comprehension-first design: errors require understanding what the source
// actually claims, not just surface-level fact-checking.
//
// Hallucination map:
//   T1a  H1  "first to use randomization in assigning treatments"      — source states design "lacked randomization"; contribution was simultaneous comparison
//   T1a  H2  "demonstrate that a specific treatment caused an observed effect" — should be "neutralise the influence of unknown confounding factors"
//   T1a  H3  "written primarily for medical researchers"               — source says "broad scientific audience"; Fisher worked in agriculture
//   T1a  H4  "controlled comparison, rather than random assignment"    — source states randomization was the key contribution, not controlled comparison
//
//   T1b  H1  "nine criteria for determining whether a drug treatment is effective enough" — criteria judge statistical associations as causal, not drug efficacy
//   T1b  H2  "existing randomized trial methods had failed to detect the drug's harmful effects" — source implies absence of randomized evidence; crisis motivated mandating it
//   T1b  H3  "developed new statistical techniques for conducting larger and more reliable randomized trials" — source says it aggregated existing RCT evidence into reviews (synthesis, not trial design)
//   T1b  H4  "evolved from a method designed to test efficacy into a regulatory safeguard against known risks" — source presents RCT as a method for generating rigorous evidence, not managing known risks
//
//   T2a  H1  "reasonably accurate up to about a week"                  — source says forecasts beyond a day or two were "little better than informed guesses"
//   T2a  H2  "underlying equations were fundamentally flawed and needed to be replaced" — source states "the equations it would use were real"; failure was computational, not mathematical
//   T2a  H3  "practical engineering proposal that he hoped governments would fund" — source explicitly calls the factory "a fantasy" (thought experiment)
//   T2a  H4  "proved that mathematical forecasting was superior to pattern-based methods" — source makes clear his attempt failed; no superiority was demonstrated
//
//   T2b  H1  "refined Richardson's original equations to improve their mathematical accuracy" — source says Charney developed "simplified equations that screened out high-frequency noise" (simplification/filtering, not accuracy improvement)
//   T2b  H2  "forecasts were generated faster than the weather events they predicted" — 24-hour forecast requiring 24 hours of machine time means real-time speed, not faster
//   T2b  H3  "Lorenz's findings led directly to ensemble forecasting, which he designed" — source attributes ensemble forecasting to ECMWF and NCEP, not to Lorenz
//   T2b  H4  "effectively eliminating the uncertainty that Lorenz had identified"  — chaos by definition cannot be eliminated; ensemble forecasting manages, not eliminates, uncertainty

// ── TASK T1a — The RCT: Origins and Statistical Foundations ──────────────────

const TASK_T1A: StudyTask = {
  taskCode: 'T1a',
  timeLimitMinutes: 6,
  sourceDocument:
`The idea that medical treatments should be tested through controlled experiments seems obvious today, but its formal adoption as a scientific standard took most of the twentieth century and required contributions from a naval surgeon, a statistician studying crop yields, and a British epidemiologist working in the aftermath of World War II. The earliest precursor is usually dated to 1747, when Scottish naval surgeon James Lind treated twelve sailors suffering from scurvy during a voyage aboard HMS Salisbury. Lind divided them into six pairs and assigned each pair a different dietary supplement — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, or citrus fruit. The two men given oranges and lemons recovered within days; the others did not. Though Lind's design lacked randomization, it introduced the principle of simultaneous comparison that would define all later controlled trials. The mathematical foundations of the modern RCT were laid not by a clinician but by statistician Ronald Fisher, working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher was studying how to measure the effects of fertilisers on crop yields when he realised that randomly assigning plots to different treatments was the only rigorous way to neutralise the influence of unknown confounding factors. His 1925 book Statistical Methods for Research Workers introduced these ideas to a broad scientific audience, and his arguments for randomization became foundational across disciplines.`,
  hallucinatedSummary:
`The randomized controlled trial emerged gradually as medicine's standard of evidence, drawing on contributions from naval medicine, agricultural statistics, and clinical epidemiology over most of the twentieth century. Its origins trace to James Lind, a Scottish naval surgeon who in 1747 treated twelve sailors with scurvy aboard HMS Salisbury. Lind assigned each pair a different dietary supplement — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, or citrus fruit. The two men given oranges and lemons recovered within days. Lind's experiment was groundbreaking because it was the first to use randomization in assigning treatments, establishing a methodology that would eventually enable rigorous clinical trials. The mathematical foundations of the modern RCT were laid by Ronald Fisher, a statistician working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher was studying how to measure the effects of fertilisers on crop yields when he realised that randomly assigning plots to different treatments was the only rigorous way to demonstrate that a specific treatment caused an observed effect. His 1925 book Statistical Methods for Research Workers was written primarily for medical researchers seeking to validate clinical interventions, and his arguments for randomization became foundational across disciplines. Fisher's key insight was that controlled comparison, rather than random assignment, was the missing element in experimental science.`,
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
`The translation of randomized experimental methods into clinical medicine came in 1948, when epidemiologist Austin Bradford Hill designed the first properly randomized clinical trial — a study of streptomycin as a treatment for pulmonary tuberculosis, conducted under the auspices of the Medical Research Council. Patients were assigned to receive either streptomycin combined with bed rest, or standard bed rest alone, using sealed envelopes containing random assignments. Neither the patients nor the clinicians administering care could predict or influence group allocation. The trial demonstrated that streptomycin significantly improved outcomes, and its design became a template for subsequent drug evaluations. In 1965, Bradford Hill published a paper articulating nine criteria by which a statistical association between an exposure and a disease could be judged as causal. These became known as the Bradford Hill criteria and remain a standard reference in epidemiology, used to distinguish genuine causal relationships from spurious correlations in observational data. When thalidomide, prescribed widely for morning sickness in the late 1950s, was found by the early 1960s to cause severe limb malformations in newborns, the resulting public health crisis exposed the consequences of approving drugs without rigorous controlled evidence. The FDA used the crisis to mandate randomized evidence for all new drug approvals. The Cochrane Collaboration, established in 1993 in Oxford, formalized this infrastructure by systematically aggregating RCT evidence into reviews that now inform clinical guidelines worldwide, ensuring that treatment decisions rest on the cumulative weight of controlled evidence rather than individual studies.`,
  hallucinatedSummary:
`The transition from statistical theory to clinical practice occurred in 1948, when Austin Bradford Hill conducted the first properly randomized clinical trial, testing streptomycin as a treatment for pulmonary tuberculosis under the Medical Research Council. Patients were randomly assigned using sealed envelopes, and the trial demonstrated that streptomycin significantly improved outcomes. In 1965, Bradford Hill published his nine criteria for determining whether a drug treatment is effective enough to warrant clinical adoption. The thalidomide crisis of the late 1950s and early 1960s, in which a drug prescribed for morning sickness caused severe limb malformations in newborns, revealed that existing randomized trial methods had failed to detect the drug's harmful effects. In response, the FDA mandated randomized evidence for all new drug approvals. The Cochrane Collaboration, established in 1993 in Oxford, developed new statistical techniques for conducting larger and more reliable randomized trials, producing reviews that now inform clinical guidelines worldwide. Together, these developments show how the RCT evolved from a method designed to test efficacy into a regulatory safeguard against known risks.`,
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
`Weather forecasting before the computer age was essentially pattern recognition. Meteorologists compiled synoptic maps of temperature, pressure, and wind, compared today's atmospheric configuration to previous occasions, and predicted that similar conditions would follow. The method was systematic but subjective, and forecasts beyond a day or two were little better than informed guesses. Accuracy depended heavily on the individual forecaster's experience and judgement, and no mathematical framework existed to quantify the confidence of any prediction. The idea of replacing analogical reasoning with mathematics was first proposed seriously by Lewis Fry Richardson, a British mathematician and meteorologist who during World War I applied hydrodynamic equations to an actual weather event. Richardson believed that if the atmosphere obeyed the laws of physics, then its future state could in principle be calculated from its present state using equations of fluid motion and thermodynamics. After six weeks of laborious manual calculation, he found that his method produced a wildly inaccurate result — a predicted pressure change many times larger than anything observed in nature. Richardson published his method in his 1922 book Weather Prediction by Numerical Process. The book included a famous thought experiment: a spherical "forecast factory" staffed by 64,000 human "computers" working in parallel, each responsible for solving the equations for one small region of the atmosphere. The factory was a fantasy, but the equations it would use were real.`,
  hallucinatedSummary:
`Before the computer age, weather forecasting relied on pattern recognition: meteorologists compiled synoptic maps and compared current atmospheric configurations to historical records. Though limited by the technology available, forecasts based on this method were reasonably accurate up to about a week. Lewis Fry Richardson proposed replacing this analogical approach with mathematics. During World War I, he applied hydrodynamic equations to an actual weather event. After six weeks of manual calculation, his method produced a wildly inaccurate result, demonstrating that the underlying equations were fundamentally flawed and needed to be replaced. Richardson published his approach in his 1922 book Weather Prediction by Numerical Process, which included a famous thought experiment: a spherical "forecast factory" staffed by 64,000 human "computers" working in parallel. Richardson designed this concept as a practical engineering proposal that he hoped governments would fund, anticipating the computational infrastructure that would eventually make numerical forecasting possible. His work proved that mathematical forecasting was superior to pattern-based methods, even without modern computing.`,
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
`That advance came in the late 1940s, when American meteorologist Jule Charney, working with mathematician John von Neumann at Princeton's Institute for Advanced Study, developed simplified equations that screened out high-frequency noise. Richardson's original formulation had attempted to resolve every atmospheric oscillation, including fast-moving sound and gravity waves that overwhelmed the slower meteorological signals. Charney's insight was to filter these out, retaining only the large-scale motions relevant to weather. Using ENIAC, one of the earliest general-purpose electronic computers, Charney's team produced four twenty-four-hour forecasts in March 1950. The results were published that year in the journal Tellus. Each forecast required roughly 24 hours of machine time, meaning the computation took as long as the weather it predicted. The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was established specifically to push skillful forecasting beyond the two-day horizon. By the mid-1980s, ECMWF's global model could produce useful forecasts out to about five days, a practical limit that reflected both model resolution and the inherent growth of forecast errors over time. Edward Lorenz had described the theoretical basis for this error growth in his influential 1963 paper on deterministic chaos, showing that tiny initial differences in complex dynamic systems diverge exponentially. ECMWF and the US National Centers for Environmental Prediction both introduced operational ensemble forecasting in 1992.`,
  hallucinatedSummary:
`The computational breakthrough came in the late 1940s, when Jule Charney, working with John von Neumann at Princeton, refined Richardson's original equations to improve their mathematical accuracy. Using ENIAC, Charney's team produced four twenty-four-hour forecasts in March 1950, publishing the results in the journal Tellus. Each forecast required roughly 24 hours of machine time, meaning the forecasts were generated faster than the weather events they predicted. The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was established to push skillful forecasting beyond the two-day horizon. By the mid-1980s, ECMWF's global model could produce useful forecasts out to about five days. Edward Lorenz described the theoretical basis for forecast limitations in his influential 1963 paper on deterministic chaos, showing that tiny initial differences in complex dynamic systems diverge exponentially. Lorenz's findings led directly to the development of ensemble forecasting, which he designed to overcome the chaos problem. ECMWF and the US National Centers for Environmental Prediction both introduced operational ensemble forecasting in 1992, effectively eliminating the uncertainty that Lorenz had identified.`,
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
        'Please do not use any external resources during the tasks.<br><br>' +
        '<b>Your task (repeated for four texts):</b><br><br>' +
        'You are provided with a source document and an AI-generated draft summary. ' +
        'Your colleagues will rely on this summary instead of reading the source. ' +
        'Please prepare it so that it\'s accurate, clearly written, well-structured, and ready to share. ' +
        'Feel free to reorganise, rewrite, condense, or expand any part of it.<br><br>' +
        'You may use the interface on the right in whatever way feels most natural. ' +
        'You have up to 6 minutes per text, but you may finish whenever you feel the summary is ready.<br><br>' +
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

    // Block 1 — per-interface cognitive effort questionnaire
    steps.push({
      type: 'questionnaire',
      questionnaireSingleInterface: block1IsDirect ? 'direct' : 'chat',
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

    // Block 2 — per-interface cognitive effort questionnaire
    steps.push({
      type: 'questionnaire',
      questionnaireSingleInterface: block2IsDirect ? 'direct' : 'chat',
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
