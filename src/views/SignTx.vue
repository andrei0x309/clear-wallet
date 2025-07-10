<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <p style="margin-bottom: 0.5rem">
            Send Transaction
            {{
              `${
                intialSelectedAccount?.name
                  ? "- [ " + intialSelectedAccount?.name + " ]"
                  : ""
              }`
            }}
          </p>
          <p
            v-if="intialSelectedAccount?.address"
            style="
              font-size: 0.7rem;
              color: #aca3bb;
              padding: 0;
              margin: 0;
              margin-left: 0.5rem;
            "
          >
            Sending from: {{ intialSelectedAccount?.address }}
          </p>
          <p
            v-if="website"
            style="
              font-size: 0.7rem;
              color: #aca3bb;
              padding: 0;
              margin: 0;
              margin-left: 0.5rem;
            "
          >
            Request from domain: <b>{{ website }}</b>
          </p>
          <p style="margin: 0; padding: 0; margin-top: 0.5rem; font-size: 0">&nbsp;</p>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item
        ><ion-label>Network Name: {{ selectedNetwork?.name }}</ion-label></ion-item
      >
      <ion-item>
        <ion-avatar
          v-if="(allTemplateNets as any)[selectedNetwork?.chainId]?.icon"
          style="margin-right: 1rem; width: 1.6rem; height: 1.6rem"
        >
          <img
            :alt="selectedNetwork?.name"
            :src="getUrl('assets/chain-icons/' + (allTemplateNets as any)[selectedNetwork?.chainId]?.icon)"
          />
        </ion-avatar>
        <ion-label>Network ID: {{ selectedNetwork?.chainId }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-label>Transaction to Sign &amp; Send</ion-label>
      </ion-item>
      <ion-item>
        Last Balance: {{ userBalance }}
        <span
          style="font-size: 0.9rem; opacity: 0.7; margin-left: 1rem"
          v-if="dollarPrice > 0"
          >${{ (dollarPrice * userBalance).toFixed(3) }}</span
        >
      </ion-item>
      <ion-item> Contract: {{ contract }} </ion-item>
      <ion-item>
        Tx Total Cost: {{ totalCost }}
        <span
          style="font-size: 0.9rem; opacity: 0.7; margin-left: 1rem"
          v-if="dollarPrice > 0"
          >${{ (dollarPrice * totalCost).toFixed(3) }}</span
        >
      </ion-item>
      <ion-item>
        Gas Fee: {{ gasFee }}
        <span
          style="font-size: 0.9rem; opacity: 0.7; margin-left: 1rem"
          v-if="dollarPrice > 0"
          >${{ (dollarPrice * gasFee).toFixed(3) }}</span
        >
      </ion-item>
      <ion-item> Tx value: {{ txValue }} </ion-item>
      <ion-item>
        Gas Limit: {{ gasLimit }}
        <ion-button style="margin-left: 1rem" @click="gasLimitModal = true"
          >Set manually</ion-button
        >
      </ion-item>
      <ion-item>
        Gas Price: {{ gasPrice }}
        <ion-button style="margin-left: 1rem" @click="gasPriceModal = true"
          >Set manually</ion-button
        >
      </ion-item>
      <ion-item v-if="showRawData">
        <ion-label>Raw TX:</ion-label>
        <ion-textarea
          aria-label="raw tx"
          style="overflow-y: scroll; width: 400px; height: 200px"
          :rows="10"
          :cols="20"
          :value="signTxData"
          readonly
        ></ion-textarea>
      </ion-item>
      <AssetChanges
        v-if="isAssetChangesEnabled && assetChangesKey"
        :asset-changes="assetChanges"
        :chain-not-supported="assetChangesNotSupported"
        :loading="assetChangesLoading"
        :error="assetChangesError"
      />

      <ion-item>Auto-reject timer: {{ timerReject }}</ion-item>
      <ion-item v-if="gasPriceReFetch">New fee price timer: {{ timerFee }}</ion-item>

      <ion-item style="display: flex; justify-self: end" class="no-inner-border">
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button :disabled="insufficientBalance" @click="onSign">{{
          insufficientBalance ? "Insufficient Balance" : "Send"
        }}</ion-button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>

      <ion-modal :is-open="gasLimitModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="gasLimitModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Set Gas Limit</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list>
            <ion-item>
              <ion-label>Limit in units</ion-label>
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="gas limit"
                v-model="inGasLimit"
                type="number"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-button @click="setGasLimit">Set Limit</ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="gasPriceModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="gasPriceModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Set Gas Price</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list>
            <ion-item>
              <ion-label>Price in gwei</ion-label>
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="price in gwei"
                v-model="inGasPrice"
                type="number"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-button @click="setGasPrice">Set Price</ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
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
  IonButton,
  IonAlert,
  IonTextarea,
  onIonViewWillEnter,
  IonList,
  IonLoading,
  IonModal,
  IonButtons,
  IonInput,
  modalController,
} from "@ionic/vue";
import { ethers } from "ethers";
import { approve, walletPing, walletSendData } from "@/extension/userRequest";
import { useRoute } from "vue-router";
import {
  getSelectedNetwork,
  getUrl,
  getPrices,
  numToHexStr,
  blockLockout,
  unBlockLockout,
  getSelectedAccount,
  strToHex,
  hexTostr,
  getSettings,
} from "@/utils/platform";
import { getBalance, getGasPrice, estimateGas } from "@/utils/wallet";
import type { Network, Account, Settings } from "@/extension/types";
import { allTemplateNets, chainIdToPriceId } from "@/utils/networks";
import UnlockModal from "@/views/UnlockModal.vue";
import router from "@/router";
import { setUnlockModalState } from "@/utils/unlockStore";
import AssetChanges from "./sub-views/AssetChanges.vue";
import type { AlchemyAssetChange } from "@/extension/types";
import { getAlchemyEndpointFromChainId, simulateTx } from "@/utils/alchemy";

const route = useRoute();
const rid = (route?.params?.rid as string) ?? "";
const website = route?.params?.website ? hexTostr(route?.params?.website as string) : "";
let isError = false;
const decodedParam = hexTostr((route.params?.param as string) ?? "");
const params = JSON.parse(decodedParam);
const signTxData = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const loading = ref(true);
const contract = params.to;
const gasPrice = ref(0);
const gasLimit = ref(0);
const totalCost = ref(0);
const gasFee = ref(0);
const userBalance = ref(0);
const txValue = ref(0);
const timerReject = ref(140);
const timerFee = ref(20);
const insufficientBalance = ref(false);
const gasPriceReFetch = ref(true);
const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
const intialSelectedAccount = ref(null as unknown) as Ref<Account>;
const dollarPrice = ref(0);
const gasLimitModal = ref(false);
const gasPriceModal = ref(false);
const inGasPrice = ref(0);
const inGasLimit = ref(0);
const showRawData = ref(false);

// asset changes
const isAssetChangesEnabled = ref(false);
const assetChangesKey = ref("");
const assetChanges = ref([]) as Ref<AlchemyAssetChange[]>;
const assetChangesError = ref(false);
const assetChangesLoading = ref(true);
const assetChangesNotSupported = ref(false);

let gasFeed = {} as Awaited<ReturnType<typeof getGasPrice>>["feed"];

let interval = 0;
const bars = ref(0);

if (!rid) {
  isError = true;
}

if (!decodedParam) {
  isError = true;
} else {
  const paramsWithoutZeros = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(params).filter(([_, v]) => v !== "0x0")
  );

  signTxData.value = JSON.stringify(paramsWithoutZeros, null, 2);
}

const setItervalFn = async () => {
  if (timerReject.value <= 0) {
    onCancel();
    return;
  }
  if (gasPriceReFetch.value) {
    timerFee.value -= 1;
    if (timerFee.value <= 0) {
      timerFee.value = 20;
      loading.value = true;
      const { feed, price } = await getGasPrice();
      gasFeed = feed;
      gasPrice.value = parseFloat(price.toString() ?? 0.1);
      await newGasData();
      loading.value = false;
    }
  }

  timerReject.value -= 1;
  bars.value++;
  walletPing();
};

const openModal = async () => {
  const modal = await modalController.create({
    component: UnlockModal,
    animated: true,
    focusTrap: false,
    backdropDismiss: false,
    componentProps: {
      unlockType: "transaction",
    },
  });
  await modal.present();
  setUnlockModalState(true);
  const { role } = await modal.onWillDismiss();
  if (role === "confirm") return true;
  await setUnlockModalState(false);
  return false;
};

const onSign = async () => {
  loading.value = true;
  if (interval) {
    clearInterval(interval);
  }
  const selectedAccount = await getSelectedAccount();
  loading.value = false;
  if ((selectedAccount.pk ?? "").length !== 66) {
    const modalResult = await openModal();
    if (modalResult) {
      unBlockLockout();
      loading.value = true;
      approve(rid);
    } else {
      onCancel();
    }
  } else {
    unBlockLockout();
    approve(rid);
  }
  loading.value = false;
};

const onCancel = () => {
  window.close();
  if (interval) {
    try {
      unBlockLockout();
      clearInterval(interval);
    } catch {
      // ignore
    }
  }
};

const newGasData = async () => {
  await walletSendData(rid, {
    gas: numToHexStr(gasLimit.value),
    gasPrice: numToHexStr(BigInt(Math.trunc(gasPrice.value * 1e9))),
    supportsEIP1559: gasFeed?.maxFeePerGas !== null,
  });

  gasFee.value = Number(
    ethers.formatUnits(Math.trunc(gasLimit.value * gasPrice.value), "gwei")
  );
  txValue.value = Number(ethers.formatEther(params?.value ?? "0x0"));
  totalCost.value = gasFee.value + txValue.value;
};

const runSimularion = async (settings: Settings, network: Network) => {
  isAssetChangesEnabled.value = settings.enableAssetTransactionSimulation;
  assetChangesKey.value = settings.assetTransactionSimulationAlchemyKey;
  if (!isAssetChangesEnabled.value || !assetChangesKey.value) {
    return;
  }
  const endpoint = getAlchemyEndpointFromChainId(network.chainId, assetChangesKey.value);
  if (!endpoint) {
    assetChangesNotSupported.value = true;
    assetChangesLoading.value = false;
    return;
  }
  try {
    const changes = await simulateTx(endpoint, params);
    assetChangesError.value = false;
    if (!changes) {
      assetChangesLoading.value = false;
      assetChangesError.value = true;
      return;
    }
    assetChanges.value = changes ?? [];
    assetChangesLoading.value = false;
  } catch (error) {
    assetChangesLoading.value = false;
    assetChangesError.value = true;
  }
};

onIonViewWillEnter(async () => {
  (window as any)?.resizeTo?.(600, 860);
  blockLockout();
  const pGasPrice = getGasPrice();
  const pBalance = getBalance();
  const pGetPrices = getPrices();
  const pGetSelectedAccount = getSelectedAccount();
  const pGetSelectedNetwork = getSelectedNetwork();
  getSettings().then((settings) => {
    showRawData.value = settings.showRawTransactionData;
    pGetSelectedNetwork.then((network) => {
      runSimularion(settings, network);
    });
  });

  const data = await Promise.all([pGetSelectedNetwork, pGetSelectedAccount]);
  selectedNetwork.value = data[0];
  intialSelectedAccount.value = data[1];
  userBalance.value = Number(ethers.formatEther((await pBalance).toString() ?? "0x0"));
  const { feed, price } = await pGasPrice;
  gasFeed = feed;

  gasPrice.value = parseFloat(price.toString() ?? 0.1);

  const pEstimateGas = estimateGas({
    to: params?.to ?? "",
    from: params?.from ?? "",
    data: params?.data ?? "",
    value: params?.value ?? "0x0",
  });

  try {
    gasLimit.value = parseInt((await pEstimateGas).toString(), 10);
  } catch (err) {
    const errorToHex = strToHex(String(err));
    router.push(`/contract-error/${rid}/${errorToHex}/${contract}`);
    loading.value = false;
    return;
  }
  inGasPrice.value = gasPrice.value;
  inGasLimit.value = gasLimit.value;

  if (userBalance.value < totalCost.value) {
    insufficientBalance.value = true;
  }
  const prices = await pGetPrices;
  dollarPrice.value =
    prices[chainIdToPriceId(selectedNetwork.value?.chainId ?? 0)]?.usd ?? 0;
  await newGasData();
  loading.value = false;

  interval = setInterval(setItervalFn, 1000) as any;
});

const setGasLimit = async () => {
  gasLimit.value = inGasLimit.value;
  await newGasData();
  gasLimitModal.value = false;
};

const setGasPrice = async () => {
  gasPrice.value = inGasPrice.value;
  gasPriceReFetch.value = false;
  await newGasData();
  gasPriceModal.value = false;
};
</script>

<style scoped>
ion-item {
  --min-height: 34px;
  --padding-start: 8px;
  --padding-end: 8px;
}
</style>
