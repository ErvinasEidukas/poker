const ranges = {
  "lh-rfi": RANGE_LH_RFI,
  "lh-iso": RANGE_LH_ISO,
  "hj-rfi": RANGE_HJ_RFI,
  "co-rfi": RANGE_CO_RFI,
  "btn-rfi": RANGE_BTN_RFI
};

function getCurrentRange() {
  if (state.position === "LH" && state.action === "rfi") {
    return ranges["lh-rfi"];
  }

  if (state.position === "LH" && state.action === "iso") {
    return ranges["lh-iso"];
  }

  if (state.position === "HJ" && state.action === "rfi") {
    return ranges["hj-rfi"];
  }

  if (state.position === "CO" && state.action === "rfi") {
    return ranges["co-rfi"];
  }

  if (state.position === "BTN" && state.action === "rfi") {
    return ranges["btn-rfi"];
  }

  return null;
}

const ranks = [
  "A", "K", "Q", "J", "T",
  "9", "8", "7", "6", "5",
  "4", "3", "2"
];

const positions = {
  "6max": ["LH", "HJ", "CO", "BTN", "SB", "BB"],
  "9max": ["UTG-3", "UTG-2", "UTG-1", "LH", "HJ", "CO", "BTN", "SB", "BB"]
};

const positionDescriptions = {
  "UTG-3": "UTG-3 first-in strategy.",
  "UTG-2": "UTG-2 first-in strategy.",
  "UTG-1": "UTG-1 first-in strategy.",
  LH: "Late hijack strategy.",
  HJ: "Hijack first-in strategy.",
  CO: "Cutoff opens first-in against the remaining players.",
  BTN: "Button opens first-in with the widest practical range.",
  SB: "Small blind first-in strategy versus the big blind.",
  BB: "Big blind strategy versus an opponent open."
};

function getSavedState() {
  const cookieName = "poker-range-state=";
  const cookies = document.cookie ? document.cookie.split(";") : [];
  const match = cookies.find(cookie => cookie.trim().startsWith(cookieName));

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(match.trim().slice(cookieName.length)));
  } catch (error) {
    return null;
  }
}

function saveSelectedState() {
  const payload = {
    format: state.format,
    position: state.position,
    action: state.action
  };

  document.cookie = `poker-range-state=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

const savedState = getSavedState();

const state = {
  format: savedState?.format || "6max",
  position: savedState?.position || "LH",
  action: savedState?.action || "rfi",
  filter: "all",
  selected: "AA"
};

const positionList = document.getElementById("position-list");
const grid = document.getElementById("hand-grid");
const title = document.getElementById("range-title");
const subtitle = document.getElementById("range-subtitle");
const comboCount = document.getElementById("combo-count");
const rangePercent = document.getElementById("range-percent");
const raisePercent = document.getElementById("raise-percent");
const detailsHand = document.getElementById("details-hand");
const detailsTitle = document.getElementById("details-title");
const detailsCopy = document.getElementById("details-copy");
const detailsFrequency = document.getElementById("details-frequency");

function handName(hand) {
  const a = hand[0];
  const b = hand[1];
  const suffix = hand[2] || "";

  if (a === b) return `Pocket ${a}s`;
  if (suffix === "s") return `${a}${b} suited`;
  return `${a}${b} offsuit`;
}

function comboCountFor(hand) {
  if (hand[0] === hand[1]) return 6;
  if (hand.endsWith("s")) return 4;
  return 12;
}

function positionIndex(position) {
  return positions[state.format].indexOf(position);
}

function getActionsForPosition(position) {
  const index = positionIndex(position);
  const actions = [];

  if (position !== "BB") {
    actions.push({ id: "rfi", label: "RFI" });
  }

  actions.push({ id: "iso", label: "ISO" });

  if (index > 0) {
    positions[state.format].slice(0, index).forEach(opponent => {
      actions.push({
        id: `vs-${opponent}`,
        label: `vs ${opponent}`
      });
    });
  }

  return actions;
}

function buildPositionList() {
  positionList.innerHTML = "";

  positions[state.format].forEach(position => {
    const wrapper = document.createElement("div");
    wrapper.className = "position-group";

    const positionButton = document.createElement("button");
    positionButton.className = "position-button";

    if (state.position === position) {
      positionButton.classList.add("active");
    }

    positionButton.innerHTML = `
      <span>${position}</span>
      <span class="position-arrow">›</span>
    `;

    positionButton.addEventListener("click", () => {
      state.position = position;

      const actions = getActionsForPosition(position);
      state.action = actions.some(action => action.id === "rfi")
        ? "rfi"
        : actions[0]?.id || "iso";

      saveSelectedState();
      buildPositionList();
      updateRange();
    });

    wrapper.appendChild(positionButton);

    const actionList = document.createElement("div");
    actionList.className = "position-actions";

    if (state.position !== position) {
      actionList.classList.add("collapsed");
    }

    getActionsForPosition(position).forEach(action => {
      const button = document.createElement("button");
      button.className = "position-action";

      if (
        state.position === position &&
        state.action === action.id
      ) {
        button.classList.add("active");
      }

      button.textContent = action.label;

      button.addEventListener("click", event => {
        event.stopPropagation();

        state.position = position;
        state.action = action.id;

        saveSelectedState();
        buildPositionList();
        updateRange();
      });

      actionList.appendChild(button);
    });

    wrapper.appendChild(actionList);
    positionList.appendChild(wrapper);
  });
}

function getRangeAction(hand) {
  const data = currentRange.hands[hand];

  if (!data) {
    return {
      action: "fold",
      freq: 0
    };
  }

  const actions = Object.entries(data);

  if (!actions.length) {
    return {
      action: "fold",
      freq: 0
    };
  }

  const [action, frequency] = actions.reduce(
    (best, current) => current[1] > best[1] ? current : best
  );

  return {
    action,
    freq: frequency * 100
  };
}

function getGeneratedAction(hand) {
  const a = ranks.indexOf(hand[0]);
  const b = ranks.indexOf(hand[1]);
  const pair = a === b;
  const suited = hand.endsWith("s");
  const off = hand.endsWith("o");

  if (state.action === "rfi") {
    if (pair) {
      return {
        action: "raise",
        freq: 100
      };
    }

    const index = positionIndex(state.position);

    if (index <= 1) {
      if (a === 0 || (a <= 2 && b <= 4)) {
        return {
          action: "raise",
          freq: suited ? 100 : 80
        };
      }

      if (suited && a <= 5 && b <= 7) {
        return {
          action: "raise",
          freq: 45
        };
      }
    } else {
      if (a === 0 || (a <= 3 && b <= 5)) {
        return {
          action: "raise",
          freq: suited ? 100 : 85
        };
      }

      if (suited && a <= 7 && b <= 9) {
        return {
          action: "raise",
          freq: 55
        };
      }

      if (suited && a <= 9 && b <= 11) {
        return {
          action: "raise",
          freq: 25
        };
      }
    }

    return {
      action: "fold",
      freq: 0
    };
  }

  if (state.action === "iso") {
    if (pair) {
      return {
        action: "raise",
        freq: 100
      };
    }

    if (a === 0 || (a <= 3 && b <= 5)) {
      return {
        action: "raise",
        freq: suited ? 100 : 75
      };
    }

    if (suited && a <= 7 && b <= 9) {
      return {
        action: "raise",
        freq: 50
      };
    }

    return {
      action: "fold",
      freq: 0
    };
  }

  if (state.action.startsWith("vs-")) {
    const opponent = state.action.replace("vs-", "");
    const opponentIndex = positions[state.format].indexOf(opponent);

    if (pair) {
      if (a <= 3) {
        return {
          action: "raise",
          freq: 55
        };
      }

      return {
        action: "call",
        freq: 100
      };
    }

    if (a === 0 || (a <= 3 && b <= 4)) {
      return {
        action: "call",
        freq: 80
      };
    }

    if (suited && a <= 7 && b <= 9) {
      return {
        action: "call",
        freq: 65
      };
    }

    if (
      opponentIndex >= positions[state.format].length - 3 &&
      suited &&
      a <= 10 &&
      b <= 11
    ) {
      return {
        action: "call",
        freq: 45
      };
    }

    if (off && a <= 4 && b <= 4) {
      return {
        action: "call",
        freq: 35
      };
    }

    return {
      action: "fold",
      freq: 0
    };
  }

  return {
    action: "fold",
    freq: 0
  };
}

function getDominantAction(data) {
  if (!data || !Object.keys(data).length) {
    return {
      action: "fold",
      freq: 0,
      actions: { fold: 0 }
    };
  }

  const [action, frequency] = Object.entries(data).reduce(
    (best, current) => current[1] > best[1] ? current : best
  );

  return {
    action,
    freq: frequency * 100,
    actions: data
  };
}

function formatActionBreakdown(actions) {
  if (!actions || !Object.keys(actions).length) {
    return "fold -> 0%";
  }

  return Object.entries(actions)
    .map(([action, value]) => `${action} -> ${Math.round(value * 100)}%`)
    .join(" ");
}

function getActionAndFreq(hand) {
  const range = getCurrentRange();

  if (range) {
    const data = range.hands[hand];

    if (!data) {
      return {
        action: "fold",
        freq: 0,
        actions: { fold: 0 }
      };
    }

    return getDominantAction(data);
  }

  const generated = getGeneratedAction(hand);
  return {
    ...generated,
    actions: { [generated.action]: generated.freq / 100 }
  };
}

function getActionTone(actions) {
  const palette = {
    raise: { rgb: "220, 53, 69", text: "#ffe5e8" },
    optionalRaise: { rgb: "255, 153, 0", text: "#fff1d6" },
    call: { rgb: "40, 167, 69", text: "#e9f9ee" },
    limp: { rgb: "142, 146, 153", text: "#f3f4f6" },
    "3bet": { rgb: "123, 77, 255", text: "#f1ebff" },
    fold: { rgb: "32, 41, 52", text: "#aeb8c4" }
  };

  const entries = Object.entries(actions || {}).map(([action, value]) => ({
    action,
    value: Number(value) || 0
  }));

  if (!entries.length) {
    const tone = palette.fold;
    return {
      background: `rgba(${tone.rgb}, 0.2)`,
      color: tone.text,
      borderColor: "rgba(255,255,255,0.08)"
    };
  }

  const total = entries.reduce((sum, entry) => sum + entry.value, 0) || 1;

  if (entries.length === 1) {
    const entry = entries[0];
    const tone = palette[entry.action] || palette.fold;
    const alpha = Math.min(1, Math.max(0.18, entry.value / total));

    return {
      background: `rgba(${tone.rgb}, ${alpha})`,
      color: tone.text,
      borderColor: `rgba(255,255,255,${0.08 + alpha * 0.18})`
    };
  }

  let cursor = 0;
  const stops = entries.map(entry => {
    const tone = palette[entry.action] || palette.fold;
    const width = (entry.value / total) * 100;
    const start = cursor;
    const end = cursor + width;
    cursor = end;
    return `rgb(${tone.rgb}) ${start}% ${end}%`;
  });

  return {
    background: `linear-gradient(90deg, ${stops.join(", ")})`,
    color: "#ffffff",
    borderColor: "rgba(255,255,255,0.18)"
  };
}

function buildGrid() {
  grid.innerHTML = "";

  ranks.forEach((r1, row) => {
    ranks.forEach((r2, col) => {
      let hand;

      if (row === col) {
        hand = r1 + r2;
      } else if (row < col) {
        hand = r1 + r2 + "s";
      } else {
        hand = r2 + r1 + "o";
      }

      const data = getActionAndFreq(hand);
      const cell = document.createElement("button");
      const tone = getActionTone(data.actions);

      cell.className = `hand ${data.action}`;
      cell.dataset.hand = hand;
      cell.dataset.action = data.action;
      cell.dataset.freq = data.freq;
      cell.style.background = tone.background;
      cell.style.color = tone.color;
      cell.style.borderColor = tone.borderColor;

      cell.innerHTML = `<span>${hand}</span>`;

      if (
        state.filter !== "all" &&
        data.action !== state.filter
      ) {
        cell.classList.add("filtered-out");
      }

      if (state.selected === hand) {
        cell.classList.add("selected");
      }

      cell.title =
        `${handName(hand)} · ${formatActionBreakdown(data.actions)}`;

      cell.addEventListener("click", () => selectHand(hand));

      grid.appendChild(cell);
    });
  });

  updateStats();
}

function updateStats() {
  const cells = [...grid.querySelectorAll(".hand")];

  const combos = cells.reduce((sum, cell) => {
    const frequency = Number(cell.dataset.freq);
    return sum + comboCountFor(cell.dataset.hand) * frequency / 100;
  }, 0);

  const raiseCombos = cells.reduce((sum, cell) => {
    if (cell.dataset.action !== "raise") return sum;

    const frequency = Number(cell.dataset.freq);
    return sum + comboCountFor(cell.dataset.hand) * frequency / 100;
  }, 0);

  comboCount.textContent = Math.round(combos);
  rangePercent.textContent = `${(combos / 1326 * 100).toFixed(1)}%`;
  raisePercent.textContent = `${(raiseCombos / 1326 * 100).toFixed(1)}%`;
}

function selectHand(hand) {
  state.selected = hand;

  const data = getActionAndFreq(hand);
  const range = getCurrentRange();

  grid.querySelectorAll(".hand").forEach(cell => {
    cell.classList.toggle("selected", cell.dataset.hand === hand);
  });

  detailsHand.textContent = hand;
  detailsTitle.textContent = handName(hand);
  detailsFrequency.textContent = formatActionBreakdown(data.actions);

  const action = data.action.charAt(0).toUpperCase() + data.action.slice(1);

  detailsCopy.textContent = range
    ? `${action} in the ${range.name} ${range.stack || ""}BB range — ${formatActionBreakdown(data.actions)}.`
    : `${action} in this demo range — ${formatActionBreakdown(data.actions)}.`;
}

function updateHeader() {
  const position = state.position;
  const range = getCurrentRange();

  let actionLabel = state.action.toUpperCase();

  if (state.action.startsWith("vs-")) {
    actionLabel = `VS ${state.action.replace("vs-", "")}`;
  }

  title.textContent = `${position} ${actionLabel}`;

  if (range) {
    subtitle.textContent = `${range.name} · ${range.stack}BB`;
    return;
  }

  if (state.action === "rfi") {
    subtitle.textContent = positionDescriptions[position];
    return;
  }

  if (state.action === "iso") {
    subtitle.textContent = `${position} isolation strategy versus limpers.`;
    return;
  }

  const opponent = state.action.replace("vs-", "");
  subtitle.textContent = `${position} strategy versus a ${opponent} open.`;
}

function updateRange() {
  updateHeader();
  buildGrid();
  selectHand(state.selected);
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.action;

    document.querySelectorAll(".filter").forEach(filterButton => {
      filterButton.classList.toggle(
        "active",
        filterButton === button
      );
    });

    buildGrid();
    selectHand(state.selected);
  });
});

document.getElementById("format").addEventListener("change", event => {
  state.format = event.target.value;

  const availablePositions = positions[state.format];

  if (!availablePositions.includes(state.position)) {
    state.position =
      availablePositions[availablePositions.length - 2];
  }

  const actions = getActionsForPosition(state.position);

  if (!actions.some(action => action.id === state.action)) {
    state.action = actions[0]?.id || "iso";
  }

  saveSelectedState();
  buildPositionList();
  updateRange();
});

buildPositionList();
updateRange();
selectHand("AA");