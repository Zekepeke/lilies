/* The lilies. Each one stands on its own upright stem. Add, move or remove a lily
   by editing one line.
   row: "front" or "back". The back row is drawn first, so it sits behind, and is
        dimmed and darkened to look farther away
   base: where the stem meets the ground, in vmin (from the centre)
   x, y: where the head sits, in vmin (x from the centre, y up from the bottom)
   size: head width in vmin
   head: image number in assets/lilies (1-9)
   turn: head rotation in degrees
   flip: true mirrors the head, so it faces the other way
   delay: seconds before the stem starts growing; the head blooms 1.8s later
   edge: true hides the lily on narrow screens, where there is no room for it
   leaves: broad leaves low on the stem, as [height up the stem in vmin,
           side (-1 left, 1 right), length in vmin, angle from upright in degrees] */
const LILIES = [
  // Front row
  { row: "front", base: -29, x: -30, y: 60, size: 29, head: 1, turn: -6, delay: 0.7,
    leaves: [[6, -1, 22, 64], [12, 1, 17, 52], [18, -1, 21, 50], [25, 1, 15, 40]] },
  { row: "front", base: 29, x: 30, y: 56, size: 28, head: 8, turn: 6, delay: 1.1,
    leaves: [[5, 1, 22, 64], [11, -1, 17, 52], [17, 1, 21, 50], [24, -1, 15, 40]] },
  { row: "front", base: 0, x: 0, y: 74, size: 32, head: 6, turn: 0, delay: 0.3,
    leaves: [[7, -1, 24, 52], [13, 1, 24, 50], [21, -1, 19, 38], [28, 1, 18, 34]] },
  // Back row
  { row: "back", base: -52, x: -53, y: 46, size: 24, head: 3, turn: 11, flip: true, delay: 1.3, edge: true,
    leaves: [[5, 1, 13, 58], [11, -1, 11, 48]] },
  { row: "back", base: -20, x: -21, y: 86, size: 24, head: 7, turn: -12, delay: 0.5,
    leaves: [[6, -1, 14, 56], [13, 1, 12, 46]] },
  { row: "back", base: 21, x: 21, y: 38, size: 23, head: 4, turn: 8, delay: 0.9,
    leaves: [[5, 1, 13, 58], [10, -1, 11, 46]] },
  { row: "back", base: 52, x: 53, y: 70, size: 24, head: 2, turn: -9, flip: true, delay: 1.6, edge: true,
    leaves: [[6, -1, 14, 56], [13, 1, 12, 46]] },
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

function bladePath([base, tip, height, width]) {
  const x = 50 + base;
  const tipX = 50 + tip;
  const tipY = 100 - height;
  const midY = 100 - height * 0.5;
  const midX = x + (tip - base) * 0.3;
  return (
    `M${n(x - width / 2)} 100` +
    `Q${n(midX - width)} ${n(midY)} ${n(tipX)} ${n(tipY)}` +
    `Q${n(midX + width)} ${n(midY)} ${n(x + width / 2)} 100Z`
  );
}

/* A broad, pointed leaf from the stem at (50, 100 - rise), reaching out
   `length` vmin at `angle` degrees from upright, drooping a little at the tip. */
function leafMarkup([rise, side, length, angle], delay) {
  const ax = 50;
  const ay = 100 - rise;
  const rad = (angle * Math.PI) / 180;
  const ux = Math.sin(rad) * side;
  const uy = -Math.cos(rad);
  const tipX = ax + ux * length;
  const tipY = ay + uy * length + length * 0.12;
  const nx = -uy;
  const ny = ux;
  const half = length * 0.15;
  const bend = -length * 0.06;
  const ctrl = (along, across) =>
    `${n(ax + ux * length * along + nx * across)} ${n(ay + uy * length * along + ny * across)}`;
  const shape =
    `M${ax} ${n(ay)}Q${ctrl(0.4, half * 2 + bend)} ${n(tipX)} ${n(tipY)}` +
    `Q${ctrl(0.4, -half * 2 + bend)} ${ax} ${n(ay)}Z`;
  const rib = `M${ax} ${n(ay)}Q${ctrl(0.5, bend)} ${n(tipX)} ${n(tipY)}`;
  return (
    `<g class="leaf" style="transform-origin:${ax}px ${n(ay)}px; --leaf-delay:${n(delay)}s">` +
    `<path class="leaf__blade" d="${shape}"/><path class="leaf__rib" d="${rib}"/></g>`
  );
}

/* A nearly straight stem with a gentle S-curve up to the head. */
function stemPath(lily, headX, headY) {
  const lean = headX - 50;
  return (
    `M50 100C${n(50 + lean * 0.1)} ${n(100 - lily.y * 0.35)} ` +
    `${n(50 + lean * 0.9)} ${n(headY + lily.y * 0.3)} ${n(headX)} ${n(headY)}`
  );
}

function lilyMarkup(lily, index) {
  const delay = lily.delay;
  const headX = 50 + lily.x - lily.base;
  const headY = 100 - lily.y;
  const leaves = lily.leaves
    .map((leaf, k) => leafMarkup(leaf, delay + 0.5 + k * 0.28))
    .join("");

  return `
    <div class="lily lily--${lily.row}${lily.edge ? " lily--edge" : ""}" style="
      --base:${n(lily.base)}vmin; --head-x:${n(lily.x - lily.base)}vmin; --head-y:${lily.y}vmin;
      --size:${lily.size}vmin; --turn:${lily.turn}deg; --flip:${lily.flip ? -1 : 1};
      --delay:${n(delay)}s; --bloom-delay:${n(delay + 1.8)}s;
      --sway:${n(3.2 + ((index * 3) % 7) * 0.35)}s; --sway-delay:${n(-index * 1.1)}s;">
      <svg class="plant" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="lily__stem" pathLength="1" d="${stemPath(lily, headX, headY)}"/>
        ${leaves}
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

document.querySelector(".bouquet").innerHTML =
  `<div class="bouquet__glow"></div>` + LILIES.map((lily, i) => [lily, i])
    .sort(([a], [b]) => (a.row === "back" ? 0 : 1) - (b.row === "back" ? 0 : 1))
    .map(([lily, i]) => lilyMarkup(lily, i))
    .join("");


document.querySelector(".opener-hearts").innerHTML = OPENER_HEARTS.map(
  ({ x, y, size, color, delay }) =>
    `<div class="opener-heart" style="--x:${x}; --y:${y}; --s:${size}vmin; --c:${color}; --delay:${delay}s"><div class="opener-heart__shape"></div></div>`
).join("");
