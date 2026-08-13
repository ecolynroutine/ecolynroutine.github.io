import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const saved = localStorage.getItem('ecolyn-language')
const browserLanguage = navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'fr'

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      translation: {
        nav: {
          home: 'Accueil', advice: 'Conseils', cases: 'Cas pratiques',
          stories: 'Expériences', lives: 'Lives', ask: 'Demander des conseils',
          pack: 'Routine ECOLYN', cta: 'Recevoir mes conseils'
        },
        hero: {
          eyebrow: 'Votre espace peau • Maroc',
          titleA: 'Votre peau vous envoie des signes.',
          titleB: 'Apprenez à mieux les comprendre.',
          copy: 'Décrivez-nous les difficultés que vous rencontrez avec votre peau du visage. Notre experte en routines de soins vous enverra gratuitement des conseils adaptés à votre situation.',
          badge: 'Conseils gratuits • Sans obligation d’achat',
          primary: 'Décrire mon problème de peau',
          secondary: 'Explorer les conseils',
          scroll: 'Suivre le fil'
        },
        common: {
          read: 'Lire plus', related: 'Voir les conseils liés',
          describe: 'Décrire ma situation', close: 'Fermer', next: 'Suivant',
          previous: 'Précédent', minutes: 'min de lecture', illustration: 'Illustration éditoriale'
        },
        form: {
          eyebrow: 'Votre demande, en confiance',
          title: 'Parlez-nous de votre peau',
          copy: 'Une seule page courte. Les détails seront approfondis ensuite sur WhatsApp.',
          next: 'Continuer', back: 'Retour', submit: 'Envoyer ma demande de conseils',
          successTitle: 'Votre demande est prête.',
          successCopy: 'Merci. Confirmez simplement l’envoi sur WhatsApp pour nous transmettre votre demande.',
          whatsapp: 'Envoyer ma demande sur WhatsApp',
          group: 'Rejoindre le groupe WhatsApp'
        }
      }
    },
    ar: {
      translation: {
        nav: {
          home: 'الرئيسية', advice: 'النصائح', cases: 'حالات واقعية',
          stories: 'التجارب', lives: 'اللقاءات المباشرة', ask: 'طلب نصائح',
          pack: 'روتين ECOLYN', cta: 'استفيدي من النصائح'
        },
        hero: {
          eyebrow: 'مساحتك لفهم البشرة • المغرب',
          titleA: 'بشرتك ترسل لك إشارات…',
          titleB: 'تعلّمي كيف تفهمينها بشكل أفضل',
          copy: 'اشرحي لنا ما يزعجك في بشرة وجهك، وستقدم لك خبيرتنا في روتين العناية نصائح مجانية تناسب حالتك.',
          badge: 'نصائح مجانية • من دون إلزام بالشراء',
          primary: 'شرح مشكلة بشرتي',
          secondary: 'استكشاف النصائح',
          scroll: 'تابعي المسار'
        },
        common: {
          read: 'قراءة المزيد', related: 'عرض النصائح المرتبطة',
          describe: 'شرح حالتي', close: 'إغلاق', next: 'التالي',
          previous: 'السابق', minutes: 'دقائق للقراءة', illustration: 'صورة توضيحية'
        },
        form: {
          eyebrow: 'طلبك بكل ثقة',
          title: 'حدّثينا عن بشرتك',
          copy: 'نموذج قصير في صفحة واحدة، ويمكن متابعة التفاصيل لاحقاً عبر WhatsApp.',
          next: 'متابعة', back: 'رجوع', submit: 'إرسال طلب النصائح',
          successTitle: 'تم استلام طلبك بنجاح.',
          successCopy: 'يمكن لحنان الآن مراجعة المعلومات التي أرسلتِها والتواصل معك عبر WhatsApp.',
          whatsapp: 'فتح WhatsApp',
          group: 'الانضمام إلى مجموعة WhatsApp'
        }
      }
    }
  },
  lng: saved || browserLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
