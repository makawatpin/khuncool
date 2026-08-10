/**
 * Responsive audit for a /media game stage.
 *
 * Paste into the browser console on a game page, or run it through a
 * devtools/CDP eval. Reports the four failures the stage contract exists to
 * prevent — see docs/media-stage-contract.md.
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

  const shape =
    box.width / box.height < 0.9 ? "portrait" : box.height < 440 ? "short" : "wide";

  return {
    viewport: [window.innerWidth, window.innerHeight],
    stage: { width: Math.round(box.width), height: Math.round(box.height), shape, tapFloor: tap },
    pass: !unreachable.length && !undersizedTargets.length && !smallText.length && !pageScrollsSideways,
    pageScrollsSideways,
    unreachable,
    undersizedTargets,
    smallText,
    belowComfortTargets, // advisory only
  };
}

if (typeof module !== "undefined") module.exports = { auditStage };
if (typeof window !== "undefined") window.auditStage = auditStage;
