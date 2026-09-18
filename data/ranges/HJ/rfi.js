const RANGE_HJ_RFI = {
  name: "HJ RFI",
  position: "HJ",
  hands: (() => {
    const AsHands = buildRangeMap({
      main: "A",
      lowest: "2",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const AoHands = buildRangeMap({
      main: "A",
      lowest: "T",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const KsHands = buildRangeMap({
      main: "K",
      lowest: "5",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const KoHands = buildRangeMap({
      main: "K",
      lowest: "T",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const QsHands = buildRangeMap({
      main: "Q",
      lowest: "9",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const QoHands = buildRangeMap({
      main: "Q",
      lowest: "T",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const JoHands = buildRangeMap({
      main: "J",
      lowest: "T",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const pairHands = buildPocketPairRange({
      lowest: "A",
      highest: "7"
    }).reduce((map, hand) => {
      map[hand] = {
        raise: 1
      };
      return map;
    }, {});

    const customRaises = {
      "K4s": { optionalRaise: 1 },
      "Q8s": { optionalRaise: 1 },
      "J9s": { optionalRaise: 1 },
      "T9s": { optionalRaise: 1 },
      "QTo": { optionalRaise: 1 },
      "A9o": { optionalRaise: 1 },
      "A8o": { optionalRaise: 1 },
      "A5o": { optionalRaise: 1 },
      "66": { optionalRaise: 1 },
      "55": { optionalRaise: 1 }
    };

    return {
      ...AsHands,
      ...AoHands,
      ...KsHands,
      ...KoHands,
      ...QsHands,
      ...QoHands,
      ...JoHands,
      ...pairHands,
      ...customRaises
    };
  })()
};
