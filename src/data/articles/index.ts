import type { Article } from '../../types'

export const articles: Article[] = [
  {
    slug: 'nettoyer-sans-agresser',
    category: 'Routine',
    time: 4,
    title: { fr: 'Nettoyer sans agresser la barrière cutanée', ar: 'تنظيف البشرة بلا ما نجهدو الحاجز ديالها' },
    summary: { fr: 'Les signes qui indiquent qu’un nettoyage est peut-être trop décapant.', ar: 'الإشارات اللي كيبينو بلي التنظيف قوي بزاف على البشرة.' },
    introduction: { fr: 'Une peau qui tire juste après le nettoyage ne signifie pas toujours qu’elle est parfaitement propre. Cette sensation peut signaler que le film protecteur naturel a été trop sollicité.', ar: 'إلا بقات البشرة كتشّد مباشرة من بعد الغسيل، ماشي بالضرورة معناها نقية مزيان. يمكن يكون الحاجز الطبيعي ديالها تجهد.' },
    explanation: { fr: 'Le nettoyage sert à retirer sueur, sébum, poussières et filtres solaires. Un produit doux, une eau tiède et un massage court suffisent souvent.', ar: 'التنظيف كينقص العرق والدهون والغبرة وبقايا الواقي الشمسي. غالباً منتج لطيف، ماء دافئ ومساج قصير كافيين.' },
    mistakes: { fr: ['Utiliser de l’eau très chaude', 'Frotter avec une serviette rêche', 'Multiplier les nettoyages sans besoin'], ar: ['استعمال ماء سخون بزاف', 'الحك بفوطة قاصحة', 'تكرار الغسيل بلا حاجة'] },
    gestures: { fr: ['Choisir une texture adaptée au confort de la peau', 'Masser 30 à 60 secondes sans insister', 'Sécher en tamponnant'], ar: ['اختاري قوام مريح للبشرة', 'دلكي 30 حتى 60 ثانية بلا ضغط', 'نشفي بالتربيت'] },
    watch: { fr: 'Surveillez les rougeurs, picotements durables et tiraillements répétés.', ar: 'راقبي الحمرة، الحريق اللي كيبقى، والشد المتكرر.' },
    professional: { fr: 'Demandez un avis professionnel si l’irritation devient forte, inhabituelle ou persistante.', ar: 'طلبي رأي مختص إلا ولات التهيجات قوية، غريبة أو مستمرة.' }
  },
  {
    slug: 'spf-chaque-jour',
    category: 'Protection solaire',
    time: 5,
    title: { fr: 'Pourquoi le SPF compte même sans journée à la plage', ar: 'علاش SPF مهم حتى إلا ما مشيتيش للبحر' },
    summary: { fr: 'Comprendre la protection quotidienne et les habitudes qui font la différence.', ar: 'كيفاش نديرو الحماية اليومية والعادات اللي كتفرق.' },
    introduction: { fr: 'L’exposition ne se limite pas aux vacances. Les déplacements, les fenêtres et les activités quotidiennes comptent aussi dans la régularité de la protection.', ar: 'التعرض للشمس ماشي غير فالعطلة. الطريق، النوافذ والنشاط اليومي كاملين كيدخلو فالحماية المنتظمة.' },
    explanation: { fr: 'Un écran solaire adapté aide à limiter l’impact visible du soleil, notamment sur l’irrégularité du teint. La régularité compte autant que le choix du produit.', ar: 'واقي شمسي مناسب كيساعد ينقص الأثر الظاهر ديال الشمس، خصوصاً على توحيد اللون. الاستمرار مهم بحال اختيار المنتج.' },
    mistakes: { fr: ['Appliquer une quantité symbolique', 'Oublier cou et oreilles', 'Compter uniquement sur le SPF du maquillage'], ar: ['وضع كمية قليلة بزاف', 'نسيان العنق والودنين', 'الاعتماد غير على SPF ديال الماكياج'] },
    gestures: { fr: ['Appliquer en dernière étape du matin', 'Renouveler selon l’exposition', 'Garder un format pratique dans le sac'], ar: ['ديريه آخر مرحلة فالصباح', 'جدديه حسب التعرض', 'خلي فورما صغيرة فالصاك'] },
    watch: { fr: 'Observez la tolérance autour des yeux et la compatibilité avec vos autres produits.', ar: 'راقبي واش مريح حدا العينين وواش كيناسب باقي المنتجات.' },
    professional: { fr: 'Une lésion qui change d’aspect ou une réaction importante mérite un avis dermatologique.', ar: 'أي علامة كتبدل الشكل أو تفاعل قوي خاصو رأي طبيب الجلد.' }
  },
  {
    slug: 'ordre-des-produits',
    category: 'Routine',
    time: 4,
    title: { fr: 'Dans quel ordre appliquer ses produits ?', ar: 'بأي ترتيب نديرو منتجات الروتين؟' },
    summary: { fr: 'Une méthode simple pour éviter une routine confuse.', ar: 'طريقة بسيطة باش مايبقاش الروتين مخربق.' },
    introduction: { fr: 'Un bon ordre facilite l’application, mais une routine utile n’a pas besoin de dix étapes.', ar: 'الترتيب المزيان كيسهل الاستعمال، ولكن الروتين المفيد ما محتاجش عشر مراحل.' },
    explanation: { fr: 'Commencez généralement par nettoyer, puis appliquez les textures légères, l’hydratant et enfin le SPF le matin. Les indications du fabricant restent prioritaires.', ar: 'غالباً كنبدأو بالتنظيف، من بعد القوام الخفيف، المرطب، وفالأخير SPF فالصباح. تعليمات المنتج كتبقى مهمة.' },
    mistakes: { fr: ['Ajouter plusieurs actifs en même temps', 'Ne pas laisser les textures se poser', 'Copier une routine sans tenir compte de sa peau'], ar: ['إضافة بزاف ديال المواد الفعالة دفعة وحدة', 'ما نخليوش القوام يستقر', 'نسخو روتين بلا ما نراعيو البشرة'] },
    gestures: { fr: ['Garder une base de trois étapes', 'Introduire une nouveauté à la fois', 'Noter les réactions pendant deux semaines'], ar: ['خلي الأساس فثلاث مراحل', 'دخلي غير منتج واحد جديد', 'كتبي ردود الفعل لمدة أسبوعين'] },
    watch: { fr: 'Bouloches, inconfort ou picotements répétés indiquent qu’il faut simplifier.', ar: 'التكتل، عدم الراحة أو الحريق المتكرر كيعنيو خاص التبسيط.' },
    professional: { fr: 'En cas de réaction intense ou de gonflement, arrêtez et demandez un avis médical.', ar: 'إلا وقع تفاعل قوي أو انتفاخ، حبسي وطلبي رأي طبي.' }
  },
  {
    slug: 'peau-grasse-hydratation',
    category: 'Peau grasse',
    time: 4,
    title: { fr: 'Peau grasse : l’hydratation reste utile', ar: 'البشرة الدهنية حتى هي محتاجة للترطيب' },
    summary: { fr: 'Sébum et manque d’eau ne racontent pas la même chose.', ar: 'الدهون ونقص الماء ماشي نفس الحاجة.' },
    introduction: { fr: 'Une peau brillante peut aussi manquer de confort ou d’eau. Décaper davantage peut renforcer les sensations désagréables.', ar: 'البشرة اللي كتلمع ممكن حتى هي تكون ناقصها الماء والراحة. التنظيف القوي يقدر يزيد المشكل.' },
    explanation: { fr: 'Le sébum est une matière grasse produite par la peau. L’hydratation concerne la teneur en eau et le confort. Une texture légère peut répondre aux deux réalités.', ar: 'الزهم مادة دهنية كتنتجها البشرة. الترطيب مرتبط بالماء والراحة. قوام خفيف يقدر يناسب الحالتين.' },
    mistakes: { fr: ['Éviter toute crème par peur de briller', 'Utiliser uniquement des produits alcoolisés', 'Nettoyer dès que la peau brille'], ar: ['تجنّب أي كريم خوفاً من اللمعان', 'استعمال غير منتجات فيها الكحول', 'الغسيل كلما بان اللمعان'] },
    gestures: { fr: ['Choisir un hydratant fluide non inconfortable', 'Nettoyer matin et soir selon le besoin', 'Observer la zone T séparément'], ar: ['اختاري مرطب خفيف ومريح', 'غسلي صباح وليل حسب الحاجة', 'راقبي منطقة T بوحدها'] },
    watch: { fr: 'Distinguez brillance, boutons inflammés et tiraillement après lavage.', ar: 'فرقي بين اللمعان، الحبوب الملتهبة والشد من بعد الغسيل.' },
    professional: { fr: 'Des lésions douloureuses ou une acné qui laisse des marques nécessitent un suivi adapté.', ar: 'الحبوب المؤلمة أو اللي كتخلي آثار خاصها متابعة مناسبة.' }
  },
  {
    slug: 'introduire-un-actif',
    category: 'Erreurs fréquentes',
    time: 6,
    title: { fr: 'Tester un nouvel actif sans bouleverser sa peau', ar: 'كيفاش نجربو مادة فعالة جديدة بلا ما نخلطو البشرة' },
    summary: { fr: 'Progressivité, zone test et observation : le trio le plus utile.', ar: 'التدرج، اختبار منطقة صغيرة والمراقبة هما الأساس.' },
    introduction: { fr: 'Quand plusieurs nouveautés arrivent en même temps, il devient difficile d’identifier ce qui aide ou ce qui irrite.', ar: 'ملي كندخلو بزاف ديال الجديد دفعة وحدة، كيولي صعيب نعرفو شنو نفع وشنو هيّج.' },
    explanation: { fr: 'Introduire un produit à la fois permet d’observer la tolérance. Commencez à faible fréquence et suivez les indications propres au produit.', ar: 'دخلي منتج واحد فكل مرة باش تراقبي التحمل. بدئي بتواتر قليل وتبعي تعليمات المنتج.' },
    mistakes: { fr: ['Associer plusieurs exfoliants', 'Augmenter la fréquence trop vite', 'Ignorer brûlures et démangeaisons'], ar: ['خلط بزاف ديال المقشرات', 'زيادة الاستعمال بسرعة', 'تجاهل الحريق والحكة'] },
    gestures: { fr: ['Faire un test localisé', 'Photographier seulement pour son suivi privé', 'Conserver le reste de la routine stable'], ar: ['ديري اختبار فبلاصة صغيرة', 'صوري غير للمتابعة الشخصية', 'خلي باقي الروتين ثابت'] },
    watch: { fr: 'Une légère adaptation n’est pas la même chose qu’une brûlure ou un gonflement.', ar: 'التأقلم الخفيف ماشي هو الحريق أو الانتفاخ.' },
    professional: { fr: 'Stoppez immédiatement en cas de gonflement, plaques ou douleur forte.', ar: 'حبسي فوراً إلا كان انتفاخ، بقع قوية أو ألم.' }
  },
  {
    slug: 'taches-patience',
    category: 'Taches',
    time: 6,
    title: { fr: 'Taches : pourquoi la patience et le SPF vont ensemble', ar: 'البقع: علاش الصبر والحماية من الشمس مرتبطين' },
    summary: { fr: 'Une routine cohérente se juge sur la durée, pas en quelques jours.', ar: 'الروتين المنتظم كيتقاس مع الوقت، ماشي فشي أيام.' },
    introduction: { fr: 'Les marques visibles n’apparaissent pas toutes pour la même raison. Leur évolution dépend du contexte, de la peau et de l’exposition.', ar: 'الآثار الظاهرة ما كتجيش كلها من نفس السبب. التطور ديالها كيعتمد على السياق والبشرة والتعرض.' },
    explanation: { fr: 'Les routines douces, régulières et protégées du soleil sont plus simples à évaluer que les changements fréquents et agressifs.', ar: 'الروتين اللطيف والمنتظم مع الحماية من الشمس أسهل فالتقييم من التبديل والحك بزاف.' },
    mistakes: { fr: ['Chercher un résultat immédiat', 'Frotter ou exfolier trop souvent', 'Négliger la protection solaire'], ar: ['انتظار نتيجة فورية', 'الحك أو التقشير بزاف', 'نسيان الحماية من الشمس'] },
    gestures: { fr: ['Prendre une photo mensuelle dans la même lumière', 'Éviter de toucher les boutons', 'Garder un nombre limité de produits'], ar: ['صوري مرة فالشهر بنفس الضوء', 'ما تلمسيش الحبوب', 'خلي عدد المنتجات محدود'] },
    watch: { fr: 'Surveillez toute tache qui change rapidement de forme, couleur ou relief.', ar: 'راقبي أي بقعة كتبدل بسرعة فالشكل أو اللون أو البروز.' },
    professional: { fr: 'Une tache inhabituelle, douloureuse ou changeante doit être examinée par un dermatologue.', ar: 'أي بقعة غريبة، مؤلمة أو كتبدل خاصها طبيب الجلد.' }
  },
  {
    slug: 'peau-seche-ou-deshydratee',
    category: 'Hydratation',
    time: 5,
    title: { fr: 'Peau sèche ou déshydratée : observer avant de choisir', ar: 'بشرة جافة ولا ناقصها الماء؟ راقبي قبل الاختيار' },
    summary: { fr: 'Deux réalités proches, mais pas toujours les mêmes besoins.', ar: 'جوج حالات متشابهة ولكن الاحتياجات ماشي ديما نفسها.' },
    introduction: { fr: 'La sécheresse décrit souvent un manque de lipides, tandis que la déshydratation correspond à un manque d’eau temporaire. Les deux peuvent coexister.', ar: 'الجفاف غالباً مرتبط بنقص الدهون الطبيعية، ونقص الترطيب مرتبط بالماء بشكل مؤقت. بجوج يقدرو يكونو مع بعض.' },
    explanation: { fr: 'La sensation, la texture et le moment où apparaît l’inconfort donnent des indices. L’objectif n’est pas de poser un diagnostic, mais de choisir une routine plus confortable.', ar: 'الإحساس والقوام والوقت اللي كيبان فيه عدم الراحة كيعطيو مؤشرات. الهدف ماشي تشخيص، ولكن روتين مريح أكثر.' },
    mistakes: { fr: ['Confondre brillance et bonne hydratation', 'Exfolier les petites peaux chaque jour', 'Changer de crème tous les trois jours'], ar: ['نخلطو اللمعان مع الترطيب', 'نقشرو القشور كل نهار', 'نبدلو الكريم كل ثلاثة أيام'] },
    gestures: { fr: ['Observer matin et soir', 'Ajouter une crème simple avant de multiplier les sérums', 'Limiter l’eau très chaude'], ar: ['راقبي صباح وليل', 'زيدي كريم بسيط قبل بزاف ديال السيرومات', 'نقصي الماء السخون'] },
    watch: { fr: 'Notez les zones, la durée et les produits associés à l’inconfort.', ar: 'كتبي المناطق والمدة والمنتجات المرتبطة بعدم الراحة.' },
    professional: { fr: 'Des fissures, démangeaisons importantes ou plaques persistantes demandent un avis professionnel.', ar: 'التشققات، الحكة القوية أو البقع المستمرة خاصها رأي مختص.' }
  },
  {
    slug: 'routine-minimaliste',
    category: 'Routine',
    time: 5,
    title: { fr: 'La routine minimale qui aide vraiment à observer sa peau', ar: 'روتين بسيط كيساعدك تفهمي بشرتك' },
    summary: { fr: 'Nettoyer, hydrater, protéger : une base lisible avant les options.', ar: 'تنظيف، ترطيب، حماية: أساس واضح قبل الإضافات.' },
    introduction: { fr: 'Une routine courte n’est pas une routine incomplète. Elle crée une base stable pour comprendre les réactions de la peau.', ar: 'الروتين القصير ماشي ناقص. كيعطي أساس ثابت باش نفهمو ردود فعل البشرة.' },
    explanation: { fr: 'Un nettoyant confortable, un hydratant adapté et une protection solaire le matin suffisent souvent pour établir une base. Les actifs viennent ensuite selon le besoin.', ar: 'منظف مريح، مرطب مناسب وواقي شمسي فالصباح غالباً كافيين كأساس. المواد الفعالة كتجي من بعد حسب الحاجة.' },
    mistakes: { fr: ['Associer trop de promesses', 'Suivre chaque tendance', 'Abandonner après quelques jours'], ar: ['نجمعو بزاف ديال الوعود', 'نتبعو كل ترند', 'نحبسو بعد أيام قليلة'] },
    gestures: { fr: ['Écrire sa routine sur une seule ligne', 'Fixer un objectif principal', 'Évaluer le confort avant l’apparence'], ar: ['كتبي الروتين فسطر واحد', 'حددي هدف رئيسي', 'قيمي الراحة قبل الشكل'] },
    watch: { fr: 'Une routine simple doit rester confortable ; simple ne veut pas dire supporter une irritation.', ar: 'الروتين البسيط خاصو يبقى مريح؛ البساطة ماشي تحمل التهيج.' },
    professional: { fr: 'Un problème sévère, inhabituel ou persistant ne doit pas être géré uniquement par des conseils en ligne.', ar: 'أي مشكل قوي، غريب أو مستمر ما خاصوش يبقى غير مع نصائح الإنترنت.' }
  }
]

export const quickTips = articles.slice(0, 8).map((article, index) => ({
  id: index + 1,
  article,
  symbol: ['01', 'SPF', '→', 'H₂O', '+1', '◌', '≈', '03'][index]
}))
