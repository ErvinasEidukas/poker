const ranks = [
  "A", "K", "Q", "J", "T",
  "9", "8", "7", "6", "5",
  "4", "3", "2"
];


/* =========================================================
   POSITIONS
========================================================= */

const positions = {

  "6max": [
    "UTG",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB"
  ],

  "9max": [
    "UTG",
    "UTG1",
    "MP",
    "MP1",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB"
  ]

};


/* =========================================================
   POSITION DESCRIPTIONS
========================================================= */

const positionDescriptions = {

  UTG: "Under the gun first-in strategy.",
  UTG1: "UTG+1 first-in strategy.",
  MP: "Middle position first-in strategy.",
  MP1: "MP+1 first-in strategy.",
  HJ: "Hijack first-in strategy.",
  CO: "Cutoff opens first-in against the remaining players.",
  BTN: "Button opens first-in with the widest practical range.",
  SB: "Small blind first-in strategy versus the big blind.",
  BB: "Big blind strategy versus an opponent open."

};


/* =========================================================
   STATE
========================================================= */

const state = {

  format: "6max",

  position: "CO",

  action: "rfi",

  filter: "all",

  selected: "AA"

};


/* =========================================================
   DOM
========================================================= */

const positionList =
  document.getElementById("position-list");

const grid =
  document.getElementById("hand-grid");

const title =
  document.getElementById("range-title");

const subtitle =
  document.getElementById("range-subtitle");

const comboCount =
  document.getElementById("combo-count");

const rangePercent =
  document.getElementById("range-percent");

const raisePercent =
  document.getElementById("raise-percent");

const detailsHand =
  document.getElementById("details-hand");

const detailsTitle =
  document.getElementById("details-title");

const detailsCopy =
  document.getElementById("details-copy");

const detailsFrequency =
  document.getElementById("details-frequency");


/* =========================================================
   HAND NAMES
========================================================= */

function handName(hand) {

  const a = hand[0];
  const b = hand[1];
  const suffix = hand[2] || "";

  if (a === b) {
    return `Pocket ${a}s`;
  }

  if (suffix === "s") {
    return `${a}${b} suited`;
  }

  return `${a}${b} offsuit`;
}


/* =========================================================
   COMBINATION COUNT
========================================================= */

function comboCountFor(hand) {

  if (hand[0] === hand[1]) {
    return 6;
  }

  if (hand.endsWith("s")) {
    return 4;
  }

  return 12;
}


/* =========================================================
   POSITION INDEX
========================================================= */

function positionIndex(position) {

  return positions[state.format].indexOf(position);
}


/* =========================================================
   AVAILABLE ACTIONS
========================================================= */

function getActionsForPosition(position) {

  const index = positionIndex(position);

  const actions = [];

  /*
    BB doesn't have an RFI situation in the
    traditional first-in sense.
  */

  if (position !== "BB") {
    actions.push({
      id: "rfi",
      label: "RFI"
    });
  }

  /*
    ISO can be used from positions facing
    limpers.
  */

  actions.push({
    id: "iso",
    label: "ISO"
  });


  /*
    Add VS situations against positions
    that act before this position.
  */

  if (index > 0) {

    positions[state.format]
      .slice(0, index)
      .forEach(opponent => {

        actions.push({
          id: `vs-${opponent}`,
          label: `vs ${opponent}`
        });

      });

  }


  /*
    BB gets VS situations against every
    position before it.
  */

  return actions;
}


/* =========================================================
   BUILD POSITION SIDEBAR
========================================================= */

function buildPositionList() {

  positionList.innerHTML = "";

  const currentPositions =
    positions[state.format];


  currentPositions.forEach(position => {

    const wrapper =
      document.createElement("div");

    wrapper.className = "position-group";


    /*
      Position button
    */

    const positionButton =
      document.createElement("button");

    positionButton.className =
      "position-button";


    if (state.position === position) {
      positionButton.classList.add("active");
    }


    positionButton.innerHTML = `
      <span>${position}</span>
      <span class="position-arrow">›</span>
    `;


    positionButton.addEventListener(
      "click",
      () => {

        state.position = position;

        const actions =
          getActionsForPosition(position);

        /*
          Default to RFI when available.
        */

        if (
          actions.some(
            action => action.id === "rfi"
          )
        ) {

          state.action = "rfi";

        } else {

          state.action =
            actions[0]?.id || "iso";

        }

        buildPositionList();
        updateRange();

      }
    );


    wrapper.appendChild(positionButton);


    /*
      Action list
    */

    const actionList =
      document.createElement("div");

    actionList.className =
      "position-actions";


    const actions =
      getActionsForPosition(position);


    /*
      Only expand the currently selected
      position.
    */

    if (state.position !== position) {
      actionList.classList.add("collapsed");
    }


    actions.forEach(action => {

      const button =
        document.createElement("button");

      button.className =
        "position-action";


      if (
        state.position === position &&
        state.action === action.id
      ) {

        button.classList.add("active");

      }


      button.textContent =
        action.label;


      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          state.position = position;
          state.action = action.id;

          buildPositionList();
          updateRange();

        }
      );


      actionList.appendChild(button);

    });


    wrapper.appendChild(actionList);

    positionList.appendChild(wrapper);

  });

}


/* =========================================================
   DEMO RANGE DATA
========================================================= */

function getActionAndFreq(hand) {

  const a = ranks.indexOf(hand[0]);
  const b = ranks.indexOf(hand[1]);

  const pair = a === b;
  const suited = hand.endsWith("s");
  const off = hand.endsWith("o");


  /* =======================================================
     RFI
  ======================================================= */

  if (state.action === "rfi") {

    if (pair) {

      return {
        action: "raise",
        freq: 100
      };

    }


    /*
      Earlier positions get tighter ranges.
    */

    const index =
      positionIndex(state.position);


    if (index <= 1) {

      if (
        a === 0 ||
        (a <= 2 && b <= 4)
      ) {

        return {
          action: "raise",
          freq: suited ? 100 : 80
        };

      }


      if (
        suited &&
        a <= 5 &&
        b <= 7
      ) {

        return {
          action: "raise",
          freq: 45
        };

      }

    }


    /*
      CO / BTN / later positions
    */

    else {

      if (
        a === 0 ||
        (a <= 3 && b <= 5)
      ) {

        return {
          action: "raise",
          freq: suited ? 100 : 85
        };

      }


      if (
        suited &&
        a <= 7 &&
        b <= 9
      ) {

        return {
          action: "raise",
          freq: 55
        };

      }


      if (
        suited &&
        a <= 9 &&
        b <= 11
      ) {

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


  /* =======================================================
     ISO
  ======================================================= */

  if (state.action === "iso") {

    if (pair) {

      return {
        action: "raise",
        freq: 100
      };

    }


    if (
      a === 0 ||
      (a <= 3 && b <= 5)
    ) {

      return {
        action: "raise",
        freq: suited ? 100 : 75
      };

    }


    if (
      suited &&
      a <= 7 &&
      b <= 9
    ) {

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


  /* =======================================================
     VS POSITION
  ======================================================= */

  if (state.action.startsWith("vs-")) {

    const opponent =
      state.action.replace("vs-", "");


    const opponentIndex =
      positions[state.format].indexOf(opponent);


    /*
      Default defense model.
      Later positions generally create
      wider defending ranges.
    */

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


    /*
      Strong hands
    */

    if (
      a === 0 ||
      (a <= 3 && b <= 4)
    ) {

      return {
        action: "call",
        freq: 80
      };

    }


    /*
      Suited hands
    */

    if (
      suited &&
      a <= 7 &&
      b <= 9
    ) {

      return {
        action: "call",
        freq: 65
      };

    }


    /*
      Wider defense versus later opens
    */

    if (
      opponentIndex >=
      positions[state.format].length - 3 &&
      suited &&
      a <= 10 &&
      b <= 11
    ) {

      return {
        action: "call",
        freq: 45
      };

    }


    /*
      Some offsuit broadways
    */

    if (
      off &&
      a <= 4 &&
      b <= 4
    ) {

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


/* =========================================================
   BUILD GRID
========================================================= */

function buildGrid() {

  grid.innerHTML = "";


  ranks.forEach((r1, row) => {

    ranks.forEach((r2, col) => {

      let hand;


      if (row === col) {

        hand = r1 + r2;

      }

      else if (row < col) {

        hand = r1 + r2 + "s";

      }

      else {

        hand = r2 + r1 + "o";

      }


      const data =
        getActionAndFreq(hand);


      const cell =
        document.createElement("button");


      cell.className =
        `hand ${data.action}`;


      cell.dataset.hand =
        hand;

      cell.dataset.action =
        data.action;

      cell.dataset.freq =
        data.freq;


      cell.innerHTML = `
        <span>${hand}</span>
        <span class="freq">${data.freq}%</span>
      `;


      /*
        Filter
      */

      if (
        state.filter !== "all" &&
        data.action !== state.filter
      ) {

        cell.classList.add(
          "filtered-out"
        );

      }


      /*
        Selected
      */

      if (
        state.selected === hand
      ) {

        cell.classList.add(
          "selected"
        );

      }


      /*
        Tooltip
      */

      cell.title =
        `${handName(hand)} · ` +
        `${data.action.toUpperCase()} ` +
        `${data.freq}%`;


      cell.addEventListener(
        "click",
        () => selectHand(hand)
      );


      grid.appendChild(cell);

    });

  });


  updateStats();

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

  const cells = [
    ...grid.querySelectorAll(".hand")
  ];


  const inRange =
    cells.filter(
      cell =>
        Number(cell.dataset.freq) > 0
    );


  const combos =
    inRange.reduce(
      (sum, cell) => {

        const combosForHand =
          comboCountFor(
            cell.dataset.hand
          );

        const frequency =
          Number(cell.dataset.freq);


        return sum +
          combosForHand *
          frequency /
          100;

      },
      0
    );


  const total = 1326;


  const raiseCells =
    cells.filter(
      cell =>
        cell.dataset.action === "raise"
    );


  const raiseCombos =
    raiseCells.reduce(
      (sum, cell) => {

        const combosForHand =
          comboCountFor(
            cell.dataset.hand
          );

        const frequency =
          Number(cell.dataset.freq);


        return sum +
          combosForHand *
          frequency /
          100;

      },
      0
    );


  comboCount.textContent =
    Math.round(combos);


  rangePercent.textContent =
    `${(combos / total * 100).toFixed(1)}%`;


  raisePercent.textContent =
    `${(raiseCombos / total * 100).toFixed(1)}%`;

}


/* =========================================================
   SELECT HAND
========================================================= */

function selectHand(hand) {

  state.selected = hand;


  const data =
    getActionAndFreq(hand);


  grid
    .querySelectorAll(".hand")
    .forEach(cell => {

      cell.classList.toggle(
        "selected",
        cell.dataset.hand === hand
      );

    });


  detailsHand.textContent =
    hand;


  detailsTitle.textContent =
    handName(hand);


  detailsFrequency.textContent =
    `${data.freq}%`;


  const action =
    data.action.charAt(0).toUpperCase() +
    data.action.slice(1);


  detailsCopy.textContent =
    `${action} ${data.freq}% of the time in this demo range.`;

}


/* =========================================================
   UPDATE RANGE HEADER
========================================================= */

function updateHeader() {

  const position =
    state.position;


  let actionLabel =
    state.action.toUpperCase();


  if (
    state.action.startsWith("vs-")
  ) {

    const opponent =
      state.action.replace(
        "vs-",
        ""
      );

    actionLabel =
      `VS ${opponent}`;

  }


  title.textContent =
    `${position} ${actionLabel}`;


  if (
    state.action === "rfi"
  ) {

    subtitle.textContent =
      positionDescriptions[position];

  }

  else if (
    state.action === "iso"
  ) {

    subtitle.textContent =
      `${position} isolation strategy versus limpers.`;

  }

  else {

    const opponent =
      state.action.replace(
        "vs-",
        ""
      );

    subtitle.textContent =
      `${position} strategy versus a ${opponent} open.`;

  }

}


/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateRange() {

  updateHeader();

  buildGrid();

  selectHand(state.selected);

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        state.filter =
          button.dataset.action;


        document
          .querySelectorAll(".filter")
          .forEach(filterButton => {

            filterButton.classList.toggle(
              "active",
              filterButton === button
            );

          });


        buildGrid();

        selectHand(
          state.selected
        );

      }
    );

  });


/* =========================================================
   FORMAT SELECTOR
========================================================= */

document
  .getElementById("format")
  .addEventListener(
    "change",
    event => {

      state.format =
        event.target.value;


      const availablePositions =
        positions[state.format];


      /*
        Preserve the selected position
        when possible.
      */

      if (
        !availablePositions.includes(
          state.position
        )
      ) {

        state.position =
          availablePositions[
            availablePositions.length - 2
          ];

      }


      /*
        Reset action to RFI when available.
      */

      const actions =
        getActionsForPosition(
          state.position
        );


      if (
        !actions.some(
          action =>
            action.id === state.action
        )
      ) {

        state.action =
          actions[0]?.id || "iso";

      }


      buildPositionList();

      updateRange();

    }
  );


/* =========================================================
   INITIALIZE
========================================================= */

buildPositionList();

updateRange();

selectHand("AA");