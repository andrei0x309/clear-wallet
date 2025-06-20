<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Switch Network</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-text>
          <b v-if="website">{{ website }}</b>
          <span v-else>Website</span>
          requested network switch</ion-text
        >
      </ion-item>
      <ion-list>
        <ion-item v-if="networkCase === 'exists' || networkCase === 'inTemplates'">
          <ion-list>
            <ion-item><b>Switch</b></ion-item>
            <ion-item>From:</ion-item>
            <ion-item>
              <ion-list>
                <ion-item>Network Name: {{ selectedNetwork?.name }}</ion-item>
                <ion-item>
                  <ion-avatar
                    v-if="(allTemplateNets as any)[selectedNetwork?.chainId]?.icon"
                    style="margin-right: 1rem; width: 1.6rem; height: 1.6rem"
                  >
                    <img
                      :alt="selectedNetwork?.name"
                      :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[selectedNetwork?.chainId]?.icon)"
                    />
                  </ion-avatar>
                  <ion-label>Network ID: {{ selectedNetwork?.chainId }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-item>
            <ion-item>To</ion-item>
            <ion-item>
              <ion-list>
                <ion-item
                  >Network Name:
                  {{ (existingNetworks as any)[networkId]?.name }}</ion-item
                >
                <ion-item>
                  <ion-avatar
                    v-if="(allTemplateNets as any)[(existingNetworks as any)[networkId]?.chainId]?.icon"
                    style="margin-right: 1rem; width: 1.6rem; height: 1.6rem"
                  >
                    <img
                      :alt="(existingNetworks as any)[networkId]?.name"
                      :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[(existingNetworks as any)[networkId]?.chainId].icon)"
                    />
                  </ion-avatar>
                  <ion-label
                    >Network ID:
                    {{ (existingNetworks as any)[networkId]?.chainId }}</ion-label
                  >
                </ion-item>
              </ion-list>
            </ion-item>
            <ion-item>
              <ion-button @click="onCancel">Cancel</ion-button>
              <ion-button v-if="networkCase === 'exists'" @click="onSwitchExists"
                >Switch</ion-button
              >
              <ion-button v-else @click="onSwitchTemplates"
                >Add Network and Switch</ion-button
              >
            </ion-item>
          </ion-list>
        </ion-item>
        <ion-item v-else>
          <ion-list>
            <ion-item>Request to change to unknown network ID: {{ networkId }}</ion-item>
            <ion-item>Do you want to go to {{ addChainUrl }}</ion-item>
            <ion-item>To add it manually.</ion-item>
            <ion-item>
              <ion-button @click="onCancel">No</ion-button>
              <ion-button @click="onSwitchNotExisting">Yes</ion-button>
            </ion-item>
          </ion-list>
        </ion-item>
        <ion-item>Auto-reject Timer: {{ timerReject }}</ion-item>
      </ion-list>

      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
const chainListPage = "https://chainlist.org/chain/";

import { ref, Ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonAlert,
  IonText,
  IonLoading,
  onIonViewWillEnter,
  IonList,
  IonAvatar,
} from "@ionic/vue";
// import { ethers } from "ethers";
import { useRoute } from "vue-router";
import {
  getSelectedNetwork,
  getNetworks,
  getUrl,
  saveSelectedNetwork,
  saveNetwork,
  openTab,
  numToHexStr,
  hexTostr,
} from "@/utils/platform";
import type { Network, Networks } from "@/extension/types";
import { allTemplateNets } from "@/utils/networks";
import { approve, walletPing } from "@/extension/userRequest";
import { triggerListner } from "@/extension/listners";

const route = useRoute();
const loading = ref(true);
const rid = (route?.params?.rid as string) ?? "";
const website = route?.params?.website ? hexTostr(route?.params?.website as string) : "";
const networkId = ref(String(Number((route?.params?.param as string) ?? "")));
const alertOpen = ref(false);
const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
const alertMsg = ref("");
const networkCase = ref("");
let pnetworks: Promise<Networks>;
const addChainUrl = `${chainListPage}${networkId.value}`;
const timerReject = ref(140);
let interval: any;
const existingNetworks = ref({});

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
  pnetworks = getNetworks();
  selectedNetwork.value = await getSelectedNetwork();
  existingNetworks.value = await pnetworks;
  if ((networkId.value ?? "0") in (existingNetworks?.value ?? {})) {
    networkCase.value = "exists";
  } else if ((networkId.value ?? "0") in allTemplateNets) {
    existingNetworks.value = allTemplateNets;
    networkCase.value = "inTemplates";
  } else {
    networkCase.value = "doesNotExist";
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

const onSwitchExists = async () => {
  loading.value = true;
  const existingNetworks = await pnetworks;
  selectedNetwork.value = existingNetworks[Number(networkId.value)];
  await saveSelectedNetwork(selectedNetwork.value);
  triggerListner("chainChanged", numToHexStr(selectedNetwork.value?.chainId ?? 0));
  approve(rid);
  loading.value = false;
};

const onSwitchTemplates = async () => {
  loading.value = true;
  const nId = Number(networkId.value) as keyof typeof allTemplateNets;
  selectedNetwork.value = allTemplateNets[nId];
  await saveNetwork(allTemplateNets[nId]);
  await saveSelectedNetwork(allTemplateNets[nId]);
  triggerListner("chainChanged", numToHexStr(selectedNetwork.value?.chainId ?? 0));
  approve(rid);
  loading.value = false;
};

const onSwitchNotExisting = async () => {
  loading.value = true;
  openTab(addChainUrl);
  onCancel();
};
</script>
