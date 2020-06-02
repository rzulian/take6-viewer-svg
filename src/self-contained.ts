import launch from './launch';
import { setup, Move, move as execMove, moveAI, stripSecret } from "take6-engine";
import { cloneDeep } from "lodash";

function launchSelfContained (selector = "#app") {
  const emitter = launch(selector);

  let gameState = setup(10, {});

  for (const player of gameState.players.slice(1)) {
    player.isAI = true;
  }

  emitter.on("move", async (move: Move) => {
    const index = gameState.log.length;
    gameState = execMove(gameState, move, 0);

    while (gameState.players.some(pl => pl.isAI && pl.availableMoves)) {
      gameState = moveAI(gameState, gameState.players.findIndex(pl => pl.isAI && pl.availableMoves));
    }

    emitter.emit("gamelog", cloneDeep({
      start: index,
      data: {
        log: stripSecret(gameState, 0).log.slice(index),
        availableMoves: stripSecret(gameState, 0).players.map(pl => pl.availableMoves)
      }
    }));
  });

  emitter.on('fetchSate', () => emitter.emit("state", cloneDeep(stripSecret(gameState, 0))));

  emitter.emit("player", {index: 0});
  emitter.emit("state", cloneDeep(stripSecret(gameState, 0)));
}

export default launchSelfContained;
