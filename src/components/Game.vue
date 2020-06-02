<template>
  <div class="game">
    <svg viewBox="-350 -250 700 500" id="scene">
      <defs>
        <filter id="shadow">
          <feGaussianBlur stdDeviation="0.5 0.5" result="shadow"/>
          <feOffset dx="1" dy="1"/>
        </filter>
      </defs>

      <!-- Players -->
      <PlayerLabel :player="state.players[player || 0]" :playerIndex=player :main=true :points=state.players[player||0].points transform="translate(0, 210)" />
      <PlaceHolder :player="player || 0" transform="translate(-220, 170)" />

      <template v-for="(player, i) in otherPlayers">
        <PlayerLabel :player="state.players[player]" :playerIndex=player :points=state.players[player].points :transform="`translate(${i <= 5 ? 173 + 145 * (i % 2) : -317}, ${i <= 5 ? -218 + 110 * Math.floor(i /2) : -218 + 110 * (i - 6)})`" :key="'label-'+player" />
        <PlaceHolder :player="player" :key="'placehold-player-' + player" :transform="`translate(${i <= 5 ? 173 + 145 * (i % 2) : -317}, ${i <= 5 ? -163 + 110 * Math.floor(i /2) : -163 + 110 * (i - 6)})`" />
      </template>

      <!-- Board -->
      <template v-for="row in 4">
        <template v-for="rowPos in 6">
          <PlaceHolder :key="`board-${row-1}-${rowPos-1}`" :row=row-1 :rowPos=rowPos-1 :danger="rowPos===6" :transform="`translate(${-203 + (rowPos-1) * 55}, ${((row - 1) - 1.5) * 80 - 75})`" />
        </template>
      </template>

      <!-- All the cards -->
      <Card v-for="(card, i) in handCards" :card="card" :key="card.number || `hand-${i}`" :targetState="handTargetState(handCards.length - 1 - i)" />

      <use xlink:href="#dragged"/>
    </svg>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Provide, ProvideReactive } from 'vue-property-decorator';
import { LogItem, GameState } from 'take6-engine';
import { EventEmitter } from 'events';
import Card from "./Card.vue";
import PlaceHolder from "./Placeholder.vue";
import PlayerLabel from "./PlayerLabel.vue";
import { range } from "lodash";
import { UIData } from '../types/ui-data';

@Component({
  created (this: Game) {
    this.emitter.on("addLog", this.addLog.bind(this));
  },
  components: {
    Card,
    PlaceHolder,
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
  ui: UIData = {cards: {}, placeholders: {rows: [], players: []}};

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

  get otherPlayers() {
    if (!this.state) {
      return [];
    }
    return range(0, this.state.players.length).filter(pl => pl !== (this.player || 0));
  }
}

</script>
<style lang="scss">

.game {
  height: 100%;
  width: 100%;
  background-color: #444;
}

#scene {
  max-height: 100%;
}

body, html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

text {
  font-family: 'Arial';
  pointer-events: none;
  text-anchor: middle;
  dominant-baseline: central;
}

</style>
