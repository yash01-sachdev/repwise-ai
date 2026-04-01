// Formula: (weight × 1.5) + (reps × 1)
// If bodyweight, weight = 0
export function calcScore(weight, reps) {
    const w = weight || 0;
    return (w * 1.5) + (reps * 1);
  }
  
  export function getBestSet(sessions) {
    if (!sessions || sessions.length === 0) return null;
    return sessions.reduce((best, session) => {
      const score = calcScore(session.weight, session.reps);
      const bestScore = calcScore(best.weight, best.reps);
      return score > bestScore ? session : best;
    });
  }
  
  export function getMaxWeight(sessions, exerciseId) {
    const filtered = sessions.filter(s => s.exerciseId === exerciseId);
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map(s => s.weight || 0));
  }