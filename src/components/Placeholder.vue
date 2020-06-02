<template>
  <g :class="['placeholder', {enabled, playerTurn, danger, overlapping}]">
    <rect width="50" height="70" x="-25" y="-35" />
  </g>
</template>
<script lang="ts">
import {Vue, Component, Prop, Watch, Inject, InjectReactive} from "vue-property-decorator";
import { UIData } from '../types/ui-data';
import { EventEmitter, Listener } from 'events';

@Component({
  created(this: PlaceHolder) {
    if (this.row !== undefined) {
      this.ui.placeholders.rows[this.row] = this.ui.placeholders.rows[this.row] || [];
      this.ui.placeholders.rows[this.row][this.rowPos!] = this;
    } else if (this.player !== undefined) {
      this.ui.placeholders.players[this.player] = this;
    }

    const listener = () => this.updateOverlapping();

    this.communicator.on("draggedPosChanged", listener);
    this.$on("hook:beforeDestroy", () => this.communicator.off("draggedPosChanged", listener));
  }
})
export default class PlaceHolder extends Vue {
  @Inject()
  readonly ui!: UIData;

  @Inject()
  readonly communicator!: EventEmitter;

  @Prop({default: false})
  enabled!: boolean;

  @Prop({default: false})
  playerTurn!: boolean;

  @Prop({default: false})
  danger!: boolean;

  overlapping = false;

  updateOverlapping() {
    console.log("triggered");
    if (!this.enabled || !this.ui.dragged) {
      this.overlapping = false;
      return;
    }

    console.log((this.ui.dragged as any).currentX);

    const rect1 = this.$el.getBoundingClientRect();
    const rect2 = this.ui.dragged!.$el.getBoundingClientRect();

    this.overlapping = rect1.bottom >= rect2.top && rect1.right >= rect2.left && rect1.top <= rect2.bottom && rect1.left <= rect2.right;
  }

  @Watch("enabled", {immediate: true})
  onEnabledChanged() {
    if (!this.listener) {
      this.listener = () => this.updateOverlapping();
      this.$on("hook:beforeDestroy", () => this.communicator.off("draggedPosChanged", this.listener!));
    }

    if (this.enabled) {
      this.communicator.on("draggedPosChanged", this.listener!);
    } else {
      this.communicator.off("draggedPosChanged", this.listener!);
    }
  }

  listener?: Listener;

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