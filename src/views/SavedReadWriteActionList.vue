<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
        <ion-title>Select Action</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-searchbar placeholder="Search" @ionInput="onSearch"></ion-searchbar>
      </ion-item>

      <ion-radio-group :value="selectedAbi">
        <ion-list-header>
          <ion-label>Actions</ion-label>
        </ion-list-header>

        <ion-list class="ion-padding" v-for="key in Object.keys(actions)" :key="key">
          <ion-item>
            <ion-radio
              @click="changeSelected(key)"
              slot="start"
              :value="key"
              :aria-label="key"
            >
              {{ key }} on ABI {{ actions[key].abi }}
            </ion-radio>
          </ion-item>
          <ion-item>
            <ion-button @click="onDelete(key)">Delete</ion-button>
          </ion-item>
        </ion-list>
      </ion-radio-group>

      <ion-list v-if="!!!Object.keys(actions ?? {}).length">
        <ion-item class="ion-padding">
          <ion-label>No Actions found, please save at least one</ion-label>
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
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  modalController,
  IonRadio,
  IonListHeader,
  IonRadioGroup,
  IonLabel,
  IonLoading,
  IonSearchbar,
  IonButtons,
  IonButton,
} from "@ionic/vue";
import { ref, onMounted, Ref } from "vue";
import {
  readCAGetAll,
  readCARemove,
  writeCAGetAll,
  writeCARemove,
} from "@/utils/platform";
import { ContractActions } from "@/extension/types";
// import {
//   getAllAbis,
//   setAbis,
//   // removeAllAbis
// } from "@/utils/platform";

const props = defineProps(["type"]);

const type = props?.type ?? "read";

const actions = ref({}) as Ref<ContractActions>;
const intialActions = ref({}) as Ref<ContractActions>;

const loading = ref(false);
const selectedAbi = ref("");

const onSearch = (e: any) => {
  const text = e.target.value;
  if (text) {
    const keys = Object.keys(intialActions.value).filter((key) =>
      key.toLowerCase().includes(text.toLowerCase())
    );
    actions.value = keys.reduce((acc, key) => {
      acc[key] = intialActions.value[key];
      return acc;
    }, {} as ContractActions);
  } else {
    actions.value = { ...intialActions.value };
  }
};

onMounted(async () => {
  loading.value = true;
  actions.value = type === "read" ? await readCAGetAll() : await writeCAGetAll();
  intialActions.value = { ...actions.value };
  loading.value = false;
});

const onDelete = async (key: string) => {
  delete actions.value[key];
  type === "read" ? await readCARemove(key) : await writeCARemove(key);
  intialActions.value = { ...actions.value };
};

const changeSelected = (item: string) => {
  modalController.dismiss(actions.value?.[item], "confirm");
};

const close = () => {
  try {
    modalController.dismiss(null, "cancel");
  } catch {
    // ignore
  }
};
</script>
