<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
        <ion-title>Select Address</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-button @click="openModalAddContact()" expand="block"
          >Add Contact Addr</ion-button
        >
      </ion-item>

      <ion-item>
        <ion-searchbar placeholder="Search" @ionInput="onSearch"></ion-searchbar>
      </ion-item>

      <ion-radio-group :value="selectedContact">
        <ion-list-header>
          <ion-segment
            style="width: auto; padding: 0.5rem; margin: 0.5rem"
            :value="currentSegment"
            mode="ios"
            @ion-change="segmentChange"
          >
            <ion-segment-button value="contacts">
              <ion-label>Addrs Contacts</ion-label>
            </ion-segment-button>
            <ion-segment-button value="wallet">
              <ion-label>Addrs from Wallet</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-list-header>

        <template v-if="currentSegment === 'contacts'">
          <ion-list class="ion-padding" v-for="(item, index) in contacts" :key="index">
            <ion-item>
              <ion-radio
                @click="changeSelected(item.address)"
                slot="start"
                :value="item"
                :aria-label="item"
              >
                <ion-list>
                  <ion-item>
                    <ion-label>{{ item.name }}</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label style="font-size: 0.75rem">{{ item.address }}</ion-label>
                  </ion-item>
                </ion-list>
              </ion-radio>
            </ion-item>
            <ion-item>
              <ion-button @click="openModalAddContact(item.address)" expand="block"
                >Edit contact</ion-button
              >
              <ion-button @click="deleteContact(item.address)" expand="block"
                >Delete contact</ion-button
              >
            </ion-item>
          </ion-list>
          <ion-list v-if="!!!contacts.length">
            <ion-item class="ion-padding">
              <ion-label>No contacts found, please add at least one</ion-label>
            </ion-item>
          </ion-list>
        </template>
        <template v-if="currentSegment === 'wallet'">
          <ion-list
            class="ion-padding"
            v-for="(item, index) in walletAddresses"
            :key="index"
          >
            <ion-item>
              <ion-radio
                @click="changeSelected(item.address)"
                slot="start"
                :value="item"
                :aria-label="item"
              >
                <ion-list>
                  <ion-item>
                    <ion-label>{{ item.name }}</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label style="font-size: 0.75rem">{{ item.address }}</ion-label>
                  </ion-item>
                </ion-list>
              </ion-radio>
            </ion-item>
          </ion-list>
          <ion-list v-if="!!!walletAddresses.length">
            <ion-item class="ion-padding">
              <ion-label v-if="searchValue === ''"
                >No addresses found in wallet, please add at least one</ion-label
              >
              <ion-label v-else> No matching addresses found </ion-label>
            </ion-item>
          </ion-list>
        </template>
      </ion-radio-group>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
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
import AddContact from "@/views/AddContact.vue";
import { getContacts, replaceContacts, getAccounts } from "@/utils/platform";
import type { Contact } from "@/extension/types";

const loading = ref(false);
let intialContacts = [] as Contact[];
let intialWalletAddresses = [] as Contact[];
const contacts = ref([]) as Ref<Contact[]>;
const walletAddresses = ref([]) as Ref<Contact[]>;
const selectedContact = ref(null) as Ref<Contact | null>;
const currentSegment = ref("contacts");
const searchValue = ref("");

const onSearch = (e: any) => {
  searchValue.value = e.target.value;
  if (currentSegment.value === "contacts") {
    if (searchValue.value) {
      contacts.value = contacts.value.filter(
        (item) =>
          item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
          item.address.toLowerCase().includes(searchValue.value.toLowerCase())
      );
    } else {
      contacts.value = intialContacts;
    }
  } else {
    if (searchValue.value) {
      walletAddresses.value = walletAddresses.value.filter(
        (item) =>
          item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
          item.address.toLowerCase().includes(searchValue.value.toLowerCase())
      );
    } else {
      walletAddresses.value = intialWalletAddresses;
    }
  }
};

const convertAccountsToContacts = async () => {
  const accounts = await getAccounts();
  walletAddresses.value = accounts.map((item) => ({
    name: item.name,
    address: item.address,
  }));
};

const segmentChange = (e: CustomEvent) => {
  currentSegment.value = e.detail.value;
};

const loadContacts = async () => {
  loading.value = true;
  intialContacts = await getContacts();
  contacts.value = intialContacts;
  await convertAccountsToContacts();
  intialWalletAddresses = walletAddresses.value;
  loading.value = false;
};

onMounted(async () => {
  loadContacts();
});

const openModalAddContact = async (address = "") => {
  let modal: Awaited<ReturnType<typeof modalController.create>>;
  if (address) {
    const contact = contacts.value.find((item) => item.address === address);
    modal = await modalController.create({
      component: AddContact,
      componentProps: {
        name: contact?.name,
        address: contact?.address,
        isEdit: true,
      },
    });
  } else {
    modal = await modalController.create({
      component: AddContact,
      componentProps: {},
    });
  }

  modal.present();

  const { data, role } = await modal.onWillDismiss();
  if (role === "confirm") {
    selectedContact.value = data;
    loadContacts();
  }
};

const deleteContact = async (address: string) => {
  loading.value = true;
  const newContacts = contacts.value.filter((item) => item.address !== address) ?? [];
  await replaceContacts(newContacts);
  contacts.value = newContacts;
  loading.value = false;
};

const changeSelected = (address: string) => {
  if (currentSegment.value === "contacts") {
    const contact = contacts.value.find((item) => item.address === address);
    modalController.dismiss(contact, "confirm");
  } else {
    const contact = walletAddresses.value.find((item) => item.address === address);
    modalController.dismiss(contact, "confirm");
  }
};

const close = () => {
  try {
    modalController.dismiss(null, "cancel");
  } catch {
    // ignore
  }
};
</script>
