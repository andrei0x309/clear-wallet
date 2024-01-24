<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancel">Close</ion-button>
        </ion-buttons>
        <ion-title v-if="!isEdit">Add Abi</ion-title>
        <ion-title v-else>Edit Abi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          label="Abi Name(*)"
          labelPlacement="stacked"
          v-model="name"
          :readonly="isEdit"
          :style="`${isEdit ? 'opacity: 0.6;' : ''}}`"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-textarea
          label="Content:"
          labelPlacement="stacked"
          style="overflow-y: scroll"
          :rows="10"
          :cols="40"
          v-model="content"
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button @click="onAddAbi">{{ isEdit ? "Edit ABI" : "Add ABI" }}</ion-button>
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
      >
      </ion-loading>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  //   IonLabel,
  IonInput,
  IonButton,
  IonAlert,
  //   IonIcon,
  onIonViewWillEnter,
  //   modalController,
  //   IonModal,
  IonButtons,
  IonLoading,
  IonTextarea,
  modalController,
} from "@ionic/vue";
// import { ethers } from "ethers";
import { paste, setAbi } from "@/utils/platform";
// import { useRoute } from "vue-router";

import { clipboardOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    // IonLabel,
    IonInput,
    IonButton,
    IonAlert,
    // IonIcon,
    // IonModal,
    IonButtons,
    IonTextarea,
    IonLoading,
  },
  props: {
    abi: {
      type: Object as PropType<{ [key: string]: string } | null>,
      default: null,
    },
  },
  setup: (props) => {
    const isEdit = ref(props.abi !== null);
    const name = ref(props.abi?.name ?? "");
    const content = ref(props.abi?.content ?? "");
    const alertOpen = ref(false);

    const alertMsg = ref("");
    // const route = useRoute();
    // const isEdit = route.path.includes("/edit");
    // const paramAddress = route.params.address ?? "";
    const loading = ref(false);

    // let accountsProm: Promise<Account[] | undefined>;
    // let settingsProm: Promise<Settings | undefined>;

    // const resetFields = () => {
    //   name.value = "";
    //   pk.value = "";
    // };

    // const openModal = async () => {
    //   const modal = await modalController.create({
    //     component: UnlockModal,
    //     componentProps: {
    //       unlockType: "addAccount",
    //     },
    //   });
    //   modal.present();
    //   const { role, data } = await modal.onWillDismiss();
    //   if (role === "confirm") return data;
    //   return false;
    // };

    onIonViewWillEnter(async () => {
      //   if (isEdit && paramAddress) {
      //     accountsProm = getAccounts();
      //     settingsProm = getSettings();
      //     const accounts = (await accountsProm) as Account[];
      //     const acc = accounts.find((account) => account.address === paramAddress);
      //     if (acc) {
      //       name.value = acc.name;
      //     }
      //   }
    });

    const onAddAbi = async () => {
      if (!name.value) {
        alertMsg.value = "Please input name.";
        alertOpen.value = true;
        return;
      }
      if (!content.value) {
        alertMsg.value = "Please input content.";
        alertOpen.value = true;
        return;
      }

      try {
        JSON.parse(content.value);
      } catch (e) {
        alertMsg.value = "Invalid content, must be json format.";
        alertOpen.value = true;
        return;
      }
      loading.value = true;
      await setAbi({
        name: name.value,
        content: content.value,
      });

      modalController.dismiss(
        {
          name: name.value,
          content: content.value,
        },
        "confirm"
      );

      loading.value = false;
    };

    const onCancel = () => {
      try {
        modalController.dismiss(null, "cancel");
      } catch {
        // ignore
      }
    };

    return {
      name,
      content,
      onAddAbi,
      onCancel,
      alertOpen,
      alertMsg,
      clipboardOutline,
      paste,
      isEdit,
      loading,
    };
  },
});
</script>
