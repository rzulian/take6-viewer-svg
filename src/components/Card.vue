<template>
  <g class="card" ref="card">
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
import {Vue, Component, Prop, Watch, Mixins} from "vue-property-decorator";
import {Card as ICard} from "take6-engine";
import Draggable from './Draggable.vue';

@Component
export default class Card extends Mixins(Draggable) {
  @Prop()
  card!: ICard;

  get facedown() {
    return !this.card || this.card.number === 0;
  }

  get number() {
    return this.card?.number ?? 0;
  }

  get points() {
    return this.card?.points ?? 0;
  }
}

</script>
<style lang="scss">

.card {
  .card-body {
    stroke: red;
    stroke-width: 1;

    &:not(.facedown) {
      fill: #6666ff;

      &:hover {
        fill: green;
      }

      cursor: pointer;
    }

    &.facedown {
      fill: #ccc;
    }
  }

  text {
    font-family: sans-serif;
    font-size: 12;
    pointer-events: none;
    text-anchor: middle;
    dominant-baseline: central;
  }

  .point {
    pointer-events: none;
  }
}

</style>