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
        <ion-list v-for="network of networks" :key="network.chainId">
       <ion-item>
        <ion-avatar v-if="(mainNets as any)[network.chainId].icon" style="margin-right: 1rem; width: 1.8rem; height:1.8rem;">
    <img :alt="network.name" :src="getUrl('assets/chain-icons/' + (mainNets as any)[network.chainId].icon)" />
  </ion-avatar>
       <ion-label>
            {{ network.name }}
        </ion-label>
        <ion-label>
            ID: {{ network.chainId }}
        </ion-label>
       </ion-item>
        <ion-item>
        <router-link :to="`/add-network/edit/${network.chainId}`" ><ion-chip>Edit</ion-chip></router-link>
        <ion-chip @click="deleteNetwork">Delete</ion-chip>
        </ion-item>
        </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { getNetworks, copyAddress, getUrl, replaceNetworks } from "@/utils/platform"
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
  IonAvatar
} from "@ionic/vue";
import { mainNets } from "@/utils/networks"
import { addCircleOutline, copyOutline } from "ionicons/icons";
import type { Networks } from '@/extension/types'

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
  IonAvatar
  },
  setup () {
    const networks = ref({}) as Ref<Networks>
    const loading = ref(true)
    const toastState = ref(false)

    const getToastRef = () => toastState
    
    const loadData = () => {
      const pAccounts = getNetworks()
      Promise.all([pAccounts]).then(( res )  => {
        networks.value = res[0]
        loading.value = false
      })
    }

    const deleteNetwork = async (chainId: number) => {
        loading.value = true
        delete networks.value[chainId]
        await replaceNetworks(networks.value)
        loading.value = false
    }

    onIonViewWillEnter(() => {
        loadData()
      })

      return {
        networks,
        addCircleOutline,
        copyOutline,
        toastState,
        copyAddress,
        getToastRef,
        getUrl,
        mainNets,
        deleteNetwork
      }

  }
});
</script>
