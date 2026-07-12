# Watan Portfolio — Simple Admin Login Edition

ئەم وەشانە **پێویستی بە Authentication → Users و admin_users نییە**. چوونەژوورەوەی ئەدمین بە `ADMIN_EMAIL` و `ADMIN_PASSWORD` ـی Vercel کار دەکات، و کارەکانی داشبۆرد لە سێرڤەرەوە بە `SUPABASE_SERVICE_ROLE_KEY` جێبەجێ دەبن.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_EMAIL=w.awakalaey@gmail.com
ADMIN_PASSWORD=CHOOSE_A_STRONG_PASSWORD
```

- `SUPABASE_SERVICE_ROLE_KEY` لە **Supabase → Project Settings → API Keys** وەربگرە.
- ئەم key ـە هەرگیز لە GitHub یان وێنەدا بڵاو مەکەرەوە؛ تەنها لە Vercel Environment Variables دایبنێ.
- دوای زیادکردنی variable ـەکان، Vercel ـەکە Redeploy بکە.
- داشبۆرد: `/admin/login`
- ئیمەیڵ: نرخی `ADMIN_EMAIL`
- پاسوۆرد: نرخی `ADMIN_PASSWORD`

---

# Watan Portfolio — Vercel + Supabase + Admin Dashboard

ئەم پڕۆژەیە بە **Next.js، Bootstrap، JavaScript، CSS و Supabase** دروستکراوە و بۆ بڵاوکردنەوە لە **Vercel** ئامادەیە.

## تایبەتمەندییەکان

- پۆرتفۆلیۆی کوردی و ئینگلیزی
- فۆنتی کوردی **Rabar**
- ڕیسپۆنسیڤ بۆ مۆبایل، تابلێت و کۆمپیوتەر
- جوڵە، Dark/Light Mode و دیزاینی مۆدێرن
- فۆڕمی پەیوەندی کە نامەکان لە Supabase تۆمار دەکات
- Admin Dashboard بە Login
- بینین، خوێندراوەکردن و سڕینەوەی نامەکان
- زیادکردن، دەستکاری و سڕینەوەی پڕۆژەکان
- بارکردنی وێنەی پڕۆژەکان بۆ Supabase Storage
- Supabase Row Level Security (RLS)

## 1) دروستکردنی Supabase

1. لە Supabase پڕۆژەیەکی نوێ دروست بکە.
2. بچۆ بۆ **SQL Editor**.
3. ناوەڕۆکی `supabase/schema.sql` کۆپی بکە و Run بکە.
4. بچۆ بۆ **Authentication → Users → Add user** و ئیمەیڵ و پاسوۆردی ئەدمین دروست بکە.
5. دووبارە بچۆ بۆ SQL Editor و ئەمە Run بکە؛ ئیمەیڵەکە بە ئیمەیڵی خۆت بگۆڕە:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR_EMAIL@example.com'
on conflict (user_id) do nothing;
```

## 2) دانانی Environment Variables

لە Supabase بچۆ بۆ **Project Settings → API** و ئەمانە وەربگرە:

- Project URL
- Publishable key

`.env.example` کۆپی بکە بە ناوی `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

> هیچ Service Role Key ـێک لەم پڕۆژەیەدا پێویست نییە. دەسەڵاتەکان بە Supabase Auth و RLS پارێزراون.

## 3) Run لە کۆمپیوتەر

```bash
npm install
npm run dev
```

پاشان:

- Portfolio: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`

## 4) بڵاوکردنەوە لە GitHub و Vercel

1. پڕۆژەکە بخەرە GitHub.
2. لە Vercel، **Add New Project** بکە و Repository ـەکە Import بکە.
3. لە **Settings → Environment Variables** ئەم دوو Variable ـە زیاد بکە:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy بکە.
5. ئەگەر Variable ـەکانت دوای Deploy گۆڕی، Redeploy بکە.

## چۆن نامەکان دەبینیت؟

بچۆ بۆ:

```text
https://YOUR-PROJECT.vercel.app/admin/login
```

بە ئیمەیڵ و پاسوۆردی Supabase Auth بچۆ ژوورەوە. لە داشبۆردەکە دەتوانیت:

- نامەکان ببینیت
- بە خوێندراوە/نەخوێندراوە نیشانیان بکەیت
- بە ئیمەیڵ وەڵام بدەیتەوە
- نامە بسڕیتەوە

## چۆن وێنەی پڕۆژەکان زیاد بکەیت؟

لە Admin Dashboard بچۆ بۆ **پڕۆژەکان → پڕۆژەی نوێ**. وێنەی JPG، PNG یان WebP هەڵبژێرە. قەبارەکە نابێت لە 5MB زیاتر بێت. وێنەکە لە bucket ـی `project-images` لە Supabase Storage پارێزراو دەبێت.

## شوێنی دەستکاریی ناو و دەقەکان

- ناو، ئیمەیڵ، شوێن، دەقە کوردی و ئینگلیزییەکان: `lib/site-content.js`
- وێنەی سەرەکی: `public/images/profile.png`
- فۆنتی Rabar: `public/fonts/Rabar_021.ttf`
- ڕەنگ و باکگراوند و دیزاین: `app/globals.css`
- خشتە و RLS: `supabase/schema.sql`

## پاراستن

- Admin signup لە وێبسایت نییە؛ تەنها خۆت لە Supabase Dashboard ئەدمین دروست دەکەیت.
- Public user تەنها دەتوانێت نامە بنێرێت و پڕۆژە بڵاوکراوەکان بخوێنێتەوە.
- Public user ناتوانێت نامەکان ببینێت، بگۆڕێت یان بسڕێتەوە.
