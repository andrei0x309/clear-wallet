<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <router-link to="/tabs/add-network">
            <ion-button>
              <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
            </ion-button>
          </router-link>
        </ion-buttons>
        <ion-title>Networks</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item v-if="loading || Object.keys(networks).length < 1">
        <ion-label>No EVM Networks found</ion-label>
        <ion-button @click="goToAddNetwork">Add Network</ion-button>
      </ion-item>

      <ion-list v-for="network of networks" :key="network.chainId">
        <ion-item>
          <ion-avatar
            v-if="(allTemplateNets as any)[network.chainId]?.icon"
            style="margin-right: 1rem; width: 1.6rem; height: 1.6rem"
          >
            <img
              :alt="network.name"
              :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[network.chainId].icon)"
            />
          </ion-avatar>
          <ion-label>
            {{ network.name }}
          </ion-label>
          <ion-label> ID: {{ network.chainId }} </ion-label>
        </ion-item>
        <ion-item>
          <ion-chip @click="editNetwork(network.chainId)" button>Edit</ion-chip>
          <ion-chip @click="deleteNetwork(network.chainId)" button>Delete</ion-chip>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { getNetworks, copyText, getUrl, replaceNetworks } from "@/utils/platform";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonButtons,
  IonButton,
  onIonViewWillEnter,
  IonAvatar,
} from "@ionic/vue";
import { allTemplateNets } from "@/utils/networks";
import { addCircleOutline, copyOutline } from "ionicons/icons";
import router from "@/router/index";
import type { Networks } from "@/extension/types";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonButtons,
    IonButton,
    IonAvatar,
  },
  setup() {
    const networks = ref({}) as Ref<Networks>;
    const loading = ref(true);
    const toastState = ref(false);

    const getToastRef = () => toastState;

    const loadData = () => {
      const pAccounts = getNetworks();
      Promise.all([pAccounts]).then((res) => {
        networks.value = res[0];
        loading.value = false;
      });
    };

    const deleteNetwork = async (chainId: number) => {
      loading.value = true;
      delete networks.value[chainId];
      await replaceNetworks(networks.value);
      loading.value = false;
    };

    const editNetwork = (chainId: number) => {
      router.push(`add-network/edit/${chainId}`);
    };

    const goToAddNetwork = () => {
      router.push("/tabs/add-network");
    };

    onIonViewWillEnter(() => {
      loadData();
    });

    return {
      networks,
      addCircleOutline,
      copyOutline,
      toastState,
      copyText,
      getToastRef,
      getUrl,
      allTemplateNets,
      deleteNetwork,
      editNetwork,
      loading,
      goToAddNetwork,
    };
  },
});
</script>
