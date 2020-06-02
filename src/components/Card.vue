<template>
  <g :class="['card', {dragging}]" :id="dragging ? 'dragged' : undefined" ref="card" :transform="`translate(${currentX}, ${currentY}), rotate(${rotation})`">
    <rect x="-20" y="-30" width="40" height="60" :class="['card-body', {facedown}]" />
    <text v-if="!facedown">{{number}}</text>

    <template v-for="i in points">
      <template v-for="j in 2">
        <rect
          class="point"
          width="5"
          height="5"
          fill="red"
          :a="i"
          :key="i+'-'+j"
          :x="(j-1) ? 14 - 2.5 : -14 - 2.5"
          :y="(((i-1) % 2 === 0) ? (- Math.ceil((i-1)/2) * 7.5 - 2.5) : (Math.ceil((i-1)/2) * 7.5) - 2.5)"
          />
      </template>
    </template>
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins, Inject, InjectReactive } from "vue-property-decorator";
import { Card as ICard } from "take6-engine";
import Draggable from './Draggable.vue';
import { UIData } from '../types/ui-data';
import { EventEmitter } from 'events';

@Component({
  created(this: Card) {
    this.$on("draggedTo", (coords: {x: number, y: number}) => {
      [this.currentX, this.currentY] = [coords.x, coords.y];

      this.$nextTick(() => {
        console.log("emitting event", this.communicator);
        this.communicator.emit("draggedPosChanged");
      });
    });

    this.$on("hook:beforeDestroy", () => {
      if (this.card?.number && this.ui.cards[this.card.number] === this) {
        delete this.ui.cards[this.card.number];
      }
    });
  }
})
export default class Card extends Mixins(Draggable) {
  @Prop()
  card!: ICard;

  @Prop({default: () => ({x: 0, y: 0, rotation: 0})})
  targetState!: {
    x: number,
    y: number,
    rotation: number
  };

  @Inject()
  readonly communicator!: EventEmitter;

  @Inject()
  readonly ui!: UIData;

  currentX = 0;
  currentY = 0;

  get facedown() {
    return !this.card || this.card.number === 0;
  }

  get number() {
    return this.card?.number ?? 0;
  }

  get points() {
    return this.card?.points ?? 0;
  }

  get rotation(): number {
    return this.targetState?.rotation ?? 0;
  }

  @Watch("dragging")
  @Watch("targetState", {immediate: true})
  onTargetChanged() {
    console.log("target changed");
    if (this.dragging) {
      return;
    }
    if (this.targetState.x === this.currentX && this.targetState.y === this.currentY) {
      return;
    }

    this.currentX = this.targetState.x;
    this.currentY = this.targetState.y;
  }

  @Watch("card", {immediate: true})
  onCardChanged(newCard?: ICard, oldCard?: ICard) {
    const oldCardNumber = oldCard?.number ?? 0;
    const newCardNumber = newCard?.number ?? 0;

    if (oldCardNumber === newCardNumber) {
      return;
    }

    if (oldCardNumber) {
      delete this.ui.cards[oldCardNumber];
    }

    if (newCardNumber) {
      this.ui.cards[newCardNumber] = this;
    }
  }

  @Watch("dragging")
  onDraggingChanged() {
    console.log("changing dragged")
    if (this.dragging) {
      this.ui.dragged = this;
    } else {
      this.ui.dragged = null;
      this.communicator.emit("draggedPosChanged");
    }
  }
}

</script>
<style lang="scss">

.card {
  &:not(.dragging) {
    transition-property: transform;
    transition-duration: 0.8s;
    transition-timing-function: ease-in-out;
  }

  .card-body {
    stroke: red;
    stroke-width: 1;

    fill: #6666ff;
    cursor: pointer;

    &.facedown {
      fill: #ccc;
    }

    &:hover {
      fill: green;
    }
  }

  &.dragging .card-body {
    fill: green;
  }

  text {
    font-size: 12px;
  }

  .point {
    pointer-events: none;
  }
}

</style>