<template>
  <div class="game">
    <svg viewBox="-350 -250 700 500" id="scene">
      <Card :card="{number: 1, points: 1}" />
    </svg>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { LogItem, GameState } from 'take6-engine';
import { EventEmitter } from 'events';
import Card from "./Card.vue";

@Component({
  created (this: Game) {
    this.emitter.on("addLog", this.addLog.bind(this));
  },
  components: {
    Card
  }
})
export default class Game extends Vue {
  @Prop()
  state?: GameState;

  @Prop()
  player?: number;

  @Prop()
  emitter!: EventEmitter;

  _futureState?: GameState;

  addLog ({ log, start }: {log: LogItem[]; start: number}) {

  }

  @Watch("state", { immediate: true })
  replaceState () {
    this._futureState = this.state;
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
