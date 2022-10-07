<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Send Transaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
    <ion-item><ion-label>Network Name: {{ selectedNetwork?.name }}</ion-label></ion-item>
      <ion-item>
        <ion-avatar
          v-if="(mainNets as any)[selectedNetwork?.chainId]?.icon"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="selectedNetwork?.name"
            :src="getUrl('assets/chain-icons/' + (mainNets as any)[selectedNetwork?.chainId]?.icon)"
          />
        </ion-avatar>
        <ion-label>Network ID: {{ selectedNetwork?.chainId }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-label>Transaction to Sign &amp; Send</ion-label>
      </ion-item>
      <ion-item>
      Last Balance: {{ userBalance }}
      </ion-item>
      <ion-item>
      Contract: {{ contract }}
      </ion-item>
      <ion-item>
      Tx Total Cost: {{ totalCost }}
      </ion-item>
      <ion-item>
      Gas Fee:  {{ gasFee }}
      </ion-item>
      <ion-item>
      Tx value: {{ txValue }}
      </ion-item>
      <ion-item>
      Gas Limit: {{ gasLimit }} <ion-button @click="setGasLimit">Set manually</ion-button>
      </ion-item>
      <ion-item>
      Gas Price: {{ gasPrice}} <ion-button @click="setGasPrice">Set manually</ion-button>
      </ion-item>
      <ion-item>
        <ion-label>Raw TX:</ion-label>
  <ion-textarea :rows="10" :cols="20" :value="signTxData" readonly></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-button @click="onCancel">Cancel</ion-button>
        <ion-button :disabled="insuficientBalance" @click="onSign">{{ insuficientBalance ? "Insuficient Balance": "Send" }}</ion-button>
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
        @didDismiss="loading = false"
      >
      </ion-loading>
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
  IonLoading
} from "@ionic/vue";
import { ethers } from "ethers";
import { approve, walletPing, walletSendData } from "@/extension/userRequest";
import { useRoute } from "vue-router";
import { getSelectedNetwork, getUrl } from '@/utils/platform'
import { getBalance, getGasPrice, estimateGas } from '@/utils/wallet'
import type { Network } from '@/extension/types'
import { mainNets } from "@/utils/networks";

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
    IonLoading
  },
  setup: () => {
    const route = useRoute();
    const rid = (route?.params?.rid as string) ?? "";
    let isError = false
    const decodedParam = decodeURIComponent(route.params?.param as string ?? '')
    const params = JSON.parse(decodedParam)
    const signTxData = ref('');
    const alertOpen = ref(false);
    const alertMsg = ref('');
    const loading = ref(true)
    const contract = params.to
    const gasPrice = ref(0);
    const gasLimit = ref(0);
    const totalCost = ref(0)
    const gasFee = ref(0);
    const userBalance = ref(0)
    const txValue = ref(0)
    const timerReject = ref(140)
    const timerFee = ref(20)
    const insuficientBalance = ref(false)
    const gasPriceReFetch = ref(true)
    const selectedNetwork = (ref(null) as unknown) as Ref<Network>;
    let interval = 0
    const bars = ref(0)

    if(!rid){
      isError = true;
    }

    if(!decodedParam){
      isError = true
    } else {
      signTxData.value = JSON.stringify( params, null, 2)
    }

    const onSign = () => {
      approve(rid);
    };

    const onCancel = () => {
      window.close();
      if(interval) {
        try {
          clearInterval(interval)
        } catch {
          // ignore
        }
      }
    };

    onIonViewWillEnter(async () => {
      console.log(params.value);
      (window as any)?.resizeTo?.(600, 800)
      const pEstimateGas = estimateGas({
                            to: params?.to ?? '',
                            from: params?.from ?? '',
                            data: params?.data ?? '',
                            value: params?.value ?? '0x0'
                        })
      const pGasPrice = getGasPrice()
      const pBalance =  getBalance()
      selectedNetwork.value = await getSelectedNetwork()
      userBalance.value = Number(ethers.utils.formatEther((await pBalance).toString()))
      console.log(userBalance.value)
      
      gasPrice.value = parseInt(ethers.utils.formatUnits((await pGasPrice).toString(), "gwei"), 10)
      console.log(gasPrice.value)
      gasLimit.value = parseInt((await pEstimateGas).toString(), 10)
      gasFee.value = Number(ethers.utils.formatUnits(String(gasLimit.value * gasPrice.value), "gwei"))
      txValue.value = Number(ethers.utils.formatEther(params?.value ?? '0x0'))
      totalCost.value = gasFee.value + txValue.value
      if(userBalance.value < totalCost.value){
        insuficientBalance.value = true
      }
      loading.value=false

      interval = setInterval(async () => {
        if(timerReject.value <= 0) {
          onCancel()
          return;
        }
        if( gasPriceReFetch.value ) {
          timerFee.value -= 1
          if(timerFee.value <= 0) {
            timerFee.value = 20
            loading.value=true
            gasPrice.value = parseInt(ethers.utils.formatUnits((await getGasPrice()).toString(), "gwei"), 10)
            gasFee.value = Number(ethers.utils.formatUnits(String(gasLimit.value * gasPrice.value), "gwei"))
            txValue.value = Number(ethers.utils.formatEther(params?.value ?? '0x0'))
            loading.value=false
          }
        }
        
        timerReject.value -= 1
        bars.value++
        walletPing()
      }, 1000) as any
    })
    
    const setGasLimit = () => {
      // TODO
    }

    const setGasPrice = () => {
      // TODO
    }


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
      mainNets,
      getUrl,
      setGasLimit,
      setGasPrice
    };
  },
});
</script>
