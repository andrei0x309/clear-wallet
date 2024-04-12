<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Unlock to Proceed</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close" color="primary">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-list v-if="unlockType === 'message'">
          <ion-item>To continue signing the message, unlock wallet.</ion-item>
          <ion-item>Closing will reject sigining the message.</ion-item>
        </ion-list>
        <ion-list v-else-if="unlockType === 'viewPk'">
          <ion-item>To view the PK, unlock wallet.</ion-item>
          <ion-item>Closing will not show the PK.</ion-item>
        </ion-list>
        <ion-list v-else-if="unlockType === 'addAccount'">
          <ion-item>Storage Encrypted, Unlock to add account.</ion-item>
          <ion-item>Closing will not add the account.</ion-item>
        </ion-list>
        <ion-list v-else>
          <ion-item>To continue sending the transaction, unlock wallet.</ion-item>
          <ion-item>Closing will reject sending the transaction.</ion-item>
        </ion-list>
        <ion-item>
          <ion-label>Unlock Password</ion-label>
        </ion-item>
        <ion-list>
          <ion-item>
            <ion-input
              aria-label="password"
              placeholder=""
              class="password-input"
              type="password"
              @ion-input="mpPass = String($event.target.value)"
              fill="solid"
              ref="ionInput"
            ></ion-input>

            <!-- <ion-input
            label="Password"
            label-placement="floating"
            fill="outline"
            placeholder=""
            type="password"
            ref="ionInput"
            @ion-input="mpPass = String($event.target.value)"
          ></ion-input> -->
          </ion-item>
        </ion-list>
      </ion-list>
      <ion-item>
        <ion-button @click="unlock">Confirm</ion-button>
      </ion-item>
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
import { defineComponent, ref, onMounted } from "vue";
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
  IonList,
  IonButtons,
  modalController,
  IonLoading,
} from "@ionic/vue";
import { getAccounts, replaceAccounts, saveSelectedAccount } from "@/utils/platform";
import { decrypt, getCryptoParams } from "@/utils/webCrypto";

export default defineComponent({
  props: {
    unlockType: {
      type: String,
      default: "message",
    },
  },
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
    IonList,
    IonButtons,
    IonLoading,
  },
  setup: () => {
    const mpPass = ref("");
    const loading = ref(false);
    const alertOpen = ref(false);
    const alertMsg = ref("");

    const close = () => {
      return modalController?.dismiss(null, "cancel");
    };

    const unlock = async () => {
      try {
        loading.value = true;
        let accounts = await getAccounts();
        const cryptoParams = await getCryptoParams(mpPass.value);
        const accProm = accounts.map(async (a) => {
          if (a.encPk) {
            a.pk = await decrypt(a.encPk, cryptoParams);
          }
          return a;
        });
        accounts = await Promise.all(accProm);
        await replaceAccounts(accounts);
        await saveSelectedAccount(accounts[0]);
        loading.value = false;
        return modalController?.dismiss(mpPass.value, "confirm");
      } catch {
        loading.value = false;
        alertMsg.value = "Decryption failed, password is not correct, try again.";
        alertOpen.value = true;
        return;
      }
    };

    onMounted(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const el = document?.querySelector(
        ".password-input .native-input"
      ) as HTMLInputElement;
      el?.focus?.();
    });

    return {
      loading,
      unlock,
      mpPass,
      alertOpen,
      alertMsg,
      close,
    };
  },
});
</script>
