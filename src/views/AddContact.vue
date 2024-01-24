<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="!isEdit">Add Contact</ion-title>
        <ion-title v-else>Edit Contact</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input label="Name" labelPlacement="stacked" v-model="localName"></ion-input>
      </ion-item>
      <ion-item>
        <ion-icon
          style="margin-right: 0.5rem"
          @click="paste('address')"
          :icon="clipboardOutline"
          button
        />
        <ion-input
          label="Address"
          labelPlacement="stacked"
          id="address"
          v-model="localAddress"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-button @click="close">Cancel</ion-button>
        <ion-button @click="onAddContact">{{
          isEdit ? "Edit Contact" : "Add Contact"
        }}</ion-button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
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
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  modalController,
} from "@ionic/vue";
import { paste, saveContact } from "@/utils/platform";

import { clipboardOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonButton,
    IonAlert,
    IonIcon,
  },

  props: {
    address: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup: (props) => {
    const localName = ref(props.name);
    const localAddress = ref(props.address);
    const localIsEdit = ref(props.isEdit);
    const alertOpen = ref(false);
    const alertMsg = ref("");

    const resetFields = () => {
      localName.value = "";
      localAddress.value = "";
    };

    onIonViewWillEnter(async () => {});

    const onAddContact = async () => {
      if (!localName.value) {
        alertMsg.value = "Name is required.";
        alertOpen.value = true;
        return;
      }
      if (!localAddress.value) {
        alertMsg.value = "Address is required.";
        alertOpen.value = true;
        return;
      }
      await saveContact({
        name: localName.value,
        address: localAddress.value,
      });
      resetFields();
      modalController.dismiss(
        {
          name: localName.value,
          address: localAddress.value,
        },
        "confirm"
      );
    };

    const close = () => {
      try {
modalController.dismiss(null, "cancel");
} catch {
// ignore 
}
    };

    return {
      localName,
      localAddress,
      onAddContact,
      close,
      alertOpen,
      alertMsg,
      clipboardOutline,
      paste,
      localIsEdit,
    };
  },
});
</script>
