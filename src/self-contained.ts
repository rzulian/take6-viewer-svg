import launch from './launch';
import { setup, Move, move as execMove, moveAI, stripSecret } from "take6-engine";
import { cloneDeep } from "lodash";

function launchSelfContained (selector = "#app") {
  const emitter = launch(selector);

  let gameState = setup(2, {});

  gameState.players[1].isAI = true;

  emitter.on("move", (move: Move) => {
    const index = gameState.log.length;
    gameState = execMove(gameState, move, 0);

    while (gameState.players.some(pl => pl.isAI && pl.availableMoves)) {
      gameState = moveAI(gameState, gameState.players.findIndex(pl => pl.isAI && pl.availableMoves));
    }

    emitter.emit("gamelog", cloneDeep({
      start: index,
      log: stripSecret(gameState, 0).log.slice(index),
      availableMoves: stripSecret(gameState, 0).players.map(pl => pl.availableMoves)
    }));
  });

  emitter.emit("state", cloneDeep(gameState));
}

export default launchSelfContained;
