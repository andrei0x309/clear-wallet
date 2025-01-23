<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-avatar
            style="margin: 0.3rem; width: 1.6rem; height: 1.6rem; display: inline-flex"
          >
            <img alt="clw" :src="getUrl('assets/extension-icon/wallet_32.png')" />
          </ion-avatar>
          <span style="position: absolute; top: 0.35rem; margin-left: 0.3rem">
            <span style="font-size: 0.9rem; font-weight: bold; color: #aca3bb">
              Clear
            </span>
            <span style="font-size: 0.9rem; color: #aca3bb"> Wallet </span>
          </span>
          <span
            v-if="version"
            style="
              position: absolute;
              right: 1.1rem;
              margin-left: 0.3rem;
              color: #aca3bb;
              font-weight: bold;
              font-size: 0.65rem;
              top: -1px;
            "
            >Version: {{ version }}</span
          >
          <span
            class="github-icon"
            @click="openTab('https://github.com/andrei0x309/clear-wallet/')"
            ><GitHub
          /></span>
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
          <ion-label>
            <span style="color: #aca3bb; font-weight: bold; font-size: 0.85rem"
              >[ Selected Account ]:</span
            >&nbsp;

            {{ selectedAccount?.name }}</ion-label
          >
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
        <ion-item
          button
          @click="
            copyText(
              settings?.copyLowerCaseAddress
                ? selectedAccount?.address?.toLowerCase()
                : selectedAccount?.address,
              getToastRef()
            )
          "
        >
          <p style="font-size: 0.7rem; color: #aca3bb">{{ selectedAccount?.address }}</p>
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
            class="ion-text-wrap"
            expand="block"
            style="margin: auto; width: 98%; font-size: 0.8rem; padding: 0.6rem"
            >View Address on
            {{
              `${selectedNetwork.explorer}`
                .replace("https://", "")
                .replace("http://", "")
                .replace(/\/.*/, "")
            }}
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-item v-if="loading || Object.keys(networks).length < 1">
        <ion-label>No EVM Networks found</ion-label>
        <ion-button @click="goToAddNetwork">Add Network</ion-button>
      </ion-item>
      <ion-item style="font-size: 0.86rem" v-else>
        <ion-avatar
          v-if="(allTemplateNets as any)[selectedNetwork?.chainId]?.icon"
          style="margin-right: 1rem; width: 1.6rem; height: 1.6rem"
        >
          <img
            :alt="selectedNetwork?.name"
            :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[selectedNetwork?.chainId]?.icon)"
          />
        </ion-avatar>
        <ion-label
          button
          @click="copyText(String(selectedNetwork?.chainId), getToastRef())"
          style="cursor: pointer"
        >
          <span style="color: #aca3bb; font-weight: bold; font-size: 0.85rem"
            >[ Selected Network ID ]:</span
          >
          &nbsp;
          <span style="font-weight: bold">{{ selectedNetwork?.chainId }}</span>
          <ion-icon
            style="margin-left: 0.5rem; top: 2px; position: relative"
            :icon="copyOutline"
          ></ion-icon>
        </ion-label>
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
      <ion-item style="margin-top: 0.3rem; margin-bottom: 0.3rem; text-align: center">
        <ion-button
          @click="goToFarcasterActions"
          expand="block"
          style="margin: auto; width: 98%; font-size: 0.8rem; padding: 0.6rem"
          >Experimental Farcaster Wallet Actions</ion-button
        >
      </ion-item>

      <ion-item style="margin-top: 0.3rem; margin-bottom: 0.3rem; text-align: center">
        <ion-button
          @click="goToPersonalSign"
          expand="block"
          style="margin: auto; width: 98%; font-size: 0.8rem; padding: 0.6rem"
          >Personal Sign Messages</ion-button
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
          <p style="font-size: 0.75rem; opacity: 0.8; padding: 0.2rem">
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
          <ion-title>Select Account</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list style="margin-bottom: 4rem">
          <ion-radio-group :value="selectedAccount?.address ?? ''">
            <ion-list-header>
              <ion-searchbar
                placeholder="search..."
                autocomplete="off"
                autocorrect="off"
                :autofocus="true"
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
    <ion-modal :is-open="networksModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="networksModal = false">Close</ion-button>
          </ion-buttons>
          <ion-title>Select Network</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list style="margin-bottom: 4rem">
          <ion-radio-group :value="selectedNetwork.chainId">
            <ion-list-header>
              <ion-searchbar
                autocomplete="off"
                autocorrect="off"
                :autofocus="true"
                :clear-input="false"
                :clear-on-edit="false"
                :spellcheck="false"
                :tabindex="0"
                placeholder="search..."
                @ionInput="searchNetwork"
              ></ion-searchbar>
            </ion-list-header>

            <ion-list
              class="ion-padding"
              v-for="network of filtredNetworks"
              :key="network.chainId"
            >
              <ion-item>
                <ion-radio
                  @click="changeSelectedNetwork(network.chainId)"
                  :value="network.chainId"
                  :aria-label="network.name"
                  slot="start"
                  labelPlacement="start"
                  mode="ios"
                  justify="space-between"
                  color="warning"
                  style="padding: 0.5rem"
                >
                  <div>
                    <ion-avatar
                      v-if="(allTemplateNets as any)[network.chainId]?.icon"
                      style="
                        margin-right: 0.5rem;
                        width: 1.4rem;
                        height: 1.4rem;
                        margin-bottom: 0.5rem;
                      "
                    >
                      <img
                        :alt="selectedNetwork?.name"
                        :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[network.chainId]?.icon)"
                      />
                    </ion-avatar>
                    {{
                      (network.name?.length || 0) > 18
                        ? (network.name || "").slice(0, 15) + "..."
                        : network.name
                    }}&nbsp;
                    <span style="opacity: 0.7; font-size: 0.7rem">
                      ({{ network.chainId }})
                    </span>
                  </div>
                  <div>
                    <ion-text style="opacity: 0.9; font-size: 0.85rem"
                      >RPC:&nbsp;</ion-text
                    >
                    <ion-text style="opacity: 0.8; font-size: 0.75rem">{{
                      network.rpc.replace("https://", "").replace("http://", "")
                    }}</ion-text>
                  </div>
                </ion-radio>
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
  IonSearchbar,
} from "@ionic/vue";
import {
  getAccounts,
  getNetworks,
  getSelectedAccount,
  saveSelectedAccount,
  replaceAccounts,
  getSelectedNetwork,
  copyText,
  replaceNetworks,
  getUrl,
  saveSelectedNetwork,
  numToHexStr,
  openTab,
  getSettings,
  getVersion,
} from "@/utils/platform";
import type { Network, Account, Networks } from "@/extension/types";
import { allTemplateNets } from "@/utils/networks";
import router from "@/router";
import { triggerListner } from "@/extension/listners";
import { copyOutline } from "ionicons/icons";
import GitHub from "@/components/icons/GitHub.vue";

const version = getVersion();

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
    GitHub,
    IonSearchbar,
  },
  setup: () => {
    const loading = ref(false);
    const filtredAccounts = ref([]) as Ref<Account[]>;
    const filtredNetworks = ref({}) as Ref<Networks>;
    const accounts = ref([]) as Ref<Account[]>;
    const networks = ref({}) as Ref<Networks>;
    const accountsModal = ref(false) as Ref<boolean>;
    const networksModal = ref(false) as Ref<boolean>;
    const selectedAccount = (ref(null) as unknown) as Ref<Account>;
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const toastState = ref(false);
    const settings = ref({}) as Ref<Awaited<ReturnType<typeof getSettings>>>;

    const getToastRef = () => toastState;

    const loadData = () => {
      loading.value = true;
      const pAccounts = getAccounts();
      const pNetworks = getNetworks();
      const pSelectedAccount = getSelectedAccount();
      const pSelectedNetwork = getSelectedNetwork();
      const pSettings = getSettings();
      Promise.all([
        pAccounts,
        pNetworks,
        pSelectedAccount,
        pSelectedNetwork,
        pSettings,
      ]).then((res) => {
        accounts.value = res[0];
        networks.value = res[1];
        filtredAccounts.value = res[0];
        filtredNetworks.value = res[1];
        selectedAccount.value = res[2];
        selectedNetwork.value = res[3];
        settings.value = res[4];
        loading.value = false;
      });
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

    const goToFarcasterActions = () => {
      router.push("/farcaster-actions");
    };

    const goToPersonalSign = () => {
      router.push("/personal-sign");
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
        triggerListner("accountsChanged", [newAccounts.map((a) => a.address)?.[0]]);
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

    const searchNetwork = (e: any) => {
      const text = e.target.value;
      if (text) {
        const filtred = Object.keys(networks.value).reduce(
          (acc: Networks, key: string) => {
            if (
              networks.value[Number(key)].name
                .toLowerCase()
                .includes(text.toLowerCase()) ||
              networks.value[Number(key)].rpc
                .toLowerCase()
                .includes(text.toLowerCase()) ||
              networks.value[Number(key)].chainId.toString().includes(text)
            ) {
              acc[Number(key)] = networks.value[Number(key)];
            }
            return acc;
          },
          {} as Networks
        );
        filtredNetworks.value = filtred;
      } else {
        filtredNetworks.value = networks.value;
      }
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
      copyText,
      copyOutline,
      toastState,
      getToastRef,
      networksModal,
      allTemplateNets,
      getUrl,
      openTab,
      settings,
      version,
      goToFarcasterActions,
      goToPersonalSign,
      filtredAccounts,
      filtredNetworks,
      searchAccount,
      searchNetwork,
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

.github-icon {
  position: absolute;
  top: 0.9rem;
  right: 2.4rem;
  margin-left: 0.3rem;
  color: #aca3bb;
  font-weight: bold;
  font-size: 0.65rem;
  cursor: pointer;
}

.github-icon:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  transform: scale(1.05);
}
</style>
