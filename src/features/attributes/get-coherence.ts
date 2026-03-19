export const getCoherence = (
  bscan: number[][],
  windowLength: number,
): number[][] => {
  const coherence: number[][] = [];
  for (let i = 0; i < bscan.length; i++) {
    const ascan = bscan[i];
    const ascanNext = bscan[i + 1 >= bscan.length ? bscan.length - 1 : i + 1];
    const ascanPrev = bscan[i - 1 < 0 ? 0 : i - 1];
    coherence.push([]);
    for (let j = 0; j < ascan.length; j++) {
      let upperPart = 0;
      let lowerPart = 0;
      let sum = 0;
      let sumNext = 0;
      let sumPrev = 0;
      for (let k = 0; k < windowLength; k++) {
        let ind = j + k - windowLength / 2;
        if (ind >= ascan.length) {
          ind = ascan.length - 1;
        } else if (ind < 0) {
          ind = 0;
        }
        const value = ascan[ind];
        const valueNext = ascanNext[ind];
        const valuePrev = ascanPrev[ind];
        sum += value * value;
        sumNext += valueNext * valueNext;
        sumPrev += valuePrev * valuePrev;
        upperPart += value * valueNext + value * valuePrev;
      }
      lowerPart = Math.sqrt(sum * sumNext) + Math.sqrt(sum * sumPrev);
      coherence[i][j] = upperPart / lowerPart;
    }
  }
  return coherence;
};

export default getCoherence;
