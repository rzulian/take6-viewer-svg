<template>
  <div class="game">
    <svg viewBox="-350 -250 700 500" id="scene">
      <PlayerLabel />
      <Card v-for="(card, i) in handCards" :card="card" :key="card.number || `hand-${i}`" :targetState="handTargetState(handCards.length - 1 - i)" />
    </svg>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Provide } from 'vue-property-decorator';
import { LogItem, GameState } from 'take6-engine';
import { EventEmitter } from 'events';
import Card from "./Card.vue";
import PlayerLabel from "./PlayerLabel.vue";
import { UIData } from '../types/ui-data';

@Component({
  created (this: Game) {
    this.emitter.on("addLog", this.addLog.bind(this));
  },
  components: {
    Card,
    PlayerLabel
  }
})
export default class Game extends Vue {
  @Prop()
  state?: GameState;

  @Prop()
  player?: number;

  @Prop()
  emitter!: EventEmitter;

  @Provide()
  ui: UIData = {cards: {}};

  _futureState?: GameState;

  addLog ({ log, start }: {log: LogItem[]; start: number}) {

  }

  @Watch("state", { immediate: true })
  @Watch("player")
  replaceState () {
    this._futureState = this.state;
  }

  get handCards() {
    return this.state?.players[this.player!]?.hand;
  }

  handTargetState(index: number) {
    const hand = this.handCards!;

    const angle = (index - (hand.length - 1)/2) * 0.03;
    const anglePos = (index - (hand.length - 1)/2) * 0.04;

    return {
      x: - Math.cos(Math.PI / 2 + anglePos) * 800,
      y: - Math.sin(Math.PI / 2 + anglePos) * 800 + 950,
      rotation: angle * 180 / Math.PI
    };
  }
}

</script>
<style lang="scss">

.game {
  height: 100%;
  width: 100%;
  background-color: #444;
}

body, html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

</style>
