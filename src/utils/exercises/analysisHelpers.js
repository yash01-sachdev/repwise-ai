import { getKP } from "../poseDetector";

export function smoothValue(previous, next, factor = 0.35) {
  if (typeof next !== "number" || Number.isNaN(next)) {
    return previous;
  }

  if (typeof previous !== "number" || Number.isNaN(previous)) {
    return next;
  }

  return previous + (next - previous) * factor;
}

export function nextStableCount(currentCount, condition) {
  return condition ? currentCount + 1 : 0;
}

export function averagePoints(...points) {
  const visible = points.filter(Boolean);

  if (visible.length === 0) {
    return null;
  }

  const totals = visible.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      score: sum.score + (point.score || 0),
    }),
    { x: 0, y: 0, score: 0 },
  );

  return {
    x: totals.x / visible.length,
    y: totals.y / visible.length,
    score: totals.score / visible.length,
  };
}

export function getDistance(pointA, pointB) {
  if (!pointA || !pointB) {
    return 0;
  }

  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getTorsoLean(topPoint, bottomPoint) {
  if (!topPoint || !bottomPoint) {
    return 0;
  }

  const dx = Math.abs(topPoint.x - bottomPoint.x);
  const dy = Math.abs(bottomPoint.y - topPoint.y) || 1;
  return Math.atan2(dx, dy) * (180 / Math.PI);
}

export function getBestSide(keypoints, names, minScore = 0.35) {
  const pickSide = (side) => {
    const joints = Object.fromEntries(
      names.map((name) => {
        const jointName = `${side}_${name}`;
        return [name, getKP(keypoints, jointName, minScore)];
      }),
    );

    const visibleCount = Object.values(joints).filter(Boolean).length;
    const score = Object.values(joints).reduce((sum, joint) => sum + (joint?.score || 0), 0);

    return {
      side,
      joints,
      visibleCount,
      score,
    };
  };

  const left = pickSide("left");
  const right = pickSide("right");

  if (left.visibleCount !== right.visibleCount) {
    return left.visibleCount > right.visibleCount ? left : right;
  }

  return left.score >= right.score ? left : right;
}
