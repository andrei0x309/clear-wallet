<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Import/Export</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group :value="'import-export'">
        <ion-accordion value="import-export">
          <ion-item slot="header" color="light">
            <ion-label> Import / Export Accounts</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ImportExport :refs="getRefs" />
          </div>
        </ion-accordion>
      </ion-accordion-group>

      <ion-item class="ion-no-padding export-border">
        <ion-button color="warning" @click="close()">Close Window</ion-button>
      </ion-item>
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        :message="toastMsg"
        :duration="1500"
      ></ion-toast>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, reactive, Ref } from "vue";
import { getSettings, getAccounts } from "@/utils/platform";
import type { ModalPromisePassword, Settings } from "@/extension/types";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonLoading,
  onIonViewWillEnter,
  IonAccordion,
  IonAccordionGroup,
  IonAlert,
  IonToast,
} from "@ionic/vue";

import ImportExport from "@/views/sub-views/accordion/ImportExport.vue";

const loading = ref(true);
const mpModal = ref(false);
const mpPass = ref("");
const mpConfirm = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const toastState = ref(false);
const toastMsg = ref("");
const alertHeader = ref("Error");
const lockOutPeriod = defineModel({ default: 2 as number });

const modalGetPassword = ref(null) as Ref<ModalPromisePassword>;
const noAccounts = ref(true);
const radioTheme = ref("system") as Ref<"system" | "light" | "dark">;

const close = () => {
  window.close();
};

const settings = reactive({
  s: (null as unknown) as Settings,
}) as { s: Settings };

const getRefs = () => {
  return {
    alertMsg,
    alertOpen,
    alertHeader,
    modalGetPassword,
    mpModal,
    settings,
    mpPass,
    mpConfirm,
    noAccounts,
  };
};

onIonViewWillEnter(async () => {
  await Promise.all([
    getSettings().then((storeSettings) => {
      settings.s = storeSettings;
      lockOutPeriod.value = settings.s.lockOutPeriod;
      radioTheme.value = settings.s.theme;
    }),
    getAccounts().then((accounts) => {
      if (accounts.length) {
        noAccounts.value = false;
      }
    }),
  ]);
  loading.value = false;
});
</script>

<style lang="css" scoped>
.helper-label {
  font-size: 0.82rem;
  opacity: 0.85;
  margin: -0.1rem 0 0.6rem 0;
}

.dark .file-input-cls {
  cursor: pointer;
  background-color: #222428;
}
.file-input-cls {
  cursor: pointer;
  background-color: var(--ion-background-color);
}

.dark .export-border {
  border-top: 1px solid #222;
}
.export-border {
  border-top: 1px solid #eee;
}

native-input sc-ion-input-md-h {
  padding-left: 0.4rem;
}
</style>
