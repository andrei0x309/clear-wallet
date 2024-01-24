<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
        <ion-title>Select Abi</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button expand="block" @click="openModal">Add New ABI</ion-button>

      <ion-radio-group :value="selectedAbi">
        <ion-list-header>
          <ion-label>Saved ABIs</ion-label>
        </ion-list-header>

        <ion-list class="ion-padding" v-for="item of Object.keys(abis ?? {})" :key="item">
          <ion-item>
            <ion-radio
              @click="changeSelected(item)"
              slot="start"
              :value="item"
              :aria-label="item"
            >
              {{ item }}
            </ion-radio>
            <ion-button @click="onEdit(item)">Edit</ion-button>
            <ion-button @click="onDelete(item)">Delete</ion-button>
          </ion-item>
        </ion-list>
      </ion-radio-group>

      <ion-list v-if="!!!Object.keys(abis ?? {}).length">
        <ion-item class="ion-padding">
          <ion-label>No Abis found, please add at least one</ion-label>
        </ion-item>
      </ion-list>

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

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  modalController,
  IonRadio,
  IonButtons,
  IonListHeader,
  IonRadioGroup,
  IonLabel,
  IonLoading,
} from "@ionic/vue";
import AbiAdd from "./AbiAdd.vue";
import { ref, onMounted, Ref } from "vue";
import {
  getAllAbis,
  setAbis,
  // removeAllAbis
} from "@/utils/platform";

const loading = ref(false);
const abis = ref() as Ref<{ [key: string]: string }>;
const selectedAbi = ref("");

onMounted(async () => {
  loading.value = true;
  // await removeAllAbis();
  abis.value = (await getAllAbis()) ?? {};
  loading.value = false;
});

const changeSelected = (item: string) => {
  selectedAbi.value = item;
  modalController.dismiss(
    {
      name: item,
      content: abis.value[item],
    },
    "confirm"
  );
};

const openModal = async (id = "") => {
  const modal = await modalController.create({
    component: AbiAdd,
    componentProps: {
      abi: abis.value?.[id] ? { name: id, content: abis.value?.[id] } : null,
    },
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "confirm") {
    selectedAbi.value = data.name;
    abis.value = {
      ...(abis.value ?? {}),
      [data.name]: data.content,
    };
    if (Object.keys(abis.value ?? {}).length === 1) {
      changeSelected(data.name);
    }
  }
};

const onEdit = (id: string) => {
  openModal(id);
};

const onDelete = async (id: string) => {
  loading.value = true;
  if (abis.value?.[id]) {
    delete abis.value[id];
    await setAbis({ ...(abis.value ?? {}) });
  }
  loading.value = false;
};

const close = () => {
  try {
    modalController.dismiss(null, "cancel");
  } catch {
    // ignore
  }
};
</script>
