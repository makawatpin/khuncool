/**
 * Responsive audit for a /media game stage.
 *
 * Paste into the browser console on a game page, or run it through a
 * devtools/CDP eval. Reports the failures the stage contract exists to
 * prevent — see docs/media-stage-contract.md.
 *
 * `pass` covers only the hard failures. Two fields are advisory and have to
 * be read, not just checked: `contentHiddenBehindScroll` and
 * `belowComfortTargets`. A screen can pass and still be bad to play.
 *
 *   auditStage()            // audit the stage as rendered right now
 *   auditStage({ min: 11 }) // custom minimum font size
 *
 * Elements that are decorative (aria-hidden, pointer-events:none) or
 * absolutely positioned backdrops are ignored: they are allowed to bleed past
 * the stage edge, that is what the stage clips them for.
 */
function auditStage({ min = 11 } = {}) {
  const stage =
    document.querySelector(".kc-stage") ||
    document.querySelector(".kc-game") ||
    document.querySelector('[class*="__shell"]') ||
    document.querySelector('[class*="__lab"]') ||
    document.querySelector('[class*="__game"]');
  if (!stage) return { error: "no stage found on this page" };

  const box = stage.getBoundingClientRect();
  const label = (el) =>
    (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 20);

  const decorative = (el) => {
    const cs = getComputedStyle(el);
    return (
      el.closest("[aria-hidden='true']") !== null ||
      cs.pointerEvents === "none" ||
      cs.visibility === "hidden" ||
      cs.display === "none"
    );
  };

  const scrollableWithin = (el) => {
    for (let p = el.parentElement; p && p !== stage.parentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      const scrolls = /auto|scroll/.test(cs.overflow + cs.overflowY + cs.overflowX);
      if (scrolls && (p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth)) return true;
    }
    return false;
  };

  const controls = [...stage.querySelectorAll("button,a[href],input,select,textarea,[role='button']")]
    .filter((el) => !decorative(el) && el.getBoundingClientRect().width > 0);

  // 1. Controls pushed outside the stage that nothing can scroll to.
  const unreachable = controls
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const outside =
        r.bottom > box.bottom + 1 || r.top < box.top - 1 || r.right > box.right + 1 || r.left < box.left - 1;
      return outside && !scrollableWithin(el);
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { control: label(el), overflowBottom: Math.round(r.bottom - box.bottom), overflowRight: Math.round(r.right - box.right) };
    });

  // 2. Tap targets.
  //
  // Two thresholds, because they mean different things. 24x24 is WCAG 2.2
  // 2.5.8 Target Size (Minimum) — anything under it is a defect. --kc-tap
  // (40/44/48 by shape) is the comfort target from Apple HIG and Material;
  // a dense grid of adjacent options can sit under it without being a real
  // problem, so those are reported separately rather than failing the audit.
  const tap = parseFloat(getComputedStyle(stage.querySelector(".kc-stage-body") || stage).getPropertyValue("--kc-tap")) || 40;
  const size = (el) => {
    const r = el.getBoundingClientRect();
    return { control: label(el), width: Math.round(r.width), height: Math.round(r.height) };
  };
  const undersizedTargets = controls
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height < 24 || r.width < 24;
    })
    .map(size);
  const belowComfortTargets = controls
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return (r.height < tap - 0.5 || r.width < tap - 0.5) && r.height >= 24 && r.width >= 24;
    })
    .map(size);

  // 3. Text below the legibility floor.
  //
  // font-size: 0 is not small text, it is hidden text — the icon-button idiom
  // that collapses a label and renders the glyph through ::first-letter. Only
  // text that actually renders can be too small to read.
  const smallText = [...stage.querySelectorAll("*")]
    .filter((el) => !el.children.length && (el.textContent || "").trim() && !decorative(el))
    .map((el) => ({ text: (el.textContent || "").trim().slice(0, 20), size: parseFloat(getComputedStyle(el).fontSize) }))
    .filter((row) => row.size > 0 && row.size < min);

  // 4. Horizontal page scroll.
  const pageScrollsSideways = document.documentElement.scrollWidth > window.innerWidth + 1;

  // 5. The body must actually be bound to the stage.
  //
  // .kc-stage-body is position:absolute; inset:0. A game that sets `position`
  // inline on the same element wins over that and leaves the body in flow,
  // free to grow past the stage — at which point every measurement above is
  // taken against a box the game is no longer inside. Cheap to check, and
  // silent if you do not.
  const bodyEl = stage.querySelector(".kc-stage-body");
  const bodyBox = bodyEl && bodyEl.getBoundingClientRect();
  const bodyUnbound = Boolean(
    bodyEl && (bodyBox.height > box.height + 2 || bodyBox.width > box.width + 2),
  );

  // 6. Content parked outside its own scroll region.
  //
  // Check 1 clears anything a scroll can reach, which is right for "can the
  // user get to it at all" but wrong as the only question. Phonics Bingo
  // passed this audit on a portrait phone while showing 12 of 16 answer
  // cards: the grid had its own scrollbar, so every hidden card counted as
  // reachable. A small box scrolling inside a screen has almost no
  // affordance — a student reads the four rows they can see and plays on,
  // never learning the rest exist.
  //
  // Not a hard failure, because some regions genuinely have no bound (a
  // results list is one row per question) and scrolling is the honest answer
  // there. What decides it is WHAT is hidden, so report that: a region
  // hiding 4 answer buttons needs a layout fix, one hiding the tail of a
  // paragraph does not. Read this list on every screen a game has.
  const contentHiddenBehindScroll = [...stage.querySelectorAll("*")]
    .filter((el) => {
      const cs = getComputedStyle(el);
      if (!/auto|scroll/.test(cs.overflowY + cs.overflowX)) return false;
      return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      const inside = controls.filter((c) => el.contains(c));
      const hidden = inside.filter((c) => {
        const cr = c.getBoundingClientRect();
        return (
          cr.bottom > r.bottom + 1 ||
          cr.top < r.top - 1 ||
          cr.right > r.right + 1 ||
          cr.left < r.left - 1
        );
      });
      return {
        region: el === bodyEl ? "kc-stage-body" : el.className.toString().trim() || el.tagName,
        hiddenPx: Math.max(
          Math.round(el.scrollHeight - el.clientHeight),
          Math.round(el.scrollWidth - el.clientWidth),
        ),
        hiddenControls: hidden.length,
        totalControls: inside.length,
        sample: hidden.slice(0, 3).map(label),
      };
    })
    .filter((row) => row.hiddenControls > 0);

  const shape =
    box.width / box.height < 0.9 ? "portrait" : box.height < 440 ? "short" : "wide";

  return {
    viewport: [window.innerWidth, window.innerHeight],
    stage: { width: Math.round(box.width), height: Math.round(box.height), shape, tapFloor: tap },
    pass:
      !unreachable.length &&
      !undersizedTargets.length &&
      !smallText.length &&
      !pageScrollsSideways &&
      !bodyUnbound,
    pageScrollsSideways,
    bodyUnbound,
    unreachable,
    undersizedTargets,
    smallText,
    contentHiddenBehindScroll, // advisory — judge by what is hidden
    belowComfortTargets, // advisory only
  };
}

if (typeof module !== "undefined") module.exports = { auditStage };
if (typeof window !== "undefined") window.auditStage = auditStage;
