<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
        <ion-title>Select Function</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-searchbar placeholder="Search" @ionInput="onSearch"></ion-searchbar>
      </ion-item>

      <ion-radio-group :value="selectedAbi">
        <ion-list-header>
          <ion-label>Functions</ion-label>
        </ion-list-header>

        <ion-list class="ion-padding" v-for="(item, index) in refFunctions" :key="item">
          <ion-item>
            <ion-radio
              @click="changeSelected(Number(index))"
              slot="start"
              :value="item"
              :aria-label="item"
            >
              {{ item }}
            </ion-radio>
          </ion-item>
        </ion-list>
      </ion-radio-group>

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
import { ref, onMounted, Ref, PropType } from "vue";
// import {
//   getAllAbis,
//   setAbis,
//   // removeAllAbis
// } from "@/utils/platform";

const props = defineProps({
  functions: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const refFunctions = ref(props.functions) as Ref<string[]>;

const loading = ref(false);
const selectedAbi = ref("");

const onSearch = (e: any) => {
  const text = e.target.value;
  if (text) {
    refFunctions.value = props.functions.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
  } else {
    refFunctions.value = props.functions;
  }
};

onMounted(async () => {
  loading.value = true;
  // await removeAllAbis();

  loading.value = false;
});

const changeSelected = (item: number) => {
  modalController.dismiss(refFunctions.value[item], "confirm");
};

const close = () => {
  try {
    modalController.dismiss(null, "cancel");
  } catch {
    // ignore
  }
};
</script>
