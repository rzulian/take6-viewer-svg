<template>
  <g :class="['placeholder', {enabled, playerTurn, danger, overlapping}]">
    <rect width="50" height="70" x="-25" y="-35" />
  </g>
</template>
<script lang="ts">
import {Vue, Component, Prop, Watch, Inject} from "vue-property-decorator";
import { UIData } from '../types/ui-data';

@Component({
  created(this: PlaceHolder) {
    if (this.row !== undefined) {
      this.ui.placeholders.rows[this.row][this.rowPos!] = this;
    } else if (this.player !== undefined) {
      this.ui.placeholders.players[this.player] = this;
    }
  }
})
export default class PlaceHolder extends Vue {
  @Inject()
  readonly ui!: UIData;

  @Prop({default: false})
  enabled!: boolean;

  @Prop({default: false})
  playerTurn!: boolean;

  @Prop({default: false})
  danger!: boolean;

  @Prop({default: false})
  overlapping!: boolean;

  @Prop()
  row?: number;

  @Prop()
  rowPos?: number;

  @Prop()
  player?: number;
}

</script>
<style lang="scss">
g.placeholder {
  & > rect {
    fill: #00000022;
  }

  &.danger > rect {
    fill: #ff000044;
  }

  &.enabled > rect {
    stroke-width: 2;
    stroke: #ffffff33;
  }

  &.playerTurn > rect {
    stroke-width: 2;
    stroke: #77ff7755;
  }

  &.overlapping > rect {
    fill: #ffffff22;
  }
}
</style>