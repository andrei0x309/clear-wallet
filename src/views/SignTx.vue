<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Send Transaction</ion-title>
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
      <ion-item>
        <ion-label>Raw TX:</ion-label>
        <ion-textarea
          aria-label="raw tx"
          style="overflow-y: scroll"
          :rows="10"
          :cols="20"
          :value="signTxData"
          readonly
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button :disabled="insuficientBalance" @click="onSign">{{
          insuficientBalance ? "Insuficient Balance" : "Send"
        }}</ion-button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <ion-list>
        <ion-item>Auto-reject Timer: {{ timerReject }}</ion-item>
      </ion-list>
      <ion-list v-if="gasPriceReFetch">
        <ion-item>New Fee price Timer: {{ timerFee }}</ion-item>
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
              <ion-button @click="setGasLimit">Set Price</ion-button>
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

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
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
} from "@/utils/platform";
import { getBalance, getGasPrice, estimateGas } from "@/utils/wallet";
import type { Network } from "@/extension/types";
import { allTemplateNets, chainIdToPriceId } from "@/utils/networks";
import UnlockModal from "@/views/UnlockModal.vue";
import router from "@/router";

export default defineComponent({
  components: {
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
    IonList,
    IonLoading,
    IonModal,
    IonButtons,
    IonInput,
  },
  setup: () => {
    const route = useRoute();
    const rid = (route?.params?.rid as string) ?? "";
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
    const insuficientBalance = ref(false);
    const gasPriceReFetch = ref(true);
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    const dollarPrice = ref(0);
    const gasLimitModal = ref(false);
    const gasPriceModal = ref(false);
    const inGasPrice = ref(0);
    const inGasLimit = ref(0);

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

    const openModal = async () => {
      const modal = await modalController.create({
        component: UnlockModal,
        componentProps: {
          unlockType: "transaction",
        },
      });
      modal.present();
      const { role } = await modal.onWillDismiss();
      if (role === "confirm") return true;
      return false;
    };

    const onSign = async () => {
      loading.value = true;
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
      });

      await walletSendData(rid, {
        gasPrice: numToHexStr(BigInt(Math.trunc(gasPrice.value * 1e9))),
      });
      gasFee.value = Number(
        ethers.formatUnits(Math.trunc(gasLimit.value * gasPrice.value), "gwei")
      );
      txValue.value = Number(ethers.formatEther(params?.value ?? "0x0"));
      totalCost.value = gasFee.value + txValue.value;
    };

    onIonViewWillEnter(async () => {
      (window as any)?.resizeTo?.(600, 800);
      const pEstimateGas = estimateGas({
        to: params?.to ?? "",
        from: params?.from ?? "",
        data: params?.data ?? "",
        value: params?.value ?? "0x0",
      });
      blockLockout();
      const pGasPrice = getGasPrice();
      const pBalance = getBalance();
      const pGetPrices = getPrices();
      selectedNetwork.value = await getSelectedNetwork();
      userBalance.value = Number(
        ethers.formatEther((await pBalance).toString() ?? "0x0")
      );

      gasPrice.value = parseFloat((await pGasPrice).toString() ?? 0.1);

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
        insuficientBalance.value = true;
      }
      const prices = await pGetPrices;
      dollarPrice.value =
        prices[chainIdToPriceId(selectedNetwork.value?.chainId ?? 0)]?.usd ?? 0;
      await newGasData();
      loading.value = false;

      interval = setInterval(async () => {
        if (timerReject.value <= 0) {
          onCancel();
          return;
        }
        if (gasPriceReFetch.value) {
          timerFee.value -= 1;
          if (timerFee.value <= 0) {
            timerFee.value = 20;
            loading.value = true;
            gasPrice.value = parseFloat((await getGasPrice()).toString() ?? 0.1);
            await newGasData();
            loading.value = false;
          }
        }

        timerReject.value -= 1;
        bars.value++;
        walletPing();
      }, 1000) as any;
    });

    const setGasLimit = () => {
      gasLimit.value = inGasLimit.value;
      newGasData();
      gasLimitModal.value = false;
    };

    const setGasPrice = () => {
      gasPrice.value = inGasPrice.value;
      gasPriceReFetch.value = false;
      newGasData();
      gasPriceModal.value = false;
    };

    return {
      signTxData,
      onCancel,
      alertOpen,
      alertMsg,
      onSign,
      isError,
      contract,
      txValue,
      gasPrice,
      gasLimit,
      totalCost,
      gasFee,
      timerReject,
      timerFee,
      insuficientBalance,
      gasPriceReFetch,
      userBalance,
      bars,
      loading,
      selectedNetwork,
      allTemplateNets,
      getUrl,
      setGasLimit,
      setGasPrice,
      dollarPrice,
      gasLimitModal,
      gasPriceModal,
      inGasPrice,
      inGasLimit,
    };
  },
});
</script>
