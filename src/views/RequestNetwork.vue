<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Add and Switch Network</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-text>{{ website }}</ion-text>
      </ion-item>
      <ion-item>
        <ion-text>has requested network you to add and switch to the following</ion-text>
      </ion-item>
      <ion-list>
        <ion-item>
          <ion-list>
            <ion-item><b>NETWORK:</b></ion-item>
            <ion-item>
              <ion-list>
                <ion-item>
                  <ion-label>Name:</ion-label>
                  <ion-input
                    aria-label="Name"
                    style="margin-left: 0.5rem"
                    v-model="name"
                    readonly
                    placeholder="ex: Polygon"
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>ChainId: </ion-label>
                  <ion-input
                    aria-label="ChainId"
                    style="margin-left: 0.5rem"
                    v-model="chainId"
                    readonly
                    placeholder="137"
                  ></ion-input>
                </ion-item>
                <ion-item button>
                  <ion-label>RPC URL: </ion-label>
                  <ion-input
                    aria-label="RPC URL"
                    style="margin-left: 0.5rem"
                    readonly
                    placeholder="https://polygon-mainnet.g.alchemy.com/..."
                    v-model="rpc"
                  ></ion-input>
                </ion-item>
                <ion-item button>
                  <ion-label>Native Token Symbol: </ion-label>
                  <ion-input
                    aria-label="Native Token Symbol"
                    style="margin-left: 0.5rem"
                    readonly
                    placeholder="MATIC"
                    v-model="symbol"
                  ></ion-input>
                </ion-item>
                <ion-item button>
                  <ion-label>Explorer: </ion-label>
                  <ion-input
                    aria-label="Explorer"
                    style="margin-left: 0.5rem"
                    readonly
                    placeholder="https://polygonscan.com"
                    v-model="explorer"
                  ></ion-input>
                </ion-item>
              </ion-list>
            </ion-item>
            <ion-item>
              <ion-button @click="onCancel">Cancel</ion-button>
              <ion-button @click="onAddSwitch">Add Network and Switch</ion-button>
            </ion-item>
          </ion-list>
        </ion-item>
        <ion-item>Auto-reject Timer: {{ timerReject }}</ion-item>
      </ion-list>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonLoading,
  onIonViewWillEnter,
  IonList,
  IonInput,
} from "@ionic/vue";
import { useRoute } from "vue-router";
import { getUrl, saveSelectedNetwork, saveNetwork, hexTostr } from "@/utils/platform";
import type { Network } from "@/extension/types";
import { approve, walletPing } from "@/extension/userRequest";
import { triggerListner } from "@/extension/listners";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonLoading,
    IonList,
    IonInput,
  },
  setup: () => {
    const route = useRoute();
    const loading = ref(true);
    const rid = (route?.params?.rid as string) ?? "";
    const networkData = hexTostr((route.params?.param as string) ?? "");
    const alertOpen = ref(false);
    const timerReject = ref(140);
    let interval: any;
    const website = ref("");
    const name = ref("");
    const chainId = ref("");
    const rpc = ref("");
    const symbol = ref("");
    const explorer = ref("");

    const onCancel = () => {
      window.close();
      if (interval) {
        try {
          clearInterval(interval);
        } catch {
          // ignore
        }
      }
    };

    onIonViewWillEnter(async () => {
      (window as any)?.resizeTo?.(600, 600);
      try {
        if (!networkData) {
          onCancel();
        } else {
          const data = JSON.parse(networkData);
          name.value = data.chainName;
          chainId.value = data.chainId;
          rpc.value = data.rpcUrls[0];
          symbol.value = data.nativeCurrency.symbol;
          explorer.value = data.blockExplorerUrls[0];
          website.value = data.website;
        }
      } catch {
        onCancel();
      }
      loading.value = false;

      interval = setInterval(async () => {
        if (timerReject.value <= 0) {
          onCancel();
          return;
        }

        timerReject.value -= 1;
        walletPing();
      }, 1000) as any;
    });

    const onAddSwitch = async () => {
      loading.value = true;
      const network: Network = {
        chainId: Number(chainId.value),
        name: name.value,
        explorer: explorer.value,
        rpc: rpc.value,
        symbol: symbol.value,
      };
      await saveNetwork(network);
      await saveSelectedNetwork(network);
      triggerListner("chainChanged", chainId.value);
      approve(rid);
      loading.value = false;
    };

    return {
      onCancel,
      alertOpen,
      loading,
      getUrl,
      onAddSwitch,
      timerReject,
      website,
      chainId,
      name,
      rpc,
      explorer,
      symbol,
    };
  },
});
</script>
