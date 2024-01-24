<template>
  <ion-page>
    <ion-content>
      <ion-tabs @ionTabsWillChange="beforeTabChange" @ionTabsDidChange="afterTabChange">
        <ion-router-outlet />
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="home" href="/tabs/home">
            <ion-icon :icon="walletOutline"></ion-icon>
            <ion-label>Wallet</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="accounts" href="/tabs/accounts">
            <ion-icon :icon="personCircle"></ion-icon>
            <ion-label>Accounts</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="networks" href="/tabs/networks">
            <ion-icon :icon="gitNetworkOutline"></ion-icon>
            <ion-label>Networks</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="history" href="/tabs/history">
            <ion-icon :icon="receiptOutline"></ion-icon>
            <ion-label>History</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="assets" href="/tabs/assets">
            <ion-icon :icon="diamondOutline"></ion-icon>
            <ion-label>Assets</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="settings" href="/tabs/settings">
            <ion-icon :icon="cogOutline"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-tab-button>
        </ion-tab-bar>

        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="send-token" href="/tabs/send-token">
            <ion-icon :icon="sendOutline"></ion-icon>
            <ion-label>Send Tokens</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="read-contract" href="/tabs/read-contract">
            <ion-icon :icon="glassesOutline"></ion-icon>
            <ion-label>Read Contract</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="write-contract" href="/tabs/write-contract">
            <ion-icon :icon="pushOutline"></ion-icon>
            <ion-label>Write Contracts</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
} from "@ionic/vue";
import {
  personCircle,
  walletOutline,
  diamondOutline,
  cogOutline,
  receiptOutline,
  gitNetworkOutline,
  sendOutline,
  glassesOutline,
  pushOutline,
} from "ionicons/icons";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
  },
  name: "AppTabs",
  setup() {
    const beforeTabChange = () => {
      // do something before tab change
    };
    const afterTabChange = () => {
      // do something after tab change
    };

    return {
      walletOutline,
      personCircle,
      diamondOutline,
      cogOutline,
      receiptOutline,
      gitNetworkOutline,
      sendOutline,
      beforeTabChange,
      afterTabChange,
      glassesOutline,
      pushOutline,
    };
  },
});
</script>
