<template>
  <svg class="game">

  </svg>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { LogItem, GameState } from 'take6-engine';
import { EventEmitter } from 'events';

@Component({
  created (this: Game) {
    this.emitter.on("addLog", this.addLog.bind(this));
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

svg.game {
  background-color: #444;
}

</style>
