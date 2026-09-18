const RANGE_CO_RFI = {
  name: "CO RFI",
  position: "CO",
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
      lowest: "8",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const KsHands = buildRangeMap({
      main: "K",
      lowest: "3",
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
      lowest: "8",
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

    const JsHands = buildRangeMap({
      main: "J",
      lowest: "8",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const JoHands = buildRangeMap({
      main: "J",
      lowest: "T",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const pairHands = buildPocketPairRange({
      lowest: "A",
      highest: "5"
    }).reduce((map, hand) => {
      map[hand] = {
        raise: 1
      };
      return map;
    }, {});

    const customRaises = {
      "K2s": { optionalRaise: 1 },
      "T8s": { optionalRaise: 1 },
      "98s": { optionalRaise: 1 },
      "T9s": { raise: 1 },
      "A7o": { optionalRaise: 1 },
      "A5o": { optionalRaise: 1 },
      "K9o": { optionalRaise: 1 },
      "44": { optionalRaise: 1 }
    };

    return {
      ...AsHands,
      ...AoHands,
      ...KsHands,
      ...KoHands,
      ...QsHands,
      ...QoHands,
      ...JsHands,
      ...JoHands,
      ...pairHands,
      ...customRaises
    };
  })()
};
