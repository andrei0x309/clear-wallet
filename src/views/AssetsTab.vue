<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Assets</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      1
    </ion-content>
    <ion-content class="ion-padding">
      2
    </ion-content>
    <ion-content class="ion-padding">
      3
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, onIonViewWillEnter } from "@ionic/vue";
import { getSelectedAccount } from "@/utils/platform"
import type { Account } from "@/extension/types"

const yupAssetsApi = 'https://api.yup.io/profile'

export default defineComponent({
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar },
  setup: () => {
    const selectedAccount = ref({}) as Ref<Account>
    const assets = ref({})
    const loading = ref(true)
    const isError = ref(false)
    const noAssets = ref(false)

    onIonViewWillEnter(async () => {
        selectedAccount.value = await getSelectedAccount()
        const req = await fetch(`${yupAssetsApi}/${selectedAccount.value.address}`)
        if(req.ok) {
          assets.value = (await req.json()) ?? {}
          if(!('poaps' in assets.value) && !('tokens' in assets.value) && !('nfts' in assets.value)) {
            noAssets.value = true
          }
        }else {
          isError.value = true
        }
        loading .value = false
      })
  }
});
</script>
