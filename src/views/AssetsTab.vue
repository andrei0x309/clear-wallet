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

      <ion-item>
        <ion-label>Assests for Account: {{ selectedAccount?.name }}</ion-label>
      </ion-item>
      <ion-item button @click="copyAddress(selectedAccount?.address, getToastRef())">
        <p style="font-size: 0.7rem">{{ selectedAccount?.address }}</p>
        <ion-icon style="margin-left: 0.5rem" :icon="copyOutline"></ion-icon>
      </ion-item>
      <template v-if="isError">
        Assets info could not be retrieved because of an http error, API down or
        conectivity issues.
      </template>
      <template v-else-if="noAssets">
        <p class="padding: 1rem;">
          No know assets found for this wallet address.
        </p></template
      >
      <template v-else>
        <template v-if="ethTokens.length || polyTokens.length">
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
                <ion-label
                  ><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label
                >
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
                <ion-label
                  ><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label
                >
              </ion-item>
              <ion-item v-if="hasMore.polyTokens">
                <ion-button @click="loadMore('polyTokens')">Load More</ion-button>
              </ion-item>
            </ion-list>
          </template>
        </template>
        <template v-if="ethNfts.length || polyNfts.length">
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
                <ion-label
                  ><b>{{ nft?.collectionName }}</b></ion-label
                >
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
                <ion-label
                  ><b>{{ nft?.collectionName }}</b></ion-label
                >
              </ion-item>
              <ion-item v-if="hasMore.polyNfts">
                <ion-button @click="loadMore('polyNfts')">Load More</ion-button>
              </ion-item>
            </ion-list>
          </template>
        </template>
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
              <ion-label
                ><b>{{ nft?.title }}</b></ion-label
              >
            </ion-item>
            <ion-item v-if="hasMore.poaps">
              <ion-button @click="loadMore('poaps')">Load More</ion-button>
            </ion-item>
          </ion-list>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, reactive } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  IonItem,
  IonLabel,
  IonAvatar,
  IonList,
  IonButton,
  IonToast,
  IonLoading,
  IonIcon,
} from "@ionic/vue";
import { getSelectedAccount, copyAddress, getUrl } from "@/utils/platform";
import type { Account } from "@/extension/types";

import { copyOutline } from "ionicons/icons";

interface IProfileToken {
  address: string;
  balance: number;
  image: string;
  name: string;
  symbol: string;
}

interface IProfileNFT {
  address: string;
  collectionImageURI: string;
  collectionName: string;
  imageURI: string;
  link: string;
  tokenId: number;
}

interface IProfilePOAP {
  description: string;
  eventId: string;
  image: string;
  link: string;
  title: string;
}

export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonAvatar,
    IonList,
    IonButton,
    IonToast,
    IonLoading,
    IonIcon,
  },
  setup: () => {
    const selectedAccount = ref({}) as Ref<Account>;
    const loading = ref(true);
    const isError = ref(false);
    const noAssets = ref(false);
    const toastState = ref(false);
    const ethTokens = ref([]) as Ref<IProfileToken[]>;
    const polyTokens = ref([]) as Ref<IProfileToken[]>;
    const ethNfts = ref([]) as Ref<IProfileNFT[]>;
    const polyNfts = ref([]) as Ref<IProfileNFT[]>;
    const poaps = ref([]) as Ref<IProfilePOAP[]>;
    const hasMore = reactive({
      poaps: true,
      ethTokens: true,
      polyTokens: true,
      ethNfts: true,
      polyNfts: true,
    });
    const getToastRef = () => toastState;

    const resources = ["nfts", "poaps", "tokens"];
    const chains = ["ethereum", "polygon"];

    const fetchFromWallet = async ({
      apiBase = "https://api.yup.io",
      address,
      resource = resources[0],
      chain = chains[0],
      start = 0,
      limit = 10,
    }: {
      apiBase?: string;
      address: string;
      resource?: string;
      chain?: string;
      start?: number;
      limit?: number;
    }) => {
      try {
        const res = await fetch(
          `${apiBase}/web3-profiles/${resource}/${address}?chain=${chain}&start=${start}&limit=${limit}`
        );
        const req = await res.json();
        if (res.ok) {
          return req;
        } else {
          return null;
        }
      } catch (error) {
        console.info("ERROR: Failed to fetch web3 profiles", error);
        return null;
      }
    };

    const walletLoadArgs = {
      address: "",
      start: 0,
      limit: 11,
      res: resources,
      ch: chains,
      apiBase: "https://api.yup.io",
    };

    const getProfileWallet = async ({
      address,
      start,
      limit,
      res,
      ch,
      apiBase,
    }: {
      address: string;
      start: number;
      limit: number;
      res: string[];
      ch: string[];
      apiBase: string;
    }) => {
      const r = {
        poaps: [] as IProfilePOAP[],
        ethNfts: [] as IProfileNFT[],
        polyNfts: [] as IProfileNFT[],
        ethTokens: [] as IProfileToken[],
        polyTokens: [] as IProfileToken[],
      };
      try {
        const promises = [];

        if (res.includes("poaps")) {
          promises.push(
            fetchFromWallet({
              apiBase,
              address,
              start,
              limit,
              resource: "poaps",
              chain: "ethereum",
            }).then((rz) => {
              r.poaps = rz ?? [];
            })
          );
        }
        if (res.includes("nfts")) {
          if (ch.includes("ethereum")) {
            promises.push(
              fetchFromWallet({
                apiBase,
                address,
                start,
                limit,
                resource: "nfts",
                chain: "ethereum",
              }).then((rz) => {
                r.ethNfts = rz ?? [];
              })
            );
          }
          if (ch.includes("polygon")) {
            promises.push(
              fetchFromWallet({
                apiBase,
                address,
                start,
                limit,
                resource: "nfts",
                chain: "polygon",
              }).then((rz) => {
                r.polyNfts = rz ?? [];
              })
            );
          }
        }
        if (res.includes("tokens")) {
          if (ch.includes("ethereum")) {
            promises.push(
              fetchFromWallet({
                apiBase,
                address,
                start,
                limit,
                resource: "tokens",
                chain: "ethereum",
              }).then((rz) => {
                r.ethTokens = rz ?? [];
              })
            );
          }
          if (ch.includes("polygon")) {
            promises.push(
              fetchFromWallet({
                apiBase,
                address,
                start,
                limit,
                resource: "tokens",
                chain: "polygon",
              }).then((rz) => {
                r.polyTokens = rz ?? [];
              })
            );
          }
        }

        await Promise.all(promises);
        return r;
      } catch {
        return r;
      }
    };

    onIonViewWillEnter(async () => {
      selectedAccount.value = await getSelectedAccount();
      walletLoadArgs.address = selectedAccount.value.address;
      const r = await getProfileWallet(walletLoadArgs);
      ethNfts.value = r.ethNfts.slice(0, 10);
      if (r.ethNfts.length !== walletLoadArgs.limit) {
        hasMore.ethNfts = false;
      }
      polyNfts.value = r.polyNfts.slice(0, 10);
      if (r.polyNfts.length !== walletLoadArgs.limit) {
        hasMore.polyNfts = false;
      }
      ethTokens.value = r.ethTokens.slice(0, 10);
      if (r.ethTokens.length !== walletLoadArgs.limit) {
        hasMore.ethTokens = false;
      }
      polyTokens.value = r.polyTokens.slice(0, 10);
      if (r.polyTokens.length !== walletLoadArgs.limit) {
        hasMore.polyTokens = false;
      }
      poaps.value = r.poaps.slice(0, -1);
      if (r.poaps.length !== walletLoadArgs.limit) {
        hasMore.poaps = false;
      }
      noAssets.value =
        poaps.value.length &&
        ethNfts.value.length &&
        polyNfts.value.length &&
        ethTokens.value.length &&
        polyTokens.value.length
          ? false
          : true;
      loading.value = false;

      // const req = await fetch(`${yupAssetsApi}/${selectedAccount.value.address}`);
      // if (req.ok) {
      //   assets.value = (await req.json()) ?? {};
      //   if (
      //     !("poaps" in assets.value) &&
      //     !("tokens" in assets.value) &&
      //     !("nfts" in assets.value)
      //   ) {
      //     noAssets.value = true;
      //   }
      //   if ("poaps" in assets.value) {
      //     poaps.value = assets.value?.poaps?.slice(0, 10) ?? [];
      //     if (poaps.value.length >= (assets.value?.poaps?.length ?? 0)) {
      //       hasMore.poaps = false;
      //     }
      //   }
      //   if ("nfts" in assets.value) {
      //     ethNfts.value =
      //       assets.value?.nfts?.filter((n) => n.chain === "ethereum").slice(0, 10) ?? [];
      //     if (
      //       ethNfts.value.length >=
      //       (assets.value?.nfts?.filter((n) => n.chain === "ethereum").length ?? 0)
      //     ) {
      //       hasMore.ethNfts = false;
      //     }
      //     polyNfts.value =
      //       assets.value?.nfts?.filter((n) => n.chain === "polygon").slice(0, 10) ?? [];
      //     if (
      //       polyNfts.value.length >=
      //       (assets.value?.nfts?.filter((n) => n.chain === "polygon").length ?? 0)
      //     ) {
      //       hasMore.polyNfts = false;
      //     }
      //   }
      //   if ("tokens" in assets.value) {
      //     ethTokens.value =
      //       assets.value?.tokens?.filter((n) => n.chain === "ethereum").slice(0, 10) ??
      //       [];
      //     if (
      //       ethTokens.value.length >=
      //       (assets.value?.tokens?.filter((n) => n.chain === "ethereum").length ?? 0)
      //     ) {
      //       hasMore.ethTokens = false;
      //     }
      //     polyTokens.value =
      //       assets.value?.tokens?.filter((n) => n.chain === "polygon").slice(0, 10) ?? [];
      //     if (
      //       polyTokens.value.length >=
      //       (assets.value?.tokens?.filter((n) => n.chain === "polygon").length ?? 0)
      //     ) {
      //       hasMore.polyTokens = false;
      //     }
      //   }
      // } else {
      //   isError.value = true;
      // }
      // loading.value = false;
    });

    const loadMore = async (type: string) => {
      switch (type) {
        case "ethTokens": {
          walletLoadArgs.start = ethTokens.value.length;
          walletLoadArgs.res = ["tokens"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.ethTokens.length !== walletLoadArgs.limit) {
            hasMore.ethTokens = false;
            return;
          }
          ethTokens.value = [...ethTokens.value, ...r.ethTokens.slice(0, 10)];
          break;
        }
        case "polyTokens": {
          walletLoadArgs.start = polyTokens.value.length;
          walletLoadArgs.res = ["tokens"];
          walletLoadArgs.ch = ["polygon"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.polyTokens.length !== walletLoadArgs.limit) {
            hasMore.polyTokens = false;
            return;
          }
          polyTokens.value = [...polyTokens.value, ...r.polyTokens.slice(0, 10)];
          break;
        }
        case "ethNfts": {
          walletLoadArgs.start = ethNfts.value.length;
          walletLoadArgs.res = ["nfts"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.ethNfts.length !== walletLoadArgs.limit) {
            hasMore.ethNfts = false;
            return;
          }
          ethNfts.value = [...ethNfts.value, ...r.ethNfts.slice(0, 10)];
          break;
        }
        case "polyNfts": {
          walletLoadArgs.start = polyNfts.value.length;
          walletLoadArgs.res = ["nfts"];
          walletLoadArgs.ch = ["polygon"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.polyNfts.length !== walletLoadArgs.limit) {
            hasMore.polyNfts = false;
            return;
          }
          polyNfts.value = [...polyNfts.value, ...r.polyNfts.slice(0, 10)];
          break;
        }
        case "poaps": {
          walletLoadArgs.start = poaps.value.length;
          walletLoadArgs.res = ["poaps"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.poaps.length !== walletLoadArgs.limit) {
            hasMore.poaps = false;
            return;
          }
          poaps.value = [...poaps.value, ...r.poaps.slice(0, 10)];
          break;
        }
      }
    };

    return {
      selectedAccount,
      loading,
      isError,
      noAssets,
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
      getUrl,
    };
  },
});
</script>
