<template>
  <ion-modal :is-open="accountsModal" @ionModalDidPresent="accountModalPresented">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="accountsModal = false">Close</ion-button>
        </ion-buttons>
        <ion-title>Select Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list style="margin-bottom: 0.5rem">
        <ion-radio-group :value="selectedAccount?.address ?? ''">
          <ion-list-header>
            <ion-searchbar
              ref="accountSearchBar"
              placeholder="search..."
              autocomplete="off"
              autocorrect="off"
              :clear-input="false"
              :clear-on-edit="false"
              :spellcheck="false"
              :tabindex="0"
              @ionInput="searchAccount"
            ></ion-searchbar>
          </ion-list-header>

          <ion-list
            @click="changeSelectedAccount(account.address)"
            class="ion-padding"
            v-for="account of filtredAccounts"
            :key="account.address"
            button
          >
            <ion-item>
              <ion-radio
                :aria-label="account.name"
                :value="account.address"
                slot="end"
                labelPlacement="end"
                mode="ios"
                justify="start"
                color="warning"
                style="margin-left: 0.1rem"
              >
                <div style="margin-left: 0.5rem">{{ account.name }}</div>
                <div style="margin-top: 0.1rem">
                  <ion-text style="font-size: 0.65rem; color: coral">{{
                    account.address.slice(0, 6)
                  }}</ion-text>
                  <ion-text style="font-size: 0.65rem">{{
                    account.address.slice(6, -4)
                  }}</ion-text>
                  <ion-text style="font-size: 0.65rem; color: coral">{{
                    account.address.slice(-4)
                  }}</ion-text>
                </div>
              </ion-radio>
            </ion-item>
          </ion-list>
        </ion-radio-group>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonButton,
  IonModal,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonList,
  IonListHeader,
  IonText,
  IonSearchbar,
} from "@ionic/vue";
import type {Account } from "@/extension/types";

import {
  saveSelectedAccount,
  replaceAccounts,
} from "@/utils/platform";

import { triggerListener } from "@/extension/listeners";


const props = defineProps<{ refs: () => {
  accounts: Ref<Account[]>,
  accountsModal: Ref<boolean>,
  selectedAccount: Ref<Account> | Ref<null>;
}}>();

const {
  accounts,
  accountsModal,
  selectedAccount,
} = props.refs();

const accountSearchBar = ref<InstanceType<typeof IonSearchbar> | null>(null);
const loading = ref(false);
const filtredAccounts = ref(accounts.value) as Ref<Account[]>;

const accountModalPresented = () => {
  if (accountSearchBar.value) {
    accountSearchBar?.value?.$el?.setFocus?.();
  }
};

const changeSelectedAccount = async (address: string) => {
  loading.value = true;
  const findIndex = accounts.value.findIndex((a) => a.address == address);
  if (findIndex > -1) {
    selectedAccount.value = accounts.value[findIndex];
    accounts.value = accounts.value.filter((a) => a.address !== address);
    accounts.value.unshift(selectedAccount.value);
    const newAccounts = [...accounts.value];
    await Promise.all([
      saveSelectedAccount(selectedAccount.value),
      replaceAccounts(newAccounts),
    ]);
    triggerListener("accountsChanged", [newAccounts.map((a) => a.address)?.[0]]);
  }
  accountsModal.value = false;
  loading.value = false;
};

const searchAccount = (e: any) => {
  const text = e.target.value;
  if (text) {
    filtredAccounts.value = accounts.value.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.address.toLowerCase().includes(text.toLowerCase())
    );
  } else {
    filtredAccounts.value = accounts.value;
  }
};
</script>
