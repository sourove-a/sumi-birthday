# Sumi's Birthday 💚

A birthday website made for Sumi — React + TypeScript + Vite.
Countdown, 3D photo orbit, BTS-style photocards, a real candle-and-cake scene (blow into the mic!),
wishes wall, favourite lines on notebook pages, and a letter in a sealed envelope.

## Chalano (nijer computer-e)

```bash
npm install
npm run dev
```
Browser-e `http://localhost:5173` kholo.

## Build

```bash
npm run build
```
`dist/` folder toiri hoy. Eta-i website (Hostinger-e eta-r bhitorer sob kichu jay).

## GitHub → Hostinger (auto deploy)

`main` branch-e push korlei `.github/workflows/deploy.yml` site build kore.
Hostinger-e nijer theke upload korte chaile GitHub repo-te ei **Secrets** dao
(Settings → Secrets and variables → Actions → New repository secret):

| Secret | Kothay pabe |
|---|---|
| `FTP_SERVER` | hPanel → Files → **FTP Accounts** (jemon `ftp.yourdomain.com`) |
| `FTP_USERNAME` | oi page-e |
| `FTP_PASSWORD` | oi page-e (na jana thakle "Change password") |
| `FTP_DIR` | optional, default `./public_html/` |

Secrets na dile shudhu build hobe, upload hobe na. Tokhon haate upload:
hPanel → File Manager → `public_html` → `dist/`-er **bhitorer** sob file (`.htaccess` shoho) upload.

## Content bodlano

- **Shobar jonno (pakapakki):** `src/data.ts` → `DEF` (naam, tarikh, gaan, chhobi, lekha, passcode)। Tarpor push / build.
- **Chhobi:** `public/assets/`-e rakho, `src/data.ts`-e path dao (jemon `assets/sumi-1.jpeg`)।
- **Website-er Admin panel** (upore dane ⚙, passcode `src/data.ts`-er `passcode`) theke-o sob edit kora jay,
  kintu seta shudhu oi browser-e save hoy. Onno jaygay nite **Backup → Export / Import**.
- **"আমাদের গল্প":** ekhon khali, tai Home-e lukano. Admin → আমাদের গল্প, ba `src/data.ts`-er `story`-te likhle dekhabe.

## Shobar wish ek jaygay (Supabase, optional)

Na korle-o site cholbe; tokhon wish shudhu je likhe tar browser-e thake.

1. supabase.com e free project khulo.
2. **SQL Editor**-e eta **Run** koro:

```sql
create table public.wishes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 40),
  text text not null check (char_length(text) between 1 and 600),
  emoji text not null default '💖' check (char_length(emoji) <= 16),
  color smallint not null default 0 check (color between 0 and 3)
);
alter table public.wishes enable row level security;
create policy "anyone can read wishes" on public.wishes for select to anon using (true);
create policy "anyone can add a wish" on public.wishes for insert to anon with check (true);
```

3. **Project Settings → API** theke `Project URL` ar `anon public` key nao.
4. Local: `.env.example` copy kore `.env` banao, dui-ta value boshao.
   GitHub deploy: same dui-ta `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` Secrets-e dao.

Kharap wish muchhte: Supabase → Table editor → `wishes` → row delete.

## Folder

```
src/
  main.tsx, App.tsx     app shuru, page change, music, effects
  data.ts               shob lekha + default settings  ← content ekhane
  lib/                  config, dates, canvas effects, music, mic blow, wishes API
  components/           gate, loader, top bar, dock, photocards, quiz ...
  pages/                Home, Cake, Gallery, Wishes, Letter, Admin
  styles/style.css      shob design
public/
  assets/               chhobi
  .htaccess             Hostinger: https, cache, compression
.github/workflows/      GitHub → build → Hostinger
```
