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
          pack: 'روتين ECOLYN', cta: 'نستافد من النصائح'
        },
        hero: {
          eyebrow: 'فضاء ديالك لفهم البشرة • المغرب',
          titleA: 'بشرتك كتعطيك إشارات…',
          titleB: 'تعلمي كيفاش تفهميها أكثر',
          copy: 'شرحي لينا المشكل اللي كتعاني منو بشرة وجهك، وخبيرتنا في روتين العناية بالبشرة غادي تقدم ليك نصائح مجانية مناسبة للحالة ديالك.',
          badge: 'نصائح مجانية • بدون إجبار على الشراء',
          primary: 'نشرح مشكل البشرة ديالي',
          secondary: 'نشوف النصائح',
          scroll: 'تبعي المسار'
        },
        common: {
          read: 'نقرا أكثر', related: 'نشوف النصائح المرتبطة',
          describe: 'نشرح حالتي', close: 'نسد', next: 'التالي',
          previous: 'السابق', minutes: 'دقائق للقراءة', illustration: 'صورة توضيحية'
        },
        form: {
          eyebrow: 'طلبك بكل ثقة',
          title: 'حكي لينا على بشرتك',
          copy: 'صفحة وحدة قصيرة. التفاصيل نكملوها من بعد فالواتساب.',
          next: 'نكمل', back: 'نرجع', submit: 'نرسل طلب النصائح',
          successTitle: 'الطلب ديالك واجد.',
          successCopy: 'شكراً. أكدي الإرسال عبر واتساب باش يوصلنا الطلب ديالك.',
          whatsapp: 'نرسل الطلب عبر واتساب',
          group: 'ننضم لمجموعة واتساب'
        }
      }
    }
  },
  lng: saved || browserLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
