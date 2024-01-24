<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Wallet Error</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Operation Aborted</ion-label>
      </ion-item>
      <ion-item>
        <ion-textarea
          label="Error:"
          labelPlacement="stacked"
          style="overflow-y: scroll"
          :rows="10"
          :cols="20"
          :value="error"
          readonly
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Exit</ion-button>
      </ion-item>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
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
  IonTextarea,
  onIonViewWillEnter,
  IonLoading,
} from "@ionic/vue";
import { useRoute } from "vue-router";
import { hexTostr } from "@/utils/platform";

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
    IonTextarea,
    IonLoading,
  },
  setup: () => {
    const route = useRoute();
    const error = hexTostr((route.params?.param as string) ?? "");
    const loading = ref(true);

    const onCancel = () => {
      window.close();
    };

    onIonViewWillEnter(async () => {
      (window as any)?.resizeTo?.(700, 600);
      loading.value = false;
    });

    return {
      onCancel,
      loading,
      error,
    };
  },
});
</script>
