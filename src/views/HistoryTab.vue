<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">Not implemented</ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, onIonViewWillEnter } from "@ionic/vue";
import { getHistory } from '@/utils/platform'
import type { HistoryItem } from '@/extension/types'

export default defineComponent({
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar },
  setup: () => {
    const history = ref([]) as Ref<HistoryItem[]>;
    const loading = ref(true)
    onIonViewWillEnter(async () => {
      history.value = await getHistory()
      loading.value = false
    })
    return {
      history,
      loading
    }
  }
});
</script>
