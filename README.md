# FinTrack — অফিসিয়াল ওয়েবসাইট

**FinTrack** Android অ্যাপের (`com.fintrack.app`) অফিসিয়াল স্ট্যাটিক ওয়েবসাইট।  
বিদ্যমান FinTrack Firebase project-এর Firebase Hosting-এ host করা আছে।

---

## ফাইল কাঠামো

```
fintrack-site/
├── index.html          # মূল ল্যান্ডিং পেজ (হোমপেজ)
├── privacy.html        # Privacy Policy
├── terms.html          # Terms & Conditions
├── support.html        # Support + অ্যাকাউন্ট ডিলিট
├── css/
│   └── style.css       # সব স্টাইল (ডিজাইন সিস্টেম, লেআউট, কম্পোনেন্ট)
├── js/
│   └── main.js         # মোবাইল নেভ টগল, স্ক্রল রিভিল, কপি-টু-ক্লিপবোর্ড
├── assets/
│   └── favicon.png     # অ্যাপ আইকন (ফেভিকন + নেভ লোগো হিসেবে ব্যবহৃত)
└── README.md           # এই ফাইল
```

---

## পেজসমূহের বিবরণ

### `index.html` — ল্যান্ডিং পেজ

- **Hero section:** "Every account. Every habit. One app." — অ্যানিমেটেড bloom ইলাস্ট্রেশন সহ
- **Accounts flow:** মাল্টি-অ্যাকাউন্ট → সিঙ্গেল ড্যাশবোর্ড ভিজ্যুয়াল (Cash, Bank, bKash)
- **How it works:** ৩-step explainer (অ্যাকাউন্ট যোগ → লগ → Insights)
- **Features grid:** ১৬টি ফিচার ৪টি গ্রুপে সাজানো:
  - *Track everything:* Multiple accounts, Categories, Receipt scanner, Recurring bills
  - *Plan & stay on top:* Budgets, Debt & credit tracker, Calendar, To-do lists
  - *Understand the bigger picture:* AI insights, Reports (PDF & Excel), Cloud backup, Reminders
  - *Stay motivated:* Gamification & levels, Rewards, Community, Notifications
- **Trust band:** ৫টি privacy/security trust point (AI insight আর্কিটেকচারের ব্যাখ্যা সহ)
- **Closing CTA:** "Built for how Bangladesh actually saves"
- **Footer:** Product / Legal / Help কলাম সব লিংক সহ

---

### `privacy.html` — Privacy Policy

**কার্যকর তারিখ:** ০১ অক্টোবর, ২০২৬

| section | বিষয়বস্তু |
|---|---|
| ভূমিকা | সম্মতির ভিত্তি, GDPR/CCPA/PDPO ২০২৫ উল্লেখ |
| তথ্য সংগ্রহ | অ্যাকাউন্ট, লেনদেন, রিসিট, ভয়েস, বায়োমেট্রিক, AI সারাংশ, কমিউনিটি, গেমিফিকেশন |
| **AI Insights কীভাবে কাজ করে** | ৪-ধাপে বিস্তারিত ব্যাখ্যা (নিচে দেখুন) |
| পারমিশন তালিকা | CAMERA, READ\_MEDIA, RECORD\_AUDIO, USE\_BIOMETRIC, POST\_NOTIFICATIONS, SCHEDULE\_EXACT\_ALARM, RECEIVE\_BOOT\_COMPLETED, INTERNET, WAKE\_LOCK, VIBRATE, FOREGROUND\_SERVICE |
| স্টোরেজ ও নিরাপত্তা | Local-first, Firestore isolation, এনক্রিপ্টেড secure storage |
| অ্যাকাউন্ট ডিলিট | ২টি উপায়: in-app + ওয়েব ইমেইল রিকোয়েস্ট |
| থার্ড-পার্টি সার্ভিস | Firebase, Google Sign-In, AdMob, Play Billing |
| আন্তর্জাতিক ট্রান্সফার | Firebase/Google Cloud infrastructure |
| Retention policy | অ্যাকাউন্ট active থাকা পর্যন্ত **indefinitely**, ডিলিটে স্থায়ীভাবে মুছে যাবে |
| আঞ্চলিক বিধান | EU/UK (GDPR), California (CCPA/CPRA), Bangladesh (PDPO 2025), অন্যান্য দেশ |
| যোগাযোগ | support.fintrack.app@gmail.com |

**AI Insights-এর ৪-ধাপ প্রক্রিয়া:**
1. মাসে একবার শুধু aggregated summary তৈরি হয় (আয়, ব্যয়, সঞ্চয়, ক্যাটাগরি %) — raw transaction নয়
2. সেই summary Firestore-এ save হয়
3. ডেভেলপারের নিজের local LLM প্রক্রিয়া করে — OpenAI/Gemini/Anthropic কোনো third-party AI নয়
4. Generated insight Firestore-এ save হয় → user-এর নিজের data-র সাথে তুলনা করে app-এ দেখানো হয়

---

### `terms.html` — Terms & Conditions

**কার্যকর তারিখ:** ০১ অক্টোবর, ২০২৬

| section | বিষয়বস্তু |
|---|---|
| সেবার বিবরণ | Personal finance organizer, সব ফিচারের সংক্ষিপ্ত বর্ণনা |
| যোগ্যতা | ১৮ বছর বা তার বেশি |
| আন্তর্জাতিক ব্যবহার | সব ফিচার সর্বত্র কাজ করে; bKash/Nagad/Rocket manual wallet type হিসেবে |
| গ্রহণযোগ্য ব্যবহার | কোনো জালিয়াতি নয়, reverse engineering নয়, Community conduct rules |
| **আর্থিক দায়মুক্তি** | Financial advisor নয়; AI insight = শুধু informational, monthly aggregated summary থেকে তৈরি |
| **Community content** | User মালিকানা রাখে, সীমিত display license, post-এর দায়িত্ব user-এর |
| Premium ও billing | Google Play Billing, auto-renewal, Google refund policy |
| শাসনকারী আইন | বাংলাদেশ (mandatory local consumer rights carve-out সহ) |
| যোগাযোগ | support.fintrack.app@gmail.com |

---

### `support.html` — সাপোর্ট পেজ

| section | বিষয়বস্তু |
|---|---|
| যোগাযোগ | Copy-to-clipboard email button → support.fintrack.app@gmail.com |
| **অ্যাকাউন্ট ও ডেটা ডিলিট** | Play Store-এর বাধ্যতামূলক requirement — ২টি উপায় |
| FAQ accordion | ১০টি প্রশ্ন-উত্তর |
| পারমিশন ব্যাখ্যা | Privacy Policy-র পারমিশন টেবিলের লিংক |
| সমস্যা রিপোর্ট | bug/feedback পাঠানোর নির্দেশনা |

**অ্যাকাউন্ট ডিলিটের ২টি উপায়:**
- **Option 1 (in-app):** FinTrack → Settings → Account → Delete Account → Confirm
- **Option 2 (ওয়েব থেকে):** support.fintrack.app@gmail.com-এ "Delete my FinTrack account" subject-এ ইমেইল — ৭ business দিনের মধ্যে সম্পন্ন

**FAQ তালিকা:**
1. Community-তে কি অন্য user আমার আর্থিক তথ্য দেখতে পারে?
2. নতুন অ্যাকাউন্ট (cash, bank, mobile wallet) কীভাবে যোগ করব?
3. AI Insights কতটা accurate?
4. Insights-এর জন্য কি আমার data কোনো AI কোম্পানিতে যায়?
5. Premium subscription কীভাবে cancel করব?
6. App delete করলে কি account-ও চলে যায়?
7. PDF বা Excel-এ report export করা যাবে?
8. আমার data export করা যাবে?
9. বাংলাদেশের বাইরে থাকলে FinTrack কাজ করবে কি?
10. EU/UK বা California-তে থাকলে কি extra rights আছে?

---

## ডিজাইন সিস্টেম

| টোকেন | মান |
|---|---|
| ব্যাকগ্রাউন্ড (dark) | `#0B1530` |
| ব্যাকগ্রাউন্ড ২ | `#0E1B3D` |
| Indigo card | `#142657` |
| Cyan accent | `#00B8D9` |
| Sky blue | `#4FC3F7` |
| Gold accent | `#F2B134` |
| Paper (light sections) | `#F7F5EF` |
| Font — display | Sora |
| Font — body | Inter |
| Font — mono | JetBrains Mono |

সব font Google Fonts থেকে লোড হয়। সব SVG icon `index.html`-এ inline sprite হিসেবে define করা এবং `<use href="#ic-...">` দিয়ে reference করা হয়।

---

## Firebase Hosting — Deploy গাইড

### পূর্বশর্ত
- Node.js ইনস্টল করা থাকতে হবে ([nodejs.org](https://nodejs.org) → LTS version)
- Firebase CLI ইনস্টল করা থাকতে হবে
- বিদ্যমান FinTrack Firebase project থাকতে হবে (নতুন project লাগবে না)

---

### ধাপ ১ — Firebase CLI ইনস্টল করুন

```bash
npm install -g firebase-tools
```

ইনস্টল সফল হয়েছে কিনা যাচাই করুন:
```bash
firebase --version
```

---

### ধাপ ২ — Firebase-এ login করুন

```bash
firebase login
```

Browser খুলবে → FinTrack Firebase project যে Google account-এ আছে সেটা দিয়ে login করুন।

---

### ধাপ ৩ — site folder-এ যান

```bash
cd path/to/fintrack-site
```

Windows-এ উদাহরণ:
```bash
cd C:\Users\YourName\Downloads\fintrack-site
```

---

### ধাপ ৪ — Firebase Hosting initialize করুন

```bash
firebase init hosting
```

নিচের প্রশ্নগুলোর উত্তর এভাবে দিন:

| প্রশ্ন | উত্তর |
|---|---|
| Which Firebase project? | Use an existing project → FinTrack project সিলেক্ট করুন |
| Public directory? | `.` (শুধু একটা dot লিখুন, Enter দিন) |
| Configure as single-page app? | `N` |
| Set up GitHub auto-deploy? | `N` |
| File index.html already exists. Overwrite? | `N` ← গুরুত্বপূর্ণ |

এই command দুটো নতুন config ফাইল তৈরি করবে:
- `.firebaserc` — Firebase project-এর সাথে link
- `firebase.json` — hosting configuration

---

### ধাপ ৫ — Deploy করুন

```bash
firebase deploy --only hosting
```
| for deploy to fintrack-lab.web.app
```bash
firebase deploy --only hosting:fintrack-lab
```

সফল হলে দেখাবে:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR-PROJECT-ID/overview
Hosting URL: https://YOUR-PROJECT-ID.web.app
```

---

### ধাপ ৬ — সব পেজ যাচাই করুন

Browser-এ একে একে খুলুন এবং সঠিকভাবে দেখাচ্ছে কিনা নিশ্চিত করুন:

```
https://YOUR-PROJECT-ID.web.app/
https://YOUR-PROJECT-ID.web.app/privacy.html
https://YOUR-PROJECT-ID.web.app/terms.html
https://YOUR-PROJECT-ID.web.app/support.html
```

---

### ধাপ ৭ — Google OAuth Consent Screen-এ URL যোগ করুন

Google Cloud Console → APIs & Services → OAuth consent screen:

| ফিল্ড | URL |
|---|---|
| Privacy Policy URL | `https://YOUR-PROJECT-ID.web.app/privacy.html` |
| Terms of Service URL | `https://YOUR-PROJECT-ID.web.app/terms.html` |

---

### পরে site আপডেট করতে চাইলে

যেকোনো পেজ edit করার পর `fintrack-site/` folder-এর ভেতর থেকে শুধু এই command:

```bash
firebase deploy --only hosting
```

এটুকুই — প্রায় ১ মিনিটের মধ্যে live হয়ে যাবে।

---

### Custom Domain (ভবিষ্যতে, ঐচ্ছিক)

`https://fintrackapp.com` এর মতো clean URL চাইলে:

1. Domain কিনুন (Namecheap, Google Domains ইত্যাদি — বছরে $10-15)
2. Firebase Console → Hosting → **Add custom domain**
3. দেখানো DNS verification steps অনুসরণ করুন (TXT record, তারপর A record)
4. Firebase নিজেই বিনামূল্যে SSL দেবে

---

## যোগাযোগ ও সাপোর্ট

| চ্যানেল | বিবরণ |
|---|---|
| সাপোর্ট ইমেইল | support.fintrack.app@gmail.com |
| Telegram bot | https://t.me/FinTrackSupportBot |
| WhatsApp | শীঘ্রই আসছে |

---

## গুরুত্বপূর্ণ নোট

- **Firebase project ID পরিবর্তন করা যায় না** — একবার set হলে চিরস্থায়ী। Clean URL চাইলে Custom domain ব্যবহার করুন।
- **নতুন Firebase project লাগবে না** — Firebase Hosting বিদ্যমান FinTrack project-এর ভেতরেই চলে। এই সাইজের static site-এর জন্য কোনো অতিরিক্ত খরচ নেই।
- **AI Insights privacy:** শুধু monthly aggregated summary (আয়, ব্যয়, সঞ্চয়, ক্যাটাগরি %) store ও process হয় — কখনো raw transaction নয়। LLM ডেভেলপারের নিজের local machine-এ চলে, কোনো third-party AI service নয়।
- **Data retention:** অ্যাকাউন্ট active থাকা পর্যন্ত সব user data indefinitely রাখা হয়। অ্যাকাউন্ট ডিলিটের verified request পাওয়ার ৭ business দিনের মধ্যে স্থায়ীভাবে মুছে যাবে।
- **Legal pages কার্যকর তারিখ:** ০১ অক্টোবর, ২০২৬
- **App package ID:** `com.fintrack.app`
