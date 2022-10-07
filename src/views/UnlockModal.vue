<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button @click="close">Close</ion-button>
              </ion-buttons>
        <ion-title>Unlock to Proceed</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <ion-list>
         <ion-list v-if="unlockType === 'message'">
         <ion-item>To continue signing the message, unlock wallet.</ion-item>
            <ion-item>Closing will reject sigining the message</ion-item>
         </ion-list>
         <ion-list v-else>
            <ion-item>To continue sending the transaction, unlock wallet.</ion-item>
            <ion-item>Closing will reject sending the tranzaction.</ion-item>
         </ion-list>
          <ion-item>
            <ion-label>Unlock Password</ion-label>
          </ion-item> <ion-item>
          <ion-input v-model="mpPass" type="password"></ion-input>
        </ion-item>
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
  IonInput,
  IonButton,
  IonAlert,
  IonList,
  IonButtons,
  modalController,
  IonLoading
} from "@ionic/vue";
import {
  getAccounts,
  replaceAccounts,
  saveSelectedAccount
} from "@/utils/platform";
import { decrypt } from "@/utils/webCrypto"

export default defineComponent({
  props: {
    unlockType: {
        type: String,
        default: 'message'
    }
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
    IonLoading
  },
  setup: () => {
    const mpPass = ref('');
    const loading = ref(false);
    const alertOpen = ref(false);
    const alertMsg = ref('');

    const close = () => {
        return modalController.dismiss(null, 'cancel');
    }

    const unlock = async () => {
        try {
        loading.value = true
        let accounts = await getAccounts()
        const accProm = accounts.map(async a => {
          a.pk = await decrypt(a.encPk, mpPass.value)
          return a
        })
        accounts = await Promise.all(accProm)
        await replaceAccounts(accounts)
        await saveSelectedAccount(accounts[0])
        loading.value = false
        return modalController.dismiss(null, 'confirm');
        } catch {
        loading.value = false
        alertMsg.value = 'Decryption failed, password is not correct, try again.';
        alertOpen.value = true
        return
        }
    }


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
