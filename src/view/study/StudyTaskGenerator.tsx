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
// Each summary:        ~200–215 words, 6 hallucinations (1 Tier 1 / 2 Tier 2 / 3 Tier 3).
// Time limit:          6 minutes (≈ 1 hallucination per minute).
//
// Hallucination map:
//   T1a  H1 Tier 1  "HMS Victory"                should be "HMS Salisbury"
//   T1a  H2 Tier 2  "five pairs"                 should be "six pairs"
//   T1a  H3 Tier 2  "1935 book"                  should be "1925 book"
//   T1a  H4 Tier 3  "fourteen sailors"            should be "twelve sailors"
//   T1a  H5 Tier 3  "Cambridgeshire"             should be "Hertfordshire"
//   T1a  H6 Tier 3  "crop rotation"              should be "crop yields"
//
//   T1b  H1 Tier 1  "British Medical Association" should be "Medical Research Council"
//   T1b  H2 Tier 2  "Cambridge"                  should be "Oxford" (Cochrane location)
//   T1b  H3 Tier 2  "ten criteria"               should be "nine criteria"
//   T1b  H4 Tier 3  "miliary tuberculosis"        should be "pulmonary tuberculosis"
//   T1b  H5 Tier 3  "1964"                        should be "1965" (Bradford Hill criteria)
//   T1b  H6 Tier 3  "1991"                        should be "1993" (Cochrane founding year)
//
//   T2a  H1 Tier 1  "640,000 human computers"    should be "64,000"
//   T2a  H2 Tier 2  "physicist"                  should be "mathematician"
//   T2a  H3 Tier 2  "eight weeks"                should be "six weeks"
//   T2a  H4 Tier 3  "1923 book"                  should be "1922 book"
//   T2a  H5 Tier 3  "humidity"                   should be "pressure"
//   T2a  H6 Tier 3  "three days"                 should be "a day or two"
//
//   T2b  H1 Tier 1  "Alan Turing"                should be "John von Neumann"
//   T2b  H2 Tier 2  "established in 1965"        should be "1975" (ECMWF)
//   T2b  H3 Tier 2  "Journal of Meteorology"     should be "Tellus"
//   T2b  H4 Tier 3  "1962 paper"                 should be "1963 paper" (Lorenz)
//   T2b  H5 Tier 3  "January 1950"               should be "March 1950"
//   T2b  H6 Tier 3  "seven-day predictions"       should be "five-day predictions"

// ── TASK T1a — The RCT: Origins and Statistical Foundations ──────────────────

const TASK_T1A: StudyTask = {
  taskCode: 'T1a',
  timeLimitMinutes: 6,
  sourceDocument:
`The idea that medical treatments should be tested through controlled experiments seems obvious today, but its formal adoption as a scientific standard took most of the twentieth century and required contributions from a naval surgeon, a statistician studying crop yields, and a British epidemiologist working in the aftermath of World War II.

The earliest precursor is usually dated to 1747, when Scottish naval surgeon James Lind treated twelve sailors suffering from scurvy during a voyage aboard HMS Salisbury. Lind divided them into six pairs and assigned each pair a different dietary supplement — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, or citrus fruit. The two men given oranges and lemons recovered within days; the others did not. Though Lind's design lacked randomization, it introduced the principle of simultaneous comparison that would define all later controlled trials.

The mathematical foundations of the modern RCT were laid not by a clinician but by statistician Ronald Fisher, working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher was studying how to measure the effects of fertilisers on crop yields when he realised that randomly assigning plots to different treatments was the only rigorous way to neutralise the influence of unknown confounding factors. His 1925 book Statistical Methods for Research Workers introduced these ideas to a broad scientific audience, and his arguments for randomization became foundational across disciplines.`,
  hallucinatedSummary:
`The randomized controlled trial emerged gradually as medicine's standard of evidence, taking centuries of improvised experimentation to become the regulatory requirement it is today.

Its origins are usually traced to James Lind, a Scottish naval surgeon who in 1747 treated fourteen sailors with scurvy during a voyage aboard HMS Victory. Lind divided them into five pairs and assigned each a different dietary supplement; only the pair given citrus fruit recovered within days. Though Lind's design lacked randomization, it introduced the logic of simultaneous comparison that would prove foundational to later experimental medicine.

The statistical foundations of the modern RCT were laid not by a clinician but by statistician Ronald Fisher, working at the Rothamsted Experimental Station in Cambridgeshire during the 1920s. Fisher had been studying how to measure the effects of fertilisers on crop rotation when he realised that randomly assigning plots to different treatments was the only rigorous way to neutralise the influence of unknown confounding factors. His 1935 book Statistical Methods for Research Workers introduced these ideas to a broad scientific audience, and his arguments for randomization became foundational across disciplines.`,
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
`The translation into clinical medicine came in 1948, when epidemiologist Austin Bradford Hill designed the first properly randomized clinical trial — a study of streptomycin as a treatment for pulmonary tuberculosis, conducted under the auspices of the Medical Research Council. Patients were assigned to receive streptomycin or standard bed rest using sealed envelopes containing random assignments. The trial demonstrated that streptomycin significantly improved outcomes and, just as importantly, showed that decisive clinical evidence could be produced through rigorous methodology rather than clinical judgment alone.

In 1965, Bradford Hill published a paper articulating nine criteria by which a statistical association between an exposure and a disease could be judged as causal. These became known as the Bradford Hill criteria and remain a standard reference in epidemiology, shaping debates from the link between tobacco and cancer to evaluations of hormone therapy.

The regulatory dimension followed a disaster. When thalidomide, prescribed for morning sickness in the late 1950s, was found by the early 1960s to cause severe limb malformations in newborns, the United States Food and Drug Administration used the crisis to mandate randomized evidence for all new drug approvals. Within a generation, the RCT had become medicine's central evidentiary tool.

The Cochrane Collaboration, established in 1993 in Oxford, formalized this infrastructure by systematically aggregating RCT evidence from across medical specialties into reviews that now inform clinical guidelines worldwide.`,
  hallucinatedSummary:
`The clinical translation came in 1948, when Austin Bradford Hill designed a trial of streptomycin for miliary tuberculosis, conducted under the auspices of the British Medical Association. Using sealed random envelopes, the trial demonstrated that streptomycin significantly improved outcomes and that rigorous methodology could settle clinical disputes once decided by authority alone.

Bradford Hill later published, in 1964, ten criteria for judging whether a statistical association could be considered causal — a framework that remains a standard reference in epidemiology, shaping debates from the tobacco-cancer link to evaluations of hormone therapy.

The thalidomide disaster of the early 1960s provided regulatory momentum: the FDA responded by requiring randomized trial evidence for all new drug approvals. The Cochrane Collaboration, established in Cambridge in 1991, formalized this infrastructure by systematically compiling RCT evidence into reviews that now inform clinical guidelines worldwide.`,
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
`Weather forecasting before the computer age was essentially pattern recognition. Meteorologists compiled synoptic maps of temperature, pressure, and wind, compared today's atmospheric configuration to previous occasions when similar patterns had appeared, and predicted that similar conditions would follow. The method was systematic but subjective, and forecasts beyond a day or two were little better than informed guesses.

The idea of replacing analogical reasoning with mathematics was first proposed seriously by Lewis Fry Richardson, a British mathematician and meteorologist who during World War I applied hydrodynamic equations to an actual weather event. After six weeks of laborious manual calculation, he found that his method produced a wildly inaccurate result — the equations had amplified small measurement errors into nonsense. Richardson published his method, along with a careful diagnosis of why it had failed, in his 1922 book Weather Prediction by Numerical Process. The book included a famous thought experiment: a spherical "forecast factory" staffed by 64,000 human "computers" working in parallel, each responsible for a small region of the atmosphere, all coordinated by a conductor at the centre. The factory was a fantasy, but the equations it would use were real.`,
  hallucinatedSummary:
`Before the computer age, weather forecasting relied on comparing atmospheric patterns — readings of temperature, humidity, and wind — to historical precedents. Meteorologists assumed that when a similar configuration appeared, similar weather would follow. The approach was systematic but inherently subjective, and useful forecasts extended little more than three days into the future.

The alternative — replacing analogy with mathematics — was first pursued seriously by Lewis Fry Richardson, a British physicist and meteorologist who applied hydrodynamic equations to an actual weather event during World War I. Eight weeks of laborious hand calculation yielded a result that was wildly inaccurate; small measurement errors had been amplified into nonsense by the equations. Richardson nevertheless published the work in his 1923 book Weather Prediction by Numerical Process. The book contained a famous thought experiment: completing a forecast in real time would require a spherical "forecast factory" staffed by 640,000 human "computers" working in parallel, each responsible for a small region of the atmosphere, all coordinated by a central conductor. The factory was imaginary; the mathematics was not.`,
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
`The underlying problem was initialization. Atmospheric equations needed accurate starting measurements, and the solution involved filtering out certain high-frequency oscillations before the equations were applied. That advance came in the late 1940s, when American meteorologist Jule Charney, working with mathematician John von Neumann at Princeton's Institute for Advanced Study, developed simplified equations that screened out the problematic noise. Using ENIAC, one of the first programmable electronic computers, Charney's team produced four twenty-four-hour forecasts in March 1950. The results were published that year in the journal Tellus. Each forecast required roughly 24 hours of machine time — barely useful in practice, but the proof of concept was complete.

Progress accelerated as computing power grew. The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was established specifically to push skillful forecasting beyond the two-day horizon. By the mid-1980s, ECMWF's global model could produce useful forecasts out to about five days — a benchmark that had seemed unreachable a decade earlier.

A further refinement came from recognising that small measurement uncertainties grow unpredictably as forecasts extend in time. Edward Lorenz had described the theoretical basis for this in his influential 1963 paper on deterministic chaos, showing that tiny initial differences in complex dynamic systems diverge exponentially. Rather than producing a single best estimate, meteorologists began running multiple simulations from slightly different starting conditions. ECMWF and the United States National Centers for Environmental Prediction both introduced operational ensemble forecasting in 1992, enabling forecasters to communicate not just a prediction but its associated uncertainty.`,
  hallucinatedSummary:
`The first successful numerical forecast was produced in January 1950, when Jule Charney's team at Princeton's Institute for Advanced Study — working alongside mathematician Alan Turing — ran four twenty-four-hour simulations on ENIAC. The results were published in the Journal of Meteorology, and although each simulation took around 24 hours of machine time, the proof of concept was established.

The European Centre for Medium-Range Weather Forecasts, established in 1965 in Reading, United Kingdom, was purpose-built to extend forecast skill beyond the two-day barrier; by the mid-1980s, its global model delivered reliable seven-day predictions.

The theoretical ceiling on forecasting was formalised by Edward Lorenz, whose 1962 paper on deterministic chaos showed that small initial measurement errors grow rapidly in complex systems. To manage this uncertainty, both ECMWF and the United States National Centers for Environmental Prediction introduced operational ensemble forecasting in 1992, generating multiple simulations from varied starting conditions to produce probabilistic predictions.`,
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
