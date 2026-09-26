export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1_000_000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }

  if (num < 1_000_000_000) {
    const millions = num / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }

  const billions = num / 1_000_000_000;
  return billions % 1 === 0 ? `${billions}B` : `${billions.toFixed(1)}B`;
};
