// Pure geometry for the IURY aperture / iris mark.
// Generates a pinwheel of curved blades that read as a camera shutter — the
// same swirl as the IURY logo. Used both for the static mark and the animated
// intro shutter.

export const BLADE_COUNT = 12;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export interface BladeOpts {
  cx?: number;
  cy?: number;
  ri?: number; // inner radius (size of the central opening)
  ro?: number; // outer radius
  span?: number; // angular width of a blade in degrees
  swirl?: number; // how much the blade twists — gives the iris its spin
  count?: number;
}

export function bladePaths(o: BladeOpts = {}): string[] {
  const {
    cx = 50,
    cy = 50,
    ri = 4,
    ro = 82,
    span = 44,
    swirl = 24,
    count = BLADE_COUNT,
  } = o;
  const step = 360 / count;
  const paths: string[] = [];
  for (let k = 0; k < count; k++) {
    const a = k * step;
    const b = a + span;
    const [ix, iy] = polar(cx, cy, ri, a);
    const [ox, oy] = polar(cx, cy, ro, a + swirl);
    const [rx, ry] = polar(cx, cy, ro, b + swirl);
    const [ex, ey] = polar(cx, cy, ri, b);
    const [qx, qy] = polar(cx, cy, (ri + ro) / 2, a + swirl * 0.4);
    paths.push(
      `M ${ix.toFixed(2)} ${iy.toFixed(2)} ` +
        `Q ${qx.toFixed(2)} ${qy.toFixed(2)} ${ox.toFixed(2)} ${oy.toFixed(2)} ` +
        `A ${ro} ${ro} 0 0 1 ${rx.toFixed(2)} ${ry.toFixed(2)} ` +
        `L ${ex.toFixed(2)} ${ey.toFixed(2)} Z`
    );
  }
  return paths;
}
