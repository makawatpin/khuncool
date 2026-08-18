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

  // 5. Controls the other checks cannot see.
  //
  // Every check above starts from button/a/input/[role=button]. A <span
  // onClick> is invisible to all of them — and to the Tab key and to a screen
  // reader, which is the actual problem. Sound Wheel has two of these sitting
  // 114px past the stage: unreachable by pointer AND by keyboard, and no check
  // reported a thing.
  //
  // Reported separately from the layout findings because it is a different
  // failure: WCAG 2.1.1 Keyboard and 4.1.2 Name, Role, Value, not a box that
  // does not fit.
  //
  // `cursor` inherits, so a pointer container makes every descendant look
  // clickable. Only the element that ORIGINATES the pointer counts — where the
  // parent does not already have it. Anything that is or contains a real
  // control is a wrapper, not a control, and is dropped.
  // `grab` counts as well as `pointer`. Family Tree's word cards are divs with
  // pointer handlers and cursor:grab, and a first version of this check that
  // looked only for `pointer` missed all nine of them — reporting half the
  // problem, which is worse than reporting none.
  const INTERACTIVE_CURSORS = ["pointer", "grab", "grabbing"];
  const semantic = "button,a[href],input,select,textarea,label,summary,[role='button'],[role='link'],[role='checkbox'],[role='radio'],[role='tab'],[role='option']";
  const nonSemanticControls = [...stage.querySelectorAll("*")]
    .filter((el) => {
      if (decorative(el)) return false;
      const cs = getComputedStyle(el);
      if (!INTERACTIVE_CURSORS.includes(cs.cursor)) return false;
      const parent = el.parentElement;
      if (parent && parent !== stage.parentElement && INTERACTIVE_CURSORS.includes(getComputedStyle(parent).cursor)) return false;
      if (el.matches(semantic) || el.closest(semantic)) return false;
      if (el.querySelector(semantic)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const outside =
        r.bottom > box.bottom + 1 || r.top < box.top - 1 || r.right > box.right + 1 || r.left < box.left - 1;
      return {
        control: label(el),
        tag: el.tagName,
        // A drag source is legitimately not a button and needs a keyboard path
        // rather than a relabelling, so the two are counted apart. The cursor
        // is the reliable signal here: these games drag with pointer events and
        // never set draggable="true", so that attribute finds nothing.
        dragAffordance: cs.cursor === "grab" || cs.cursor === "grabbing",
        draggable: el.getAttribute("draggable") === "true",
        role: el.getAttribute("role") || null,
        tabbable: el.getAttribute("tabindex") !== null,
        offStage: outside && !scrollableWithin(el),
      };
    });

  // 6. Text cut off by its own box.
  //
  // A box with overflow hidden or clip whose content is wider than it fits is
  // showing a truncated label. Nothing else here catches it: the element is
  // inside the stage, so unreachable does not fire; its box is not a scroll
  // region, so contentHiddenBehindScroll does not either; and the font size is
  // whatever it was, so smallText is quiet. It cost a wrong commit earlier this
  // week — a set of answer buttons whose faces had been given a smaller wrapper
  // rendered "M…" and "Gr…" where "Mom" and "Grandma" should have been, and
  // every check passed.
  //
  // Advisory, because ellipsis is sometimes the intended design. What decides
  // it is which text is cut, so the report names it.
  const clippedText = [...stage.querySelectorAll("*")]
    .filter((el) => {
      if (decorative(el)) return false;
      const cs = getComputedStyle(el);
      if (!/hidden|clip/.test(cs.overflowX + cs.overflow)) return false;
      // A scroll region is the other check’s business, not this one.
      if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) return false;
      // Leaves only. A flex row whose children add up wider than it reports the
      // same overflow without any label being cut, and reporting the whole
      // toolbar as "clipped" buries the one span that actually is.
      if (el.children.length) return false;
      if (!(el.textContent || "").trim()) return false;
      return el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0;
    })
    .map((el) => ({
      control: label(el),
      visiblePx: Math.round(el.clientWidth),
      neededPx: Math.round(el.scrollWidth),
      cutPx: Math.round(el.scrollWidth - el.clientWidth),
    }));

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
    nonSemanticControls, // advisory — accessibility, reported separately
    clippedText, // advisory — judge by which label is cut
  };
}

if (typeof module !== "undefined") module.exports = { auditStage };
if (typeof window !== "undefined") window.auditStage = auditStage;
