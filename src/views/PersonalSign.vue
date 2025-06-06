<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancel">Back</ion-button>
        </ion-buttons>
        <ion-title>Personal Sign</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Get personal signature for custom messages, useful for some websites and
          developers
        </ion-label>
      </ion-item>
      <div
        style="border: 1px solid var(--ion-color-medium-contrast);
      margin: 0.6rem;
  }"
      >
        <ion-item>
          <ion-label>Selected Account: {{ selectedAccount?.name }}</ion-label>
          <ion-button
            @click="
              () => {
                accountsModal = true;
                toastState = false;
              }
            "
            >Select</ion-button
          >
        </ion-item>
        <ion-item button>
          <p style="font-size: 0.7rem; color: coral">{{ selectedAccount?.address }}</p>
        </ion-item>
      </div>

      <ion-item
        button
        @click="
          () => {
            pasteTextArea('textToSig');
          }
        "
      >
        <ion-label>
          <p>
            Text for personal sign
            <ion-icon
              style="
                display: inline-block;
                cursor: pointer;
                margin-right: 0.5rem;
                margin-top: 0.3rem;
                position: relative;
                top: 0.16rem;
              "
              :icon="clipboardOutline"
              button
            />
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-textarea
          style="overflow-y: scroll; width: 100%"
          aria-label="Enter text to sign"
          id="textToSig"
          :rows="4"
          :cols="8"
          v-model="textToSig"
        ></ion-textarea>
      </ion-item>
      <ion-item
        button
        @click="
          () => {
            if (sig.length > 0) {
              copyText(sig, getToastRef());
            } else {
              alertMsg = 'Please get signature first';
              alertOpen = true;
            }
          }
        "
      >
        <ion-label>
          <p>
            Signature
            <ion-icon
              style="
                display: inline-block;
                cursor: pointer;
                margin-right: 0.5rem;
                margin-top: 0.3rem;
                position: relative;
                top: 0.2rem;
              "
              :icon="copyOutline"
            ></ion-icon>
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-textarea
          style="overflow-y: scroll; width: 100%"
          aria-label="Signature"
          :rows="4"
          :cols="8"
          v-model="sig"
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel" color="light">Cancel</ion-button>
        <ion-button @click="getSignature">Get Signature</ion-button>
      </ion-item>

      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="dismissAlert"
      ></ion-alert>

      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>

      <SelectedAccountModal :refs="() => getRefs()" :key="`${loading}-status`" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
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
  IonIcon,
  onIonViewWillEnter,
  IonButtons,
  IonTextarea,
  IonToast,
  modalController,
  IonSearchbar,
} from "@ionic/vue";
import { pasteTextArea, unBlockLockout } from "@/utils/platform";
import router from "@/router";
import type { Account } from "@/extension/types";
import { copyOutline } from "ionicons/icons";
import { clipboardOutline } from "ionicons/icons";
import { getAccounts, getSelectedAccount, copyText } from "@/utils/platform";
import { signMsg } from "@/utils/wallet";
import UnlockModal from "@/views/UnlockModal.vue";
import { setUnlockModalState } from "@/utils/unlockStore";
import SelectedAccountModal from "@/views/modals/SelectAccountModal.vue";

const textToSig = ref("");
const sig = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const exitWallet = ref(false);
const alertHeader = ref("Error");

const loading = ref(false);
const accounts = ref([]) as Ref<Account[]>;
const accountsModal = ref(false) as Ref<boolean>;
const selectedAccount = (ref(null) as unknown) as Ref<Account>;
const toastState = ref(false);

const getToastRef = () => toastState;

const loadData = () => {
  loading.value = true;
  const pAccounts = getAccounts();
  const pSelectedAccount = getSelectedAccount();
  Promise.all([pAccounts, pSelectedAccount]).then((res) => {
    accounts.value = res[0];
    selectedAccount.value = res[1];
    loading.value = false;
  });
};

onIonViewWillEnter(() => {
  loadData();
});

const onCancel = () => {
  router.push("/tabs/home");
};

const openModal = async () => {
  const modal = await modalController.create({
    component: UnlockModal,
    animated: true,
    focusTrap: false,
    backdropDismiss: false,
    componentProps: {
      unlockType: "message",
    },
  });
  await modal.present();
  setUnlockModalState(true);
  const { role } = await modal.onWillDismiss();
  if (role === "confirm") return true;
  setUnlockModalState(false);
  return false;
};

const getSignature = async () => {
  if (!selectedAccount.value) {
    alertMsg.value = "Please select an account";
    alertOpen.value = true;
    return;
  }
  if (!textToSig.value) {
    alertMsg.value = "Please enter text to sign";
    alertOpen.value = true;
    return;
  }

  if ((selectedAccount.value.pk ?? "").length !== 66) {
    const modalResult = await openModal();
    if (modalResult) {
      unBlockLockout();
      loading.value = true;
    } else {
      onCancel();
    }
  } else {
    unBlockLockout();
  }

  try {
    const signature = await signMsg(textToSig.value);
    sig.value = signature;
  } catch (e) {
    console.error(e);
    alertMsg.value = "Error getting signature";
    alertOpen.value = true;
  }
};

const dismissAlert = () => {
  alertOpen.value = false;
  alertHeader.value = "Error";
  exitWallet.value && window?.close();
};

const getRefs = () => {
  return {
    accountsModal,
    selectedAccount,
    accounts,
  };
};
</script>
