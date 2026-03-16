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
// Task T1 — The Randomized Controlled Trial
// Task T2 — Numerical Weather Prediction
//
// Each source article: ~450 words, fully accurate, expository prose with a
// narrative arc.  Each summary: ~220 words, 4 hallucinations across three
// difficulty tiers (1 × T1, 2 × T2, 1 × T3) plus 2–3 stylistic imperfections.
//
// Hallucination map — T1:
//   H1 Tier 1  "British Medical Association" should be "Medical Research Council"
//   H2 Tier 2  (stylistic magnet) "1935 book" should be "1925 book"
//   H3 Tier 2  (clean) "ten criteria" should be "nine criteria"
//   H4 Tier 3  "fourteen sailors" should be "twelve sailors"
//
// Hallucination map — T2:
//   H1 Tier 1  "640,000 human computers" should be "64,000"
//   H2 Tier 2  (stylistic magnet) "established in 1965" should be "1975"
//   H3 Tier 2  (clean) "Journal of Meteorology" should be "Tellus"
//   H4 Tier 3  "1962 paper" should be "1963 paper" (Lorenz)

// ── TASK T1 — The Randomized Controlled Trial ────────────────────────────────

const TASK_T1: StudyTask = {
  taskCode: 'T1',
  timeLimitMinutes: 10,
  sourceDocument:
`The idea that medical treatments should be tested through controlled experiments seems obvious today, but its formal adoption as a scientific standard took most of the twentieth century and required contributions from a naval surgeon, a statistician studying crop yields, and a British epidemiologist working in the aftermath of World War II.

The earliest precursor is usually dated to 1747, when Scottish naval surgeon James Lind treated twelve sailors suffering from scurvy during a voyage aboard HMS Salisbury. Lind divided them into six pairs and assigned each pair a different dietary supplement — vinegar, cider, seawater, dilute sulphuric acid, garlic paste, or citrus fruit. The two men given oranges and lemons recovered within days; the others did not. Though Lind's design lacked randomization, it introduced the principle of simultaneous comparison that would define all later controlled trials.

The mathematical foundations of the modern RCT were laid not by a clinician but by statistician Ronald Fisher, working at the Rothamsted Experimental Station in Hertfordshire during the 1920s. Fisher was studying how to measure the effects of fertilisers on crop yields when he realised that randomly assigning plots to different treatments was the only rigorous way to neutralise the influence of unknown confounding factors. His 1925 book Statistical Methods for Research Workers introduced these ideas to a broad scientific audience, and his arguments for randomization became foundational across disciplines.

The translation into clinical medicine came in 1948, when epidemiologist Austin Bradford Hill designed the first properly randomized clinical trial — a study of streptomycin as a treatment for pulmonary tuberculosis, conducted under the auspices of the Medical Research Council. Patients were assigned to receive streptomycin or standard bed rest using sealed envelopes containing random assignments. The trial demonstrated that streptomycin significantly improved outcomes and, just as importantly, showed that decisive clinical evidence could be produced through rigorous methodology rather than clinical judgment alone.

In 1965, Bradford Hill published a paper articulating nine criteria by which a statistical association between an exposure and a disease could be judged as causal. These became known as the Bradford Hill criteria and remain a standard reference in epidemiology, shaping debates from the link between tobacco and cancer to evaluations of hormone therapy.

The regulatory dimension followed a disaster. When thalidomide, prescribed for morning sickness in the late 1950s, was found by the early 1960s to cause severe limb malformations in newborns, the United States Food and Drug Administration used the crisis to mandate randomized evidence for all new drug approvals. Within a generation, the RCT had become medicine's central evidentiary tool.

The Cochrane Collaboration, established in 1993 in Oxford, formalized this infrastructure by systematically aggregating RCT evidence from across medical specialties into reviews that now inform clinical guidelines worldwide.`,
  hallucinatedSummary:
`The randomized controlled trial emerged gradually as medicine's standard of evidence, taking centuries of improvised experimentation to become the regulatory requirement it is today.

Its origins are usually traced to James Lind, a Scottish naval surgeon who in 1747 recruited fourteen sailors with scurvy and assigned each of six pairs a different dietary supplement. The pair given citrus fruit recovered within days; none of the others did. Though Lind's design lacked randomization, it introduced the logic of simultaneous comparison that would prove foundational to later experimental medicine.

The statistical foundations were laid by Ronald Fisher, drawing on his work in agricultural field trials during the 1920s, who argued in his 1935 book Statistical Methods for Research Workers that randomly assigning subjects to treatment and control groups was the only reliable way to control for unknown confounding factors.

The clinical translation came in 1948, when Austin Bradford Hill designed a trial of streptomycin for pulmonary tuberculosis, conducted under the auspices of the British Medical Association. Using sealed random envelopes, the trial demonstrated that streptomycin significantly improved outcomes and that rigorous methodology could settle clinical disputes once decided by authority alone.

Bradford Hill later published, in 1965, ten criteria for judging whether a statistical association could be considered causal — a framework that remains a standard reference in epidemiology, shaping debates from the tobacco-cancer link to evaluations of hormone therapy.

The Cochrane Collaboration, established in Oxford in 1993, formalized this infrastructure by systematically compiling RCT evidence into reviews that now inform clinical guidelines worldwide.`,
};

// ── TASK T2 — Numerical Weather Prediction ───────────────────────────────────

const TASK_T2: StudyTask = {
  taskCode: 'T2',
  timeLimitMinutes: 10,
  sourceDocument:
`Weather forecasting before the computer age was essentially pattern recognition. Meteorologists compiled synoptic maps of temperature, pressure, and wind, compared today's atmospheric configuration to previous occasions when similar patterns had appeared, and predicted that similar conditions would follow. The method was systematic but subjective, and forecasts beyond a day or two were little better than informed guesses.

The idea of replacing analogical reasoning with mathematics was first proposed seriously by Lewis Fry Richardson, a British mathematician and meteorologist who during World War I applied hydrodynamic equations to an actual weather event. After six weeks of laborious manual calculation, he found that his method produced a wildly inaccurate result — the equations had amplified small measurement errors into nonsense. Richardson published his method, along with a careful diagnosis of why it had failed, in his 1922 book Weather Prediction by Numerical Process. The book included a famous thought experiment: a spherical "forecast factory" staffed by 64,000 human "computers" working in parallel, each responsible for a small region of the atmosphere, all coordinated by a conductor at the centre. The factory was a fantasy, but the equations it would use were real.

The underlying problem was initialization. Atmospheric equations needed accurate starting measurements, and the solution involved filtering out certain high-frequency oscillations before the equations were applied. That advance came in the late 1940s, when American meteorologist Jule Charney, working with mathematician John von Neumann at Princeton's Institute for Advanced Study, developed simplified equations that screened out the problematic noise. Using ENIAC, one of the first programmable electronic computers, Charney's team produced four twenty-four-hour forecasts in March 1950. The results were published that year in the journal Tellus. Each forecast required roughly 24 hours of machine time — barely useful in practice, but the proof of concept was complete.

Progress accelerated as computing power grew. The European Centre for Medium-Range Weather Forecasts, founded in 1975 and headquartered in Reading, United Kingdom, was established specifically to push skillful forecasting beyond the two-day horizon. By the mid-1980s, ECMWF's global model could produce useful forecasts out to about five days — a benchmark that had seemed unreachable a decade earlier.

A further refinement came from recognising that small measurement uncertainties grow unpredictably as forecasts extend in time. Edward Lorenz had described the theoretical basis for this in his influential 1963 paper on deterministic chaos, showing that tiny initial differences in complex dynamic systems diverge exponentially. Rather than producing a single best estimate, meteorologists began running multiple simulations from slightly different starting conditions. ECMWF and the United States National Centers for Environmental Prediction both introduced operational ensemble forecasting in 1992, enabling forecasters to communicate not just a prediction but its associated uncertainty.`,
  hallucinatedSummary:
`Before digital computing, weather forecasting relied on comparing current atmospheric patterns to historical precedents — a method generally limited to useful horizons of a day or two.

The mathematical approach was first outlined by Lewis Fry Richardson in his 1922 book Weather Prediction by Numerical Process. Richardson's own wartime test calculation failed dramatically because of inadequate observational data, but the underlying equations were sound.

His imagined "forecast factory" illuminated the scale of the computational challenge: completing a forecast in real time would require 640,000 human "computers" working simultaneously.

The first successful numerical forecast was produced in March 1950, when Jule Charney's team at Princeton ran four twenty-four-hour simulations on ENIAC. The results were published in the Journal of Meteorology, and although computation took roughly as long as the forecast period itself, the proof of concept was established.

The European Centre for Medium-Range Weather Forecasts, established in 1965 in Reading, United Kingdom, was purpose-built to extend forecast skill beyond the two-day barrier; by the mid-1980s, its global model delivered reliable five-day predictions.

The theoretical ceiling on forecasting was formalised by Edward Lorenz, whose 1962 paper on deterministic chaos showed that small initial measurement errors grow rapidly in complex systems. To manage this uncertainty, both ECMWF and the United States National Centers for Environmental Prediction introduced operational ensemble forecasting in 1992, generating multiple simulations from varied starting conditions to produce probabilistic predictions.`,
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

    // Stage 1 — Briefing, Consent, and Task Description
    steps.push({
      type: 'message',
      message:
        '<b>Briefing and Consent</b><br><br>' +
        'Welcome, and thank you for participating in this study. ' +
        'The session will be recorded (audio and screen). Please do not use any external resources during the tasks.<br><br>' +
        '<b>Your task (repeated for two texts):</b><br><br>' +
        'Imagine you are working with a team and need to prepare a short summary of a document for colleagues who have not read it. ' +
        'You are provided with the original source text and an initial draft summary. ' +
        'Your colleagues will rely on this summary instead of reading the full document. Please make sure it is accurate and ready to share.<br><br>' +
        'Please use the interface in whatever way feels most natural to you. ' +
        'You may copy and paste from the source, ask questions, edit the summary, or verify any points you consider important. ' +
        'You have up to 10 minutes per text, but you may finish whenever you feel the summary is accurate and trustworthy enough to share.<br><br>' +
        'You will complete this task twice, each time with a different text and a different interface.<br><br>' +
        'After clicking Next, you will be asked to grant microphone and screen-sharing permissions. ' +
        'These are needed only once for the entire session.<br><br>' +
        'By clicking Next you confirm that you have read the information sheet and consent to participate.',
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

    // Between blocks — simple continuation prompt
    steps.push({
      type: 'message',
      message:
        '<b>End of Task 1</b><br><br>' +
        'Well done. When you are ready, click Next to begin Task 2.',
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
