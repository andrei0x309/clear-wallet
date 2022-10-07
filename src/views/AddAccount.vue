<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Name</ion-label>
        <ion-input v-model="name"></ion-input>
      </ion-item>
      <ion-item>
      <ion-label>Get Random Name</ion-label>
      <ion-button @click="getRandomName" >Generate</ion-button>
      </ion-item>
      <ion-item>
        <ion-icon style="margin-right: 0.5rem;" @click="paste('pasteRpc')" :icon="clipboardOutline" button /><ion-label>PK</ion-label>
        <ion-input id="pastePk" v-model="pk"></ion-input>
      </ion-item>
      <ion-item>
      <ion-label>Get Random PK</ion-label>
      <ion-button @click="generateRandomPk" >Generate</ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button @click="onAddAccount">Add Account</ion-button>
      </ion-item>
      <ion-alert
      :is-open="alertOpen"
      header="Error"
      :message="alertMsg"
      :buttons="['OK']"
      @didDismiss="alertOpen=false"
    ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonAlert, IonIcon } from "@ionic/vue";
import { ethers } from "ethers"
import { saveSelectedAccount, getAccounts, saveAccount, getRandomPk, smallRandomString, paste } from "@/utils/platform";
import router from "@/router";

import { clipboardOutline } from "ionicons/icons";

export default defineComponent({
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonAlert, IonIcon },
  setup: () => {
    const name = ref('')
    const pk = ref('')
    const alertOpen = ref(false)
    const alertMsg = ref('')

    const resetFields = () => {
      name.value = ''
      pk.value = ''
    }

    const onAddAccount = async () => {
        let p1 = Promise.resolve()
        if(pk.value.length === 64){
            pk.value = `0x${pk.value.trim()}`
        }
        if(pk.value.length !== 66) {
            alertMsg.value = "Provided private key is invalid."
            alertOpen.value = true
            return
        }


        const wallet = new ethers.Wallet(pk.value)
        const accounts = await getAccounts()
        if((accounts.length ?? 0) < 1 ){
            p1 = saveSelectedAccount({
                address: wallet.address,
                name: name.value,
                pk: pk.value,
                encPk: ''
            })
        } else {
          if(accounts.find(account => account.address === wallet.address)){
            alertMsg.value = "Account already exists."
            return alertOpen.value = true
          }
        }
        const p2 = saveAccount({
                address: wallet.address,
                name: name.value,
                pk: pk.value,
                encPk: ''
        })
        await Promise.all([p1, p2])
        router.push('/')
        resetFields()
    }

    const generateRandomPk = () => {
      pk.value = getRandomPk()
    }

    const getRandomName = () => {
      name.value = smallRandomString()
    }

    const onCancel = () => {
        router.push('/')
    }

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
        paste
    }

  }
});
</script>
