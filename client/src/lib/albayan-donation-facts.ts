/**
 * Facts transcribed from the association's registration decision, bylaws,
 * and attached enrollment-report poster. Report figures are historical
 * source material, not live application metrics.
 */
export const albayanAssociation = {
  brandName: "مقارئ البيان",
  legalName: "مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية",
  city: "الرياض",
  region: "منطقة الرياض",
  licenseNumber: "1000863300",
  registrationDecision: "ED048385",
  registrationDate: "2026-03-31",
} as const;

export const associationObjectives = [
  "إعداد المعلمين والمعلمات للعمل في حلقات القرآن الكريم",
  "تأهيل المشرفين والمشرفات على حلقات القرآن الكريم",
  "تعليم التلاوة والتحفيظ للفئات الاجتماعية",
  "تصحيح تلاوة القرآن الكريم",
  "غرس تعظيم كتاب الله تعالى لدى المجتمع",
] as const;

export const attachedReportSnapshot = {
  sourceLabel: "ملخص التقرير المرفق",
  notLiveLabel: "أرقام واردة في التقرير المرفق، وليست إحصاءات مباشرة",
  registeredLearners: 3287,
  countriesMoreThan: 28,
  volunteerTeachers: 87,
  learnerBreakdown: [
    { label: "النساء", value: 2682 },
    { label: "الرجال", value: 605 },
  ],
} as const;
