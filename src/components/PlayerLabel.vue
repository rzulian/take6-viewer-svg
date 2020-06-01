<template>
  <g :transform="`translate(${x}, ${y})`">
  </g>
</template>
<script lang="ts">
import {Vue, Component, Prop, Watch} from "vue-property-decorator";

@Component
export default class PlayerLabel extends Vue {
  @Prop()
  x!: number;

  @Prop()
  y!: number;
}

</script>
