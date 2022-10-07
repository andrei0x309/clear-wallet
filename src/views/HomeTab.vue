<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item v-if="loading || accounts.length < 1">
        <ion-label>No EVM accounts found</ion-label>
        <ion-button @click="goToAddAccount">Add Account</ion-button>
      </ion-item>
      <ion-list v-else>
        <ion-item>
          <ion-label>Selected Account: {{ selectedAccount?.name }}</ion-label>
          <ion-button @click="accountsModal = true">Select</ion-button>
        </ion-item>
        <ion-item button @click="copyAddress(selectedAccount.address, getToastRef())">
          <p style="font-size: 0.7rem">{{ selectedAccount?.address }}</p>
          <ion-icon style="margin-left: 0.5rem" :icon="copyOutline"></ion-icon>
        </ion-item>
      </ion-list>
      <ion-item v-if="loading || Object.keys(networks).length < 1">
        <ion-label>No EVM Networks found</ion-label>
        <ion-button @click="goToAddNetwork">Add Network</ion-button>
      </ion-item>
      <ion-item v-else>
        <ion-avatar
          v-if="(mainNets as any)[selectedNetwork?.chainId]?.icon"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="selectedNetwork?.name"
            :src="getUrl('assets/chain-icons/' + (mainNets as any)[selectedNetwork?.chainId]?.icon)"
          />
        </ion-avatar>
        <ion-label>Selected Network ID: {{ selectedNetwork?.chainId }}</ion-label>
        <ion-button @click="networksModal = true">Select</ion-button>
      </ion-item>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-toast
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>
    </ion-content>

    <ion-modal
        :is-open="accountsModal"
      >
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button @click="accountsModal=false">Close</ion-button>
              </ion-buttons>
              <ion-title>Select</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list style="margin-bottom: 4rem">
              <ion-radio-group :value="selectedAccount.address">
                <ion-list-header>
                  <ion-label>Accounts</ion-label>
                </ion-list-header>

                <ion-list
                  @click="changeSelectedAccount(account.address)"
                  class="ion-padding"
                  v-for="account of accounts"
                  :key="account.address"
                  button
                >
                  <ion-item>
                    <ion-radio slot="start" :value="account.address" />
                    <ion-label>{{ account.name }}</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-text style="font-size:0.8rem;">{{ account.address }}</ion-text>
                  </ion-item>
                </ion-list>
              </ion-radio-group>
            </ion-list>
          </ion-content>
          </ion-modal>
          <ion-modal
        :is-open="networksModal"
      >
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button @click="networksModal=false">Close</ion-button>
              </ion-buttons>
              <ion-title>Select</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list style="margin-bottom: 4rem">
              <ion-radio-group :value="selectedNetwork.chainId">
                <ion-list-header>
                  <ion-label>Networks</ion-label>
                </ion-list-header>

                <ion-list
                  class="ion-padding"
                  v-for="network of networks"
                  :key="network.chainId"
                >
                  <ion-item>
                    <ion-radio
                      @click="changeSelectedNetwork(network.chainId)"
                      slot="start"
                      :value="network.chainId"
                    />
                    <ion-label>{{ network.name }}</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-text>{{ network.rpc }}</ion-text>
                  </ion-item>
                </ion-list>
              </ion-radio-group>
            </ion-list>
          </ion-content>
      </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonItem,
  IonLabel,
  IonButton,
  onIonViewWillEnter,
  IonModal,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonList,
  IonListHeader,
  IonText,
  IonToast,
  IonIcon,
  IonAvatar,
} from "@ionic/vue";
import {
  getAccounts,
  getNetworks,
  getSelectedAccount,
  saveSelectedAccount,
  replaceAccounts,
  getSelectedNetwork,
  copyAddress,
  replaceNetworks,
  getUrl,
  saveSelectedNetwork,
} from "@/utils/platform";
import type { Network, Account, Networks } from "@/extension/types";
import { mainNets } from "@/utils/networks";
import router from "@/router";

import { copyOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLoading,
    IonItem,
    IonLabel,
    IonButton,
    IonModal,
    IonRadioGroup,
    IonRadio,
    IonButtons,
    IonList,
    IonListHeader,
    IonText,
    IonToast,
    IonIcon,
    IonAvatar,
  },
  setup: () => {
    const loading = ref(true);
    const accounts = ref([]) as Ref<Account[]>;
    const networks = ref({}) as Ref<Networks>;
    const accountsModal = ref(false) as Ref<boolean>;
    const networksModal = ref(false) as Ref<boolean>;
    const selectedAccount = (ref(null) as unknown) as Ref<Account>;
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const toastState = ref(false);

    const getToastRef = () => toastState;

    const loadData = () => {
      const pAccounts = getAccounts();
      const pNetworks = getNetworks();
      const pSelectedAccount = getSelectedAccount();
      const pSelectedNetwork = getSelectedNetwork();
      Promise.all([pAccounts, pNetworks, pSelectedAccount, pSelectedNetwork]).then(
        (res) => {
          accounts.value = res[0];
          networks.value = res[1];
          selectedAccount.value = res[2];
          selectedNetwork.value = res[3];
          loading.value = false;
        }
      );
    };

    onIonViewWillEnter(() => {
      loadData();
    });

    onMounted(() => {
      // nothing
    });

    const goToAddAccount = () => {
      router.push("/tabs/add-account");
    };

    const goToAddNetwork = () => {
      router.push("/tabs/add-network");
    };


    const changeSelectedAccount = async (address: string) => {
      loading.value = true;
      const findIndex = accounts.value.findIndex(a => a.address == address)
      if (findIndex > -1) {
        selectedAccount.value = accounts.value[findIndex]
        await saveSelectedAccount(selectedAccount.value)
        // console.log(({ [address]: accounts.value[address], ...accounts.value}))
        accounts.value.splice(findIndex, 1);
        accounts.value.splice(0,0,selectedAccount.value)
        await replaceAccounts([...accounts.value])
        
      }
      accountsModal.value = false;
      loading.value = false;
    };

    const changeSelectedNetwork = async (chainId: number) => {
      loading.value = true;
      if (chainId in networks.value) {
        await saveSelectedNetwork(networks.value[chainId]);
        await replaceNetworks(
          Object.assign({ [chainId]: networks.value[chainId] }, networks.value)
        );
        selectedNetwork.value = networks.value[chainId];
      }
      networksModal.value = false;
      loading.value = false;
    };

    return {
      loading,
      accounts,
      networks,
      accountsModal,
      goToAddAccount,
      goToAddNetwork,
      selectedAccount,
      selectedNetwork,
      changeSelectedAccount,
      changeSelectedNetwork,
      copyAddress,
      copyOutline,
      toastState,
      getToastRef,
      networksModal,
      mainNets,
      getUrl,
    };
  },
});
</script>
