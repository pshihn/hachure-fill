export type Point = [number, number];
export type Line = [Point, Point];
export type Polygon = Point[];

interface EdgeEntry {
  ymin: number;
  ymax: number;
  x: number;
  islope: number;
}

interface ActiveEdgeEntry {
  s: number;
  edge: EdgeEntry;
}

function rotatePoints(points: Point[], center: Point, degrees: number): void {
  if (points && points.length) {
    const [cx, cy] = center;
    const angle = (Math.PI / 180) * degrees;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const p of points) {
      const [x, y] = p;
      p[0] = ((x - cx) * cos) - ((y - cy) * sin) + cx;
      p[1] = ((x - cx) * sin) + ((y - cy) * cos) + cy;
    }
  }
}

function rotateLines(lines: Line[], center: Point, degrees: number): void {
  const points: Point[] = [];
  lines.forEach((line) => points.push(...line));
  rotatePoints(points, center, degrees);
}

function areSamePoints(p1: Point, p2: Point): boolean {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

export function hachureLines(polygons: Polygon[], hachureGap: number, hachureAngle: number): Line[] {
  const angle = hachureAngle + 90;
  const gap = Math.max(hachureGap, 0.1);

  const rotationCenter: Point = [0, 0];
  if (angle) {
    for (const polygon of polygons) {
      rotatePoints(polygon, rotationCenter, angle);
    }
  }
  const lines = straightHachureLines(polygons, gap);
  if (angle) {
    for (const polygon of polygons) {
      rotatePoints(polygon, rotationCenter, -angle);
    }
    rotateLines(lines, rotationCenter, -angle);
  }
  return lines;
}

function straightHachureLines(polygons: Polygon[], gap: number): Line[] {
  const vertexArray: Point[][] = [];
  for (const polygon of polygons) {
    const vertices = [...polygon];
    if (!areSamePoints(vertices[0], vertices[vertices.length - 1])) {
      vertices.push([vertices[0][0], vertices[0][1]]);
    }
    if (vertices.length > 2) {
      vertexArray.push(vertices);
    }
  }

  const lines: Line[] = [];
  gap = Math.max(gap, 0.1);

  // Create sorted edges table
  const edges: EdgeEntry[] = [];

  for (const vertices of vertexArray) {
    for (let i = 0; i < vertices.length - 1; i++) {
      const p1 = vertices[i];
      const p2 = vertices[i + 1];
      if (p1[1] !== p2[1]) {
        const ymin = Math.min(p1[1], p2[1]);
        edges.push({
          ymin,
          ymax: Math.max(p1[1], p2[1]),
          x: ymin === p1[1] ? p1[0] : p2[0],
          islope: (p2[0] - p1[0]) / (p2[1] - p1[1]),
        });
      }
    }
  }


  edges.sort((e1, e2) => {
    if (e1.ymin < e2.ymin) {
      return -1;
    }
    if (e1.ymin > e2.ymin) {
      return 1;
    }
    if (e1.x < e2.x) {
      return -1;
    }
    if (e1.x > e2.x) {
      return 1;
    }
    if (e1.ymax === e2.ymax) {
      return 0;
    }
    return (e1.ymax - e2.ymax) / Math.abs((e1.ymax - e2.ymax));
  });
  if (!edges.length) {
    return lines;
  }

  // Start scanning
  let activeEdges: ActiveEdgeEntry[] = [];
  let y = edges[0].ymin;
  let iteration = 0;
  while (activeEdges.length || edges.length) {
    if (edges.length) {
      let ix = -1;
      for (let i = 0; i < edges.length; i++) {
        if (edges[i].ymin > y) {
          break;
        }
        ix = i;
      }
      const removed = edges.splice(0, ix + 1);
      removed.forEach((edge) => {
        activeEdges.push({ s: y, edge });
      });
    }
    activeEdges = activeEdges.filter((ae) => {
      if (ae.edge.ymax <= y) {
        return false;
      }
      return true;
    });
    activeEdges.sort((ae1, ae2) => {
      if (ae1.edge.x === ae2.edge.x) {
        return 0;
      }
      return (ae1.edge.x - ae2.edge.x) / Math.abs((ae1.edge.x - ae2.edge.x));
    });

    // fill between the edges
    if (iteration % gap === 0) {
      if (activeEdges.length > 1) {
        for (let i = 0; i < activeEdges.length; i = i + 2) {
          const nexti = i + 1;
          if (nexti >= activeEdges.length) {
            break;
          }
          const ce = activeEdges[i].edge;
          const ne = activeEdges[nexti].edge;
          lines.push([
            [Math.round(ce.x), y],
            [Math.round(ne.x), y],
          ]);
        }
      }
    }
    y++;
    activeEdges.forEach((ae) => {
      ae.edge.x = ae.edge.x + ae.edge.islope;
    });
    iteration++;
  }
  return lines;
}