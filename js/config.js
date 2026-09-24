/**
 * FinTrack — Site Configuration
 * ─────────────────────────────────────────────────────────────────────────
 * এই ফাইলে শুধু launch date বদলালেই সাইটের সব জায়গায় আপনাআপনি update হবে:
 *   • Nav button
 *   • Launch announcement band
 *   • Hero CTA button
 *   • Closing CTA button
 *   • Countdown timer target
 *   • Pill note text
 *
 * HOW TO UPDATE THE DATE:
 *   1. LAUNCH_DATE    → ISO format, UTC midnight  e.g. '2026-12-01T00:00:00Z'
 *   2. LAUNCH_DISPLAY → Full display text          e.g. '01 December 2026'
 *   3. LAUNCH_SHORT   → Short form for nav button  e.g. '01 Dec 2026'
 *
 * ⚠️  privacy.html ও terms.html-এর "Effective date" আলাদা legal date —
 *     সেটা manually সেই ফাইলে বদলাতে হবে।
 * ─────────────────────────────────────────────────────────────────────────
 */
var FINTRACK_CONFIG = {

  // ── Launch date ──────────────────────────────────────────────────────────
  LAUNCH_DATE:    '2026-11-01T00:00:00Z',  // ← শুধু এই ৩ লাইন বদলান
  LAUNCH_DISPLAY: '01 November 2026',
  LAUNCH_SHORT:   '01 Nov 2026',

};
