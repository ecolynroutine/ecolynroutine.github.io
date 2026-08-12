import type { Localized } from '../types'

export type SkinProfileId = 'oily' | 'dry' | 'sensitive' | 'combination' | 'medium-dark' | 'unknown'
export type LifestyleId = 'pregnancy' | 'sleep' | 'stress' | 'motherhood' | 'emotional' | 'diet' | 'sun' | 'facial-hair'
export type DiscoveryFormat = 'fact' | 'myth' | 'gesture' | 'quiz' | 'warning'

export interface DiscoveryOption<T extends string> {
  id: T
  label: Localized
  hint: Localized
}

export interface DiscoveryCard {
  id: string
  format: DiscoveryFormat
  profiles: SkinProfileId[]
  concerns: string[]
  lifestyles: LifestyleId[]
  eyebrow: Localized
  title: Localized
  teaser: Localized
  explanation: Localized
  why: Localized
  gesture: Localized
  mistake: Localized
  professional: Localized
  sourceTitle: string
  sourceUrl: string
  sourceType: Localized
  caution?: Localized
}

export const skinProfiles: DiscoveryOption<SkinProfileId>[] = [
  { id: 'oily', label: { fr: 'Grasse', ar: 'دهنية' }, hint: { fr: 'Brillance, pores visibles', ar: 'لمعان ومسام باينة' } },
  { id: 'dry', label: { fr: 'Sèche / déshydratée', ar: 'جافة / ناقصة الماء' }, hint: { fr: 'Tiraillement, inconfort', ar: 'شد وعدم الراحة' } },
  { id: 'sensitive', label: { fr: 'Sensible', ar: 'حساسة' }, hint: { fr: 'Réagit ou pique facilement', ar: 'كتتفاعل أو كتحرق بسرعة' } },
  { id: 'combination', label: { fr: 'Mixte', ar: 'مختلطة' }, hint: { fr: 'Zone T et joues différentes', ar: 'منطقة T والخدود مختلفين' } },
  { id: 'medium-dark', label: { fr: 'Mate à foncée', ar: 'قمحية للسمراء' }, hint: { fr: 'Marques qui persistent', ar: 'آثار كتبقى مدة' } },
  { id: 'unknown', label: { fr: 'Je ne sais pas', ar: 'ما عارفاش' }, hint: { fr: 'On l’observe ensemble', ar: 'نلاحظوها بجوج' } },
]

export const lifestyleTopics: DiscoveryOption<LifestyleId>[] = [
  { id: 'pregnancy', label: { fr: 'Grossesse / allaitement', ar: 'الحمل / الرضاعة' }, hint: { fr: 'Une routine plus prudente', ar: 'روتين أكثر حذر' } },
  { id: 'sleep', label: { fr: 'Sommeil irrégulier', ar: 'النوم غير منتظم' }, hint: { fr: 'Sans culpabiliser', ar: 'بلا لوم' } },
  { id: 'stress', label: { fr: 'Stress', ar: 'الضغط' }, hint: { fr: 'Peau et rythme de vie', ar: 'البشرة وإيقاع الحياة' } },
  { id: 'motherhood', label: { fr: 'Fatigue de maman', ar: 'عياء الأمومة' }, hint: { fr: 'Faire simple quand le temps manque', ar: 'نبسطو ملي الوقت قليل' } },
  { id: 'emotional', label: { fr: 'Charge émotionnelle', ar: 'الضغط النفسي' }, hint: { fr: 'Observer sans tout lui attribuer', ar: 'نلاحظو بلا ما نفسرو كلشي به' } },
  { id: 'diet', label: { fr: 'Alimentation', ar: 'التغذية' }, hint: { fr: 'Nuance, pas d’interdits', ar: 'بتوازن، بلا منع قاسي' } },
  { id: 'sun', label: { fr: 'Soleil et habitudes', ar: 'الشمس والعادات' }, hint: { fr: 'Une protection réaliste', ar: 'حماية واقعية' } },
  { id: 'facial-hair', label: { fr: 'Pilosité du visage', ar: 'شعر الوجه' }, hint: { fr: 'Des repères sans jugement', ar: 'معلومات بلا أحكام' } },
]

export const concernOptions: DiscoveryOption<string>[] = [
  { id: 'taches', label: { fr: 'Taches', ar: 'التصبغات' }, hint: { fr: 'Couleur irrégulière', ar: 'لون غير موحد' } },
  { id: 'traces', label: { fr: 'Traces de boutons', ar: 'آثار الحبوب' }, hint: { fr: 'Marques après inflammation', ar: 'آثار من بعد الالتهاب' } },
  { id: 'grasse', label: { fr: 'Brillance', ar: 'اللمعان' }, hint: { fr: 'Sébum et pores', ar: 'الدهون والمسام' } },
  { id: 'seche', label: { fr: 'Tiraillement', ar: 'الشد' }, hint: { fr: 'Confort et barrière', ar: 'الراحة وحاجز البشرة' } },
  { id: 'sensible', label: { fr: 'Réactions', ar: 'التفاعلات' }, hint: { fr: 'Picotements, rougeurs', ar: 'حريق واحمرار' } },
  { id: 'terne', label: { fr: 'Teint terne', ar: 'البهتان' }, hint: { fr: 'Éclat irrégulier', ar: 'إشراقة ناقصة' } },
  { id: 'spf', label: { fr: 'Soleil', ar: 'الشمس' }, hint: { fr: 'Protection quotidienne', ar: 'الحماية اليومية' } },
  { id: 'inconnue', label: { fr: 'Je ne sais pas', ar: 'ما عارفاش' }, hint: { fr: 'Commencer par observer', ar: 'نبداو بالملاحظة' } },
]

export const discoveryCards: DiscoveryCard[] = [
  {
    id: 'oily-can-be-dehydrated', format: 'fact', profiles: ['oily', 'combination', 'unknown'], concerns: ['grasse', 'seche', 'inconnue'], lifestyles: [],
    eyebrow: { fr: 'Le détail qui change tout', ar: 'التفصيل اللي كيبدل كلشي' },
    title: { fr: 'Une peau peut briller et manquer d’eau.', ar: 'البشرة تقدر تلمع وتكون ناقصة الماء.' },
    teaser: { fr: 'Le sébum et l’hydratation ne racontent pas la même chose.', ar: 'الدهون والترطيب ماشي نفس الحاجة.' },
    explanation: { fr: 'La brillance parle surtout de sébum. Le tiraillement, l’inconfort ou un aspect froissé peuvent signaler un manque d’eau ou une barrière fragilisée, même sur une zone grasse.', ar: 'اللمعان كيهضر غالباً على الدهون. أما الشد وعدم الراحة يقدرو يشيرو لنقص الماء أو ضعف حاجز البشرة، حتى إلا كانت كتلمع.' },
    why: { fr: 'Nettoyer trop fort peut retirer des lipides protecteurs et augmenter l’inconfort sans régler la cause de la brillance.', ar: 'التنظيف القوي يقدر ينقص الدهون الواقية ويزيد الشد بلا ما يحل سبب اللمعان.' },
    gesture: { fr: 'Pendant sept jours, gardez un nettoyant doux et un hydratant léger. Observez séparément la zone T et les joues.', ar: 'مدة سبعة أيام، خلي منظف لطيف ومرطب خفيف. راقبي منطقة T والخدود كل وحدة بوحدها.' },
    mistake: { fr: 'Multiplier les lavages ou supprimer tout hydratant.', ar: 'تكثري الغسيل أو تحبسي المرطب كامل.' },
    professional: { fr: 'Consultez si l’inconfort, les fissures ou l’inflammation persistent.', ar: 'استشيري طبيب الجلد إلا بقى الشد أو التشقق أو الالتهاب.' },
    sourceTitle: 'Face washing 101 — American Academy of Dermatology', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101', sourceType: { fr: 'Recommandations dermatologiques', ar: 'توصيات أطباء الجلد' },
  },
  {
    id: 'hot-water-dryness', format: 'gesture', profiles: ['dry', 'sensitive', 'combination'], concerns: ['seche', 'sensible'], lifestyles: ['motherhood'],
    eyebrow: { fr: 'Test de 30 secondes', ar: 'تجربة ديال 30 ثانية' },
    title: { fr: 'La température de l’eau compte plus qu’on ne le pense.', ar: 'حرارة الماء كتفرق أكثر مما كنظنو.' },
    teaser: { fr: 'Très chaude ne veut pas dire plus propre.', ar: 'سخون بزاف ما كيعنيش أنظف.' },
    explanation: { fr: 'Une eau très chaude et le frottement peuvent accentuer l’irritation et le tiraillement. Le nettoyage doit retirer les impuretés, pas laisser la peau inconfortable.', ar: 'الماء السخون بزاف والحك يقدرو يزيدو التهيج والشد. التنظيف خاصو ينقي، ماشي يخلي البشرة متضررة.' },
    why: { fr: 'La chaleur et le frottement sollicitent davantage la surface protectrice de la peau.', ar: 'السخونية والحك كيزيدو يجهدو الطبقة الواقية ديال البشرة.' },
    gesture: { fr: 'Utilisez de l’eau tiède, vos doigts et séchez en tamponnant. Comparez la sensation juste après.', ar: 'استعملي ماء دافئ، صبيعاتك، ونشفي بالطبطبة. قارني الإحساس مباشرة من بعد.' },
    mistake: { fr: 'Frotter avec une serviette ou une brosse pour “nettoyer les pores”.', ar: 'تحكي بالفوطة أو الفرشاة باش “تنقي المسام”.' },
    professional: { fr: 'Une brûlure, des plaques ou des démangeaisons durables méritent un avis médical.', ar: 'الحريق أو البقع أو الحكة اللي كتبقى خاصها رأي طبي.' },
    sourceTitle: 'Face washing 101 — American Academy of Dermatology', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101', sourceType: { fr: 'Recommandations dermatologiques', ar: 'توصيات أطباء الجلد' },
  },
  {
    id: 'stinging-is-not-proof', format: 'myth', profiles: ['sensitive', 'dry', 'medium-dark', 'unknown'], concerns: ['sensible', 'traces', 'taches'], lifestyles: [],
    eyebrow: { fr: 'Idée reçue', ar: 'فكرة منتشرة' },
    title: { fr: '“Ça pique, donc ça agit” n’est pas une règle.', ar: '“كيحرق يعني خدام” ماشي قاعدة.' },
    teaser: { fr: 'Une sensation forte n’est pas une preuve d’efficacité.', ar: 'الإحساس القوي ماشي دليل على الفعالية.' },
    explanation: { fr: 'Un picotement persistant peut être un signe d’irritation. Sur une peau mate à foncée, l’irritation peut ensuite laisser une marque plus sombre.', ar: 'الحريق اللي كيبقى يقدر يكون علامة ديال التهيج. فالبشرة القمحية للسمراء، التهيج يقدر يخلي أثر غامق.' },
    why: { fr: 'L’inflammation peut stimuler une production supplémentaire de mélanine après la réaction.', ar: 'الالتهاب يقدر يحفز البشرة تنتج صباغة أكثر من بعد التفاعل.' },
    gesture: { fr: 'Rincez si la sensation est forte, arrêtez le nouveau produit et revenez à une routine simple.', ar: 'غسلي إلا كان الحريق قوي، وقفي المنتج الجديد، ورجعي لروتين بسيط.' },
    mistake: { fr: 'Continuer plusieurs jours pour “habituer” une peau douloureuse.', ar: 'تكملي أيام باش “تعودي” بشرة كتوجع.' },
    professional: { fr: 'Gonflement, douleur importante ou réaction étendue : demandez rapidement un avis médical.', ar: 'الانتفاخ أو الألم القوي أو التفاعل الواسع: طلبي رأي طبي بسرعة.' },
    sourceTitle: 'How to fade dark spots in darker skin tones — AAD', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/fade-dark-spots', sourceType: { fr: 'Information médicale relue', ar: 'معلومة طبية مراجعة' },
  },
  {
    id: 'combination-zones', format: 'quiz', profiles: ['combination', 'unknown', 'oily'], concerns: ['grasse', 'seche', 'inconnue'], lifestyles: [],
    eyebrow: { fr: 'Mini-observation', ar: 'ملاحظة صغيرة' },
    title: { fr: 'Et si votre visage n’avait pas besoin de la même chose partout ?', ar: 'واش ممكن وجهك ما يحتاجش نفس الحاجة فكل بلاصة؟' },
    teaser: { fr: 'Zone T brillante, joues inconfortables : ce contraste est une information.', ar: 'منطقة T كتلمع والخدود كيشدو: هاد الفرق معلومة مهمة.' },
    explanation: { fr: 'Une peau mixte peut présenter des besoins différents selon les zones. Un seul ressenti global peut masquer ce contraste.', ar: 'البشرة المختلطة تقدر تكون عندها احتياجات مختلفة حسب المناطق. إحساس واحد على الوجه كامل يقدر يخبي هاد الفرق.' },
    why: { fr: 'La densité des glandes sébacées et les habitudes d’application ne sont pas identiques sur tout le visage.', ar: 'الغدد الدهنية وطريقة وضع المنتجات ماشي كيف كيف فكل الوجه.' },
    gesture: { fr: 'Après un nettoyage doux, attendez 30 minutes puis notez séparément front, nez, menton et joues.', ar: 'من بعد تنظيف لطيف، تسناي 30 دقيقة وكتبي إحساس الجبهة والأنف والذقن والخدود كل وحدة.' },
    mistake: { fr: 'Décaper tout le visage parce que seule la zone T brille.', ar: 'تنشفي الوجه كامل حيث غير منطقة T كتلمع.' },
    professional: { fr: 'Si les zones rouges, squameuses ou douloureuses persistent, consultez.', ar: 'إلا بقا الاحمرار أو القشور أو الألم، استشيري الطبيب.' },
    sourceTitle: 'Face washing 101 — American Academy of Dermatology', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101', sourceType: { fr: 'Recommandations dermatologiques', ar: 'توصيات أطباء الجلد' },
  },
  {
    id: 'dark-marks-cause-first', format: 'fact', profiles: ['medium-dark', 'sensitive'], concerns: ['taches', 'traces', 'sensible'], lifestyles: ['sun'],
    eyebrow: { fr: 'Avant de chercher à éclaircir', ar: 'قبل ما تقلبي على التفتيح' },
    title: { fr: 'Traiter la cause peut compter autant que traiter la marque.', ar: 'علاج السبب يقدر يكون قد علاج الأثر.' },
    teaser: { fr: 'Une nouvelle irritation peut créer une nouvelle tache.', ar: 'أي تهيج جديد يقدر يخلي أثر جديد.' },
    explanation: { fr: 'Bouton, grattage, produit irritant ou inflammation peuvent précéder une hyperpigmentation. Calmer ce qui entretient l’inflammation aide à éviter de nouvelles marques.', ar: 'الحبة أو الحك أو منتج مهيج أو التهاب يقدرو يسبقو التصبغ. تهدئة السبب كتعاون ما يبانوش آثار جداد.' },
    why: { fr: 'Après une inflammation, certaines peaux produisent davantage de mélanine dans la zone concernée.', ar: 'من بعد الالتهاب، بعض البشرات كتنتج صباغة أكثر فداك المكان.' },
    gesture: { fr: 'Repérez ce qui apparaît juste avant la marque et protégez la peau du soleil chaque matin.', ar: 'لاحظي شنو كيوقع قبل الأثر مباشرة، وحمي البشرة من الشمس كل صباح.' },
    mistake: { fr: 'Ajouter plusieurs acides alors que la peau est déjà irritée.', ar: 'تزيدي بزاف ديال الأحماض والبشرة أصلاً متهيجة.' },
    professional: { fr: 'Des taches nouvelles, rapides ou inexpliquées doivent être examinées.', ar: 'التصبغات الجديدة أو السريعة أو بلا سبب واضح خاصها فحص.' },
    sourceTitle: 'How to fade dark spots in darker skin tones — AAD', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/fade-dark-spots', sourceType: { fr: 'Information médicale relue', ar: 'معلومة طبية مراجعة' },
  },
  {
    id: 'pregnancy-simple-routine', format: 'warning', profiles: ['dry', 'sensitive', 'oily', 'combination', 'medium-dark', 'unknown'], concerns: ['taches', 'traces', 'grasse', 'seche', 'sensible', 'terne', 'spf', 'inconnue'], lifestyles: ['pregnancy'],
    eyebrow: { fr: 'Grossesse & allaitement', ar: 'الحمل والرضاعة' },
    title: { fr: 'Pendant la grossesse, “simple” est déjà une vraie stratégie.', ar: 'وقت الحمل، الروتين البسيط راه استراتيجية حقيقية.' },
    teaser: { fr: 'Les changements hormonaux existent, mais tous les actifs ne se valent pas.', ar: 'التغييرات الهرمونية موجودة، ولكن ماشي كل المواد كيف كيف.' },
    explanation: { fr: 'La peau peut devenir plus sèche, sensible, sujette à l’acné ou aux taches. Une base douce — nettoyer, hydrater, protéger — permet de limiter les improvisations.', ar: 'البشرة تقدر تولي جافة أو حساسة أو يبان فيها الحب والتصبغات. أساس لطيف — تنظيف وترطيب وحماية — كيقلل التخربيق.' },
    why: { fr: 'Certaines molécules sont déconseillées pendant la grossesse, et les données manquent pour d’autres.', ar: 'كاين مواد ما منصوحاش وقت الحمل، ومواد أخرى المعلومات عليها ناقصة.' },
    gesture: { fr: 'Montrez la liste complète de vos produits à votre médecin, dermatologue ou pharmacien avant de modifier un traitement.', ar: 'وري لائحة المنتجات كاملة للطبيب أو طبيب الجلد أو الصيدلي قبل ما تبدلي علاج.' },
    mistake: { fr: 'Se fier uniquement à la mention “naturel” ou à une vidéo courte.', ar: 'تعتمدي غير على كلمة “طبيعي” أو فيديو قصير.' },
    professional: { fr: 'Tout traitement médicamenteux ou actif ciblé doit être validé individuellement pendant la grossesse et l’allaitement.', ar: 'أي دواء أو مادة فعالة مركزة خاصها موافقة فردية وقت الحمل والرضاعة.' },
    sourceTitle: 'Dermatologist-approved pregnancy skin care — AAD', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/pregnancy-skin-care', sourceType: { fr: 'Conseils dermatologiques 2025', ar: 'نصائح أطباء الجلد 2025' },
    caution: { fr: 'Information générale uniquement : elle ne remplace pas l’avis de votre médecin.', ar: 'معلومة عامة فقط، ما كتعوضش رأي الطبيب ديالك.' },
  },
  {
    id: 'stress-barrier', format: 'fact', profiles: ['sensitive', 'dry', 'unknown'], concerns: ['sensible', 'seche', 'inconnue'], lifestyles: ['stress', 'emotional', 'motherhood'],
    eyebrow: { fr: 'Sans tout mettre sur le stress', ar: 'بلا ما نفسرو كلشي بالضغط' },
    title: { fr: 'Le stress peut influencer la barrière cutanée — sans être “votre faute”.', ar: 'الضغط يقدر يأثر على حاجز البشرة — وماشي ذنبك.' },
    teaser: { fr: 'C’est un facteur possible, pas une explication universelle.', ar: 'عامل ممكن، ماشي تفسير لكلشي.' },
    explanation: { fr: 'Des travaux relient le stress psychologique à des changements de la fonction barrière. Cela ne permet pas d’expliquer seul chaque poussée ni de remplacer un diagnostic.', ar: 'أبحاث ربطات الضغط النفسي بتغييرات فحاجز البشرة. ولكن ما نقدرش نفسرو به كل تفاعل ولا نعوضو التشخيص.' },
    why: { fr: 'Les réponses hormonales et inflammatoires au stress peuvent modifier temporairement la récupération de la barrière.', ar: 'الاستجابة الهرمونية والالتهابية للضغط تقدر تبدل مؤقتاً كيفاش كيرجع حاجز البشرة.' },
    gesture: { fr: 'Les jours chargés, gardez seulement vos trois gestes les mieux tolérés au lieu de tester une nouveauté.', ar: 'فالنهارات الصعاب، خلي غير ثلاثة خطوات اللي كتتحمليهم مزيان وبلا منتج جديد.' },
    mistake: { fr: 'Se culpabiliser ou attribuer automatiquement chaque symptôme au stress.', ar: 'تلومي راسك أو تفسري أي عرض بالضغط مباشرة.' },
    professional: { fr: 'Une poussée persistante, étendue ou douloureuse nécessite un avis médical, quel que soit votre niveau de stress.', ar: 'أي تفاعل مستمر أو واسع أو مؤلم خاصو رأي طبي، كيف ما كان مستوى الضغط.' },
    sourceTitle: 'The impact of stress on epidermal barrier function — British Journal of Dermatology', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/30614527/', sourceType: { fr: 'Revue scientifique', ar: 'مراجعة علمية' },
  },
  {
    id: 'sleep-is-context', format: 'gesture', profiles: ['sensitive', 'dry', 'oily', 'unknown'], concerns: ['sensible', 'seche', 'grasse', 'terne'], lifestyles: ['sleep', 'motherhood', 'stress'],
    eyebrow: { fr: 'Quand les nuits sont courtes', ar: 'ملي الليالي كيقصرو' },
    title: { fr: 'Ne changez pas toute votre routine après une mauvaise nuit.', ar: 'ما تبدليش الروتين كامل من بعد ليلة ناقصة.' },
    teaser: { fr: 'La peau varie aussi avec le contexte et la récupération.', ar: 'البشرة كتتبدل حتى مع الظروف والراحة.' },
    explanation: { fr: 'Une petite étude expérimentale a observé une récupération plus lente de la barrière après privation de sommeil. Ce résultat donne un repère, pas une règle pour chaque personne.', ar: 'دراسة تجريبية صغيرة لاحظات رجوع أبطأ لحاجز البشرة من بعد نقص النوم. هادي معلومة تساعد، ماشي قاعدة على كل وحدة.' },
    why: { fr: 'Le sommeil, le stress et les médiateurs inflammatoires sont liés, mais beaucoup d’autres facteurs influencent aussi la peau.', ar: 'النوم والضغط والالتهاب مرتبطين، ولكن كاين عوامل أخرى كثيرة كتأثر على البشرة.' },
    gesture: { fr: 'Après une nuit difficile, privilégiez confort, hydratation et protection. Jugez votre peau sur plusieurs jours.', ar: 'من بعد ليلة صعيبة، ركزي على الراحة والترطيب والحماية. حكمي على البشرة على عدة أيام.' },
    mistake: { fr: 'Ajouter un exfoliant fort pour corriger immédiatement un teint fatigué.', ar: 'تزيدي مقشر قوي باش تصلحي البهتان بسرعة.' },
    professional: { fr: 'Un trouble durable du sommeil ou une fatigue importante mérite d’être discuté avec un professionnel de santé.', ar: 'مشكل النوم اللي كيبقى أو عياء قوي خاصو نقاش مع مهني الصحة.' },
    sourceTitle: 'Stress-induced changes in skin barrier function in healthy women', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/11511309/', sourceType: { fr: 'Étude clinique exploratoire', ar: 'دراسة سريرية استكشافية' },
  },
  {
    id: 'facial-hair-context', format: 'warning', profiles: ['oily', 'combination', 'medium-dark', 'unknown'], concerns: ['grasse', 'traces', 'inconnue'], lifestyles: ['facial-hair'],
    eyebrow: { fr: 'Pilosité du visage', ar: 'شعر الوجه' },
    title: { fr: 'Quelques poils ne racontent pas, à eux seuls, une maladie.', ar: 'شي شعرات بوحدهم ما كيعنيوش مرض.' },
    teaser: { fr: 'Le rythme d’apparition et les signes associés comptent davantage.', ar: 'سرعة الظهور والعلامات المرافقة هما الأهم.' },
    explanation: { fr: 'La pilosité varie naturellement. Une pousse épaisse qui progresse rapidement, surtout avec des règles irrégulières, une chute de cheveux ou d’autres changements, mérite une évaluation médicale douce et sans jugement.', ar: 'شعر الوجه كيختلف طبيعياً. إلا ولى غليظ وكيتزاد بسرعة، خصوصاً مع دورة غير منتظمة أو تساقط الشعر أو تغييرات أخرى، من الأفضل تقييم طبي بلا أحكام.' },
    why: { fr: 'Certaines évolutions peuvent être associées à un excès d’androgènes, alors qu’une pilosité locale isolée a souvent une faible probabilité de révéler un trouble qui change la prise en charge.', ar: 'بعض التغييرات تقدر ترتبط بزيادة الهرمونات الذكورية، بينما شعر محلي بوحدو غالباً ما كيدلش على مشكل كيبدل العلاج.' },
    gesture: { fr: 'Notez depuis quand la pousse a changé et si d’autres signes sont apparus. Ne grattez pas les boutons liés à l’épilation.', ar: 'كتبي من إمتى تبدل الشعر وواش بانو علامات أخرى. وما تحكيش الحبوب من بعد إزالة الشعر.' },
    mistake: { fr: 'Promettre qu’un cosmétique “règle les hormones” ou conclure automatiquement à un SOPK.', ar: 'نقولو منتج تجميلي “كيصلح الهرمونات” أو نحكمو مباشرة أنه تكيس المبايض.' },
    professional: { fr: 'Consultez si la pousse devient rapidement épaisse ou s’accompagne de changements hormonaux apparents.', ar: 'استشيري الطبيب إلا تزاد الشعر الغليظ بسرعة أو جا مع تغييرات هرمونية باينة.' },
    sourceTitle: 'Hirsutism Guideline Resources — Endocrine Society', sourceUrl: 'https://www.endocrine.org/clinical-practice-guidelines/hirsutism', sourceType: { fr: 'Recommandations cliniques', ar: 'توصيات سريرية' },
  },
  {
    id: 'diet-no-ban-list', format: 'myth', profiles: ['oily', 'combination', 'unknown'], concerns: ['grasse', 'traces', 'inconnue'], lifestyles: ['diet'],
    eyebrow: { fr: 'Alimentation sans liste noire', ar: 'التغذية بلا لائحة ممنوعات' },
    title: { fr: 'Un aliment isolé n’explique pas toutes les poussées.', ar: 'ماكلة وحدة ما كتفسرش جميع الحبوب.' },
    teaser: { fr: 'Les associations existent, mais elles restent variables selon les personnes.', ar: 'كاين ارتباطات، ولكن كتختلف من وحدة لوحدة.' },
    explanation: { fr: 'Une revue systématique trouve une association modeste entre charge glycémique élevée et acné. Pour les produits laitiers, les résultats sont plus mélangés et dépendent des populations.', ar: 'مراجعة علمية لقات ارتباط محدود بين الحمولة السكرية العالية والحبوب. بالنسبة للحليب ومشتقاته، النتائج مختلفة حسب الناس والمجتمعات.' },
    why: { fr: 'L’alimentation peut agir via plusieurs voies hormonales et métaboliques, mais l’acné est multifactorielle.', ar: 'التغذية تقدر تأثر عبر الهرمونات والاستقلاب، ولكن الحبوب عندها أسباب كثيرة.' },
    gesture: { fr: 'Observez vos habitudes sur plusieurs semaines avec un repas équilibré, sans supprimer brutalement un groupe alimentaire.', ar: 'راقبي العادات ديالك عدة أسابيع مع أكل متوازن، بلا ما تحيدي مجموعة غذائية كاملة فجأة.' },
    mistake: { fr: 'Suivre une restriction extrême ou culpabiliser après chaque bouton.', ar: 'تتبعي منع قاسي أو تلومي راسك على كل حبة.' },
    professional: { fr: 'Demandez conseil à un médecin ou diététicien avant une restriction importante, surtout pendant la grossesse ou l’allaitement.', ar: 'استشيري طبيب أو أخصائي تغذية قبل أي منع كبير، خصوصاً وقت الحمل والرضاعة.' },
    sourceTitle: 'Diet and acne: A systematic review — JAAD International', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35373155/', sourceType: { fr: 'Revue systématique', ar: 'مراجعة منهجية' },
  },
  {
    id: 'water-not-a-cream', format: 'myth', profiles: ['dry', 'unknown'], concerns: ['seche', 'terne', 'inconnue'], lifestyles: ['diet'],
    eyebrow: { fr: 'Vrai, mais incomplet', ar: 'صحيح ولكن ناقص' },
    title: { fr: 'Boire plus d’eau ne remplace pas un soin de barrière.', ar: 'شرب الماء ما كيعوضش العناية بحاجز البشرة.' },
    teaser: { fr: 'L’hydratation générale compte, mais la preuve d’un effet visible reste limitée.', ar: 'ترطيب الجسم مهم، ولكن الدليل على تأثير واضح فالبشرة محدود.' },
    explanation: { fr: 'Une revue a trouvé des données peu nombreuses et de qualité limitée. Un petit bénéfice est possible surtout chez les personnes qui buvaient peu, sans garantie sur la sécheresse cutanée.', ar: 'مراجعة لقات دراسات قليلة وجودتها محدودة. ممكن فائدة صغيرة خصوصاً للي ما كيشربوش كفاية، بلا ضمان على جفاف البشرة.' },
    why: { fr: 'La peau perd de l’eau par sa surface ; l’état de sa barrière et les soins appliqués comptent aussi.', ar: 'البشرة كتفقد الماء من السطح، وحالة الحاجز والعناية الخارجية حتى هما مهمين.' },
    gesture: { fr: 'Buvez selon vos besoins et ajoutez un hydratant adapté après un nettoyage doux.', ar: 'اشربي حسب الحاجة وزيدي مرطب مناسب من بعد تنظيف لطيف.' },
    mistake: { fr: 'Forcer des quantités excessives d’eau en attendant que toutes les ridules disparaissent.', ar: 'تفرضي كميات كبيرة بزاف وتستناي تختافي الخطوط كاملين.' },
    professional: { fr: 'Une soif inhabituelle ou une sécheresse persistante mérite un avis de santé.', ar: 'العطش غير العادي أو الجفاف اللي كيبقى خاصو رأي صحي.' },
    sourceTitle: 'Does dietary fluid intake affect skin hydration? — Systematic review', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/29392767/', sourceType: { fr: 'Revue systématique', ar: 'مراجعة منهجية' },
  },
  {
    id: 'sun-realistic-habit', format: 'gesture', profiles: ['medium-dark', 'sensitive', 'oily', 'dry', 'combination', 'unknown'], concerns: ['taches', 'traces', 'spf', 'terne'], lifestyles: ['sun'],
    eyebrow: { fr: 'Une habitude, pas un produit parfait', ar: 'عادة، ماشي منتج مثالي' },
    title: { fr: 'Le meilleur SPF est d’abord celui que vous pouvez porter régulièrement.', ar: 'أحسن SPF هو أولاً اللي تقدري تستعمليه بانتظام.' },
    teaser: { fr: 'Texture, confort et absence de traces blanches influencent l’usage réel.', ar: 'الملمس والراحة وبلا أثر أبيض كيأثرو على الاستعمال الحقيقي.' },
    explanation: { fr: 'Une protection large spectre SPF 30 ou plus est la base. Pour les peaux sujettes aux taches, une formule teintée peut aussi aider face à la lumière visible — sans devenir l’unique sujet de la routine.', ar: 'حماية واسعة SPF 30 أو أكثر هي الأساس. للبشرة اللي كيبانو فيها التصبغات، تركيبة ملونة تقدر تعاون ضد الضوء المرئي — بلا ما تولي هي موضوع الروتين كامل.' },
    why: { fr: 'Les UV participent aux taches ; la lumière visible peut aussi aggraver certaines hyperpigmentations.', ar: 'الأشعة فوق البنفسجية كتساهم فالتصبغات، والضوء المرئي يقدر حتى هو يزيد بعضها.' },
    gesture: { fr: 'Placez la protection près de vos gestes du matin et choisissez une texture compatible avec votre peau.', ar: 'خلي الواقي حدا خطوات الصباح واختاري ملمس كيناسب بشرتك.' },
    mistake: { fr: 'Acheter une formule parfaite sur le papier mais impossible à porter chaque jour.', ar: 'تشري تركيبة مثالية فالكلام ولكن ما تقدريش تستعمليها كل نهار.' },
    professional: { fr: 'Un mélasma ou des taches persistantes peuvent nécessiter un plan dermatologique.', ar: 'الكلف أو التصبغات المستمرة يقدرو يحتاجو خطة عند طبيب الجلد.' },
    sourceTitle: 'How do I know if I’m using the right sunscreen? — AAD', sourceUrl: 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/choosing-right-sunscreen', sourceType: { fr: 'Recommandations dermatologiques', ar: 'توصيات أطباء الجلد' },
  },
  {
    id: 'one-product-at-a-time', format: 'quiz', profiles: ['sensitive', 'unknown', 'dry', 'oily', 'combination', 'medium-dark'], concerns: ['sensible', 'inconnue', 'traces', 'taches'], lifestyles: ['motherhood', 'stress', 'emotional'],
    eyebrow: { fr: 'Le vrai raccourci', ar: 'الاختصار الحقيقي' },
    title: { fr: 'Ajouter un seul produit peut vous faire gagner du temps.', ar: 'تزيدي منتج واحد يقدر يربحك الوقت.' },
    teaser: { fr: 'Trois nouveautés créent trois suspects si la peau réagit.', ar: 'ثلاثة منتجات جداد كيعطيو ثلاثة مشتبهين إلا تفاعلات البشرة.' },
    explanation: { fr: 'Introduire progressivement aide à repérer tolérance, bénéfice et réaction. Tester une petite zone réduit aussi les surprises.', ar: 'الإدخال بالتدريج كيساعد تعرفي التحمل والفائدة والتفاعل. التجربة فبلاصة صغيرة كتقلل المفاجآت.' },
    why: { fr: 'Quand plusieurs variables changent ensemble, il devient difficile d’identifier celle qui a aidé ou irrité.', ar: 'ملي كتبدل عدة حوايج مرة وحدة، كيولي صعيب نعرفو شكون نفع وشكون هيج.' },
    gesture: { fr: 'Notez la date, testez une petite zone et laissez le reste de la routine stable.', ar: 'كتبي التاريخ، جربي فبلاصة صغيرة، وخلي باقي الروتين ثابت.' },
    mistake: { fr: 'Commencer une routine complète la veille d’un événement.', ar: 'تبداي روتين كامل ليلة قبل مناسبة.' },
    professional: { fr: 'Arrêtez et demandez conseil si une réaction importante apparaît.', ar: 'وقفي وطلبي النصيحة إلا بان تفاعل قوي.' },
    sourceTitle: 'How to test skin care products — American Academy of Dermatology', sourceUrl: 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products', sourceType: { fr: 'Recommandations dermatologiques', ar: 'توصيات أطباء الجلد' },
  },
]

