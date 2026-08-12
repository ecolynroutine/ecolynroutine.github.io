import type { Localized } from '../../types'
import type { LifestyleId, SkinProfileId } from '../discovery'
import { adviceSources, type AdviceSource } from '../sources'

export type ComplexionId = 'medium-dark' | 'not-medium-dark' | 'unspecified'
export type AdviceKind = 'skin' | 'concern' | 'context'
export type AdviceEvidence = 'established' | 'encouraging' | 'limited'

export interface AdviceItem {
  id: string
  kind: AdviceKind
  title: Localized
  explanation: Localized
  doItem: Localized
  avoidItem: Localized
  tags: {
    skinTypes: SkinProfileId[]
    concerns: string[]
    contexts: LifestyleId[]
    complexions: ComplexionId[]
  }
  priority: number
  evidenceLevel: AdviceEvidence
  source: AdviceSource
  safety?: Localized
}

const allSkin: SkinProfileId[] = ['oily', 'dry', 'sensitive', 'combination', 'unknown']
const allConcerns = ['taches', 'traces', 'acne', 'seche', 'grasse', 'sensible', 'terne', 'pilosite', 'spf', 'inconnue']

export const adviceItems: AdviceItem[] = [
  {
    id: 'oily-gentle-cleanse', kind: 'skin', priority: 10, evidenceLevel: 'established', source: adviceSources.aadWash,
    title: { fr: 'Nettoyer sans décaper', ar: 'تنظيف لطيف من دون تجفيف قاسٍ' },
    explanation: { fr: 'La brillance n’exige pas un nettoyage agressif. Une peau qui tire après le lavage peut surtout être irritée.', ar: 'لمعان البشرة لا يعني أنها تحتاج إلى تنظيف قاسٍ. الإحساس بالشد بعد الغسل قد يدل على التهيج.' },
    doItem: { fr: 'Utilisez un nettoyant doux avec les doigts, matin et soir au maximum.', ar: 'استخدمي منظفاً لطيفاً بأطراف الأصابع، بحد أقصى صباحاً ومساءً.' },
    avoidItem: { fr: 'Évitez les brosses, le frottement et les lavages répétés dans la journée.', ar: 'تجنبي الفرشاة والفرك وتكرار الغسل خلال اليوم.' },
    tags: { skinTypes: ['oily', 'combination'], concerns: ['grasse', 'acne', 'sensible'], contexts: [], complexions: [] },
  },
  {
    id: 'oily-moisturizer', kind: 'skin', priority: 9, evidenceLevel: 'established', source: adviceSources.aadMoisturizer,
    title: { fr: 'Une peau grasse peut aussi avoir besoin d’hydratation', ar: 'قد تحتاج البشرة الدهنية إلى الترطيب أيضاً' },
    explanation: { fr: 'Sébum et hydratation ne sont pas la même chose. Un hydratant léger peut améliorer le confort sans forcément boucher les pores.', ar: 'الدهون والترطيب أمران مختلفان. قد يساعد مرطب خفيف على راحة البشرة من دون أن يسد المسام بالضرورة.' },
    doItem: { fr: 'Choisissez une texture légère indiquée non comédogène si vous êtes sujette aux boutons.', ar: 'اختاري قواماً خفيفاً مكتوباً عليه أنه لا يسد المسام إذا كانت بشرتك معرضة للحبوب.' },
    avoidItem: { fr: 'Ne supprimez pas systématiquement l’hydratant parce que la zone T brille.', ar: 'لا تتوقفي عن الترطيب تلقائياً لمجرد لمعان منطقة الجبهة والأنف.' },
    tags: { skinTypes: ['oily', 'combination'], concerns: ['grasse', 'seche', 'acne'], contexts: [], complexions: [] },
  },
  {
    id: 'dry-moisturize-damp', kind: 'skin', priority: 10, evidenceLevel: 'established', source: adviceSources.aadDrySkin,
    title: { fr: 'Hydrater juste après le lavage', ar: 'ضعي المرطب بعد الغسل مباشرة' },
    explanation: { fr: 'Appliquer un hydratant sur une peau encore légèrement humide aide à retenir l’eau et à limiter le tiraillement.', ar: 'وضع المرطب على بشرة لا تزال رطبة قليلاً يساعد على الاحتفاظ بالماء وتقليل الشد.' },
    doItem: { fr: 'Tamponnez doucement puis appliquez votre hydratant sans attendre que la peau sèche complètement.', ar: 'جففي بشرتك بالتربيت ثم ضعي المرطب قبل أن تجف تماماً.' },
    avoidItem: { fr: 'Évitez d’attendre que la peau soit très sèche et inconfortable.', ar: 'تجنبي الانتظار حتى تصبح البشرة شديدة الجفاف وغير مرتاحة.' },
    tags: { skinTypes: ['dry', 'sensitive'], concerns: ['seche', 'sensible', 'terne'], contexts: [], complexions: [] },
  },
  {
    id: 'dry-hot-water', kind: 'skin', priority: 8, evidenceLevel: 'established', source: adviceSources.aadWash,
    title: { fr: 'L’eau tiède suffit', ar: 'الماء الفاتر كافٍ' },
    explanation: { fr: 'L’eau très chaude et le frottement peuvent accentuer le tiraillement et l’irritation.', ar: 'قد يزيد الماء شديد السخونة والفرك من الجفاف والتهيج.' },
    doItem: { fr: 'Rincez à l’eau tiède et séchez en tamponnant.', ar: 'اغسلي بالماء الفاتر وجففي بالتربيت.' },
    avoidItem: { fr: 'Évitez l’eau brûlante et la serviette frottée sur le visage.', ar: 'تجنبي الماء شديد السخونة وفرك الوجه بالمنشفة.' },
    tags: { skinTypes: ['dry', 'sensitive', 'combination'], concerns: ['seche', 'sensible'], contexts: [], complexions: [] },
  },
  {
    id: 'sensitive-fragrance-free', kind: 'skin', priority: 10, evidenceLevel: 'established', source: adviceSources.aadDrySkin,
    title: { fr: 'Chercher “sans parfum”', ar: 'ابحثي عن عبارة «خالٍ من العطر»' },
    explanation: { fr: 'Les parfums peuvent irriter une peau sensible. “Sans odeur” ne signifie pas toujours “sans parfum”.', ar: 'قد تسبب العطور تهيج البشرة الحساسة. وعبارة «من دون رائحة» لا تعني دائماً «خالٍ من العطر».' },
    doItem: { fr: 'Préférez la mention “sans parfum / fragrance-free” et une liste simple.', ar: 'فضّلي المنتجات المكتوب عليها «خالٍ من العطر» وبمكونات بسيطة.' },
    avoidItem: { fr: 'Ne choisissez pas uniquement selon une odeur discrète ou la mention “naturel”.', ar: 'لا تختاري المنتج فقط لأن رائحته خفيفة أو لأنه يوصف بالطبيعي.' },
    tags: { skinTypes: ['sensitive', 'dry'], concerns: ['sensible', 'seche', 'taches'], contexts: [], complexions: [] },
  },
  {
    id: 'sensitive-sting', kind: 'skin', priority: 9, evidenceLevel: 'established', source: adviceSources.aadDarkSpots,
    title: { fr: '“Ça pique” n’est pas une preuve d’efficacité', ar: 'الوخز ليس دليلاً على الفعالية' },
    explanation: { fr: 'Une brûlure ou un picotement persistant peut signaler une irritation, pas un produit qui “travaille mieux”.', ar: 'قد يكون الحرقان أو الوخز المستمر علامة على التهيج، وليس على أن المنتج يعمل بشكل أفضل.' },
    doItem: { fr: 'Rincez et arrêtez le nouveau produit si la sensation est forte ou durable.', ar: 'اغسلي البشرة وأوقفي المنتج الجديد إذا كان الإحساس قوياً أو مستمراً.' },
    avoidItem: { fr: 'Ne forcez pas plusieurs jours pour “habituer” une peau douloureuse.', ar: 'لا تواصلي أياماً بهدف تعويد بشرة تتألم.' },
    tags: { skinTypes: ['sensitive', 'dry', 'unknown'], concerns: ['sensible', 'taches', 'traces'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'combination-observe-zones', kind: 'skin', priority: 8, evidenceLevel: 'encouraging', source: adviceSources.aadWash,
    title: { fr: 'Observer chaque zone séparément', ar: 'راقبي مناطق الوجه كل واحدة على حدة' },
    explanation: { fr: 'Une zone T brillante et des joues inconfortables peuvent demander des textures différentes.', ar: 'قد تحتاج منطقة الجبهة والأنف اللامعة والخدود الجافة إلى قوام مختلف.' },
    doItem: { fr: 'Notez pendant quelques jours le ressenti du front, du nez et des joues.', ar: 'سجلي لبضعة أيام إحساس الجبهة والأنف والخدين.' },
    avoidItem: { fr: 'Évitez de décaper tout le visage parce qu’une seule zone brille.', ar: 'تجنبي تجفيف الوجه كله لأن منطقة واحدة فقط تلمع.' },
    tags: { skinTypes: ['combination', 'unknown'], concerns: ['grasse', 'seche', 'inconnue'], contexts: [], complexions: [] },
  },
  {
    id: 'unknown-observation', kind: 'skin', priority: 9, evidenceLevel: 'established', source: adviceSources.aadWash,
    title: { fr: 'Commencer par observer, pas par acheter', ar: 'ابدئي بالملاحظة لا بالشراء' },
    explanation: { fr: 'Quelques jours de routine simple donnent souvent plus d’informations qu’une succession de nouveautés.', ar: 'قد تعطيك بضعة أيام من روتين بسيط معلومات أوضح من تجربة منتجات كثيرة.' },
    doItem: { fr: 'Gardez nettoyage doux, hydratation et protection solaire, puis observez le confort.', ar: 'حافظي على تنظيف لطيف وترطيب ووقاية شمسية، ثم راقبي راحة البشرة.' },
    avoidItem: { fr: 'Évitez de conclure votre type de peau après une seule journée.', ar: 'تجنبي تحديد نوع بشرتك اعتماداً على يوم واحد فقط.' },
    tags: { skinTypes: ['unknown'], concerns: ['inconnue', 'terne'], contexts: [], complexions: [] },
  },
  {
    id: 'acne-hairline-products', kind: 'concern', priority: 10, evidenceLevel: 'established', source: adviceSources.aadHairProducts,
    title: { fr: 'Des produits capillaires peuvent toucher la lisière du visage', ar: 'قد تصل منتجات الشعر إلى الجبهة وتسبب الحبوب' },
    explanation: { fr: 'Les huiles et résidus de certains produits capillaires peuvent favoriser de petites bosses sur le front ou la lisière.', ar: 'قد تسهم زيوت وبقايا بعض منتجات الشعر في ظهور حبوب صغيرة عند الجبهة ومنبت الشعر.' },
    doItem: { fr: 'Éloignez les produits coiffants du visage et lavez taies, foulards et bandeaux régulièrement.', ar: 'أبعدي منتجات التصفيف عن الوجه واغسلي أغطية الوسائد والأوشحة وعصابات الشعر بانتظام.' },
    avoidItem: { fr: 'Évitez de laisser pommades ou huiles toucher le front pendant plusieurs semaines.', ar: 'تجنبي ملامسة الزيوت أو المراهم للجبهة لفترات طويلة.' },
    tags: { skinTypes: ['oily', 'combination', 'unknown'], concerns: ['acne', 'grasse'], contexts: ['hair-products'], complexions: [] },
  },
  {
    id: 'acne-change-slowly', kind: 'concern', priority: 9, evidenceLevel: 'established', source: adviceSources.aadAcneHabits,
    title: { fr: 'Laisser du temps à une routine', ar: 'امنحي الروتين وقتاً كافياً' },
    explanation: { fr: 'Changer de traitement chaque semaine peut irriter la peau et empêcher de comprendre ce qui aide réellement.', ar: 'قد يؤدي تغيير العلاج كل أسبوع إلى تهيج البشرة ويمنعك من معرفة ما يفيد فعلاً.' },
    doItem: { fr: 'Introduisez une seule nouveauté à la fois et notez la date.', ar: 'أدخلي منتجاً جديداً واحداً في كل مرة وسجلي التاريخ.' },
    avoidItem: { fr: 'Évitez d’empiler plusieurs actifs nouveaux le même soir.', ar: 'تجنبي جمع عدة مكونات فعالة جديدة في الليلة نفسها.' },
    tags: { skinTypes: allSkin, concerns: ['acne', 'traces', 'sensible', 'inconnue'], contexts: [], complexions: [] },
  },
  {
    id: 'acne-no-picking', kind: 'concern', priority: 10, evidenceLevel: 'established', source: adviceSources.aadAcneTips,
    title: { fr: 'Ne pas presser les boutons', ar: 'لا تعصري الحبوب' },
    explanation: { fr: 'Presser ou gratter peut prolonger l’inflammation et augmenter le risque de marques ou de cicatrices.', ar: 'قد يطيل عصر الحبوب أو حكها مدة الالتهاب ويزيد احتمال التصبغات أو الندبات.' },
    doItem: { fr: 'Laissez le bouton tranquille et utilisez une approche adaptée à l’ensemble de la zone.', ar: 'اتركي الحبة من دون لمس واتّبعي عناية مناسبة للمنطقة كلها.' },
    avoidItem: { fr: 'Évitez les ongles, aiguilles et extractions à la maison.', ar: 'تجنبي الأظافر والإبر ومحاولات الاستخراج في المنزل.' },
    tags: { skinTypes: ['oily', 'combination', 'unknown'], concerns: ['acne', 'traces', 'taches'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'acne-no-scrub', kind: 'concern', priority: 8, evidenceLevel: 'established', source: adviceSources.aadAcneTips,
    title: { fr: 'L’acné ne se gomme pas en frottant', ar: 'حب الشباب لا يختفي بالفرك' },
    explanation: { fr: 'Les gommages abrasifs et les outils rugueux peuvent augmenter l’irritation.', ar: 'قد تزيد المقشرات الخشنة وأدوات الفرك من التهيج.' },
    doItem: { fr: 'Nettoyez doucement avec les doigts et rincez complètement.', ar: 'نظفي البشرة بلطف بأطراف الأصابع ثم اغسليها جيداً.' },
    avoidItem: { fr: 'Évitez les grains, éponges rugueuses et brosses sur une zone inflammée.', ar: 'تجنبي الحبيبات والإسفنج الخشن والفرشاة على المنطقة الملتهبة.' },
    tags: { skinTypes: ['oily', 'sensitive', 'combination'], concerns: ['acne', 'sensible', 'traces'], contexts: [], complexions: [] },
  },
  {
    id: 'marks-not-scars', kind: 'concern', priority: 9, evidenceLevel: 'established', source: adviceSources.aadDarkSpots,
    title: { fr: 'Une trace colorée n’est pas toujours une cicatrice', ar: 'الأثر الملون ليس دائماً ندبة' },
    explanation: { fr: 'Une marque plate après un bouton peut être une hyperpigmentation. Une cicatrice creusée ou en relief demande une autre prise en charge.', ar: 'قد يكون الأثر المسطح بعد الحبة تصبغاً، أما الندبة الغائرة أو البارزة فتحتاج إلى تقييم مختلف.' },
    doItem: { fr: 'Observez si l’empreinte est seulement colorée ou si la texture a changé.', ar: 'راقبي هل التغير في اللون فقط أم أن ملمس البشرة تغير أيضاً.' },
    avoidItem: { fr: 'N’appliquez pas la même solution sur toutes les marques sans distinction.', ar: 'لا تستخدمي الحل نفسه لكل الآثار من دون تمييز.' },
    tags: { skinTypes: allSkin, concerns: ['traces', 'taches'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'marks-stop-cause', kind: 'concern', priority: 10, evidenceLevel: 'established', source: adviceSources.aadDarkSpots,
    title: { fr: 'Calmer la cause avant de cibler la marque', ar: 'هدّئي السبب قبل استهداف التصبغ' },
    explanation: { fr: 'Une irritation, un bouton ou un produit agressif peut créer de nouvelles marques même pendant que vous traitez les anciennes.', ar: 'قد يسبب التهيج أو الحبوب أو المنتج القاسي تصبغات جديدة أثناء علاج القديمة.' },
    doItem: { fr: 'Identifiez ce qui précède les marques et réduisez d’abord l’inflammation.', ar: 'حددي ما يسبق ظهور التصبغات وابدئي بتقليل الالتهاب.' },
    avoidItem: { fr: 'Évitez d’ajouter plusieurs acides sur une peau déjà irritée.', ar: 'تجنبي إضافة عدة أحماض إلى بشرة متهيجة أصلاً.' },
    tags: { skinTypes: ['sensitive', 'dry', 'oily', 'combination'], concerns: ['taches', 'traces', 'sensible'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'dark-skin-irritation', kind: 'concern', priority: 9, evidenceLevel: 'established', source: adviceSources.aadDarkSpots,
    title: { fr: 'Sur une peau mate à foncée, l’irritation peut laisser une marque', ar: 'قد يترك التهيج أثراً أوضح على البشرة المتوسطة إلى الداكنة' },
    explanation: { fr: 'Après une inflammation, la zone peut produire davantage de mélanine et rester plus foncée quelque temps.', ar: 'بعد الالتهاب قد تنتج المنطقة كمية أكبر من الميلانين وتبقى أغمق لفترة.' },
    doItem: { fr: 'Privilégiez la douceur et arrêtez ce qui brûle ou irrite.', ar: 'اختاري العناية اللطيفة وأوقفي ما يسبب الحرقان أو التهيج.' },
    avoidItem: { fr: 'Évitez de poursuivre un produit irritant pour obtenir un résultat plus rapide.', ar: 'تجنبي مواصلة منتج مهيج بهدف الحصول على نتيجة أسرع.' },
    tags: { skinTypes: allSkin, concerns: ['taches', 'traces', 'sensible'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'dark-skin-not-resistant', kind: 'concern', priority: 7, evidenceLevel: 'established', source: adviceSources.aadDarkSpots,
    title: { fr: 'Une peau foncée n’est pas “plus résistante” à tout', ar: 'البشرة الداكنة ليست أكثر تحملاً لكل شيء' },
    explanation: { fr: 'La mélanine ne protège pas contre l’irritation provoquée par un produit ou un frottement excessif.', ar: 'الميلانين لا يحمي من التهيج الناتج عن منتج قاسٍ أو فرك مفرط.' },
    doItem: { fr: 'Adaptez la fréquence et la douceur à votre ressenti réel.', ar: 'عدّلي تكرار الاستخدام ودرجة اللطف حسب إحساس بشرتك الحقيقي.' },
    avoidItem: { fr: 'Ne doublez pas les doses en pensant que votre peau supportera forcément.', ar: 'لا تضاعفي الكمية على افتراض أن بشرتك ستتحملها حتماً.' },
    tags: { skinTypes: allSkin, concerns: ['taches', 'traces', 'sensible', 'acne'], contexts: [], complexions: ['medium-dark'] },
  },
  {
    id: 'tinted-sunscreen', kind: 'concern', priority: 10, evidenceLevel: 'established', source: adviceSources.aadSunscreen,
    title: { fr: 'La protection solaire aide aussi à prévenir les marques', ar: 'الواقي الشمسي يساعد أيضاً على الحد من التصبغات' },
    explanation: { fr: 'Un écran large spectre SPF 30 ou plus est une base. Une formule teintée avec oxydes de fer peut aussi aider face à la lumière visible pour certaines taches.', ar: 'الواقي واسع الطيف بدرجة 30 أو أكثر خطوة أساسية، وقد تساعد التركيبة الملونة المحتوية على أكاسيد الحديد مع بعض التصبغات المرتبطة بالضوء المرئي.' },
    doItem: { fr: 'Appliquez chaque matin une quantité suffisante et renouvelez en cas d’exposition prolongée.', ar: 'ضعي كمية كافية كل صباح وجدديها عند التعرض الطويل.' },
    avoidItem: { fr: 'Évitez de réserver le SPF uniquement à la plage.', ar: 'لا تجعلي الواقي الشمسي خاصاً بالشاطئ فقط.' },
    tags: { skinTypes: allSkin, concerns: ['taches', 'traces', 'spf', 'terne'], contexts: ['sun'], complexions: ['medium-dark'] },
  },
  {
    id: 'patch-test', kind: 'concern', priority: 8, evidenceLevel: 'established', source: adviceSources.aadPatchTest,
    title: { fr: 'Tester une nouveauté sur une petite zone', ar: 'اختبري المنتج الجديد على مساحة صغيرة' },
    explanation: { fr: 'Un test local répété quelques jours peut révéler une réaction avant d’appliquer le produit sur tout le visage.', ar: 'قد يكشف الاختبار الموضعي لعدة أيام عن التهيج قبل وضع المنتج على كامل الوجه.' },
    doItem: { fr: 'Testez une petite quantité sur une zone discrète en suivant la méthode du fabricant.', ar: 'اختبري كمية صغيرة على منطقة محدودة واتّبعي تعليمات الشركة المصنّعة.' },
    avoidItem: { fr: 'Évitez de tester plusieurs nouveautés simultanément sur tout le visage.', ar: 'تجنبي تجربة عدة منتجات جديدة معاً على كامل الوجه.' },
    tags: { skinTypes: ['sensitive', 'dry', 'unknown'], concerns: ['sensible', 'acne', 'taches', 'inconnue'], contexts: [], complexions: [] },
  },
  {
    id: 'stress-simplify', kind: 'context', priority: 10, evidenceLevel: 'limited', source: adviceSources.stressReview,
    title: { fr: 'En période de stress, simplifier peut protéger la régularité', ar: 'في فترات التوتر قد يساعد تبسيط الروتين على الاستمرار' },
    explanation: { fr: 'Le stress peut être associé à des changements de la barrière cutanée, mais il n’explique pas à lui seul chaque problème de peau.', ar: 'قد يرتبط التوتر بتغيرات في حاجز البشرة، لكنه لا يفسر وحده كل مشكلة جلدية.' },
    doItem: { fr: 'Gardez trois repères réalistes : nettoyer doucement, hydrater, protéger le matin.', ar: 'حافظي على ثلاث خطوات واقعية: تنظيف لطيف، ترطيب، ووقاية صباحية.' },
    avoidItem: { fr: 'Évitez de vous culpabiliser ou de tout attribuer au stress.', ar: 'تجنبي لوم نفسك أو تفسير كل شيء بالتوتر.' },
    tags: { skinTypes: allSkin, concerns: allConcerns, contexts: ['stress', 'emotional', 'motherhood'], complexions: [] },
  },
  {
    id: 'sleep-stable-routine', kind: 'context', priority: 8, evidenceLevel: 'limited', source: adviceSources.stressReview,
    title: { fr: 'Sommeil irrégulier : choisir un minimum tenable', ar: 'مع اضطراب النوم اختاري الحد الأدنى الممكن' },
    explanation: { fr: 'Quand le rythme est difficile, une routine courte et stable est plus facile à maintenir qu’un programme complexe.', ar: 'عندما يكون الإيقاع متعباً، يكون الروتين القصير والثابت أسهل من برنامج معقد.' },
    doItem: { fr: 'Préparez un duo nettoyage doux + hydratant près de vos habitudes du soir.', ar: 'اجعلي المنظف اللطيف والمرطب قريبين من عاداتك المسائية.' },
    avoidItem: { fr: 'Évitez de compenser une soirée manquée par plusieurs actifs le lendemain.', ar: 'تجنبي تعويض ليلة فائتة باستعمال عدة مكونات فعالة في اليوم التالي.' },
    tags: { skinTypes: allSkin, concerns: ['terne', 'seche', 'sensible', 'acne', 'inconnue'], contexts: ['sleep', 'motherhood'], complexions: [] },
  },
  {
    id: 'diet-glycemic', kind: 'context', priority: 8, evidenceLevel: 'encouraging', source: adviceSources.dietReview,
    title: { fr: 'Alimentation et acné : observer sans interdire', ar: 'التغذية وحب الشباب: راقبي من دون منع قاسٍ' },
    explanation: { fr: 'Les études trouvent une association modeste entre charge glycémique élevée et acné. Cela ne permet pas d’accuser un aliment unique chez chaque personne.', ar: 'تشير الدراسات إلى ارتباط محدود بين الحمل السكري المرتفع وحب الشباب، لكن ذلك لا يعني أن طعاماً واحداً هو السبب عند الجميع.' },
    doItem: { fr: 'Observez vos habitudes globales et cherchez un équilibre durable.', ar: 'راقبي عاداتك الغذائية بشكل عام وابحثي عن توازن قابل للاستمرار.' },
    avoidItem: { fr: 'Évitez les régimes d’exclusion sévères sans accompagnement professionnel.', ar: 'تجنبي الحميات الإقصائية القاسية من دون متابعة مختصة.' },
    tags: { skinTypes: ['oily', 'combination', 'unknown'], concerns: ['acne', 'grasse'], contexts: ['diet'], complexions: [] },
  },
  {
    id: 'diet-dairy-nuance', kind: 'context', priority: 7, evidenceLevel: 'limited', source: adviceSources.dietReview,
    title: { fr: 'Le lait n’a pas le même effet chez tout le monde', ar: 'لا يؤثر الحليب بالطريقة نفسها عند الجميع' },
    explanation: { fr: 'Les données sur les produits laitiers sont variables selon les populations et ne justifient pas de supprimer automatiquement lait, yaourt et fromage.', ar: 'تختلف المعطيات حول منتجات الحليب حسب الفئات، ولا تبرر حذف الحليب واللبن والجبن تلقائياً.' },
    doItem: { fr: 'Si vous suspectez un lien, notez vos observations et parlez-en à un professionnel.', ar: 'إذا لاحظتِ ارتباطاً محتملاً، دوّني ملاحظاتك وناقشيها مع مختص.' },
    avoidItem: { fr: 'Évitez de supprimer une famille alimentaire entière sur la base d’une vidéo.', ar: 'تجنبي حذف مجموعة غذائية كاملة اعتماداً على فيديو واحد.' },
    tags: { skinTypes: allSkin, concerns: ['acne', 'grasse'], contexts: ['diet'], complexions: [] },
  },
  {
    id: 'facial-hair-common', kind: 'concern', priority: 7, evidenceLevel: 'established', source: adviceSources.endocrineHirsutism,
    title: { fr: 'La pilosité du visage peut varier naturellement', ar: 'قد تختلف كثافة شعر الوجه بشكل طبيعي' },
    explanation: { fr: 'La génétique, l’âge et les variations hormonales peuvent jouer un rôle. La présence de poils seule ne permet pas de poser un diagnostic.', ar: 'قد تلعب الوراثة والعمر والتغيرات الهرمونية دوراً. وجود الشعر وحده لا يسمح بتشخيص حالة معينة.' },
    doItem: { fr: 'Observez surtout l’évolution dans le temps et les autres changements éventuels.', ar: 'راقبي خصوصاً سرعة التغير وأي علامات أخرى مرافقة.' },
    avoidItem: { fr: 'Évitez de conclure seule à un trouble hormonal.', ar: 'تجنبي تشخيص اضطراب هرموني بنفسك.' },
    tags: { skinTypes: allSkin, concerns: ['pilosite'], contexts: [], complexions: [] },
  },
  {
    id: 'facial-hair-medical', kind: 'concern', priority: 10, evidenceLevel: 'established', source: adviceSources.aadHormonal,
    title: { fr: 'Une évolution rapide mérite un avis', ar: 'التغير السريع يستحق تقييماً طبياً' },
    explanation: { fr: 'Des poils épais apparus rapidement avec cycles irréguliers, chute de cheveux ou acné persistante peuvent justifier une évaluation médicale.', ar: 'قد يستدعي ظهور شعر كثيف بسرعة مع اضطراب الدورة أو تساقط الشعر أو حب شباب مستمر تقييماً طبياً.' },
    doItem: { fr: 'Notez la date d’apparition et consultez un médecin ou dermatologue.', ar: 'سجلي تاريخ ظهور التغير واستشيري طبيباً أو طبيب جلد.' },
    avoidItem: { fr: 'N’essayez pas de vous diagnostiquer ni de prendre un traitement hormonal seule.', ar: 'لا تشخّصي نفسك ولا تتناولي علاجاً هرمونياً من دون طبيب.' },
    tags: { skinTypes: allSkin, concerns: ['pilosite', 'acne'], contexts: [], complexions: [] },
    safety: { fr: 'Cette information ne permet pas de diagnostiquer un syndrome hormonal.', ar: 'هذه المعلومة لا تسمح بتشخيص اضطراب هرموني.' },
  },
  {
    id: 'pregnancy-simple', kind: 'context', priority: 10, evidenceLevel: 'established', source: adviceSources.aadPregnancy,
    title: { fr: 'Grossesse et allaitement : revenir à une base simple', ar: 'أثناء الحمل والرضاعة عودي إلى روتين أساسي وبسيط' },
    explanation: { fr: 'La peau peut changer pendant cette période. Nettoyer doucement, hydrater et protéger du soleil offrent une base prudente.', ar: 'قد تتغير البشرة خلال هذه الفترة. يشكل التنظيف اللطيف والترطيب والوقاية من الشمس أساساً حذراً.' },
    doItem: { fr: 'Montrez la liste complète de vos produits à votre médecin, dermatologue ou pharmacien.', ar: 'اعرضي قائمة منتجاتك كاملة على الطبيب أو طبيب الجلد أو الصيدلي.' },
    avoidItem: { fr: 'Ne considérez pas “naturel” comme synonyme de sûr pendant la grossesse.', ar: 'لا تعتبري كلمة «طبيعي» مرادفاً للأمان أثناء الحمل.' },
    tags: { skinTypes: allSkin, concerns: allConcerns, contexts: ['pregnancy'], complexions: [] },
    safety: { fr: 'Demandez un avis individuel avant tout actif ciblé ou médicament.', ar: 'اطلبي رأياً فردياً قبل أي مكوّن علاجي مركز أو دواء.' },
  },
  {
    id: 'pregnancy-avoid-actives', kind: 'context', priority: 9, evidenceLevel: 'established', source: adviceSources.aadPregnancy,
    title: { fr: 'Certains actifs sont déconseillés pendant la grossesse', ar: 'بعض المكونات غير موصى بها أثناء الحمل' },
    explanation: { fr: 'Les rétinoïdes et l’hydroquinone figurent parmi les ingrédients à éviter pendant la grossesse selon l’AAD.', ar: 'تذكر الأكاديمية الأمريكية للأمراض الجلدية أن الريتينويدات والهيدروكينون من المكونات التي ينبغي تجنبها أثناء الحمل.' },
    doItem: { fr: 'Lisez les ingrédients et faites valider chaque traitement par un professionnel.', ar: 'اقرئي قائمة المكونات واطلبي من مختص مراجعة كل علاج.' },
    avoidItem: { fr: 'Évitez rétinol/rétinoïdes et hydroquinone sans validation médicale.', ar: 'تجنبي الريتينول والريتينويدات والهيدروكينون من دون موافقة طبية.' },
    tags: { skinTypes: allSkin, concerns: ['taches', 'traces', 'acne', 'terne'], contexts: ['pregnancy'], complexions: [] },
    safety: { fr: 'Ne modifiez pas un traitement prescrit sans contacter le professionnel qui vous suit.', ar: 'لا تغيّري علاجاً موصوفاً من دون التواصل مع الطبيب المتابع.' },
  },
  {
    id: 'motherhood-minimum', kind: 'context', priority: 8, evidenceLevel: 'encouraging', source: adviceSources.aadWash,
    title: { fr: 'Quand le temps manque, trois gestes suffisent comme base', ar: 'عندما يضيق الوقت تكفي ثلاث خطوات كأساس' },
    explanation: { fr: 'Une routine courte répétée régulièrement vaut souvent mieux qu’une longue routine impossible à maintenir.', ar: 'غالباً ما يكون الروتين القصير المنتظم أفضل من روتين طويل يصعب الاستمرار عليه.' },
    doItem: { fr: 'Gardez nettoyant doux, hydratant et protection solaire à portée de main.', ar: 'اجعلي المنظف اللطيف والمرطب والواقي الشمسي في متناولك.' },
    avoidItem: { fr: 'Évitez de vous imposer dix étapes ou de culpabiliser quand vous en manquez une.', ar: 'تجنبي فرض عشر خطوات على نفسك أو الشعور بالذنب عند تفويت إحداها.' },
    tags: { skinTypes: allSkin, concerns: allConcerns, contexts: ['motherhood', 'sleep', 'stress'], complexions: [] },
  },
  {
    id: 'sun-habit', kind: 'context', priority: 9, evidenceLevel: 'established', source: adviceSources.aadSunscreen,
    title: { fr: 'Transformer la protection solaire en habitude', ar: 'اجعلي الوقاية من الشمس عادة يومية' },
    explanation: { fr: 'La régularité, la quantité et le renouvellement comptent davantage qu’un SPF appliqué occasionnellement.', ar: 'الانتظام والكمية وإعادة التطبيق أهم من استعمال الواقي بشكل متقطع.' },
    doItem: { fr: 'Associez le SPF à votre dernier geste du matin et gardez une solution de renouvellement.', ar: 'اربطي الواقي بآخر خطوة صباحية واحتفظي بطريقة مناسبة لإعادة وضعه.' },
    avoidItem: { fr: 'Évitez de compter uniquement sur le maquillage contenant un peu de SPF.', ar: 'تجنبي الاعتماد فقط على مكياج يحتوي على مقدار بسيط من الحماية.' },
    tags: { skinTypes: allSkin, concerns: ['spf', 'taches', 'traces', 'terne'], contexts: ['sun'], complexions: [] },
  },
  {
    id: 'hair-products-context', kind: 'context', priority: 9, evidenceLevel: 'established', source: adviceSources.aadHairProducts,
    title: { fr: 'Regarder aussi ce qui touche le visage', ar: 'راقبي أيضاً ما يلامس الوجه' },
    explanation: { fr: 'Produits capillaires, foulards, bonnets et taies peuvent laisser des résidus près du front.', ar: 'قد تترك منتجات الشعر والأوشحة والقبعات وأغطية الوسائد بقايا قرب الجبهة.' },
    doItem: { fr: 'Nettoyez régulièrement les tissus en contact et privilégiez des produits capillaires non comédogènes près du visage.', ar: 'اغسلي الأقمشة الملامسة للبشرة بانتظام واختاري منتجات شعر لا تسد المسام قرب الوجه.' },
    avoidItem: { fr: 'Évitez que les huiles coiffantes restent sur le front pendant la nuit.', ar: 'تجنبي بقاء زيوت التصفيف على الجبهة أثناء الليل.' },
    tags: { skinTypes: ['oily', 'combination', 'unknown'], concerns: ['acne', 'grasse', 'inconnue'], contexts: ['hair-products'], complexions: [] },
  },
  {
    id: 'dull-consistency', kind: 'concern', priority: 7, evidenceLevel: 'encouraging', source: adviceSources.aadWash,
    title: { fr: 'Pour l’éclat, commencer par la régularité', ar: 'لإشراقة أفضل ابدئي بالانتظام' },
    explanation: { fr: 'Un teint terne n’exige pas automatiquement un exfoliant. Inconfort, sommeil, sécheresse et exposition peuvent aussi modifier l’aspect de la peau.', ar: 'لا تحتاج البشرة الباهتة تلقائياً إلى مقشر. فقد يؤثر الجفاف وقلة النوم والتعرض للشمس أيضاً في مظهرها.' },
    doItem: { fr: 'Stabilisez une routine douce pendant deux semaines et observez le confort.', ar: 'ثبتي روتيناً لطيفاً لمدة أسبوعين وراقبي راحة البشرة.' },
    avoidItem: { fr: 'Évitez de multiplier les exfoliants pour obtenir un éclat immédiat.', ar: 'تجنبي الإكثار من المقشرات بحثاً عن إشراقة فورية.' },
    tags: { skinTypes: allSkin, concerns: ['terne', 'inconnue', 'seche'], contexts: ['sleep', 'stress'], complexions: [] },
  },
  {
    id: 'professional-acne', kind: 'concern', priority: 8, evidenceLevel: 'established', source: adviceSources.aadAcneTips,
    title: { fr: 'Une acné douloureuse ou persistante mérite un avis', ar: 'حب الشباب المؤلم أو المستمر يستحق تقييماً طبياً' },
    explanation: { fr: 'Des nodules profonds, des cicatrices ou une acné qui persiste malgré une routine adaptée nécessitent souvent un dermatologue.', ar: 'قد تحتاج الحبوب العميقة أو الندبات أو استمرار حب الشباب رغم العناية المناسبة إلى طبيب جلد.' },
    doItem: { fr: 'Consultez tôt si les lésions sont profondes, douloureuses ou laissent des cicatrices.', ar: 'استشيري مبكراً إذا كانت الحبوب عميقة أو مؤلمة أو تترك ندبات.' },
    avoidItem: { fr: 'Évitez d’attendre des mois en multipliant les remèdes agressifs.', ar: 'تجنبي الانتظار أشهراً مع تجربة علاجات منزلية قاسية.' },
    tags: { skinTypes: allSkin, concerns: ['acne', 'traces'], contexts: [], complexions: [] },
    safety: { fr: 'Ces conseils ne remplacent pas un diagnostic dermatologique.', ar: 'هذه النصائح لا تعوض التشخيص لدى طبيب الجلد.' },
  },
]
