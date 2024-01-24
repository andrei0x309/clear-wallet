<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Contract Error</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item
        ><ion-label>Network Name: {{ selectedNetwork?.name }}</ion-label></ion-item
      >
      <ion-item>
        <ion-avatar
          v-if="(mainNets as any)[selectedNetwork?.chainId]?.icon"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="selectedNetwork?.name"
            :src="getUrl('assets/chain-icons/' + (mainNets as any)[selectedNetwork?.chainId]?.icon)"
          />
        </ion-avatar>
        <ion-label>Network ID: {{ selectedNetwork?.chainId }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-label>Transaction was aboreted before being sent</ion-label>
      </ion-item>
      <ion-item>
        <ion-label>Gas Estimation Error due to Contract Error</ion-label>
      </ion-item>
      <ion-item> Contract: {{ contract }} </ion-item>
      <ion-item>
        <ion-label>Error From Contract:</ion-label>
        <ion-textarea
          style="overflow-y: scroll"
          aria-label="Error"
          :rows="10"
          :cols="20"
          :value="error"
          readonly
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Exit</ion-button>
      </ion-item>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonTextarea,
  onIonViewWillEnter,
  IonLoading,
} from "@ionic/vue";
import { useRoute } from "vue-router";
import { getSelectedNetwork, getUrl, hexTostr } from "@/utils/platform";
import type { Network } from "@/extension/types";
import { mainNets } from "@/utils/networks";

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
    IonTextarea,
    IonLoading,
  },
  setup: () => {
    const route = useRoute();
    const error = hexTostr((route.params?.param as string) ?? "");
    const loading = ref(true);
    const contract = (route.params?.contract as string) ?? "";
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;

    const onCancel = () => {
      window.close();
    };

    onIonViewWillEnter(async () => {
      (window as any)?.resizeTo?.(700, 600);
      selectedNetwork.value = await getSelectedNetwork();
      loading.value = false;
    });

    return {
      onCancel,
      contract,
      loading,
      selectedNetwork,
      mainNets,
      getUrl,
      error,
    };
  },
});
</script>
