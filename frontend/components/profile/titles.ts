/**
 * Maps a pathname to the translation key shown as the mobile top-bar title
 * (next to the back arrow). Detail pages show "পূর্বের পাতায় ফিরে যান"
 * (detail.back). Returns null for pages without a top-bar title so the header
 * renders the default logo.
 *
 * SSR-safe: pure string lookup, no hooks — the header translates the key.
 */

/** Longest prefixes first so nested routes fall back to their section label. */
const TITLE_BY_PREFIX: [prefix: string, key: string][] = [
  ["/my-articles/new", "detail.back"],
  ["/my-masail/new", "detail.back"],
  ["/answer-queue/", "detail.back"],
  ["/profile", "profile.rail.profile"],
  ["/my-questions", "profile.rail.myQuestions"],
  ["/answer-queue", "profile.rail.answerQueue"],
  ["/bookmarks", "profile.rail.bookmarks"],
  ["/my-articles", "profile.rail.articles"],
  ["/my-masail", "profile.rail.masail"],
  ["/ask-3", "profile.rail.ask3"],
  ["/ask-2", "profile.rail.ask2"],
  ["/ask/success", "askSuccess.backToHome"],
  ["/ask", "header.ask"],
  ["/donate", "header.donate"],
  ["/masail/", "detail.back"],
  ["/articles/", "detail.back"],
  ["/question-answer/", "detail.back"],
  ["/dua/", "detail.back"],
  ["/notice/", "detail.back"],
  ["/books/", "detail.back"],
  ["/masail", "nav.masail"],
  ["/articles", "nav.articles"],
  ["/question-answer", "nav.qa"],
  ["/dua", "nav.dua"],
  ["/prayer-times/calendar", "prayerTimes.calendar.title"],
  ["/prayer-times", "prayerTimes.title"],
  ["/books", "nav.books"],
  ["/bayan", "nav.bayan"],
  ["/videos", "nav.videos"],
  ["/notice", "nav.notice"],
  ["/malfujat", "nav.malfujat"],
  ["/author-article", "authorArticle.title"],
  ["/contributors", "detail.back"],
];

export function getMobileTitleKey(pathname: string): string | null {
  const match = TITLE_BY_PREFIX.find(
    ([prefix]) =>
      pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
  );
  return match ? match[1] : null;
}
