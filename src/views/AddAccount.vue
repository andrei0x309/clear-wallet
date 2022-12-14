<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="!isEdit">Add Account</ion-title>
        <ion-title v-else>Edit Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Name</ion-label>
        <ion-input v-model="name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Get Random Name</ion-label>
        <ion-button @click="getRandomName">Generate</ion-button>
      </ion-item>
      <ion-item v-if="!isEdit">
        <ion-icon
          style="margin-right: 0.5rem"
          @click="paste('pastePk')"
          :icon="clipboardOutline"
          button
        />
        <ion-label button>PK</ion-label>
        <ion-input id="pastePk" v-model="pk"></ion-input>
      </ion-item>
      <template v-if="!isEdit">
        <ion-item>
          <ion-label>Get Random PK</ion-label>
          <ion-button @click="generateRandomPk">Generate</ion-button>
        </ion-item>
        <ion-item>
          <ion-button @click="mnemonicModal = true" expand="full"
            >Extarct From A Mnemonic</ion-button
          >
        </ion-item>
      </template>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button @click="onAddAccount">{{
          isEdit ? "Edit Account" : "Add Account"
        }}</ion-button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <ion-modal :is-open="mnemonicModal" @didDismiss="mnemonic = ''">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="mnemonicModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Extract PK from mnemonic</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label>Enter mnemonic</ion-label>
          </ion-item>
          <ion-item>
            <ion-textarea
              style="overflow-y: scroll"
              :rows="10"
              :cols="10"
              v-model="mnemonic"
            ></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label>Enter Index (default: 0)</ion-label>
            <ion-input v-model="mnemonicIndex"></ion-input>
          </ion-item>
          <ion-item>
            <ion-button @click="extractMnemonic">Extract</ion-button>
          </ion-item>
        </ion-content>
      </ion-modal>
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
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  modalController,
  IonModal,
  IonButtons,
  IonTextarea,
} from "@ionic/vue";
import { ethers } from "ethers";
import {
  saveSelectedAccount,
  getAccounts,
  saveAccount,
  getRandomPk,
  smallRandomString,
  paste,
  getSettings,
} from "@/utils/platform";
import router from "@/router";
import { useRoute } from "vue-router";
import type { Account, Settings } from "@/extension/types";
import UnlockModal from "@/views/UnlockModal.vue";
import { encrypt, getCryptoParams } from "@/utils/webCrypto";

import { clipboardOutline } from "ionicons/icons";
import { getFromMemonic } from "@/utils/wallet";

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
    IonModal,
    IonButtons,
    IonTextarea,
  },
  setup: () => {
    const name = ref("");
    const pk = ref("");
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const route = useRoute();
    const isEdit = route.path.includes("/edit");
    const paramAddress = route.params.address ?? "";
    const mnemonicModal = ref(false);
    const mnemonic = ref("");
    const mnemonicIndex = ref(0);

    let accountsProm: Promise<Account[] | undefined>;
    let settingsProm: Promise<Settings | undefined>;

    const resetFields = () => {
      name.value = "";
      pk.value = "";
    };

    const openModal = async () => {
      const modal = await modalController.create({
        component: UnlockModal,
        componentProps: {
          unlockType: "addAccount",
        },
      });
      modal.present();
      const { role, data } = await modal.onWillDismiss();
      if (role === "confirm") return data;
      return false;
    };

    onIonViewWillEnter(async () => {
      if (isEdit && paramAddress) {
        accountsProm = getAccounts();
        settingsProm = getSettings();
        const accounts = (await accountsProm) as Account[];
        const acc = accounts.find((account) => account.address === paramAddress);
        if (acc) {
          name.value = acc.name;
        }
      }
    });

    const onAddAccount = async () => {
      let p1 = Promise.resolve();
      if (pk.value.length === 64) {
        pk.value = `0x${pk.value.trim()}`;
      }
      if (pk.value.length !== 66) {
        alertMsg.value = "Provided private key is invalid.";
        alertOpen.value = true;
        return;
      }

      const wallet = new ethers.Wallet(pk.value);
      if (!accountsProm) {
        accountsProm = getAccounts();
      }
      if (!settingsProm) {
        settingsProm = getSettings();
      }
      const accounts = (await accountsProm) as Account[];
      const settings = (await settingsProm) as Settings;
      if (settings.enableStorageEnctyption) {
        const pass = await openModal();
        if (!pass) {
          alertMsg.value = "Cannot add account with encryption password.";
          alertOpen.value = true;
          return;
        }
        const cryptoParams = await getCryptoParams(pass);
        if ((accounts.length ?? 0) < 1) {
          p1 = saveSelectedAccount({
            address: wallet.address,
            name: name.value,
            pk: pk.value,
            encPk: await encrypt(pk.value, cryptoParams),
          });
        } else {
          if (accounts.find((account) => account.address === wallet.address)) {
            alertMsg.value = "Account already exists.";
            return (alertOpen.value = true);
          }
        }
        const p2 = saveAccount({
          address: wallet.address,
          name: name.value,
          pk: pk.value,
          encPk: await encrypt(pk.value, cryptoParams),
        });
        await Promise.all([p1, p2]);
      } else {
        if ((accounts.length ?? 0) < 1) {
          p1 = saveSelectedAccount({
            address: wallet.address,
            name: name.value,
            pk: pk.value,
            encPk: "",
          });
        } else {
          if (accounts.find((account) => account.address === wallet.address)) {
            alertMsg.value = "Account already exists.";
            return (alertOpen.value = true);
          }
        }
        const p2 = saveAccount({
          address: wallet.address,
          name: name.value,
          pk: pk.value,
          encPk: "",
        });
        await Promise.all([p1, p2]);
      }
      if (isEdit) {
        router.push("/tabs/accounts");
      } else {
        router.push("/tabs/home");
      }
      resetFields();
    };

    const generateRandomPk = () => {
      pk.value = getRandomPk();
    };

    const getRandomName = () => {
      name.value = smallRandomString();
    };

    const onCancel = () => {
      if (isEdit) {
        router.push("/tabs/accounts");
      } else {
        router.push("/tabs/home");
      }
    };

    const extractMnemonic = () => {
      mnemonic.value = mnemonic.value.trim().replace(/\s+/g, " ");
      mnemonicIndex.value = Number(mnemonicIndex.value);

      if (mnemonic.value.split(" ").length !== 12) {
        alertMsg.value = "Invalid mnemonic.";
        alertOpen.value = true;
        return;
      }
      if (mnemonicIndex.value < 0) {
        alertMsg.value = "Invalid index.";
        alertOpen.value = true;
        return;
      }
      pk.value = getFromMemonic(mnemonic.value, mnemonicIndex.value);
      mnemonicModal.value = false;
    };

    return {
      name,
      pk,
      onAddAccount,
      onCancel,
      alertOpen,
      alertMsg,
      generateRandomPk,
      getRandomName,
      clipboardOutline,
      paste,
      isEdit,
      mnemonicModal,
      mnemonic,
      mnemonicIndex,
      extractMnemonic,
    };
  },
});
</script>
