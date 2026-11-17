// Privacy policy. Kept in plain language and in step with what the app actually does.
const UPDATED = '17 November 2026'
const ISSUES = 'https://github.com/Ga-lib/kana-mind/issues'

export default function Privacy() {
  return (
    <div className="page narrow prose">
      <h1>Privacy</h1>
      <p className="muted">Last updated {UPDATED}</p>
      <p>
        KanaMind is a free app for learning Japanese characters. It has no ads, no analytics and no trackers. This page explains
        what data it handles, where it goes and how you control it.
      </p>

      <h2>Without an account</h2>
      <p>
        Everything you do (memory levels, review schedule, notes, streak, points, sound setting) is stored only in your browser’s
        local storage on this device. Nothing about your learning is sent to us.
      </p>

      <h2>With an account</h2>
      <ul>
        <li>
          <b>Sign-in details.</b> Your email address and, if you choose, a name. If you sign in with Google, Google shares your
          name, email address and profile picture link with the app. Passwords are handled by Firebase Authentication; we never
          see them.
        </li>
        <li>
          <b>Your learning progress.</b> The same items as above are saved to your own record so you can continue on any device.
        </li>
        <li>
          <b>Where it’s stored.</b> Google Firebase (Authentication and Cloud Firestore), with the database in Mumbai, India
          (region asia-south1). Security rules allow only you to read, change or delete your record.
        </li>
      </ul>

      <h2>Other services the app uses</h2>
      <ul>
        <li><b>Hosting:</b> Vercel serves the website and keeps standard request logs (such as IP address and browser type).</li>
        <li>
          <b>Stroke data:</b> for a few characters (for example が, ぱ) stroke shapes are loaded from the jsDelivr and GitHub
          content networks, which see your IP address.
        </li>
        <li>
          <b>Audio:</b> pronunciation uses your device’s built-in text-to-speech, which runs in your browser or operating system.
        </li>
        <li>
          <b>Microphone check (“Say it”).</b> Only when you press the microphone button, your browser’s speech recognition service
          processes the recording (in Chrome this is Google). KanaMind doesn’t receive or keep the recording.
        </li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li><b>Export</b> your progress as a file at any time (Home or Account page).</li>
        <li><b>Erase</b> your progress from this browser, or from your account when signed in.</li>
        <li>
          <b>Delete your account</b> on the Account page. This permanently removes your login and your saved progress straight
          away.
        </li>
        <li>Signing out removes your account’s progress from that browser.</li>
      </ul>

      <h2>Keeping and sharing data</h2>
      <p>
        Your data is kept until you erase it or delete your account. We don’t sell it, share it for advertising, or use it for
        anything except running the app. The app is meant for learners of all ages; if you are under 13, ask a parent or guardian
        before creating an account.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: open an issue at <a href={ISSUES} target="_blank" rel="noopener noreferrer">github.com/Ga-lib/kana-mind/issues</a>.
      </p>
    </div>
  )
}
