## MiniGames

This is a website for minigames such as match 3, find difference and etc.

### Firebase setup

1. Create a Firebase project in the Firebase Console.
2. Enable the Email/Password provider in Authentication > Sign-in method.
3. Add a web app to the project and copy the values from the Firebase config.
4. Create a local `.env` file (or copy `.env.example`) with:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_APP_ID`

The frontend initializes Firebase using those values in `src/features/auth/api/auth.api.ts`.

### App Session Key

The authenticated app session is stored under `minigames:app-session` in `localStorage`.
This key contains a JSON object with the authenticated profile data used by the client UI.
