import type { HabitId } from '../store/useStore';

export interface StudyRef {
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
}

export interface HabitArticle {
  habitId: HabitId;
  studies: StudyRef[];
}

export const ARTICLES: Record<HabitId, HabitArticle> = {
  breathing: {
    habitId: 'breathing',
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
  },

  light: {
    habitId: 'light',
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
  },

  food: {
    habitId: 'food',
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
  },

  sleep: {
    habitId: 'sleep',
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
  },

  exercise: {
    habitId: 'exercise',
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
  },

  gratitude: {
    habitId: 'gratitude',
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
  },
};
