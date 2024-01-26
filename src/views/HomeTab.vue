<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-avatar
            style="margin: 0.3rem; width: 1.8rem; height: 1.8rem; display: inline-flex"
          >
            <img alt="clw" :src="getUrl('assets/extension-icon/wallet_32.png')" />
          </ion-avatar>
          <span style="position: absolute; top: 0.45rem; margin-left: 0.3rem"
            >CL Wallet</span
          >
        </ion-title>
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
          <ion-button
            @click="
              () => {
                accountsModal = true;
                toastState = false;
              }
            "
            >Select</ion-button
          >
        </ion-item>
        <ion-item button @click="copyAddress(selectedAccount?.address, getToastRef())">
          <p style="font-size: 0.7rem; color: coral">{{ selectedAccount?.address }}</p>
          <ion-icon style="margin-left: 0.5rem" :icon="copyOutline"></ion-icon>
        </ion-item>
        <ion-item
          v-if="!loading && selectedNetwork?.explorer && selectedAccount?.address"
        >
          <ion-button
            @click="
              openTab(
                `${selectedNetwork.explorer}/address/${selectedAccount?.address}`.replace(
                  '//',
                  '/'
                )
              )
            "
            expand="block"
            >View Address on
            {{
              `${selectedNetwork.explorer}`.replace("https://", "").replace("http://", "")
            }}
          </ion-button>
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
        <ion-label
          >Selected Network ID:
          <span style="color: coral; font-weight: bold">{{
            selectedNetwork?.chainId
          }}</span></ion-label
        >
        <ion-button
          @click="
            () => {
              networksModal = true;
              toastState = false;
            }
          "
          >Select</ion-button
        >
      </ion-item>
      <ion-item style="margin-top: 0.3rem">
        <div class="display: flex; flex-direction: column">
          <img
            alt="stealthex"
            @click="openTab('https://stealthex.io')"
            id="exchange-btn"
            :src="getUrl('assets/exchange-btn-min.svg')"
            class="exchange-btn"
            style=""
          />
          <p style="font-size: 0.75rem; opacity: 0.8; padding 0.2rem;">
            This button does not contain any referral to maximize privacy.
          </p>
        </div>
      </ion-item>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>
    </ion-content>

    <ion-modal :is-open="accountsModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="accountsModal = false">Close</ion-button>
          </ion-buttons>
          <ion-title>Select</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list style="margin-bottom: 4rem">
          <ion-radio-group :value="selectedAccount?.address ?? ''">
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
                <ion-radio
                  :aria-label="account.name"
                  slot="start"
                  :value="account.address"
                  >{{ account.name }}</ion-radio
                >
              </ion-item>
              <ion-item>
                <ion-text style="font-size: 0.7rem; color: coral">{{
                  account.address
                }}</ion-text>
              </ion-item>
            </ion-list>
          </ion-radio-group>
        </ion-list>
      </ion-content>
    </ion-modal>
    <ion-modal :is-open="networksModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="networksModal = false">Close</ion-button>
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
                  :aria-label="network.name"
                >
                  <span style="opacity: 0.7; font-size: 0.8rem">
                    ID: {{ network.chainId }} ->
                  </span>
                  {{ network.name }}
                </ion-radio>
              </ion-item>
              <ion-item>
                <ion-text style="opacity: 0.8; font-size: 0.85rem">{{
                  network.rpc
                }}</ion-text>
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
  numToHexStr,
  openTab,
} from "@/utils/platform";
import type { Network, Account, Networks } from "@/extension/types";
import { mainNets } from "@/utils/networks";
import router from "@/router";
import { triggerListner } from "@/extension/listners";
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
    const loading = ref(false);
    const accounts = ref([]) as Ref<Account[]>;
    const networks = ref({}) as Ref<Networks>;
    const accountsModal = ref(false) as Ref<boolean>;
    const networksModal = ref(false) as Ref<boolean>;
    const selectedAccount = (ref(null) as unknown) as Ref<Account>;
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const toastState = ref(false);

    const getToastRef = () => toastState;

    const loadData = () => {
      loading.value = true;
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
      const findIndex = accounts.value.findIndex((a) => a.address == address);
      if (findIndex > -1) {
        selectedAccount.value = accounts.value[findIndex];
        await saveSelectedAccount(selectedAccount.value);
        // console.log(({ [address]: accounts.value[address], ...accounts.value}))
        accounts.value.splice(findIndex, 1);
        accounts.value.splice(0, 0, selectedAccount.value);
        const newAccounts = [...accounts.value];
        await replaceAccounts(newAccounts);
        triggerListner(
          "accountsChanged",
          newAccounts.map((a) => a.address)
        );
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
        triggerListner("chainChanged", numToHexStr(chainId));
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
      openTab,
    };
  },
});
</script>

<style scoped>
.exchange-btn {
  height: 2rem;
  margin-top: 0.3rem;
  margin-left: auto;
  margin-right: auto;
  display: block;
  cursor: pointer;
}
.exchange-btn:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  transform: scale(1.05);
}
</style>
