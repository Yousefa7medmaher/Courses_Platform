import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

/**
 * Configure Passport to use Google OAuth 2.0 Strategy
 * This allows users to authenticate using their Google account.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,             // ⬅️ From .env: Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,     // ⬅️ From .env: Google Client Secret
      callbackURL: process.env.GOOGLE_CALLBACK_URL,       // ⬅️ From .env: Redirect after login
    },
    /**
     * Google OAuth Verify Callback
     * @param {string} accessToken - Token to access Google APIs (optional here)
     * @param {string} refreshToken - Token to refresh accessToken (optional here)
     * @param {Object} profile - User profile from Google
     * @param {Function} done - Callback to return the result
     */
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ هنا ممكن تحفظ بيانات المستخدم في قاعدة البيانات
        console.log('✅ Google profile received:', profile);

        // مثال: ممكن ترجع فقط ID أو البريد
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          photo: profile.photos?.[0]?.value,
        };

        // ⬅️ ارجع بالمستخدم للتخزين في الجلسة
        return done(null, user);
      } catch (error) {
        console.error('❌ Error during Google OAuth callback:', error);
        return done(error, null);
      }
    }
  )
);

/**
 * Save user info to session
 * @param {Object} user - The authenticated user object
 * @param {Function} done - Callback to finish serialization
 */
passport.serializeUser((user, done) => {
  done(null, user); // ⬅️ ممكن تختار فقط user.id لحفظه في session
});

/**
 * Retrieve user info from session
 * @param {Object} obj - The user object stored in session
 * @param {Function} done - Callback to finish deserialization
 */
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;