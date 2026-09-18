const RANGE_LH_ISO = {
  name: "LH ISO",
  position: "LH",
  hands: (() => {
    const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    const hands = {};

    for (let i = 0; i < ranks.length; i++) {
      for (let j = i; j < ranks.length; j++) {
        const a = ranks[i];
        const b = ranks[j];
        const isPair = a === b;

        if (isPair) {
          hands[`${a}${b}`] = { raise: 1 };
          continue;
        }

        const suitedKey = `${a}${b}s`;
        const offsuitKey = `${a}${b}o`;

        if ((a === "A" || a === "K" || a === "Q") && (b === "A" || b === "K" || b === "Q" || b === "J" || b === "T")) {
          hands[suitedKey] = { raise: 0.8 };
          hands[offsuitKey] = { raise: 0.75 };
          continue;
        }

        if ((a === "A" || a === "K") && (b === "9" || b === "8" || b === "7")) {
          hands[suitedKey] = { raise: 0.65 };
          hands[offsuitKey] = { raise: 0.6 };
          continue;
        }

        if ((a === "Q" || a === "J") && (b === "9" || b === "8")) {
          hands[suitedKey] = { call: 0.55 };
          hands[offsuitKey] = { call: 0.5 };
          continue;
        }

        if (a === "T" && (b === "9" || b === "8" || b === "7")) {
          hands[suitedKey] = { call: 0.45 };
          hands[offsuitKey] = { call: 0.4 };
          continue;
        }

        hands[suitedKey] = { fold: 0.1 };
        hands[offsuitKey] = { fold: 0.1 };
      }
    }

    return hands;
  })()
};
