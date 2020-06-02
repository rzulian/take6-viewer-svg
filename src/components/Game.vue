<template>
  <div class="game">
    <svg viewBox="-350 -250 690 500" id="scene">
      <defs>
        <filter id="shadow">
          <feGaussianBlur stdDeviation="0.5 0.5" result="shadow"/>
          <feOffset dx="1" dy="1"/>
        </filter>
      </defs>

      <!-- Players -->
      <PlayerLabel :player="G.players[player || 0]" :playerIndex=player :main=true :points=G.players[player||0].points transform="translate(0, 210)" v-if="G" />
      <PlaceHolder :player="player || 0" transform="translate(-220, 170)" :playerTurn="canPlayerMove(player||0)" :enabled="canPlayerMove(player||0) && !G.players[player].facedownCard" v-if="G" @cardDrop="onCardDrop" />

      <template v-for="(player, i) in otherPlayers">
        <PlayerLabel :player="G.players[player]" :playerIndex=player :points=G.players[player].points :transform="`translate(${i <= 5 ? 173 + 115 * (i % 2) : -300}, ${i <= 5 ? -218 + 110 * Math.floor(i /2) : -218 + 110 * (i - 6)})`" :key="'label-'+player" />
        <PlaceHolder :player="player" :playerTurn="canPlayerMove(player)" :key="'placehold-player-' + player" :transform="`translate(${i <= 5 ? 173 + 115 * (i % 2) : -300}, ${i <= 5 ? -163 + 110 * Math.floor(i /2) : -163 + 110 * (i - 6)})`" />
      </template>

      <!-- Board -->
      <template v-for="row in 4">
        <template v-for="rowPos in 6">
          <PlaceHolder :key="`board-${row-1}-${rowPos-1}`" :row=row-1 :rowPos=rowPos-1 :danger="rowPos===6" :transform="`translate(${-203 + (rowPos-1) * 55}, ${((row - 1) - 1.5) * 80 - 75})`" />
        </template>
      </template>

      <!-- All the cards -->
      <Card v-for="(card, i) in handCards" :card="card" :key="card.number || `hand-${i}`" :targetState="handTargetState(handCards.length - 1 - i)" />

      <template v-if="G">
        <template v-for="(player, i) in G.players">
          <Card v-if="player.faceDownCard" :card="player.faceDownCard" :key="player.faceDownCard.number || 'player-'+i" :targetState="facedownTargetState(i)" />
        </template>
      </template>

      <use xlink:href="#dragged"/>
    </svg>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Provide, ProvideReactive } from 'vue-property-decorator';
import { LogItem, GameState, MoveName, Card as ICard, AvailableMoves, GameEventName } from 'take6-engine';
import { EventEmitter } from 'events';
import Card from "./Card.vue";
import PlaceHolder from "./Placeholder.vue";
import PlayerLabel from "./PlayerLabel.vue";
import { range, isEqual } from "lodash";
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
  private state?: GameState;

  @Prop()
  player?: number;

  @Prop()
  emitter!: EventEmitter;

  @Provide()
  ui: UIData = {cards: {}, placeholders: {rows: [], players: []}, waitingAnimations: 0};

  @Provide()
  communicator: EventEmitter = new EventEmitter();

  G?: GameState | null = null;
  _futureState?: GameState;

  addLog ({ log, availableMoves, start }: {log: LogItem[]; start: number; availableMoves: AvailableMoves[]}) {
    console.log("adding log...");

    this._pendingAvailableMoves = null;

    if (start > this._futureState!.log.length) {
      this.emitter.emit("fetchState");
      return;
    }

    if (log.length === 0) {
      this.loadAvailableMoves(availableMoves);
      return;
    }

    // edge case when we do a move and another player just did a move
    if (start === this._futureState!.log.length && start > 0 && isEqual(log[0], this._futureState!.log.slice(-1)[0])) {
      this.emitter.emit("fetchState");
      return;
    }


    this._futureState!.log = [...this._futureState!.log.slice(0, start), ...log];
    this.updateUI();
    this._pendingAvailableMoves = {index: start + log.length, availableMoves: availableMoves};
  }

  @Watch("state", { immediate: true })
  replaceState () {
    this._futureState = this.state;
    this.G = JSON.parse(JSON.stringify(this.state));
  }

  get handCards() {
    return this.G?.players[this.player!]?.hand;
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


  facedownTargetState(player: number) {
    const placeholder = this.ui.placeholders.players[player];

    const elem: SVGGElement = placeholder.$el as SVGGElement;
    const transform = elem.transform.baseVal.getItem(0);

    return {
      x: transform.matrix.e,
      y: transform.matrix.f,
      rotation: 0
    }
  }

  get otherPlayers() {
    if (!this.G) {
      return [];
    }
    return range(0, this.G.players.length).filter(pl => pl !== (this.player || 0));
  }

  canPlayerMove(player: number) {
    return !!this.G?.players[player]?.availableMoves;
  }

  onCardDrop(card: ICard, {player, row, rowPos}: {player?: number, row?: number, rowPos?: number}) {
    console.log("card drop");
    if (this.player === undefined) {
      return;
    }

    if (player !== undefined) {
      const commands = this.G!.players[this.player].availableMoves;

      if (this.G!.log.length !== this._futureState!.log.length) {
        return;
      }

      this.G!.players[this.player].availableMoves = null;

      this.emitter.emit("move", {name: MoveName.ChooseCard, data: card});
    }
  }

  loadAvailableMoves(availableMoves: AvailableMoves[]) {
    for (let i = 0; i < availableMoves.length; i++) {
      this.G!.players[this.player!].availableMoves = availableMoves[i];
    }
  }

  @Watch("ui.waitingAnimations")
  updateUI() {
    if (this.ui.waitingAnimations > 0) {
      return;
    }
    if (this.G!.log.length < this._futureState!.log.length) {
      this.advanceLog();
      return;
    }
  }

  advanceLog() {
    const logItem = this._futureState!.log[this.G!.log.length];
    this.G!.log.push(logItem);

    switch (logItem.type) {
      case "phase": return;
      case "move": {
        const {player, move} = logItem;

        switch (move.name) {
          case MoveName.ChooseCard: {
            this.G!.players[player].faceDownCard = move.data;

            this.delay(200);

            if (player === (this.player || 0)) {
              this.G!.players[this.player!].hand = this.handCards!.filter(card => card.number !== move.data.number);
            } else {
              this.G!.players[player].hand.shift();
            }
            return;
          }
          case MoveName.PlaceCard: {
            const card = this.G!.players[player].faceDownCard!;
            if (move.data.replace) {
              // put new card on 6th spot
              this.G!.rows[move.data.row][5] = card;
              this.G!.players[player].faceDownCard = null;

              // this.queueAnimation(() => {
              //   console.log("delaying before taking row");
              //   this.delay(200);
              // });
              // this.queueAnimation(() => {
              //   console.log("Taking row");
              //   // Then remove all existing cards from row
              //   for (const card of this.state.rows[move.data.row]) {
              //     store.ui!.cards[card.number].destroy();
              //   }
              //   this.state.players[player].points += sumBy(this.state.rows[move.data.row], "points");
                this.G!.rows[move.data.row] = [];

              //   console.log("delaying after taking row");
              //   this.delay(300);
              // });
            }

            // Then move card to correct spot
            // this.queueAnimation(() => {
            //   console.log("attracting card to place on board", card);
              this.G!.rows[move.data.row].push(card);
            // });
            return;
          }
          default: return;
        }
      }
      case "event": {
        const {event} = logItem;
        switch (event.name) {
          case GameEventName.RevealCards: {
            const cards = event.cards;

            for (let player = 0; player < cards.length; player++) {
              this.G!.players[player].faceDownCard = cards[player];
            }

            return;
          }
          case GameEventName.RoundStart: {
            this.G!.rows = event.cards.board.map(card => [card]) as [ICard[], ICard[], ICard[], ICard[]];
            this.G!.players.forEach((pl, i) => pl.hand = event.cards.players[i]);

            return;
          }
          default: return;
        }
      }
    }
  }

  delay(ms: number) {
    this.ui.waitingAnimations += 1;
    setTimeout(() => this.ui.waitingAnimations = Math.max(this.ui.waitingAnimations - 1, 0), ms);
  }

  _pendingAvailableMoves: {index: number, availableMoves: AvailableMoves[]} | null = null;
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
