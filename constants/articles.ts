export interface StudyRef {
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
}

export interface HabitArticle {
  habitId: string;
  tldr: string;          // 2-3 sentences
  body: string;          // full explanation in markdown-ish plain text
  studies: StudyRef[];
  recommendation: string; // practical dosage
}

export const ARTICLES: Record<string, HabitArticle> = {
  breathing: {
    habitId: 'breathing',
    tldr: 'Slow, structured breathing lowers cortisol, reduces blood pressure, and improves heart rate variability within minutes. Just 5 minutes a day measurably reduces anxiety.',
    body: `Your autonomic nervous system has two branches: the sympathetic ("fight or flight") and parasympathetic ("rest and digest"). Slow, deliberate breathing directly activates the parasympathetic branch via the vagus nerve.

When you exhale slowly, baroreceptors in your aortic arch detect the pressure change and signal the brainstem to slow your heart rate. This is why techniques with extended exhales (like cyclic sighing) are particularly effective.

A 2023 Stanford study found that just 5 minutes of daily structured breathing — specifically cyclic sighing — outperformed mindfulness meditation in reducing anxiety and improving mood. The effect was measurable within the first session and compounded over 28 days.

Heart rate variability (HRV), a key marker of stress resilience, improves significantly with regular breathwork practice. Higher HRV is associated with better emotional regulation, cognitive flexibility, and cardiovascular health.

The beauty of breathing exercises is their accessibility: they require no equipment, no special space, and can be done anywhere. Even a single minute of slow breathing before a stressful event measurably reduces cortisol response.`,
    studies: [
      {
        authors: 'Balban MY, Neri E, Kogon MM, et al.',
        title: 'Brief structured respiration practices enhance mood and reduce physiological arousal',
        journal: 'Cell Reports Medicine',
        year: 2023,
        doi: '10.1016/j.xcrm.2022.100895',
      },
      {
        authors: 'Mahtani KR, Nunan D, Heneghan CJ',
        title: 'Device-guided breathing exercises in the control of human blood pressure: systematic review and meta-analysis',
        journal: 'Cochrane Database Syst Rev',
        year: 2012,
        doi: '10.1002/14651858.CD010013',
      },
      {
        authors: 'Zaccaro A, Piarulli A, Laurino M, et al.',
        title: 'How Breath-Control Can Change Your Life: A Systematic Review on Psycho-Physiological Correlates of Slow Breathing',
        journal: 'Front Hum Neurosci',
        year: 2018,
        doi: '10.3389/fnhum.2018.00353',
      },
    ],
    recommendation: '2-5 minutes of slow breathing daily. Box breathing (4-4-4-4) or cyclic sighing.',
  },

  light: {
    habitId: 'light',
    tldr: '10-30 minutes of bright light exposure regulates circadian rhythm, improves sleep quality, boosts alertness, and has antidepressant effects.',
    body: `Your body runs on a master clock — the suprachiasmatic nucleus (SCN) in the hypothalamus. This clock controls when you feel sleepy, when cortisol peaks, when body temperature rises, and hundreds of other rhythmic processes. The primary input that synchronizes this clock is light hitting specialized cells in your retina called intrinsically photosensitive retinal ganglion cells (ipRGCs).

Morning light exposure triggers a cascade: it suppresses melatonin production, elevates cortisol (the healthy morning spike), increases serotonin synthesis, and sets a timer for melatonin release roughly 14-16 hours later. This is why morning light improves both daytime alertness AND nighttime sleep.

A landmark 2016 JAMA Psychiatry trial found that bright light therapy was as effective as fluoxetine (Prozac) for non-seasonal major depression — and the combination of both was significantly more effective than either alone. The effect size was clinically meaningful and rapid.

A 2023 study in Nature Mental Health analyzing data from over 85,000 UK Biobank participants found that greater daytime light exposure was associated with reduced risk of depression, better self-reported mood, easier getting up in the morning, and less frequent tiredness. Crucially, nighttime light exposure had the opposite effect.

The key insight: it's not just about getting light — it's about getting the right light at the right time. Bright, outdoor light in the morning is profoundly different from indoor artificial light. Even on a cloudy day, outdoor light is typically 10-50x brighter than indoor lighting.`,
    studies: [
      {
        authors: 'Lam RW, Levitt AJ, Levitan RD, et al.',
        title: 'Efficacy of Bright Light Treatment, Fluoxetine, and the Combination in Patients With Nonseasonal Major Depressive Disorder',
        journal: 'JAMA Psychiatry',
        year: 2016,
        doi: '10.1001/jamapsychiatry.2015.2235',
      },
      {
        authors: 'Burns AC, Saxena R, Vetter C, et al.',
        title: 'Time spent in outdoor light is associated with mood, sleep, and circadian rhythm-related outcomes',
        journal: 'Nature Mental Health',
        year: 2023,
        doi: '10.1038/s44220-023-00135-8',
      },
      {
        authors: 'Duffy JF, Czeisler CA',
        title: 'Effect of Light on Human Circadian Physiology',
        journal: 'Sleep Med Clin',
        year: 2009,
        doi: '10.1016/j.jsmc.2009.01.004',
      },
    ],
    recommendation: 'Get outside within 1 hour of waking. 10 min sunny, 20-30 min cloudy.',
  },

  food: {
    habitId: 'food',
    tldr: 'Mediterranean-style diets reduce depression risk by ~33%, cardiovascular disease by ~30%, and all-cause mortality.',
    body: `The connection between diet and mental health is now supported by robust interventional evidence, not just observational correlations. The field of "nutritional psychiatry" has exploded in the last decade.

The landmark SMILES trial (2017) was the first randomized controlled trial to directly test whether improving diet could treat clinical depression. Participants with major depression who received dietary counseling toward a Mediterranean-style diet showed significantly greater improvement than those receiving social support. After 12 weeks, 32% of the diet group achieved remission versus 8% in the control group.

The PREDIMED trial, one of the largest dietary intervention studies ever conducted (7,447 participants), demonstrated that a Mediterranean diet supplemented with extra-virgin olive oil or nuts reduced cardiovascular events by approximately 30% compared to a control diet. This was so significant the trial was stopped early for ethical reasons.

The mechanisms are multifaceted: anti-inflammatory effects (chronic inflammation is linked to depression), gut microbiome diversity (the gut produces ~95% of your serotonin), improved blood sugar regulation (glucose spikes impair cognitive function), and better provision of nutrients critical for neurotransmitter synthesis (omega-3s, B vitamins, zinc, magnesium).

You don't need to overhaul your entire diet overnight. Research consistently shows that incremental improvements yield meaningful benefits. Adding vegetables, reducing ultra-processed food, and eating more whole foods creates a positive feedback loop — better nutrition improves mood, which improves food choices.`,
    studies: [
      {
        authors: 'Jacka FN, O\'Neil A, Opie R, et al.',
        title: 'A randomised controlled trial of dietary improvement for adults with major depression (the SMILES trial)',
        journal: 'BMC Medicine',
        year: 2017,
        doi: '10.1186/s12916-017-0791-y',
      },
      {
        authors: 'Estruch R, Ros E, Salas-Salvad\u00F3 J, et al.',
        title: 'Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts',
        journal: 'N Engl J Med',
        year: 2018,
        doi: '10.1056/NEJMoa1800389',
      },
      {
        authors: 'Pagliai G, Dinu M, Madarena MP, et al.',
        title: 'Consumption of ultra-processed foods and health status: a systematic review and meta-analysis',
        journal: 'Br J Nutr',
        year: 2021,
        doi: '10.1017/S0007114520002688',
      },
    ],
    recommendation: 'Add one extra serving of vegetables, swap processed snack for fruit/nuts.',
  },

  sleep: {
    habitId: 'sleep',
    tldr: 'During deep sleep the brain\'s glymphatic system clears waste. Less than 7 hours raises mortality 13%. One night of deprivation reduces emotional regulation by ~60%.',
    body: `Sleep is not passive unconsciousness — it is an active, highly organized process essential for survival. During deep (slow-wave) sleep, the brain's glymphatic system increases flow of cerebrospinal fluid by 60%, clearing metabolic waste products including beta-amyloid, the protein implicated in Alzheimer's disease.

A groundbreaking 2013 Science paper by Xie et al. discovered that the space between brain cells expands by 60% during sleep, allowing this "brain washing" to occur. This means chronic sleep deprivation may literally leave toxic waste accumulating in your brain.

The mortality data is stark: a meta-analysis of 1.3 million participants found that sleeping less than 7 hours per night is associated with a 13% increased risk of all-cause mortality. But it's not just about length — sleep quality matters enormously.

Perhaps most immediately relevant: a single night of sleep deprivation causes a 60% increase in amygdala reactivity to negative stimuli, effectively disconnecting your prefrontal cortex (rational brain) from your emotional centers. This is why everything feels worse after a bad night's sleep — your brain's ability to regulate emotions is physiologically impaired.

Sleep also consolidates memory, regulates hormones (growth hormone is primarily released during deep sleep), maintains immune function (your T-cell effectiveness drops significantly after just one night of poor sleep), and regulates appetite hormones (sleep deprivation increases ghrelin and decreases leptin, making you hungrier).

The two most impactful things you can do for sleep are consistency (same bed/wake time) and morning light exposure (which sets your melatonin timer for the evening).`,
    studies: [
      {
        authors: 'Xie L, Kang H, Xu Q, et al.',
        title: 'Sleep Drives Metabolite Clearance from the Adult Brain',
        journal: 'Science',
        year: 2013,
        doi: '10.1126/science.1241224',
      },
      {
        authors: 'Cappuccio FP, D\'Elia L, Strazzullo P, Miller MA',
        title: 'Sleep Duration and All-Cause Mortality: A Systematic Review and Meta-Analysis of Prospective Studies',
        journal: 'Sleep',
        year: 2010,
        doi: '10.1093/sleep/33.5.585',
      },
      {
        authors: 'Yoo SS, Gujar N, Hu P, Jolesz FA, Walker MP',
        title: 'The human emotional brain without sleep — a prefrontal amygdala disconnect',
        journal: 'Curr Biol',
        year: 2007,
        doi: '10.1016/j.cub.2007.08.007',
      },
    ],
    recommendation: '7-9 hours. Consistent bed/wake times.',
  },

  exercise: {
    habitId: 'exercise',
    tldr: 'Reduces all-cause mortality 30-35%, as effective as SSRIs for depression, promotes neurogenesis. 11 min brisk walking helps.',
    body: `Exercise is the closest thing we have to a miracle drug. A 2024 BMJ meta-analysis of over 200 studies found that exercise is 1.5x more effective than counseling or leading medications for reducing symptoms of depression, anxiety, and psychological distress. Walking or jogging, yoga, and strength training were among the most effective modalities.

The dose-response curve for exercise is remarkably front-loaded: a 2023 study in the British Journal of Sports Medicine analyzing data from 196 studies found that just 11 minutes of daily brisk walking (75 minutes/week) was associated with a 23% lower risk of premature death. Moving from zero to even minimal activity provides the largest marginal benefit.

On the neurological side, a landmark 2011 PNAS study showed that one year of moderate aerobic exercise increased hippocampal volume by 2%, effectively reversing 1-2 years of age-related shrinkage. The hippocampus is critical for memory and is one of the first structures affected in Alzheimer's disease. Exercise promotes neurogenesis (the birth of new brain cells) through increased BDNF (brain-derived neurotrophic factor).

Exercise also improves sleep quality, reduces inflammation, improves insulin sensitivity, strengthens bones, reduces cancer risk, improves cognitive function, and enhances self-efficacy. The mechanisms are so diverse that no single drug could replicate all the benefits of regular physical activity.

The key insight from modern research: the biggest health gain comes from going from nothing to something. You don't need to run marathons. A 10-minute walk is infinitely more beneficial than no walk. Start absurdly small and build consistency before intensity.`,
    studies: [
      {
        authors: 'Noetel M, Sanders T, Gallardo-G\u00F3mez D, et al.',
        title: 'Effect of exercise for depression: systematic review and network meta-analysis of randomised controlled trials',
        journal: 'BMJ',
        year: 2024,
        doi: '10.1136/bmj-2023-075847',
      },
      {
        authors: 'Garcia L, Pearce M, Abbas A, et al.',
        title: 'Non-occupational physical activity and risk of cardiovascular disease, cancer and mortality outcomes: a dose-response meta-analysis of large prospective studies',
        journal: 'Br J Sports Med',
        year: 2023,
        doi: '10.1136/bjsports-2022-105669',
      },
      {
        authors: 'Erickson KI, Voss MW, Prakash RS, et al.',
        title: 'Exercise training increases size of hippocampus and improves memory',
        journal: 'Proc Natl Acad Sci USA',
        year: 2011,
        doi: '10.1073/pnas.1015950108',
      },
    ],
    recommendation: 'Any movement counts. 10-minute walk is infinitely better than nothing.',
  },

  gratitude: {
    habitId: 'gratitude',
    tldr: 'Writing gratitude increases well-being 10-25%, improves sleep, reduces depression, creates lasting neural changes.',
    body: `Gratitude practice is one of the most well-studied positive psychology interventions, with robust evidence spanning over two decades of research. The effects are not just subjective — gratitude practice creates measurable changes in brain structure and function.

The foundational 2003 study by Emmons and McCullough established that people who wrote weekly about things they were grateful for exercised more, had fewer physical complaints, and felt better about their lives compared to those who wrote about hassles or neutral events. The effect size was substantial: 10-25% improvement in well-being measures.

A 2016 fMRI study by Kini et al. found that gratitude practice produced lasting changes in how the brain processes information. Participants who wrote gratitude letters showed significantly greater neural sensitivity to gratitude experiences months later — even when not actively practicing. The medial prefrontal cortex, involved in learning and decision-making, showed the most significant changes. This suggests gratitude practice literally rewires your brain's baseline processing.

The sleep connection is particularly compelling: Wood et al. (2009) found that gratitude was associated with better sleep quality primarily through the mechanism of pre-sleep cognitions. Grateful people have more positive thoughts and fewer negative thoughts before falling asleep, leading to faster sleep onset and better sleep quality.

The key to effective gratitude practice is specificity. "I'm grateful for my health" is far less impactful than "I'm grateful that my legs carried me on a walk through the park this morning and I noticed the cherry blossoms were blooming." Specific gratitude forces you to relive the positive experience, amplifying its emotional impact and training your brain to notice positive details.`,
    studies: [
      {
        authors: 'Emmons RA, McCullough ME',
        title: 'Counting blessings versus burdens: an experimental investigation of gratitude and subjective well-being in daily life',
        journal: 'J Pers Soc Psychol',
        year: 2003,
        doi: '10.1037/0022-3514.84.2.377',
      },
      {
        authors: 'Kini P, Wong J, McInnis S, Gabana N, Brown JW',
        title: 'The effects of gratitude expression on neural activity',
        journal: 'NeuroImage',
        year: 2016,
        doi: '10.1016/j.neuroimage.2015.12.040',
      },
      {
        authors: 'Wood AM, Joseph S, Lloyd J, Atkins S',
        title: 'Gratitude influences sleep through the mechanism of pre-sleep cognitions',
        journal: 'J Psychosom Res',
        year: 2009,
        doi: '10.1016/j.jpsychores.2008.09.002',
      },
    ],
    recommendation: '1-3 specific things daily. Be specific not generic.',
  },
};
