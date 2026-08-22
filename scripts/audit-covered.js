/**
 * "Is this control actually clickable?" — the check auditStage() cannot do.
 *
 * The gap this fills
 * ------------------
 * is-are-sorting was completely unplayable at 844x390: an overflowing question
 * card sat on top of the IS/ARE buttons, so twelve clicks left the game at
 * 1/12. Every check in audit-stage.js passed it. The buttons were inside the
 * stage, unclipped, full size, large enough, legible. They were merely
 * underneath something, and nothing measured that.
 *
 * Why this is a separate file and a separate pass
 * ----------------------------------------------
 * The first attempt at this lived inside auditStage() and fired
 * `elementFromPoint` at each control's centre. It produced 312 rows, then 35
 * after filtering, and on hand-testing every one of those 35 turned out to be
 * clickable. The cause is structural: the harness resets every scrollTop to 0
 * before measuring — which the other checks require, see the contract §6 — but
 * a real user SCROLLS TO the control they are about to press. Measured on
 * density-lab:
 *
 *     at the audit's scroll position : slider y=624 -> hit tankArea
 *     after scrolling it into view   : slider y=593 -> hit INPUT, correct
 *
 * "covered at scrollTop 0" is not "cannot be clicked". So this pass scrolls
 * each control into view first, exactly as a click would, and that is why it
 * cannot share auditStage()'s scroll-reset. It runs afterwards and puts every
 * scroll position back.
 *
 * That first attempt also taught the other half. A filter for "behind a modal"
 * looked reasonable and silently disabled the whole check, because
 * `.kc-stage-body` is `position:absolute; inset:0` and therefore every element
 * on every screen matched "is behind a positioned overlay". It was caught only
 * by testing in both directions — the fixed page must be quiet AND the bugged
 * page must be loud. So there is no modal filter here at all. A modal that
 * covers the screen behind it is reported like anything else, and the report
 * says how many controls each blocker covers, because one blocker over
 * fourteen controls reads as a modal and one blocker over two reads as
 * is-are-sorting. Classifying that here is what threw the real bug away last
 * time; naming it and leaving the judgement to the reader does not.
 *
 * Two things to know when reading the output
 * ------------------------------------------
 * A blocker reported as `NEXTJS-PORTAL` is the dev server's own overlay badge,
 * not part of the game. It sits in a corner and does cover whatever control is
 * under it — Playwright refuses that click too — but it does not exist in a
 * build. It is left in the report rather than filtered out, because filtering
 * on a guess about what "is not really part of the page" is what went wrong
 * last time; the name says what it is.
 *
 * A blocker with `ownControls > 0` is a surface carrying its own buttons: a
 * result card, a modal, something the player is meant to be using instead of
 * what is behind it, and the controls it covers are supposed to be unreachable.
 * Across the 16 games, 144 of the 146 findings are that shape — all of them on
 * coding-maze's won/lost screens, and all of them correct behaviour.
 */
async function auditCoveredControls() {
  const stage =
    document.querySelector(".kc-stage") ||
    document.querySelector(".kc-game") ||
    document.querySelector('[class*="__shell"]') ||
    document.querySelector('[class*="__lab"]') ||
    document.querySelector('[class*="__game"]');
  if (!stage) return { error: "no stage found on this page" };

  const label = (el) =>
    (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 24);

  const describe = (el) => {
    if (!el) return "(nothing)";
    const cls = (el.className || "").toString().trim().split(/\s+/)[0] || "";
    return `${el.tagName}${cls ? "." + cls : ""}`;
  };

  const decorative = (el) => {
    const cs = getComputedStyle(el);
    return (
      el.closest("[aria-hidden='true']") !== null ||
      cs.pointerEvents === "none" ||
      cs.visibility === "hidden" ||
      cs.display === "none"
    );
  };

  const controls = [...stage.querySelectorAll("button,a[href],input,select,textarea,[role='button']")]
    .filter((el) => {
      if (decorative(el)) return false;
      if (el.disabled) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

  // Put the page back exactly as it was. Everything after this pass — the next
  // screen's walk, and on a re-run the next audit — assumes the scroll reset is
  // still in force.
  const saved = [];
  for (const el of document.querySelectorAll("*")) {
    if (el.scrollTop || el.scrollLeft) saved.push([el, el.scrollTop, el.scrollLeft]);
  }

  // The point a click would land on.
  //
  // Not simply the element's centre: an element half outside its scroll
  // container has a centre that is not on screen, and Playwright uses the
  // middle of the part that is actually visible. Clipping against each
  // scrollable ancestor and then the viewport reproduces that.
  const actionPoint = (el) => {
    let r = el.getBoundingClientRect();
    let left = r.left, top = r.top, right = r.right, bottom = r.bottom;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (!/auto|scroll|hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) continue;
      const pr = p.getBoundingClientRect();
      left = Math.max(left, pr.left);
      top = Math.max(top, pr.top);
      right = Math.min(right, pr.right);
      bottom = Math.min(bottom, pr.bottom);
    }
    left = Math.max(left, 0);
    top = Math.max(top, 0);
    right = Math.min(right, window.innerWidth);
    bottom = Math.min(bottom, window.innerHeight);
    if (right <= left || bottom <= top) return null;
    return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top };
  };

  const rows = [];
  const offScreen = [];

  for (const el of controls) {
    // Scroll it in, the way a click does. `scrollIntoViewIfNeeded` is the
    // closest match to Playwright's behaviour and is a no-op when the element
    // is already fully visible, so a control that needs no scroll is measured
    // exactly where the screenshot shows it.
    if (el.scrollIntoViewIfNeeded) el.scrollIntoViewIfNeeded(true);
    else el.scrollIntoView({ block: "center", inline: "center" });

    const pt = actionPoint(el);
    if (!pt) {
      // Nothing of it is on screen even after scrolling. That is `unreachable`
      // or `contentHiddenBehindScroll`'s finding, not this one — recorded so
      // the two reports can be reconciled rather than silently disagreeing.
      offScreen.push(label(el));
      continue;
    }

    // Playwright's rule: the click lands on the target if the topmost element
    // at the point is the target or something inside it (a button's own label
    // span is the usual case). A <label> or <a> WRAPPING the control forwards
    // its clicks and is not a blocker either.
    const clear = (h) =>
      !h || el.contains(h) || (h.contains(el) && h.matches("label,a[href],button"));

    let hit = document.elementFromPoint(pt.x, pt.y);
    if (clear(hit)) continue;

    // Sample again before believing it.
    //
    // A single instantaneous hit-test cannot tell "a card is sitting on this
    // button" from "a decoration swept over it just then", and the second one
    // is not nothing — math-bomb-defusal's .energyRing is a 445x589 ellipse
    // that spins on a 9s loop with no pointer-events:none, and it takes turns
    // covering all four wire cards. Playwright's own click does not report
    // that, because it retries until the ring rotates clear.
    //
    // So both are reported, and the count says which is which: 3 of 3 is
    // something parked on top of the control, 1 of 3 is something sweeping
    // across it. A child tapping at the wrong moment loses the tap either way,
    // which is why neither is filtered out here.
    const SAMPLES = 3;
    let blocked = 1;
    const blockers = [hit];
    for (let s = 1; s < SAMPLES; s++) {
      await new Promise((res) => setTimeout(res, 140));
      const again = document.elementFromPoint(pt.x, pt.y);
      if (!clear(again)) {
        blocked++;
        blockers.push(again);
      }
    }
    // Report the blocker seen most often rather than whichever was first.
    hit = blockers.sort(
      (a, b) => blockers.filter((x) => x === b).length - blockers.filter((x) => x === a).length,
    )[0];

    const br = hit ? hit.getBoundingClientRect() : null;
    const bcs = hit ? getComputedStyle(hit) : null;
    rows.push({
      control: label(el),
      controlTag: el.tagName,
      blocker: describe(hit),
      blockerText: hit ? label(hit) : null,
      // Enough to tell an overlay apart from a box that overflowed onto this
      // one, without deciding which it is here.
      blockerPosition: bcs ? bcs.position : null,
      blockerZIndex: bcs ? bcs.zIndex : null,
      blockerCoversStagePct:
        br && stage
          ? Math.min(
              100,
              Math.round(
                ((Math.min(br.right, stage.getBoundingClientRect().right) - Math.max(br.left, stage.getBoundingClientRect().left)) *
                  (Math.min(br.bottom, stage.getBoundingClientRect().bottom) - Math.max(br.top, stage.getBoundingClientRect().top))) /
                  (stage.getBoundingClientRect().width * stage.getBoundingClientRect().height) *
                  100,
              ),
            )
          : null,
      // Does the thing doing the blocking have controls of its own?
      //
      // This is the difference between the two shapes, stated as a count rather
      // than as a verdict. A result overlay or a modal carries its own buttons
      // — it is a surface the player is meant to be using INSTEAD of what is
      // behind it, and the controls it covers are supposed to be unreachable.
      // A question card that overflowed onto the answer row carries none: it is
      // just sitting there, and the game cannot be played.
      //
      // Reported, not filtered. The last attempt at this check filtered on a
      // guess about modals and silently swallowed the real bug; this leaves
      // every row in the report and lets the number say which kind it is.
      blockerOwnControls: hit
        ? hit.querySelectorAll("button,a[href],input,select,textarea,[role='button']").length
        : 0,
      // 3 of 3 is parked on top of the control; 1 of 3 is sweeping across it.
      blockedSamples: blocked,
      totalSamples: SAMPLES,
      atPoint: [Math.round(pt.x), Math.round(pt.y)],
    });
  }

  for (const [el, top, left] of saved) {
    el.scrollTop = top;
    el.scrollLeft = left;
  }
  // Anything this pass scrolled that was at 0 before is not in `saved`, so put
  // the whole document back to the reset state the other checks ran under.
  for (const el of document.querySelectorAll("*")) {
    if (!saved.some(([s]) => s === el)) {
      if (el.scrollTop) el.scrollTop = 0;
      if (el.scrollLeft) el.scrollLeft = 0;
    }
  }

  // One line per blocker, so the shape is visible at a glance. A blocker over
  // most of the screen's controls is a modal doing its job; a blocker over one
  // or two, sitting in normal flow, is the is-are-sorting failure.
  const byBlocker = {};
  for (const r of rows) {
    const key = r.blocker;
    byBlocker[key] = byBlocker[key] || {
      blocker: key,
      blockerText: r.blockerText,
      position: r.blockerPosition,
      zIndex: r.blockerZIndex,
      coversStagePct: r.blockerCoversStagePct,
      controlsCovered: 0,
      alwaysBlocked: 0,
      intermittent: 0,
      // styled-jsx gives sibling elements the same hashed class, so a group
      // keyed on tag+class can hold more than one element. Every row stays in
      // coveredControls untouched; this summary keeps the largest count rather
      // than whichever happened to be measured first.
      ownControls: 0,
      sample: [],
    };
    byBlocker[key].controlsCovered++;
    if (r.blockedSamples === r.totalSamples) byBlocker[key].alwaysBlocked++;
    else byBlocker[key].intermittent++;
    byBlocker[key].ownControls = Math.max(byBlocker[key].ownControls, r.blockerOwnControls);
    if (byBlocker[key].sample.length < 4) byBlocker[key].sample.push(r.control);
  }

  return {
    controlsTested: controls.length,
    coveredControls: rows,
    coveredByBlocker: Object.values(byBlocker).sort((a, b) => b.controlsCovered - a.controlsCovered),
    notOnScreenAfterScroll: offScreen,
  };
}

if (typeof module !== "undefined") module.exports = { auditCoveredControls };
if (typeof window !== "undefined") window.auditCoveredControls = auditCoveredControls;
