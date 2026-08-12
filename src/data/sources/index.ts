export interface AdviceSource {
  id: string
  title: string
  organisation: string
  url: string
  evidenceNote: { fr: string; ar: string }
}

export const adviceSources: Record<string, AdviceSource> = {
  aadWash: {
    id: 'aad-wash',
    title: 'Face washing 101',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101',
    evidenceNote: { fr: 'Conseils pratiques relus par des dermatologues.', ar: 'إرشادات عملية راجعها أطباء الجلد.' },
  },
  aadMoisturizer: {
    id: 'aad-acne-moisturizer',
    title: 'Moisturizer: Why you may need it if you have acne',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/diseases/acne/skin-care/moisturizer',
    evidenceNote: { fr: 'Conseils dermatologiques sur hydratation et peau sujette à l’acné.', ar: 'إرشادات جلدية حول الترطيب والبشرة المعرّضة لحب الشباب.' },
  },
  aadAcneTips: {
    id: 'aad-acne-tips',
    title: 'Acne: Tips for managing',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/diseases/acne/skin-care/tips',
    evidenceNote: { fr: 'Habitudes de soin recommandées par des dermatologues.', ar: 'عادات عناية موصى بها من أطباء الجلد.' },
  },
  aadAcneHabits: {
    id: 'aad-acne-habits',
    title: '10 skin care habits that can worsen acne',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/diseases/acne/skin-care/habits-stop',
    evidenceNote: { fr: 'Repères dermatologiques pour limiter irritation et poussées.', ar: 'إرشادات جلدية لتقليل التهيج وظهور الحبوب.' },
  },
  aadHairProducts: {
    id: 'aad-hair-products',
    title: 'Are your hair care products causing breakouts?',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/diseases/acne/causes/hair-products',
    evidenceNote: { fr: 'Lien clinique possible entre résidus capillaires et boutons de la lisière.', ar: 'توضيح سريري للعلاقة المحتملة بين بقايا منتجات الشعر وحبوب الجبهة.' },
  },
  aadDarkSpots: {
    id: 'aad-dark-spots',
    title: 'How to fade dark spots in darker skin tones',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/fade-dark-spots',
    evidenceNote: { fr: 'Conseils spécifiques aux marques et aux phototypes mats à foncés.', ar: 'إرشادات خاصة بالتصبغات والبشرة المتوسطة إلى الداكنة.' },
  },
  aadDrySkin: {
    id: 'aad-dry-skin',
    title: 'Dry skin remedies for darker skin tones',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/darker-skin/secrets/dry-skin/dry-skin-remedies-darker-skin',
    evidenceNote: { fr: 'Conseils de soin doux pour la sécheresse et l’irritation.', ar: 'إرشادات للعناية اللطيفة بالجفاف والتهيج.' },
  },
  aadPatchTest: {
    id: 'aad-patch-test',
    title: 'How to test skin care products',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products',
    evidenceNote: { fr: 'Méthode prudente pour tester un produit sur une petite zone.', ar: 'طريقة حذرة لاختبار المنتج على مساحة صغيرة.' },
  },
  aadSunscreen: {
    id: 'aad-sunscreen',
    title: 'How do I know if I’m using the right sunscreen?',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/choosing-right-sunscreen',
    evidenceNote: { fr: 'Repères dermatologiques pour choisir une photoprotection adaptée.', ar: 'إرشادات جلدية لاختيار واقٍ شمسي مناسب.' },
  },
  aadPregnancy: {
    id: 'aad-pregnancy',
    title: 'Dermatologist-approved pregnancy skin care',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/pregnancy-skin-care',
    evidenceNote: { fr: 'Conseils généraux de prudence pendant la grossesse et l’allaitement.', ar: 'إرشادات عامة للحذر أثناء الحمل والرضاعة.' },
  },
  aadHormonal: {
    id: 'aad-hormonal',
    title: 'Is that stubborn acne really acne?',
    organisation: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/diseases/acne/really-acne/stubborn-acne',
    evidenceNote: { fr: 'Signaux qui peuvent justifier une évaluation médicale, sans autodiagnostic.', ar: 'علامات قد تستدعي تقييماً طبياً من دون تشخيص ذاتي.' },
  },
  stressReview: {
    id: 'stress-barrier-review',
    title: 'The impact of stress on epidermal barrier function',
    organisation: 'British Journal of Dermatology — PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30614527/',
    evidenceNote: { fr: 'Revue scientifique : association possible, sans causalité individuelle certaine.', ar: 'مراجعة علمية: ارتباط محتمل من دون إثبات سبب فردي مباشر.' },
  },
  dietReview: {
    id: 'diet-acne-review',
    title: 'Diet and acne: A systematic review',
    organisation: 'JAAD International — PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35373155/',
    evidenceNote: { fr: 'Revue systématique : associations modestes et variables selon les populations.', ar: 'مراجعة منهجية: ارتباطات محدودة ومتفاوتة حسب الفئات.' },
  },
  endocrineHirsutism: {
    id: 'endocrine-hirsutism',
    title: 'Hirsutism Guideline Resources',
    organisation: 'Endocrine Society',
    url: 'https://www.endocrine.org/clinical-practice-guidelines/hirsutism',
    evidenceNote: { fr: 'Recommandations cliniques sur l’évaluation d’une pilosité excessive.', ar: 'توصيات سريرية لتقييم زيادة شعر الوجه أو الجسم.' },
  },
}
