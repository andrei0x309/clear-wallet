<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Assets</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      
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

      <ion-item>
          <ion-label>Assests for Account: {{ selectedAccount?.name }}</ion-label>
        </ion-item>
        <ion-item button @click="copyAddress(selectedAccount?.address, getToastRef())">
          <p style="font-size: 0.7rem">{{ selectedAccount?.address }}</p>
          <ion-icon style="margin-left: 0.5rem" :icon="copyOutline"></ion-icon>
        </ion-item>
    <template v-if="isError">
        Assets info could not be retrieved because of an http error, API down or conectivity issues.
    </template>
    <template v-else-if="noAssets">
      No assets found for this wallet address.
    </template>
    <template v-else>
        <ion-item v-if="assets.yupScore">
        <span style="font-size: 0.9rem">YUP Score:</span> <span style="font-size: 1.1rem; margin-left: 0.5rem">{{ assets.yupScore.toFixed(2) }}</span>
        </ion-item>
        <ion-item>
          <p style="font-size: 0.7rem">YUP score is a score of your wallet based on assets and transactions. </p>
        </ion-item>
      <template v-if="assets.tokens">
       <template v-if="ethTokens.length">
       <ion-item>Ethereum Tokens</ion-item>
       <ion-list>
        <ion-item v-for="token of ethTokens" :key="token.address">
        <ion-avatar
          v-if="token?.image"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="token?.name"
            :src="token?.image"
            @error="token.image = getUrl('assets/randomGrad.svg')"
          />
        </ion-avatar>
        <ion-label><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label>
      </ion-item>
      <ion-item v-if="hasMore.ethTokens">
      <ion-button @click="loadMore('ethTokens')">Load More</ion-button>
      </ion-item>
       </ion-list>
       </template>

       <template v-if="polyTokens.length">
       <ion-item>Polygon Tokens</ion-item>
       <ion-list>
        <ion-item v-for="token of polyTokens" :key="token.address">
        <ion-avatar
          v-if="token?.image"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="token?.name"
            :src="token?.image"
            @error="token.image = getUrl('assets/randomGrad.svg')"
          />
        </ion-avatar>
        <ion-label><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label>
      </ion-item>
      <ion-item v-if="hasMore.polyTokens">
      <ion-button @click="loadMore('polyTokens')">Load More</ion-button>
      </ion-item>
       </ion-list>
       </template>

      </template>
      <template v-if="assets.nfts">
        
        <template v-if="ethNfts.length">
       <ion-item>Ethereum NFTs</ion-item>
       <ion-list>
        <ion-item v-for="nft of ethNfts" :key="nft.address">
        <ion-avatar
          v-if="nft?.imageURI"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="nft?.collectionName"
            :src="nft?.imageURI"
            @error="nft.imageURI = getUrl('assets/randomGrad.svg')"
          />
        </ion-avatar>
        <ion-label><b>{{ nft?.collectionName }}</b></ion-label>
      </ion-item>
      <ion-item v-if="hasMore.ethNfts">
      <ion-button @click="loadMore('ethNfts')">Load More</ion-button>
      </ion-item>
       </ion-list>
       </template>

       <template v-if="polyNfts.length">
       <ion-item>Polygon NFTs</ion-item>
       <ion-list>
        <ion-item v-for="nft of polyNfts" :key="nft.address">
        <ion-avatar
          v-if="nft?.imageURI"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="nft?.collectionName"
            :src="nft?.imageURI"
            @error="nft.imageURI = getUrl('assets/randomGrad.svg')"
          />
        </ion-avatar>
        <ion-label><b>{{ nft?.collectionName }}</b></ion-label>
      </ion-item>
      <ion-item v-if="hasMore.polyNfts">
      <ion-button @click="loadMore('polyNfts')">Load More</ion-button>
      </ion-item>
       </ion-list>
       </template>

      </template>
      <template v-if="assets.poaps">
        <template v-if="poaps.length">
       <ion-item>POAPs</ion-item>
       <ion-list>
        <ion-item v-for="nft of poaps" :key="nft.eventId">
        <ion-avatar
          v-if="nft?.image"
          style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
        >
          <img
            :alt="nft?.title"
            :src="nft?.image"
            @error="nft.image = getUrl('assets/randomGrad.svg')"
          />
        </ion-avatar>
        <ion-label><b>{{ nft?.title }}</b></ion-label>
      </ion-item>
      <ion-item v-if="hasMore.poaps">
      <ion-button @click="loadMore('poaps')">Load More</ion-button>
      </ion-item>
       </ion-list>
       </template>
      </template>
  </template>
</ion-content>
</ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, reactive } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, onIonViewWillEnter, IonItem, IonLabel, IonAvatar, IonList, IonButton, IonToast, IonLoading, IonIcon } from "@ionic/vue";
import { getSelectedAccount, copyAddress, getUrl } from "@/utils/platform"
import type { Account } from "@/extension/types"

import { copyOutline } from "ionicons/icons";


const yupAssetsApi = 'https://api.yup.io/profile'

interface IProfileToken {
      address: string
      balance: number
      image: string
      name: string
      symbol: string
    }

    interface IProfileNFT {
      address: string
      collectionImageURI: string
      collectionName: string
      imageURI: string
      link: string
      tokenId: number
    }

    interface IProfilePOAP {
      description: string
      eventId: string
      image: string
      link: string
      title: string
    }

export default defineComponent({
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonAvatar, IonList, IonButton, IonToast, IonLoading, IonIcon },
  setup: () => {
    const selectedAccount = ref({}) as Ref<Account>
    const assets = ref({}) as Ref< {
      yupScore?: number
      tokens?: any[] 
      nfts?: any[]
      poaps?: any[]
    }>
    const loading = ref(true)
    const isError = ref(false)
    const noAssets = ref(false)
    const toastState = ref(false);
    const ethTokens = ref([]) as Ref< IProfileToken[]>
    const polyTokens = ref([]) as Ref< IProfileToken[]>
    const ethNfts = ref([]) as Ref< IProfileNFT[]>
    const polyNfts = ref([]) as Ref< IProfileNFT[]>
    const poaps = ref([]) as Ref< IProfilePOAP[]>
    const hasMore = reactive({
      poaps: true,
      ethTokens: true,
      polyTokens: true,
      ethNfts: true,
      polyNfts: true,
    })
    const getToastRef = () => toastState;

    onIonViewWillEnter(async () => {
        selectedAccount.value = await getSelectedAccount()
        const req = await fetch(`${yupAssetsApi}/${selectedAccount.value.address}`)
        if(req.ok) {
          assets.value = (await req.json()) ?? {}
          if(!('poaps' in assets.value) && !('tokens' in assets.value) && !('nfts' in assets.value)) {
            noAssets.value = true
          }
          if ('poaps' in assets.value) {
            poaps.value = assets.value?.poaps?.slice(0, 10) ?? []
            if(poaps.value.length >= (assets.value?.poaps?.length ?? 0)) {
              hasMore.poaps = false
            }
          }
          if ('nfts' in assets.value) {
            ethNfts.value = assets.value?.nfts?.filter(n => n.chain === 'ethereum').slice(0, 10) ?? []
            if(ethNfts.value.length >= (assets.value?.nfts?.filter(n => n.chain === 'ethereum').length ?? 0)) {
              hasMore.ethNfts = false
            }
            polyNfts.value = assets.value?.nfts?.filter(n => n.chain === 'polygon').slice(0, 10) ?? []
            if(polyNfts.value.length >= (assets.value?.nfts?.filter(n => n.chain === 'polygon').length ?? 0)) {
              hasMore.polyNfts = false
            }
          }
          if ('tokens' in assets.value) {
            ethTokens.value = assets.value?.tokens?.filter(n => n.chain === 'ethereum').slice(0, 10) ?? []
            if(ethTokens.value.length >= (assets.value?.tokens?.filter(n => n.chain === 'ethereum').length ?? 0)) {
              hasMore.ethTokens = false
            }
            polyTokens.value = assets.value?.tokens?.filter(n => n.chain === 'polygon').slice(0, 10) ?? []
            if(polyTokens.value.length >= (assets.value?.tokens?.filter(n => n.chain === 'polygon').length ?? 0)) {
              hasMore.polyTokens = false
            }
          }
        }else {
          isError.value = true
        }
        loading .value = false
      })

      const loadMore = (type: string) => {
        switch(type) {
          case 'ethTokens': {
          ethTokens.value = assets.value?.tokens?.filter(n => n.chain === 'ethereum').slice(0, ethTokens.value.length + 10) ?? []
            if(ethTokens.value.length >= (assets.value?.tokens?.filter(n => n.chain === 'ethereum').length ?? 0)) {
              hasMore.ethTokens = false
            }
            break
          }
          case 'polyTokens': {
            polyTokens.value = assets.value?.tokens?.filter(n => n.chain === 'polygon').slice(0, polyTokens.value.length + 10) ?? []
            if(polyTokens.value.length >= (assets.value?.tokens?.filter(n => n.chain === 'polygon').length ?? 0)) {
              hasMore.polyTokens = false
            }
          break
          }
          case 'ethNfts': {
            ethNfts.value = assets.value?.nfts?.filter(n => n.chain === 'ethereum').slice(0, ethNfts.value.length + 10) ?? []
            if(ethNfts.value.length >= (assets.value?.nfts?.filter(n => n.chain === 'ethereum').length ?? 0)) {
              hasMore.ethNfts = false
            }
          break
          }
          case 'polyNfts': {
            polyNfts.value = assets.value?.nfts?.filter(n => n.chain === 'polygon').slice(0, polyNfts.value.length +  10) ?? []
            if(polyNfts.value.length >= (assets.value?.nfts?.filter(n => n.chain === 'polygon').length ?? 0)) {
              hasMore.polyNfts = false
            }
          break
          }
          case 'poaps': {
            poaps.value = assets.value?.poaps?.slice(0, poaps.value.length + 10) ?? []
            if(poaps.value.length >= (assets.value?.poaps?.length ?? 0)) {
              hasMore.poaps = false
            }
          break
          }
        }


      }

      return {
        selectedAccount,
        loading,
        isError,
        noAssets,
        assets,
        getToastRef,
        copyAddress,
        copyOutline,
        ethTokens,
        polyTokens,
        ethNfts,
        poaps,
        hasMore,
        polyNfts,
        loadMore,
        toastState,
        getUrl
      }
  }
});

</script>
