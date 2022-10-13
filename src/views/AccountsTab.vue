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
    :is-open="toastState"
    @didDismiss="toastState=false"
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
       <ion-item  @click="copyAddress(account.address, getToastRef())">
        <p style="font-size:0.7rem">{{ account.address }}</p><ion-icon :icon="copyOutline"></ion-icon>
        </ion-item>
        <ion-item>
        <ion-chip>View Pk</ion-chip>
        <ion-chip @click="deleteAccount(account.address)">Delete</ion-chip>
        <ion-chip @click="editAccount(account.address)">Edit Name</ion-chip>
        </ion-item>
        </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { getAccounts, copyAddress, replaceAccounts } from "@/utils/platform"
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
  IonToast
} from "@ionic/vue";

import { addCircleOutline, copyOutline } from "ionicons/icons";
import router from "@/router";
import type { Account } from '@/extension/types'

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
  IonToast
  },
  setup () {
    const accounts = ref({}) as Ref<Account[]>
    const loading = ref(true)
    const toastState = ref(false)

    const getToastRef = () => toastState
    
    const loadData = () => {
      const pAccounts = getAccounts()
      Promise.all([pAccounts]).then(( res )  => {
        accounts.value = res[0]
        loading.value = false
      })
    }

    const deleteAccount = async (address: string) => {
        loading.value = true
        const findIndex = accounts.value.findIndex(a => a.address === address)
        if (findIndex !== -1) {
          accounts.value.splice(findIndex, 1)
        }
        await replaceAccounts([...accounts.value])
        loading.value = false
    }

    const editAccount = (address: string) => {
      router.push(`add-account/edit/${address}`)
    }

    const goToAddAccount = () => {
      router.push("/tabs/add-account");
    };

    onIonViewWillEnter(() => {
        loadData()
      })

      return {
        accounts,
        addCircleOutline,
        copyOutline,
        toastState,
        copyAddress,
        getToastRef,
        deleteAccount,
        editAccount,
        loading,
        goToAddAccount
      }

  }
});
</script>
