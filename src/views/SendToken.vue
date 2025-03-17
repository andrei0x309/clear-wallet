<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Send Tokens</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment
        style="width: auto; padding: 0.5rem; margin: 0.5rem"
        :value="currentSegment"
        mode="ios"
        @ion-change="segmentChange"
      >
        <ion-segment-button value="native">
          <ion-label>Native</ion-label>
        </ion-segment-button>
        <ion-segment-button value="erc20">
          <ion-label>ERC20</ion-label>
        </ion-segment-button>
      </ion-segment>

      <template v-if="currentSegment === 'native'">
        <ion-item>
          <ion-label>Current Network</ion-label>
        </ion-item>
        <template v-if="selectedNetwork?.name">
          <ion-item>
            Name: <b>{{ selectedNetwork.name }}</b>
          </ion-item>
          <ion-item>
            ID: <b>{{ selectedNetwork.chainId }}</b>
          </ion-item>
        </template>
        <hr />
        <ion-item>
          <ion-label>Current Address</ion-label>
        </ion-item>
        <ion-item v-if="selectedAccount?.address">
          <b style="font-size: 0.8rem">{{ selectedAccount?.address }}</b>
        </ion-item>
        <hr />
        <ion-item>
          <ion-label>Current Balance</ion-label>
        </ion-item>
        <ion-item v-if="currentBalance">
          <b>{{ currentBalance.toFixed(8) }}</b>
        </ion-item>
        <hr />

        <ion-item>
          <ion-label>Send To Address:</ion-label>
        </ion-item>

        <ion-item>
          <ion-input
            aria-label="address"
            style="font-size: 0.8rem"
            id="pasteAddress"
            v-model="sendTo"
          ></ion-input>
          <ion-icon
            style="margin-right: 0.5rem; cursor: pointer"
            @click="paste('pasteAddress')"
            :icon="clipboardOutline"
            button
          />
        </ion-item>

        <ion-item button>
          <ion-button @click="openModalAddContact()">
            Load address from contacts
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>Amount (e.g. 1.2):</ion-label>
        </ion-item>

        <ion-item>
          <ion-input
            aria-label="Amount (e.g. 1.2)"
            type="number"
            id="amount"
            v-model="amount"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-button @click="promptTransaction">Prompt Transaction</ion-button>
        </ion-item>
      </template>
      <template v-else>
        <ion-item>
          <ion-label>ERC20 Token</ion-label>
        </ion-item>
        <ion-item>
          <ion-input
            aria-label="ERC20 Token"
            type="text"
            id="erc20"
            v-model="erc20"
          ></ion-input>
          <ion-icon
            style="margin-right: 0.5rem; cursor: pointer"
            @click="paste('erc20')"
            :icon="clipboardOutline"
            button
          />
        </ion-item>

        <ion-item button>
          <ion-button @click="openModalAddContact(true)">
            Load address from contacts
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>Send To Address:</ion-label>
        </ion-item>

        <ion-item>
          <ion-input
            aria-label="address"
            style="font-size: 0.8rem"
            id="pasteAddress"
            v-model="sendTo"
          ></ion-input>
          <ion-icon
            style="margin-right: 0.5rem; cursor: pointer"
            @click="paste('pasteAddress')"
            :icon="clipboardOutline"
            button
          />
        </ion-item>

        <ion-item button>
          <ion-button @click="openModalAddContact()">
            Load address from contacts
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-button
            @click="
              async () => {
                if (!erc20) {
                  alertOpen = true;
                  alertMsg = 'Invalid ERC20 address';
                  return;
                }
                if (loading) return;
                loading = true;
                await wait(100);
                await balanceOfERC20();
              }
            "
          >
            <svg
              height="24px"
              width="24px"
              id="Layer_1"
              style="enable-background: new 0 0 512 512"
              version="1.1"
              viewBox="0 0 512 512"
              xml:space="preserve"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <path
                d="M384,352l96-109.3h-66.1C407.1,141.8,325,64,223.2,64C117.8,64,32,150.1,32,256s85.8,192,191.2,192  c43.1,0,83.8-14.1,117.7-40.7l7.5-5.9l-43.2-46.2l-6.2,4.6c-22.1,16.3-48.3,24.9-75.8,24.9C152.6,384.7,95.1,327,95.1,256  c0-71,57.5-128.7,128.1-128.7c66.4,0,120.7,50,127.4,115.3h-74.1L384,352z"
              />
            </svg>
          </ion-button>
          <ion-label>Current Balance</ion-label>
          <b v-if="currentBalanceERC20">{{ currentBalanceERC20.toFixed(8) }}</b>
          <b v-else-if="currentBalanceERC20 === null">Not Fetched</b>
          <b v-else-if="currentBalanceERC20 === 0">0</b>
        </ion-item>

        <ion-item>
          <ion-label>Amount (e.g. 1.2):</ion-label>
        </ion-item>

        <ion-item>
          <ion-input
            aria-label="Amount (e.g. 1.2)"
            type="number"
            v-model="erc20Amount"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-button @click="promptTransactionERC20">Prompt Transaction</ion-button>
        </ion-item>
      </template>

      <ion-alert
        :is-open="alertOpen"
        :header="alertTitle"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="loadingSend ? 0 : 4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, Ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  IonLoading,
  modalController,
  IonSegmentButton,
  IonSegment,
} from "@ionic/vue";

import {
  paste,
  getSelectedNetwork,
  getSelectedAccount,
  // getSettings,
} from "@/utils/platform";

import { clipboardOutline } from "ionicons/icons";
import type { Network, Account } from "@/extension/types";
import { walletPromptSendTx } from "@/extension/userRequest";
import {
  isAddress,
  formatEther,
  parseEther,
  Contract,
  formatUnits,
  parseUnits,
} from "ethers";
import { getTxCount, getBalance, getCurrentProvider } from "@/utils/wallet";
import ContactsSelect from "./ContactsSelect.vue";
import { ERC20_PARTIAL_ABI } from "@/utils/abis";
import { wait } from "@/utils/misc";

const sendTo = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const alertTitle = ref("Error");
const loading = ref(true);
const amount = ref(0);
const erc20Amount = ref(0);
const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
const selectedAccount = (ref(null) as unknown) as Ref<Account>;
const currentBalance = ref(0);
const currentBalanceERC20 = ref(null) as Ref<number | null>;
const loadingSend = ref(false);
const currentSegment = ref("native");
const erc20 = ref("");

const segmentChange = (e: CustomEvent) => {
  currentSegment.value = e.detail.value;
};

onIonViewWillEnter(async () => {
  try {
    selectedNetwork.value = await getSelectedNetwork();
    selectedAccount.value = await getSelectedAccount();
    currentBalance.value = Number(formatEther((await getBalance()).toString()));
  } catch (e) {
    alertOpen.value = true;
    alertMsg.value =
      "Error getting network & balance Internet or RPC or blockchain may be down";
  }
  loading.value = false;
});

const balanceOfERC20 = async () => {
  try {
    loading.value = true;
    const provider = (await getCurrentProvider()).provider;
    const erc20Contract = new Contract(erc20.value, ERC20_PARTIAL_ABI, provider);
    const decimals = await erc20Contract.decimals();
    const balance = await erc20Contract.balanceOf(selectedAccount.value.address);
    currentBalanceERC20.value = Number(formatUnits(balance, decimals));
    return currentBalanceERC20.value;
  } catch (e) {
    // ignore
    currentBalanceERC20.value = null;
    return null;
  } finally {
    loading.value = false;
  }
};

const promptTransaction = async () => {
  alertTitle.value = "Error";
  if (
    sendTo.value?.toLocaleLowerCase() ===
    selectedAccount.value.address?.toLocaleLowerCase()
  ) {
    alertOpen.value = true;
    alertMsg.value = "Cannot send to self";
    return;
  }

  if (!isAddress(sendTo.value)) {
    alertOpen.value = true;
    alertMsg.value = "Invalid send address";
    return;
  }

  if (amount.value <= 0) {
    alertOpen.value = true;
    alertMsg.value = "Amount must be greater than 0";
    return;
  }

  const value = parseEther(amount.value.toString()).toString();

  if (Number(value) >= Number(parseEther(currentBalance.value.toString()))) {
    alertOpen.value = true;
    alertMsg.value = "Insufficient balance";
    return;
  }

  const nonce = (await getTxCount(selectedAccount.value.address)) + 1;

  loading.value = true;
  loadingSend.value = true;

  const tx = {
    from: selectedAccount.value.address,
    to: sendTo.value,
    value,
    nonce,
    gasLimit: "0x0",
    gasPrice: "0x0",
  };
  const result = (await walletPromptSendTx(tx)) as {
    error?: string;
  };
  if (result?.error) {
    alertOpen.value = true;
    alertMsg.value = "Error sending transaction to chain";
    loading.value = false;
    return;
  } else {
    alertTitle.value = "OK";
    alertOpen.value = true;
    alertMsg.value = "Transaction sent successfully";
  }

  loadingSend.value = false;
  loading.value = false;
};

const promptTransactionERC20 = async () => {
  alertTitle.value = "Error";
  if (
    sendTo.value?.toLocaleLowerCase() ===
    selectedAccount.value.address?.toLocaleLowerCase()
  ) {
    alertOpen.value = true;
    alertMsg.value = "Cannot send to self";
    return;
  }

  if (!isAddress(sendTo.value)) {
    alertOpen.value = true;
    alertMsg.value = "Invalid send address";
    return;
  }

  if (!isAddress(erc20.value)) {
    alertOpen.value = true;
    alertMsg.value = "Invalid ERC20 address";
    return;
  }

  if (erc20Amount.value <= 0) {
    alertOpen.value = true;
    alertMsg.value = "Amount must be greater than 0";
    return;
  }

  // get current erc 20 balance
  try {
    const balance = await balanceOfERC20();
    if (balance === null) {
      throw new Error("Invalid ERC20 address or balance");
    }
  } catch (e) {
    alertOpen.value = true;
    alertMsg.value = "Invalid ERC20 address or balance";
  }

  if (Number(amount.value) >= Number(currentBalanceERC20.value)) {
    alertOpen.value = true;
    alertMsg.value = "Insufficient balance";
    return;
  }

  loading.value = true;
  let tx;
  try {
    const provider = (await getCurrentProvider()).provider;
    const erc20Contract = new Contract(erc20.value, ERC20_PARTIAL_ABI, provider);
    const decimals = await erc20Contract.decimals();
    const value = parseUnits(erc20Amount.value.toString(), decimals).toString();
    tx = {
      from: selectedAccount.value.address,
      to: erc20.value,
      gasLimit: "0x0",
      gasPrice: "0x0",
      data: erc20Contract.interface.encodeFunctionData("transfer", [sendTo.value, value]),
    };
  } catch (e) {
    alertOpen.value = true;
    alertMsg.value = "Error populating transaction";
    loading.value = false;
    return;
  }

  const result = (await walletPromptSendTx(tx)) as {
    error?: string;
  };
  if (result?.error) {
    alertOpen.value = true;
    alertMsg.value = "Error sending transaction to chain";
    loading.value = false;
    return;
  } else {
    alertTitle.value = "OK";
    alertOpen.value = true;
    alertMsg.value = "Transaction sent successfully";
    currentBalanceERC20.value =
      Number(currentBalanceERC20.value) - Number(erc20Amount.value);
  }

  loadingSend.value = false;
  loading.value = false;
};

const openModalAddContact = async (isErc20 = false) => {
  const modal = await modalController.create({
    component: ContactsSelect,
    componentProps: {},
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();
  if (role === "confirm") {
    if (isErc20) {
      erc20.value = data.address;
    } else {
      sendTo.value = data.address;
    }
  }
};
</script>
