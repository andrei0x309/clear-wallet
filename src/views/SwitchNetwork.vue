<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Switch Network</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-text>Website requested network switch</ion-text>
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
                        v-if="(templateNetworks as any)[selectedNetwork?.chainId]?.icon"
                        style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
                      >
                        <img
                          :alt="selectedNetwork?.name"
                          :src="getUrl('assets/chain-icons/' + (templateNetworks as any)[selectedNetwork?.chainId]?.icon)"
                        />
                      </ion-avatar>
                      <ion-label>Network ID: {{ selectedNetwork?.chainId }}</ion-label>
                    </ion-item>
                  </ion-list>
                </ion-item>
                <ion-item>To</ion-item>
                <ion-item>
                  <ion-list>
                    <ion-item>Network Name: {{ (templateNetworks as any)[selectedNetwork?.chainId]?.name }}</ion-item>
                    <ion-item>
                      <ion-avatar
                        v-if="(templateNetworks as any)[selectedNetwork?.chainId]?.icon"
                        style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
                      >
                        <img
                          :alt="selectedNetwork?.name"
                          :src="getUrl('assets/chain-icons/' + (templateNetworks as any)[selectedNetwork?.chainId]?.icon)"
                        />
                      </ion-avatar>
                      <ion-label>Network ID: {{ (templateNetworks as any)[selectedNetwork?.chainId]?.chainId }}</ion-label>
                    </ion-item>
                  </ion-list>
                </ion-item>
                <ion-item>
                  <ion-button @click="onCancel">Cancel</ion-button>
                  <ion-button v-if="networkCase === 'exists'" @click="onSwitchExists">Switch</ion-button>
                  <ion-button v-else @click="onSwitchTemplates">Add Network and Switch</ion-button>
                </ion-item>
              </ion-list>
            </ion-item>
            <ion-item v-else>
            <ion-list>
                 <ion-item>Request to change to unknown network ID: {{ }}</ion-item>
                 <ion-item>Do you want to go to {{ }}</ion-item>
                 <ion-item>To add it manually.</ion-item>
                 <ion-item>
                  <ion-button @click="onCancel">No</ion-button>
                  <ion-button @click="onSwitchTemplates">Yes</ion-button>
                </ion-item>
            </ion-list>
            </ion-item>
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
        :duration="4000"
        @didDismiss="loading = false"
      />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
const chainListPage = "https://chainlist.org/chain/";

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
  IonAlert,
  IonText,
  IonLoading,
  onIonViewWillEnter,
  IonList,
} from "@ionic/vue";
// import { ethers } from "ethers";
import { hexTostr } from "@/utils/platform";
import { useRoute } from "vue-router";
import { getSelectedNetwork, getNetworks, getUrl } from "@/utils/platform";
import type { Network } from "@/extension/types";
import { mainNets, testNets } from "@/utils/networks";

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
    IonAlert,
    IonText,
    IonLoading,
    IonList,
  },
  setup: () => {
    const route = useRoute();
    const loading = ref(true);
    const rid = (route?.params?.rid as string) ?? "";
    const networkId = ref(hexTostr((route?.params?.param as string) ?? ""));
    const alertOpen = ref(false);
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const alertMsg = ref("");
    const networkCase = ref("");
    let pnetworks;
    const templateNetworks = Object.assign({}, mainNets, testNets) ?? {};

    const onCancel = () => {
      window.close();
    };

    onIonViewWillEnter(async () => {
      pnetworks = getNetworks();
      selectedNetwork.value = await getSelectedNetwork();
      const chainId = parseInt(networkId.value, 16);
      const existingNetworks = await pnetworks;
      if ((chainId ?? "0") in existingNetworks ?? {}) {
        networkCase.value = "exists";
      } else if ((chainId ?? "0") in templateNetworks) {
        networkCase.value = "inTemplates";
      } else {
        networkCase.value = "doesNotExist";
      }
      loading.value = false;
    });

    const onSwitchExists = async () => {
      loading.value = true;

      //   const selectedAccount = await getSelectedAccount();
      //   if ((selectedAccount.pk ?? "").length !== 66) {
      //     const modalResult = await openModal();
      //     if (modalResult) {
      //       approve(rid);
      //     } else {
      //       onCancel();
      //     }
      //   } else {
      //     approve(rid);
      //   }
      //   loading.value = false;
    };
    const onSwitchTemplates = async () => {
      loading.value = true;
    };

    const onSwitchNotExisting = async () => {
        loading.value = true;
    };

    return {
      networkId,
      onCancel,
      alertOpen,
      alertMsg,
      onSwitchExists,
      loading,
      networkCase,
      selectedNetwork,
      templateNetworks,
      getUrl,
      onSwitchTemplates,
      onSwitchNotExisting
    };
  },
});
</script>
