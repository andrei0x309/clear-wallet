<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sign Message</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Message to Sign</ion-label>
      </ion-item>
      <ion-item>
        <div
          style="white-space: pre-wrap; width: 100%; height: 250px; overflow-y: scroll"
          disabled
        >
          {{ signMsg }}
        </div>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button @click="onSign">Sign</ion-button>
      </ion-item>
      <ion-item>Auto-reject Timer: {{ timerReject }}</ion-item>
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
        :key="`k${loading}`"
        @didDismiss="loading = false"
      />
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
  IonButton,
  IonAlert,
  IonLoading,
  modalController,
  onIonViewWillEnter,
} from "@ionic/vue";
import { approve, walletPing } from "@/extension/userRequest";
import { useRoute } from "vue-router";
import {
  getSelectedAccount,
  unBlockLockout,
  blockLockout,
  hexTostr,
} from "@/utils/platform";
import UnlockModal from "@/views/UnlockModal.vue";

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
    IonLoading,
  },
  setup: () => {
    const route = useRoute();
    const loading = ref(false);
    const rid = (route?.params?.rid as string) ?? "";

    let sigmMsg: string = "";

    try {
      const typeSign = JSON.parse(
        hexTostr(hexTostr((route?.params?.param as string) ?? ""))
      );
      sigmMsg = JSON.stringify(typeSign, null, 2);
    } catch (e) {
      sigmMsg = hexTostr(hexTostr((route?.params?.param as string) ?? ""));
    }

    const signMsg = ref(sigmMsg);
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const timerReject = ref(140);
    let interval: any;

    const onCancel = () => {
      window.close();
      if (interval) {
        try {
          unBlockLockout();
          clearInterval(interval);
        } catch {
          // ignore
        }
      }
    };

    onIonViewWillEnter(async () => {
      blockLockout();
      interval = setInterval(async () => {
        if (timerReject.value <= 0) {
          onCancel();
          return;
        }

        timerReject.value -= 1;
        walletPing();
      }, 1000) as any;
    });

    const openModal = async () => {
      const modal = await modalController.create({
        component: UnlockModal,
        componentProps: {
          unlockType: "message",
        },
      });
      modal.present();
      const { role } = await modal.onWillDismiss();
      if (role === "confirm") return true;
      return false;
    };

    const onSign = async () => {
      loading.value = true;
      if (interval) {
        clearInterval(interval);
      }
      const selectedAccount = await getSelectedAccount();
      loading.value = false;
      if ((selectedAccount.pk ?? "").length !== 66) {
        const modalResult = await openModal();
        if (modalResult) {
          unBlockLockout();
          loading.value = true;
          approve(rid);
        } else {
          onCancel();
        }
      } else {
        unBlockLockout();
        approve(rid);
      }
      loading.value = false;
    };

    return {
      signMsg,
      onCancel,
      alertOpen,
      alertMsg,
      onSign,
      loading,
      timerReject,
    };
  },
});
</script>
