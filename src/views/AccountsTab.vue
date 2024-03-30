<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <router-link to="/tabs/add-account">
            <ion-button>
              <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
            </ion-button>
          </router-link>
        </ion-buttons>
        <ion-title>Accounts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>
      <ion-item v-if="loading || accounts.length < 1">
        <ion-label>No EVM accounts found</ion-label>
        <ion-button @click="goToAddAccount">Add Account</ion-button>
      </ion-item>
      <ion-list v-for="account of accounts" :key="account.address">
        <ion-item>
          <ion-label>
            {{ account.name }}
          </ion-label>
        </ion-item>
        <ion-item @click="copyText(account.address, getToastRef())">
          <p style="font-size: 0.7rem">{{ account.address }}</p>
          <ion-icon :icon="copyOutline"></ion-icon>
        </ion-item>
        <ion-item>
          <ion-chip @click="viewPk(account.address)">View Pk</ion-chip>
          <ion-chip @click="deleteAccount(account.address)">Delete</ion-chip>
          <ion-chip @click="editAccount(account.address)">Edit Name</ion-chip>
        </ion-item>
      </ion-list>

      <ion-modal :is-open="pkModal" @didDismiss="shownPk = ''">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="pkModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>View PK</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item @click="copyText(shownPk, getToastRef())" button>
            <ion-icon style="margin-right: 0.5rem" :icon="copyOutline" />
            <ion-label button>PK</ion-label>
            <ion-input
              aria-label="pk"
              id="pastePk"
              v-model="shownPk"
              readonly
            ></ion-input>
          </ion-item>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import {
  getAccounts,
  copyText,
  replaceAccounts,
  getSettings,
  clearPk,
  getSelectedAccount,
  saveSelectedAccount,
} from "@/utils/platform";
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
  IonToast,
  modalController,
  IonInput,
  IonModal,
} from "@ionic/vue";

import { addCircleOutline, copyOutline } from "ionicons/icons";
import router from "@/router";
import UnlockModal from "@/views/UnlockModal.vue";

import type { Account, Settings } from "@/extension/types";

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
    IonToast,
    IonInput,
    IonModal,
  },
  setup() {
    const accounts = ref([]) as Ref<Account[]>;
    const loading = ref(true);
    const toastState = ref(false);
    const shownPk = ref("");
    const pkModal = ref(false);
    const settings = ref({}) as Ref<Settings>;

    const getToastRef = () => toastState;

    const loadData = () => {
      const pAccounts = getAccounts();
      const pGetSettings = getSettings();
      Promise.all([pAccounts, pGetSettings]).then((res) => {
        accounts.value = res[0];
        settings.value = res[1];
        loading.value = false;
      });
    };

    const deleteAccount = async (address: string) => {
      loading.value = true;
      if (settings.value.enableStorageEnctyption) {
        const modalR = await openModal("delAcc");
        if (!modalR) {
          return;
        }
      }
      const findIndex = accounts.value.findIndex((a) => a.address === address);
      const selectedAccount = await getSelectedAccount();
      const pArr: Array<Promise<void>> = [];
      if (findIndex !== -1) {
        accounts.value.splice(findIndex, 1);
        pArr.push(replaceAccounts([...accounts.value]));
      }
      if (selectedAccount.address === address) {
        pArr.push(saveSelectedAccount({ name: "", pk: "", encPk: "", address: "" }));
      }
      await Promise.all(pArr);
      loading.value = false;
    };

    const editAccount = (address: string) => {
      router.push(`add-account/edit/${address}`);
    };

    const goToAddAccount = () => {
      router.push("/tabs/add-account");
    };

    onIonViewWillEnter(() => {
      loadData();
    });

    const openModal = async (type: string) => {
      const modal = await modalController.create({
        component: UnlockModal,
        componentProps: {
          unlockType: type,
        },
      });
      modal.present();
      const { role } = await modal.onWillDismiss();
      if (role === "confirm") return true;
      return false;
    };

    const viewPk = async (addr: string) => {
      let pk = "";
      const account = accounts.value.find((a) => a.address === addr);
      if (settings.value.enableStorageEnctyption) {
        if (account?.encPk) {
          const modalR = await openModal("viewPk");
          if (modalR) {
            const account = (await getAccounts()).find((a) => a.address === addr);
            pk = account?.pk ?? "";
          }
        } else {
          pk = account?.pk ?? "";
        }
      } else {
        pk = account?.pk ?? "";
      }
      if (pk) {
        shownPk.value = pk;
        if (settings.value.encryptAfterEveryTx) {
          clearPk();
        }
        pkModal.value = true;
      }
    };

    return {
      accounts,
      addCircleOutline,
      copyOutline,
      toastState,
      copyText,
      getToastRef,
      deleteAccount,
      editAccount,
      loading,
      goToAddAccount,
      viewPk,
      pkModal,
      shownPk,
    };
  },
});
</script>
