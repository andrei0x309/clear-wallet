<template>
  <ion-list>
    <ion-item v-if="loading">
      <div style="display: flex; flex-direction: column">
        <h3 style="font-size: 1.2rem">Simulation - Asset Changes</h3>
        <ion-item class="ion-no-padding no-inner-border"> loading... </ion-item>
      </div>
    </ion-item>
    <ion-item v-else-if="error">
      <div style="display: flex; flex-direction: column">
        <h3 style="font-size: 1.2rem">Simulation - Asset Changes</h3>
        <ion-item class="ion-no-padding no-inner-border">
          Simulation failed, please be sure your Alchemy key is working.
        </ion-item>
      </div>
    </ion-item>
    <ion-item v-else-if="chainNotSupported">
      <div style="display: flex; flex-direction: column">
        <h3 style="font-size: 1.2rem">Simulation - Asset Changes</h3>
        <ion-item class="ion-no-padding no-inner-border">
          Alchemy API does not support this chain, to run an asset change simulation.
        </ion-item>
      </div>
    </ion-item>
    <ion-item v-else-if="assetChanges.length === 0">
      <div style="display: flex; flex-direction: column">
        <h3 style="font-size: 1.2rem">Simulation - Asset Changes</h3>
        <ion-item class="ion-no-padding no-inner-border">
          No asset changes detected after running the simulation.
        </ion-item>
      </div>
    </ion-item>
    <ion-item v-else>
      <div style="display: flex; flex-direction: column">
        <h3 style="font-size: 1.2rem">Simulation - Asset Changes</h3>
        <ion-item class="ion-no-padding no-inner-border">
          <ion-list>
            <ion-item v-for="(item, index) in assetChanges" :key="index">
              <div style="display: flex; flex-direction: column; margin-bottom: 0.7rem">
                <p class="asset-line"><b>Change Type:</b> {{ item.changeType }}</p>
                <p class="asset-line">
                  <b>Asset Type:</b> {{ item.assetType }}

                  <ion-avatar v-if="item?.logo" class="asset-avatar">
                    <img :alt="item?.symbol" :src="item?.logo" />
                  </ion-avatar>
                </p>
                <p class="asset-line">
                  <b>Amount:</b> {{ Number(item.amount).toFixed(6) }}
                  <span style="opacity: 0.9"> {{ item.symbol }}</span>
                </p>
                <p class="asset-line"><b>From:</b> {{ item.from }}</p>
                <p class="asset-line"><b>To:</b> {{ item.to }}</p>
              </div>
            </ion-item>
          </ion-list>
        </ion-item>
      </div>
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import { IonItem, IonList, IonAvatar } from "@ionic/vue";
import type { AlchemyAssetChange } from "@/extension/types"

defineProps({
  assetChanges: {
    type: Array<AlchemyAssetChange>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: Boolean,
    required: false,
    default: false,
  },
  chainNotSupported: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<style scoped>
.asset-line {
  padding: 0;
  margin: 0.2rem;
  font-size: 0.9rem;
}

.asset-avatar {
  width: 1.1rem;
  height: 1.1rem;
  display: inline-block;
  position: relative;
  top: 0.3rem;
}
</style>
