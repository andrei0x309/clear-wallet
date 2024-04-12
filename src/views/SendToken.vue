<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Send Native Token</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Current Network</ion-label>
      </ion-item>
      <template v-if="selectedNetwork?.name">
        <ion-item>
          Name: <b>{{ selectedNetwork.name }}</b>
        </ion-item>
        <ion-item>
          ID: <b>{{ selectedNetwork.chainId }}</b>
        </ion-item>
      </template>
      <hr />
      <ion-item>
        <ion-label>Current Address</ion-label>
      </ion-item>
      <ion-item v-if="selectedAccount?.address">
        <b style="font-size: 0.8rem">{{ selectedAccount?.address }}</b>
      </ion-item>
      <hr />
      <ion-item>
        <ion-label>Current Balance</ion-label>
      </ion-item>
      <ion-item v-if="currentBalance">
        <b>{{ currentBalance.toFixed(8) }}</b>
      </ion-item>
      <hr />

      <ion-item>
        <ion-label>Send To Address:</ion-label>
      </ion-item>

      <ion-item>
        <ion-input
          aria-label="address"
          style="font-size: 0.8rem"
          id="pasteAddress"
          v-model="sendTo"
        ></ion-input>
        <ion-icon
          style="margin-right: 0.5rem"
          @click="paste('pasteAddress')"
          :icon="clipboardOutline"
          button
        />
      </ion-item>

      <ion-item button>
        <ion-button @click="openModalAddContact()">
          Load address from contacts
        </ion-button>
      </ion-item>

      <ion-item>
        <ion-label>Amount (e.g. 1.2):</ion-label>
      </ion-item>

      <ion-item>
        <ion-input
          aria-label="Amount (e.g. 1.2)"
          type="number"
          id="amount"
          v-model="amount"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-button @click="promptTransaction">Prompt Transaction</ion-button>
      </ion-item>

      <ion-alert
        :is-open="alertOpen"
        :header="alertTitle"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="loadingSend ? 0 : 4000"
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
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  IonLoading,
  modalController,
  // IonModal,
  // IonButtons,
  // IonTextarea,
} from "@ionic/vue";
// import { ethers } from "ethers";
import {
  // saveSelectedAccount,
  // getAccounts,
  // saveAccount,
  // getRandomPk,
  // smallRandomString,
  paste,
  getSelectedNetwork,
  getSelectedAccount,
  // getSettings,
} from "@/utils/platform";
// import router from "@/router";
// import UnlockModal from "@/views/UnlockModal.vue";
// import { encrypt, getCryptoParams } from "@/utils/webCrypto";

import { clipboardOutline } from "ionicons/icons";
import type { Network, Account } from "@/extension/types";
import { walletPromptSendTx } from "@/extension/userRequest";
import { isAddress, formatEther, parseEther } from "ethers";
import { getTxCount, getBalance } from "@/utils/wallet";
import SelectedContacts from "./ContactsSelect.vue";

// import { getFromMnemonic } from "@/utils/wallet";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonAlert,
    IonIcon,
    IonLoading,
    // IonModal,
    // IonButtons,
    // IonTextarea,
  },
  setup: () => {
    // const supportedNetworksIds = [1, 3, 4, 5, 42, 56, 97, 137, 80001];

    const name = ref("");
    const sendTo = ref("");
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const alertTitle = ref("Error");
    const loading = ref(true);
    const amount = ref(0);
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const selectedAccount = (ref(null) as unknown) as Ref<Account>;
    const currentBalance = ref(0);
    const loadingSend = ref(false);

    // let accountsProm: Promise<Account[] | undefined>;
    // let settingsProm: Promise<Settings | undefined>;

    // const resetFields = () => {
    //   name.value = "";
    //   pk.value = "";
    // };

    // const openModal = async () => {
    //   const modal = await modalController.create({
    //     component: UnlockModal,
    //     componentProps: {
    //       unlockType: "addAccount",
    //     },
    //   });
    //   modal.present();
    //   const { role, data } = await modal.onWillDismiss();
    //   if (role === "confirm") return data;
    //   return false;
    // };

    onIonViewWillEnter(async () => {
      try {
        selectedNetwork.value = await getSelectedNetwork();
        selectedAccount.value = await getSelectedAccount();
        currentBalance.value = Number(formatEther((await getBalance()).toString()));
      } catch (e) {
        alertOpen.value = true;
        alertMsg.value =
          "Error getting network & balance Internet or RPC or blockchain may be down";
      }
      loading.value = false;
    });

    const promptTransaction = async () => {
      alertTitle.value = "Error";
      if (
        sendTo.value?.toLocaleLowerCase() ===
        selectedAccount.value.address?.toLocaleLowerCase()
      ) {
        alertOpen.value = true;
        alertMsg.value = "Cannot send to self";
        return;
      }

      if (!isAddress(sendTo.value)) {
        alertOpen.value = true;
        alertMsg.value = "Invalid send address";
        return;
      }

      if (amount.value <= 0) {
        alertOpen.value = true;
        alertMsg.value = "Amount must be greater than 0";
        return;
      }

      const value = parseEther(amount.value.toString()).toString();

      if (Number(value) >= Number(parseEther(currentBalance.value.toString()))) {
        alertOpen.value = true;
        alertMsg.value = "Insufficient balance";
        return;
      }

      const nonce = (await getTxCount(selectedAccount.value.address)) + 1;

      loading.value = true;
      loadingSend.value = true;

      const tx = {
        from: selectedAccount.value.address,
        to: sendTo.value,
        value,
        nonce,
        gasLimit: "0x0",
        gasPrice: "0x0",
      };
      const result = (await walletPromptSendTx(tx)) as {
        error?: string;
      };
      if (result?.error) {
        alertOpen.value = true;
        alertMsg.value = "Error sending transaction to chain";
        loading.value = false;
        return;
      } else {
        alertTitle.value = "OK";
        alertOpen.value = true;
        alertMsg.value = "Transaction sent successfully";
      }

      loadingSend.value = false;
      loading.value = false;
    };

    const openModalAddContact = async () => {
      const modal = await modalController.create({
        component: SelectedContacts,
        componentProps: {},
      });

      modal.present();

      const { data, role } = await modal.onWillDismiss();
      if (role === "confirm") {
        sendTo.value = data.address;
      }
    };

    return {
      name,
      sendTo,
      alertOpen,
      alertMsg,
      alertTitle,
      clipboardOutline,
      loadingSend,
      paste,
      loading,
      amount,
      promptTransaction,
      currentBalance,
      selectedAccount,
      selectedNetwork,
      openModalAddContact,
    };
  },
});
</script>
