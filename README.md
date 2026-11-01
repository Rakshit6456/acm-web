# ACM Student Chapter, IILM University Gurugram

Next.js 14 (App Router) + Tailwind CSS v4 + Firebase (Auth + Firestore).

## Run locally
    npm install
    cp .env.example .env.local     # then fill in the Firebase keys
    npm run dev                    # site: http://localhost:3000   admin: /admin

Without Firebase keys the public site still works using built-in default content.

## Firebase setup (one time)
1. Firebase Console > Add project (Analytics not needed).
2. Build > **Firestore Database** > Create database (production mode).
3. Build > **Authentication** > Get started > enable **Email/Password**.
4. Project settings > Your apps > **Web app (</>)** > copy the config into `.env.local`.
5. Publish security rules (they allow only the admin email to edit content, and visitors to *submit* applications):
       npm i -g firebase-tools && firebase login
       # put your project id in .firebaserc
       npm run deploy:rules
   (or paste `firestore.rules` into Firestore > Rules > Publish)
6. Create the admin login (password is passed on the command line, never stored in code):
       npm run create-admin -- rakshityadav006@gmail.com '<password>'
   Then in Authentication > Settings > User actions, untick "Enable create (sign up)" so nobody else can register.
7. Open `/admin`, sign in, and click **Import default content** on the dashboard.

## Admin portal (`/admin`)
Dashboard, Events, Team, Achievements, Applications (status workflow + CSV export), Messages, Settings.
Join-form submissions land in Firestore `applications`; contact-form messages in `messages`.
Public pages refresh from Firestore about every 30 seconds.

## Admins and roles
Owners add people under **Admins & roles** in the portal (roles: Owner, Editor, Viewer). The person gets an email to set a
password. This needs Email/Password **sign-up enabled** in Firebase Authentication (people without a role can do nothing).
The root owner is `NEXT_PUBLIC_ADMIN_EMAILS` + the email at the top of `firestore.rules`. Republish the rules after changing them.

## SEO
Set `NEXT_PUBLIC_SITE_URL` to the live URL. The site serves `/sitemap.xml`, `/robots.txt`, a social preview image,
per-event metadata and structured data (Organization and Event).

## Structure
- `app/(site)/`      public pages     - `app/admin/` admin portal
- `components/admin` admin UI         - `lib/seed.ts` default content
- `lib/content.ts`   Firestore reads with fallback
