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
      <ion-list style="margin-bottom: 4rem">
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
import { type Ref } from "vue";
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


const props = defineProps<{ refs: () => {
  accountsModal: Ref<boolean>,
  accountModalPresented: () => void;
  selectedAccount: Ref<Account> | Ref<null>;
  changeSelectedAccount: (address: string) => void;
  filtredAccounts: Ref<Account[]>;
  searchAccount: (event: any) => void;
}}>();

const {
  accountsModal,
  accountModalPresented,
  selectedAccount,
  changeSelectedAccount,
  filtredAccounts,
  searchAccount,
} = props.refs();
</script>
