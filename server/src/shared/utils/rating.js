export const calculateWeightedRating = (count, avg, globalAvg = 3.0, m = 5) => {
  if (!count || count === 0) return 0;
  return (count * avg + m * globalAvg) / (count + m);
};
