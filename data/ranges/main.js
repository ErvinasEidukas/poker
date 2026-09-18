const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function normalizeRank(rank) {
  const normalized = String(rank || "").toUpperCase();

  if (!RANKS.includes(normalized)) {
    throw new Error(`Invalid rank: ${rank}. Use values like A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2.`);
  }

  return normalized;
}

function getNextRank(rank) {
  const currentIndex = RANKS.indexOf(normalizeRank(rank));

  if (currentIndex === -1) {
    throw new Error(`Invalid rank: ${rank}`);
  }

  return RANKS[currentIndex + 1] || RANKS[0];
}

function normalizeStyle(style) {
  const value = String(style || "both").toLowerCase();

  if (["suited", "s"].includes(value)) return "suited";
  if (["offsuit", "o"].includes(value)) return "offsuit";
  if (["both", "b", "all"].includes(value)) return "both";

  throw new Error(`Invalid style: ${style}. Use suited, offsuit, or both.`);
}

function getRangeRanks(lowest, highest) {
  const lowRank = normalizeRank(lowest);
  const highRank = normalizeRank(highest || lowRank);
  const firstIndex = RANKS.indexOf(lowRank);
  const secondIndex = RANKS.indexOf(highRank);

  if (firstIndex === -1 || secondIndex === -1) {
    throw new Error("Range bounds are invalid.");
  }

  const start = Math.min(firstIndex, secondIndex);
  const end = Math.max(firstIndex, secondIndex);

  return RANKS.slice(start, end + 1);
}

function buildRange({ main, lowest, highest = main, style = "both" }) {
  const mainRank = normalizeRank(main);
  const normalizedStyle = normalizeStyle(style);
  const secondRanks = getRangeRanks(lowest, highest);
  const hands = [];

  secondRanks.forEach(secondRank => {
    if (secondRank === mainRank) {
      if (normalizedStyle !== "both") {
        return;
      }
      return;
    }

    if (normalizedStyle === "suited") {
      hands.push(`${mainRank}${secondRank}s`);
      return;
    }

    if (normalizedStyle === "offsuit") {
      hands.push(`${mainRank}${secondRank}o`);
      return;
    }

    hands.push(`${mainRank}${secondRank}s`, `${mainRank}${secondRank}o`);
  });

  return hands;
}

function buildPocketPairRange({ main = null, lowest, highest = main || lowest }) {
  const pairLowest = normalizeRank(lowest);
  const pairHighest = normalizeRank(highest || pairLowest);
  const rangeRanks = getRangeRanks(pairLowest, pairHighest);

  if (main) {
    return rangeRanks
      .filter(rank => rank === normalizeRank(main))
      .map(rank => `${rank}${rank}`);
  }

  return rangeRanks.map(rank => `${rank}${rank}`);
}

function buildRangeMap({
  main,
  lowest,
  highest = main,
  style = "both",
  action = "raise",
  value = 1,
  actions = null
}) {
  const hands = buildRange({ main, lowest, highest, style });
  const actionMap = actions && Object.keys(actions).length
    ? actions
    : { [action]: value };

  return hands.reduce((map, hand) => {
    map[hand] = { ...actionMap };
    return map;
  }, {});
}

if (typeof window !== "undefined") {
  window.buildRange = buildRange;
  window.buildRangeMap = buildRangeMap;
  window.buildPocketPairRange = buildPocketPairRange;
}

if (typeof module !== "undefined") {
  module.exports = {
    RANKS,
    buildRange,
    buildRangeMap,
    buildPocketPairRange,
    getNextRank
  };
}
