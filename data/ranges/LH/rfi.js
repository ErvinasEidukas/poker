const RANGE_LH_RFI = {
  name: "LH RFI",
  position: "LH",
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
      lowest: "8",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const KoHands = buildRangeMap({
      main: "K",
      lowest: "J",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const QsHands = buildRangeMap({
      main: "Q",
      lowest: "T",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const QoHands = buildRangeMap({
      main: "Q",
      lowest: "J",
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
      highest: "8"
    }).reduce((map, hand) => {
      map[hand] = {
        raise: 1
      };
      return map;
    }, {});

    const customRaises = {
      "K7s": { optionalRaise: 1 },
      "K6s": { optionalRaise: 1 },
      "K5s": { optionalRaise: 1 },
      "Q9s": { optionalRaise: 1 },
      "KTo": { optionalRaise: 1 },
      "77": { optionalRaise: 1 }
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
