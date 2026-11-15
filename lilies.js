/* The bouquet. Every lily is one line; add, move or remove a lily by editing it.
   All stems start at one point at the bottom centre and fan out to their heads.
   row: "front" or "back". The back row is drawn first, so it sits behind, and is
        dimmed and darkened to look farther away
   x, y: where the head sits, in vmin (x from the centre, y up from the bottom)
   size: head width in vmin
   head: image number in assets/lilies (1-9)
   turn: head rotation in degrees (negative leans left)
   flip: true mirrors the head, so it faces the other way
   delay: seconds before the stem starts growing; the head blooms 1.8s later
   peek: optional small leaf growing from the stem, as [how far up the stem (0-1),
         side (-1 left, 1 right), length in vmin, angle from upright in degrees]
   Head images: 1 3 4 5 face left, 2 8 9 face right, 6 and 7 face the viewer. */
const LILIES = [
  { row: "front", x: 0,   y: 78, size: 26, head: 6, turn: 0,   flip: false, delay: 0.3,  peek: [0.3, 1, 15, 24] },
  { row: "front", x: -9,  y: 55, size: 26, head: 7, turn: -5,  flip: false, delay: 0.65 },
  { row: "front", x: 9,   y: 55, size: 26, head: 5, turn: 5,   flip: true,  delay: 0.8 },
  { row: "back",  x: -22, y: 68, size: 23, head: 3, turn: -12, flip: false, delay: 1.05 },
  { row: "back",  x: 22,  y: 68, size: 23, head: 2, turn: 12,  flip: false, delay: 1.2 },
  { row: "front", x: -16, y: 33, size: 24, head: 4, turn: -14, flip: false, delay: 1.45 },
  { row: "front", x: 16,  y: 33, size: 24, head: 8, turn: 14,  flip: false, delay: 1.6 },
  { row: "back",  x: -33, y: 46, size: 23, head: 1, turn: -22, flip: false, delay: 1.85, peek: [0.5, 1, 14, 36] },
  { row: "back",  x: 33,  y: 46, size: 23, head: 9, turn: 22,  flip: false, delay: 2.0,  peek: [0.5, -1, 14, 36] },
];

/* Broad leaves fanning out behind the stems from the base of the bouquet:
   [how far the tip reaches left (-) or right (+) in vmin, how high the tip is in
    vmin, tone a/b/c from mid to dark green]. On tall screens they get taller. */
const LEAVES = [
  [-6, 44, "c"], [7, 46, "c"], [-18, 48, "b"], [19, 47, "b"],
  [-30, 40, "a"], [31, 41, "a"], [-41, 34, "b"], [42, 35, "b"],
];

/* Background lights: [left %, top %, diameter in vmin, colour]. */
const BOKEH = [
  [8, 13, 3, "#c13bb0"], [24, 15, 2.6, "#c75c8e"], [18, 23, 2.8, "#c13bb0"],
  [5, 35, 2.6, "#a34a78"], [14, 41, 1.2, "#ef7fb0"], [10, 46, 1, "#ffa3c4"],
  [17, 52, 2.8, "#8d2d92"], [16, 62, 1.6, "#d9709a"], [2, 69, 2.8, "#c030ac"],
  [17, 81, 4.6, "#c13bb0"], [22, 93, 1.2, "#ef7fb0"], [50, 8, 2.8, "#a42f9b"],
  [64, 18, 2.6, "#b4507f"], [31, 27, 1.8, "#a84d8b"], [79, 25, 1.4, "#ffa3c4"],
  [77, 40, 2, "#a34a78"], [86, 45, 4, "#ff8fb4"], [91, 43, 2.4, "#ff7fa8"],
  [85, 71, 4.4, "#f27ea5"], [93, 71, 1.4, "#ef7fb0"], [77, 66, 1.4, "#d9709a"],
  [61, 75, 2.4, "#8d2d92"], [37, 57, 2.4, "#8d2d92"], [40, 74, 1.6, "#a84d8b"],
];

/* The hearts that open the animation, around the centre of the screen.
   x, y: where the heart sits, in vmin (x right of centre, y up from centre)
   size: overall width in vmin
   color: its pink
   delay: seconds after the animation starts; each heart lasts 2.8s, so the last
          one is gone 4s in */
const OPENER_HEARTS = [
  { x: -2,  y: 3,   size: 24, color: "#ff80ed", delay: 0 },
  { x: -25, y: 12,  size: 15, color: "#ff8fd0", delay: 0.2 },
  { x: 22,  y: 14,  size: 16, color: "#f76fe0", delay: 0.4 },
  { x: -19, y: -17, size: 14, color: "#ff94f0", delay: 0.55 },
  { x: 20,  y: -14, size: 21, color: "#ff7ad6", delay: 0.75 },
  { x: 1,   y: 28,  size: 13, color: "#ffa0e4", delay: 0.95 },
  { x: -34, y: -3,  size: 12, color: "#f879ec", delay: 1.2 },
];

const n = (value) => value.toFixed(2);

/* How much to lift the whole bouquet on tall screens so it fills the height. The
   shape stays the same; only the stems get longer. */
function liftFor() {
  const screenHeight = (innerHeight / Math.min(innerWidth, innerHeight)) * 100;
  const topEdge = Math.max(...LILIES.map((l) => l.y + l.size * 0.55));
  return Math.max(0, screenHeight - topEdge - 5);
}

/* A broad, pointed leaf from (ax, ay) to (tx, ty), drooping a little at the tip. */
function leafMarkup(ax, ay, tx, ty, widthBase, delay, tone = "a") {
  const dx = tx - ax;
  const dy = ty - ay;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const tipY = ty + length * 0.04;
  const half = widthBase * 0.12 * 2;
  const bend = -widthBase * 0.06 * Math.sign(dx || 1);
  const ctrl = (along, across) =>
    `${n(ax + ux * length * along + nx * across)} ${n(ay + uy * length * along + ny * across)}`;
  const shape =
    `M${n(ax)} ${n(ay)}Q${ctrl(0.4, half + bend)} ${n(tx)} ${n(tipY)}` +
    `Q${ctrl(0.4, -half + bend)} ${n(ax)} ${n(ay)}Z`;
  const rib = `M${n(ax)} ${n(ay)}Q${ctrl(0.4, bend)} ${n(tx)} ${n(tipY)}`;
  return (
    `<g class="leaf leaf--${tone}" style="transform-origin:${n(ax)}px ${n(ay)}px; --leaf-delay:${n(delay)}s">` +
    `<path class="leaf__blade" d="${shape}"/><path class="leaf__rib" d="${rib}"/></g>`
  );
}

function fanMarkup(lift) {
  const baseY = 100 + lift;
  const paths = LEAVES.map(([reach, height, tone], i) => {
    const scaled = height * (1 + lift / 85);
    const widthBase = Math.hypot(reach, height);
    return leafMarkup(50, baseY, 50 + reach, baseY - scaled, widthBase, 0.1 + i * 0.12, tone);
  }).join("");
  return `<div class="bouquet__fan"><svg class="plant" viewBox="0 0 100 ${n(baseY)}" preserveAspectRatio="none" aria-hidden="true">${paths}</svg></div>`;
}

/* The stem is one gentle curve from the shared base to the head: it leaves the base
   nearly upright, then bends outward toward the head. */
function stemCurve(bx, by, hx, hy) {
  const dx = hx - bx;
  const dy = by - hy;
  return [
    [bx, by],
    [bx + dx * 0.05, by - dy * 0.42],
    [hx - dx * 0.22, hy + dy * 0.3],
    [hx, hy],
  ];
}

function pointOn([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const at = (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  return [at(0), at(1)];
}

function lilyMarkup(lily, index, lift) {
  const base = lily.x * 0.07;
  const bx = 50 + base;
  const by = 100 + lift;
  const hx = 50 + lily.x;
  const hy = 100 - lily.y;
  const curve = stemCurve(bx, by, hx, hy);
  const d = `M${n(bx)} ${n(by)}C${curve.slice(1).map(([x, y]) => `${n(x)} ${n(y)}`).join(" ")}`;

  let peek = "";
  if (lily.peek) {
    const [t, side, length, angle] = lily.peek;
    const [px, py] = pointOn(curve, t);
    const rad = (angle * Math.PI) / 180;
    peek = leafMarkup(
      px, py, px + Math.sin(rad) * side * length, py - Math.cos(rad) * length,
      length, lily.delay + 0.9
    );
  }

  return `
    <div class="lily lily--${lily.row}" style="
      --base:${n(base)}vmin; --head-x:${n(lily.x - base)}vmin; --head-y:${n(lily.y + lift)}vmin;
      --size:${lily.size}vmin; --turn:${lily.turn}deg; --flip:${lily.flip ? -1 : 1};
      --delay:${n(lily.delay)}s; --bloom-delay:${n(lily.delay + 1.8)}s;
      --sway:${n(3.2 + ((index * 3) % 9) * 0.3)}s; --sway-delay:${n(-index * 1.1)}s;">
      <svg class="plant" viewBox="0 0 100 ${n(by)}" preserveAspectRatio="none" aria-hidden="true">
        <path class="lily__stem" pathLength="1" d="${d}"/>
        ${peek}
      </svg>
      <div class="lily__bloom">
        <img class="lily__head" src="assets/lilies/head-${String(lily.head).padStart(2, "0")}.png" alt="">
      </div>
    </div>`;
}

document.querySelector(".sky").innerHTML = BOKEH.map(
  ([x, y, d, c], i) =>
    `<span class="bokeh" style="--x:${x}%; --y:${y}%; --d:${d}vmin; --c:${c}; --in:${n(1 + (i % 6) * 0.4)}s; --t:${n(5 + (i % 5) * 1.3)}s; --drift-delay:${n(-i * 0.9)}s"></span>`
).join("");

document.querySelector(".opener-hearts").innerHTML = OPENER_HEARTS.map(
  ({ x, y, size, color, delay }) =>
    `<div class="opener-heart" style="--x:${x}; --y:${y}; --s:${size}vmin; --c:${color}; --delay:${delay}s"><div class="opener-heart__shape"></div></div>`
).join("");

/* Builds the bouquet for the current screen shape. If the screen is resized later it is
   rebuilt without replaying the grow animations. */
const bouquet = document.querySelector(".bouquet");

function buildBouquet() {
  const lift = liftFor();
  const order = LILIES.map((lily, i) => [lily, i]).sort(
    ([a], [b]) => (a.row === "back" ? 0 : 1) - (b.row === "back" ? 0 : 1)
  );
  bouquet.style.setProperty("--lift", `${n(lift)}vmin`);
  bouquet.innerHTML =
    `<div class="bouquet__glow"></div>` +
    fanMarkup(lift) +
    order.map(([lily, i]) => lilyMarkup(lily, i, lift)).join("");
}

buildBouquet();

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    bouquet.classList.add("is-settled");
    buildBouquet();
  }, 150);
});
