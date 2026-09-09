import type { Article } from '@/types/models';

export const articles: Article[] = [
  {
    slug: 'sleep-in-fragments',
    title: 'When sleep arrives in fragments',
    subtitle: 'Rest, shifts, and asking for practical help',
    minutes: 4,
    stageStart: 0,
    stageEnd: 16,
    paragraphs: [
      'Interrupted sleep is common in the postpartum period, but you do not have to minimize how it is affecting you. Name the part that is hardest: falling asleep, getting enough total rest, or carrying the night alone.',
      'A practical request is easier for someone else to act on. You might ask a trusted person to take one feeding shift, handle a morning task, or protect a short period when you can lie down without managing anything else.',
      'Bring sleep, fatigue, mood, and the support available at home to a postpartum appointment. They are valid parts of postpartum care—not side notes.',
    ],
    sourceLabel: 'ACOG Postpartum Care Checklist',
    sourceUrl: 'https://www.acog.org/womens-health/health-tools/my-postpartum-care-checklist',
  },
  {
    slug: 'recovery-can-be-uneven',
    title: 'Recovery can be uneven',
    subtitle: 'Notice changes and speak up when something feels wrong',
    minutes: 5,
    stageStart: 0,
    stageEnd: 52,
    paragraphs: [
      'Recovery does not always move in a straight line. Keep track of concerns you want to discuss, including physical recovery, mood, sleep, feeding, pain, and the support you have at home.',
      'Some symptoms during pregnancy and in the year after birth need urgent medical attention. The CDC Hear Her guide lists warning signs and what to do. Use the source link below for the current official list rather than relying on a summary in an app.',
      'If you feel that something is not right, contact a health care professional. If you cannot reach one and the concern feels urgent, seek emergency medical care.',
    ],
    sourceLabel: 'CDC Hear Her: Urgent Maternal Warning Signs',
    sourceUrl: 'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',
  },
  {
    slug: 'room-for-your-care',
    title: 'Making room for your own care',
    subtitle: 'A short list for your next check-in',
    minutes: 3,
    stageStart: 6,
    stageEnd: 104,
    paragraphs: [
      'Postpartum care includes your physical, social, and emotional well-being. Before an appointment, write down one concern you do not want tiredness or time pressure to make you forget.',
      'Consider the whole picture: mood, sleep, physical recovery, feeding, relationships, contraception, ongoing conditions, and whether you have enough help at home.',
      'Neova can help you organize what you want to say, but it is not a medical service and cannot diagnose or replace professional care.',
    ],
    sourceLabel: 'ACOG: Optimizing Postpartum Care',
    sourceUrl: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2018/05/optimizing-postpartum-care',
  },
];
