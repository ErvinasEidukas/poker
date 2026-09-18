const RANGE_BTN_RFI = {
  name: "BTN RFI",
  position: "BTN",
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
      lowest: "3",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const KsHands = buildRangeMap({
      main: "K",
      lowest: "2",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const KoHands = buildRangeMap({
      main: "K",
      lowest: "9",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const QsHands = buildRangeMap({
      main: "Q",
      lowest: "4",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const QoHands = buildRangeMap({
      main: "Q",
      lowest: "9",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const JsHands = buildRangeMap({
      main: "J",
      lowest: "7",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const JoHands = buildRangeMap({
      main: "J",
      lowest: "9",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const TsHands = buildRangeMap({
      main: "T",
      lowest: "7",
      style: "suited",
      actions: {
        raise: 1
      }
    });

    const ToHands = buildRangeMap({
      main: "T",
      lowest: "9",
      style: "offsuit",
      actions: {
        raise: 1
      }
    });

    const pairHands = buildPocketPairRange({
      lowest: "A",
      highest: "3"
    }).reduce((map, hand) => {
      map[hand] = {
        raise: 1
      };
      return map;
    }, {});

    const customRaises = {
      "Q3s": { optionalRaise: 1 },
      "J6s": { optionalRaise: 1 },
      "J5s": { optionalRaise: 1 },
      "T6s": { optionalRaise: 1 },
      "86s": { optionalRaise: 1 },
      "54s": { optionalRaise: 1 },
      "K8o": { optionalRaise: 1 },
      "22":  { optionalRaise: 1 },
      "T9o": { raise: 1 },
      "T8s": { raise: 1 },
      "T7s": { raise: 1 },
      "98s": { raise: 1 },
      "97s": { raise: 1 },
      "87s": { raise: 1 },
      "76s": { raise: 1 },
      "65s": { raise: 1 },
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
      ...TsHands,
      ...ToHands,
      ...pairHands,
      ...customRaises
    };
  })()
};
