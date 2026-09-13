# NFCcardo.ma — NFC Business Card SaaS

## 🌐 Live website

**[Open NFCcardo.ma](https://nfccardo-ma.vercel.app)**

Premium NFC business card MVP for the Moroccan market, built with Next.js App Router, TypeScript and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Demo profiles: `/card/yasmine` (active) and `/card/omar` (expired). Admin: `/admin/login`, using `admin@nfccardo.ma` / `demo2026`.

## Production integration

The project includes a Supabase-ready schema with Row Level Security, protected receipt storage, public profile assets, and a server-side order API.

1. Create a Supabase project.
2. Run `supabase/migrations/202609110001_initial_schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and add the project URL, anon key and server-only service-role key.
4. Never expose or commit the service-role key.

The connected project is configured through `.env.local`. Client registration, login, profile updates, active-card reads, analytics, receipt storage, orders and admin controls use Supabase directly. To bootstrap the first administrator, register and confirm their account, then run `supabase/promote-admin.sql` after replacing its placeholder with the administrator e-mail.

The displayed bank details are intentionally non-operational sample data.

## GitHub automation

Run `./setup.ps1` to install and verify the application locally. To publish, create an empty GitHub repository and run:

```powershell
./publish-github.ps1 -RepositoryUrl "https://github.com/YOUR_USERNAME/nfccardo-ma.git"
```

`.github/workflows/ci.yml` automatically runs `npm ci` and a production build on every push and pull request. Connect the repository in Vercel for automatic production deployments.
