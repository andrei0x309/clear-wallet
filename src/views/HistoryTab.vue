<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item v-if="history.length === 0">
        You don't have any transaction history
      </ion-item>
      <ion-item v-else>
        <ion-list>
          <ion-item
            style="margin-bottom: 0.3rem; margin-top: 0.3rem"
            v-for="item of history"
            :key="item.txHash"
          >
            <ion-list>
              <ion-item
                ><b style="margin-right: 0.5rem">Date:</b>
                {{ new Date(item.date).toDateString() }}</ion-item
              >
              <ion-item button @click="copyAddress(item.txHash, getToastRef())">
                <p style="font-size: 0.7rem">
                  <b style="margin-right: 0.5rem"
                    ><ion-icon
                      style="margin-right: 0.3rem; display: inline-block"
                      :icon="copyOutline"
                    ></ion-icon
                    >TxHash:</b
                  >{{ item.txHash }}
                </p>
              </ion-item>
              <ion-item v-if="item.chainId"
                ><b style="margin-right: 0.5rem">ChainId:</b> {{ item.chainId }}</ion-item
              >
              <ion-item v-if="item.webiste"
                ><b style="margin-right: 0.5rem">Website:</b> {{ item.webiste }}</ion-item
              >
              <ion-item v-if="item.txUrl"
                ><b style="margin-right: 0.5rem">ViewTx:</b>
                <a href="#" @click="openTab(item.txUrl as string)">LINK</a></ion-item
              >
            </ion-list>
          </ion-item>
          <ion-item>
            <ion-button style="margin-left: 0.5rem" color="warning" @click="onWipeHistory"
              >WIPE HISTORY</ion-button
            >
          </ion-item>
        </ion-list>
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
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  IonItem,
  IonList,
  IonToast,
  IonLoading,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { getHistory, copyAddress, wipeHistory, openTab } from "@/utils/platform";
import type { HistoryItem } from "@/extension/types";

import { copyOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonList,
    IonToast,
    IonLoading,
    IonButton,
    IonIcon,
  },
  setup: () => {
    const history = ref([]) as Ref<HistoryItem[]>;
    const loading = ref(false);
    const toastState = ref(false);
    const getToastRef = () => toastState;

    const loadData = async () => {
      loading.value = true;
      history.value = await getHistory();
      loading.value = false;
    };

    const onWipeHistory = async () => {
      await wipeHistory();
      loadData();
    };

    onIonViewWillEnter(async () => {
      loadData();
    });
    return {
      history,
      loading,
      copyAddress,
      getToastRef,
      toastState,
      copyOutline,
      onWipeHistory,
      openTab,
    };
  },
});
</script>
