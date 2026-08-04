import type { SkinCase } from '../../types'

export const skinCases: SkinCase[] = [
  {
    id: 'terne', category: { fr: 'Teint terne', ar: 'بشرة باهتة' },
    statement: { fr: 'J’utilise plusieurs produits mais ma peau reste terne.', ar: 'كنستعمل بزاف ديال المنتجات ولكن البشرة باقا باهتة.' },
    possible: { fr: 'La routine change souvent, l’hydratation manque de régularité ou les produits poursuivent trop d’objectifs à la fois.', ar: 'الروتين كيتبدل بزاف، الترطيب ماشي منتظم أو المنتجات عندها بزاف ديال الأهداف مرة وحدة.' },
    guidance: { fr: 'Revenir à une base simple pendant deux semaines et observer le confort avant d’ajouter un actif.', ar: 'رجعي لأساس بسيط لمدة أسبوعين وراقبي الراحة قبل ما تزيدي مادة فعالة.' }
  },
  {
    id: 'traces', category: { fr: 'Traces de boutons', ar: 'آثار الحبوب' },
    statement: { fr: 'Mes traces de boutons restent visibles longtemps.', ar: 'آثار الحبوب كيبقاو باينين مدة طويلة.' },
    possible: { fr: 'Le toucher répété, l’exposition solaire et les exfoliations agressives peuvent entretenir l’irrégularité.', ar: 'لمس الحبوب، الشمس والتقشير القوي يقدرو يخليو اللون غير موحد.' },
    guidance: { fr: 'Éviter de manipuler, protéger chaque matin et introduire les actifs progressivement.', ar: 'ما تلمسيش، ديري الحماية كل صباح ودخلي المواد الفعالة بالتدريج.' }
  },
  {
    id: 'grasse-tire', category: { fr: 'Peau grasse', ar: 'بشرة دهنية' },
    statement: { fr: 'Ma peau est grasse, mais elle tire après le nettoyage.', ar: 'بشرتي دهنية ولكن كتشّد من بعد الغسيل.' },
    possible: { fr: 'Le nettoyant, l’eau trop chaude ou la fréquence peuvent être trop intenses malgré la production de sébum.', ar: 'المنظف، الماء السخون أو كثرة الغسيل يقدرو يكونو قاصحين رغم الدهون.' },
    guidance: { fr: 'Tester un nettoyage plus doux et une hydratation légère sans multiplier les produits.', ar: 'جربي تنظيف ألطف وترطيب خفيف بلا ما تكثري المنتجات.' }
  },
  {
    id: 'spf-oublie', category: { fr: 'Protection solaire', ar: 'الحماية من الشمس' },
    statement: { fr: 'J’utilise un sérum, mais j’oublie souvent le SPF.', ar: 'كنستعمل سيروم ولكن كنسى بزاف الواقي الشمسي.' },
    possible: { fr: 'L’actif est valorisé, mais l’habitude de protection n’est pas encore liée à un geste quotidien.', ar: 'السيروم حاضر ولكن عادة الحماية مازال ما تربطاتش بروتين الصباح.' },
    guidance: { fr: 'Placer le SPF près des objets du matin et choisir une texture agréable à renouveler.', ar: 'خلي SPF حدا حاجيات الصباح واختاري قوام مريح باش تعاودي الاستعمال.' }
  },
  {
    id: 'routine-change', category: { fr: 'Routine confuse', ar: 'روتين مخربق' },
    statement: { fr: 'Je change de routine parce que je ne vois pas de résultat rapidement.', ar: 'كنبدل الروتين حيث ما كنشوفش النتيجة بسرعة.' },
    possible: { fr: 'Les changements rapprochés empêchent de savoir ce qui convient et peuvent irriter la peau.', ar: 'التبديلات القريبة ما كيخليوش نعرفو شنو مناسب ويقدرو يهيجو البشرة.' },
    guidance: { fr: 'Fixer un objectif, stabiliser la base et noter une fois par semaine ce qui change réellement.', ar: 'حددي هدف، ثبتي الأساس وكتبي مرة فالأسبوع شنو تبدل بصح.' }
  }
]
