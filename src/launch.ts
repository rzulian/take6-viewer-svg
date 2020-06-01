import type { Move, GameState } from "take6-engine";
import Vue from "vue";
import { EventEmitter } from 'events';

import Game from './components/Game.vue';

function launch (selector: string) {
  let params: {state: null | GameState; player?: number; emitter: EventEmitter} = { state: null, emitter: new EventEmitter() };

  const app = new Vue({
    render: (h) => h(Game, { props: params }, [])
  }).$mount(selector);

  const item: EventEmitter = new EventEmitter();

  params.emitter.on("move", (move: Move) => item.emit("move", move));

  item.addListener("state", data => {
    console.log("updating state to", data);
    params.state = data;
    app.$forceUpdate();
  });
  item.addListener("state:updated", () => item.emit("fetchLog", { start: params.state?.log.length }));
  item.addListener("player", data => {
    params.player = data.index;
    app.$forceUpdate();
  });
  item.addListener("gamelog", logData => {
    params.emitter.emit("addLog", { start: logData.start, log: logData.data.log, availableMoves: logData.data.availableMoves });
  });

  return item;
}

export default launch;
