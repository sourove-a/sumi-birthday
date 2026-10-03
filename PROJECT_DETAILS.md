# 🎉 Sumi's Birthday Website — Project Documentation & Guide

> **Live Website:** [https://sumi.sourove.com](https://sumi.sourove.com)  
> **GitHub Repository:** [https://github.com/sourove-a/sumi-birthday](https://github.com/sourove-a/sumi-birthday)  
> **Deployment Platform:** Vercel (Automatic Deployment on Git Push)

---

## ⚡ ১. অটো-পুশ এবং অটো-ডিপ্লয় সিস্টেম (Active)

তুমি কোনো ফাইলে এডিট করলেই যেন স্বয়ংক্রিয়ভাবে গিটহাবে পুশ হয়ে **Vercel**-এ লাইভ আপডেট হয়ে যায়, তার জন্য একটি সার্বক্ষণিক **Watcher System** চালু করা হয়েছে।

### এটি যেভাবে কাজ করে:
1. যখনই তুমি `website/src/` বা `website/public/` ফোল্ডারে কোনো ফাইল এডিট ও সেভ করবে,
2. সিস্টেমটি ৪ সেকেন্ড অপেক্ষা করে (যাতে টাইপিং শেষ হয়) স্বয়ংক্রিয়ভাবে:
   * `git add .` চালাবে।
   * টাইমস্ট্যাম্প সহ অটো-কমিট তৈরি করবে: `Auto update (তারিখ ও সময়)`
   * গিটহাবে পুশ করবে: `git push origin main`
3. গিটহাবে পুশ হওয়া মাত্রই **Vercel** তা ডিটেক্ট করে ১৫-২০ সেকেন্ডের মধ্যে **[sumi.sourove.com](https://sumi.sourove.com)** এ নতুন পরিবর্তন লাইভ করে দেবে!

### ব্যাকগ্রাউন্ডে ওয়াচার চালু রাখা:
* বর্তমানে এটি ব্যাকগ্রাউন্ডে সচল আছে।
* ভবিষ্যতে কখনো ম্যানুয়ালি টার্মিনালে চালু করতে চাইলে `website` ফোল্ডারে গিয়ে রান করো:
  ```bash
  npm run watch-deploy
  ```
  *(অথবা: `node auto-deploy.js`)*

---

## 🗄️ ২. Supabase লাইভ উইশ / চিরকুট কনফিগারেশন

ভিজিটররা সুমির জন্য যে উইশ লিখবে, তা রিয়েল-টাইমে ডাটাবেজে সংরক্ষণ হওয়ার জন্য Supabase ইন্টিগ্রেশন কনফিগার করা হয়েছে:

* **Supabase Project URL:** `https://nlgmoveieuuoxfbjclpn.supabase.co`
* **Publishable API Key:** `sb_publishable_H_YeG1SNdVbIeP-ulReFbg_8_t3D_Nl`
* **ডাটাবেজ টেবিল স্কিমা (SQL Editor-এ চালানো হয়েছে):**
  ```sql
  create table public.wishes (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    name text not null check (char_length(name) between 1 and 40),
    text text not null check (char_length(text) between 1 and 600),
    emoji text not null default '💖' check (char_length(emoji) <= 16),
    color int default 0
  );
  alter table public.wishes enable row level security;
  create policy "anyone can read wishes" on public.wishes for select to anon using (true);
  create policy "anyone can add a wish" on public.wishes for insert to anon with check (true);
  ```

---

## 📝 ৩. কন্টেন্ট এডিট করার নিয়ম

ওয়েবসাইটের সব টেক্সট, কবিতা, কুইজ এবং গান দুটি উপায়ে পরিবর্তন করা যায়:

### পদ্ধতি ক: কোড পরিবর্তন করে (স্থায়ী সবার জন্য)
* ফাইল: `src/data.ts`
* এখানে তুমি পাবে:
  * `date`: জন্মদিন `2026-10-07T00:00`
  * `passcode`: অ্যাডমিন পাসকোড `sumi07`
  * `heroSub`, `reasons`, `timeline`, `quotes`, `letter`
  * `story`: "আমাদের গল্প" টাইমলাইন (এখানে নতুন স্মৃতি যোগ করতে পারো)
  * `quiz`: সুমিকে নিয়ে মজার কুইজ প্রশ্ন ও উত্তর

### পদ্ধতি খ: ওয়েবসাইট থেকে সরাসরি (Admin Panel)
1. ওয়েবসাইটে ঢুকে ওপরে ডানে ⚙️ (গিয়ার আইকন)-এ চাপ দাও।
2. পাসকোড দাও: **`sumi07`**
3. সেখান থেকে লাইভ টেক্সট, ফটো ক্যাপশন, উইশ ও কুইজ এডিট করা যায়।
4. এডিট শেষে **Backup ➔ Export** করে ফাইল সেভ করে রাখা যায়।

---

## 🖼️ ৪. বিশেষ ইমেজ ও ব্যানার সমূহ

* **মূল ফটোগুলো:** `public/assets/sumi-1.jpeg` থেকে `sumi-9.jpeg`
* **রিয়েলিস্টিক বার্থডে ফটো:** `public/assets/sumi-real-birthday.jpeg`
* **অল-ইন-ওয়ান ট্রাভেল ব্যানার:** `public/assets/sumi-travel-banner-all-photos.png` (৯টি আসল ছবি ও টিকিট/স্ট্যাম্প দিয়ে তৈরি)
* **৮০-এর দশকের রেট্রো ফটো:** `public/assets/sumi-80s-retro.jpeg`

---

## 📱 ৫. লোকাল ডেভেলপমেন্ট কমান্ড

যদি কখনো নিজের কম্পিউটারে লোকাল ব্রাউজারে সাইট দেখতে চাও:
```bash
cd website
npm install
npm run dev
```
ব্রাউজারে খুলবে: `http://localhost:5173`
