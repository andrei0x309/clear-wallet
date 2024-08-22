<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancel">Back</ion-button>
        </ion-buttons>
        <ion-title>Farcaster Actions</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Selected address needs to own a FID in order to work, this address is also
          known as custody address.
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >These are experimental features RE from Warpcast might not work in all cases
          and might break if WC makes changes.</ion-label
        >
      </ion-item>
      <div
        style="border: 1px solid var(--ion-color-medium-contrast);
    margin: 0.6rem;
}"
      >
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
        <ion-item button>
          <p style="font-size: 0.7rem; color: coral">{{ selectedAccount?.address }}</p>
        </ion-item>
      </div>
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Used for sign in with farcaster/warpcast QR you'll need to paste the deep link
          in next screen</ion-label
        ></ion-item
      >
      <ion-item>
        <ion-button
          @click="swiwModal = true"
          color="light"
          style="
            margin: auto;
            transform: scale(1.2);
            filter: hue-rotate(59deg) saturate(1.5) sepia(0.1);
          "
          >Sign in with farcaster</ion-button
        >
      </ion-item>
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Used to login on warpcast.com without needing a mobile device</ion-label
        >
      </ion-item>
      <ion-item>
        <ion-button
          @click="promptForSignIn"
          style="
            margin: auto;
            transform: scale(1.2);
            filter: hue-rotate(59deg) saturate(1.5) sepia(0.1);
          "
          color="light"
          >Login on Warpcast.com</ion-button
        >
      </ion-item>

      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="
          () => {
            alertOpen = false;
            alertHeader = 'Error';
            exitWallet && (window as any)?.close();
          }
        "
      ></ion-alert>

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

      <ion-modal :is-open="swiwModal" @didDismiss="deepLink = ''">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="swiwModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Paste Link To Authorize</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label
              >Enter deep-link from Sign in with farcaster QR EX:
              <span style="font-size: 0.8rem; opacity: 0.8">
                https://warpcast.com/~/sign-in-with-farcaster?channelToken=4a8d3f27-....
              </span></ion-label
            >
          </ion-item>
          <ion-item>
            <ion-textarea
              style="overflow-y: scroll; width: 100%"
              aria-label="Enter deep link from Sign in with farcaste QR"
              :rows="10"
              :cols="10"
              v-model="deepLink"
            ></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-button @click="swiwModal = false" color="light">Cancel</ion-button>
            <ion-button @click="farcasterSWIWAithorize">Authorize</ion-button>
          </ion-item>
        </ion-content>

        <ion-loading
          :is-open="swloading"
          cssClass="my-custom-class"
          message="Please wait..."
          :duration="4000"
          :key="`k${swloading}`"
          @didDismiss="swloading = false"
        >
        </ion-loading>

        <ion-loading
          :is-open="warpcastLoading"
          cssClass="my-custom-class"
          message="Please wait..."
          :duration="4000"
          :key="`k${warpcastLoading}`"
          @didDismiss="warpcastLoading = false"
        >
        </ion-loading>
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
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  modalController,
  IonModal,
  IonButtons,
  IonTextarea,
} from "@ionic/vue";
import { saveSelectedAccount, paste, replaceAccounts } from "@/utils/platform";
import router from "@/router";
import type { Account } from "@/extension/types";
import UnlockModal from "@/views/UnlockModal.vue";
import { triggerListner } from "@/extension/listners";
import { copyOutline } from "ionicons/icons";

import { clipboardOutline } from "ionicons/icons";
import {
  doSignInWithFarcaster,
  validateLinkData,
  getFidFromAddress,
} from "@/utils/farcaster";
import { getAccounts, getSelectedAccount, unBlockLockout } from "@/utils/platform";
import { addWarpAuthToken, generateApiToken } from "@/utils/warpcast-auth";

export default defineComponent({
  components: {
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
    IonModal,
    IonButtons,
    IonTextarea,
  },
  setup: () => {
    const name = ref("");
    const pk = ref("");
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const swiwModal = ref(false);
    const deepLink = ref("");
    const swloading = ref(false);
    const warpcastLoading = ref(false);
    const exitWallet = ref(false);
    const alertHeader = ref("Error");

    const loading = ref(false);
    const accounts = ref([]) as Ref<Account[]>;
    const accountsModal = ref(false) as Ref<boolean>;
    const selectedAccount = (ref(null) as unknown) as Ref<Account>;
    const toastState = ref(false);

    const loadData = () => {
      loading.value = true;
      const pAccounts = getAccounts();
      const pSelectedAccount = getSelectedAccount();
      Promise.all([pAccounts, pSelectedAccount]).then((res) => {
        accounts.value = res[0];
        selectedAccount.value = res[1];
        loading.value = false;
      });
    };

    onIonViewWillEnter(() => {
      loadData();
    });

    const onCancel = () => {
      router.push("/tabs/home");
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

    const farcasterSWIWAithorize = async () => {
      exitWallet.value = false;
      if (!deepLink.value) {
        alertMsg.value = "Please enter the deep link";
        alertOpen.value = true;
        return;
      }
      const linkData = validateLinkData(deepLink.value);
      if (!linkData) {
        alertMsg.value = "Invalid deep link";
        alertOpen.value = true;
        return;
      }

      if ((selectedAccount.value.pk ?? "").length !== 66) {
        const modalResult = await openModal();
        if (modalResult) {
          unBlockLockout();
          loading.value = true;
        } else {
          onCancel();
        }
      } else {
        unBlockLockout();
      }
      swloading.value = true;
      try {
        const result = await doSignInWithFarcaster({
          link: deepLink.value,
        });

        console.log("result", result);

        if (result === -1) {
          alertMsg.value =
            "Selected account does not own a FID please select an account that owns a FID";
          alertOpen.value = true;
          swloading.value = false;
          return;
        } else if (result === -2) {
          alertMsg.value = "Optimism RCP is not available";
          alertOpen.value = true;
          swloading.value = false;
          return;
        } else if (result === -3) {
          alertMsg.value =
            "Error could not get signer params from farcaster relay, try again";
          alertOpen.value = true;
          swloading.value = false;
          return;
        } else {
          alertHeader.value = "OK";
          alertMsg.value =
            "Request sent successfully, if QR is still open, you should be signed in";
          alertOpen.value = true;
          swloading.value = false;
          exitWallet.value = true;
        }
      } catch (e) {
        alertMsg.value = String(e);
        alertOpen.value = true;
      }
      swloading.value = false;
    };

    const promptForSignIn = async () => {
      exitWallet.value = false;
      const targetUrl = "warpcast.com";
      chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const lastTab = tabs[0];

        if (!lastTab) {
          alertMsg.value = "No active tab found";
          alertOpen.value = true;
          return;
        }

        if (!lastTab?.url?.includes(targetUrl)) {
          alertOpen.value = true;
          alertMsg.value = "You are not on warpcast.com page";
          return;
        }
        if (!lastTab.id) {
          alertMsg.value = "No active tab found";
          alertOpen.value = true;
          return;
        }

        if ((selectedAccount.value.pk ?? "").length !== 66) {
          const modalResult = await openModal();
          if (modalResult) {
            unBlockLockout();
            loading.value = true;
          } else {
            onCancel();
          }
        } else {
          unBlockLockout();
        }

        warpcastLoading.value = true;

        let hasFid = 0 as number | null;

        try {
          hasFid = await getFidFromAddress(selectedAccount.value.address);
        } catch (e) {
          alertMsg.value = String(e);
          alertOpen.value = true;
          warpcastLoading.value = false;
          return;
        }

        if (!hasFid) {
          alertMsg.value =
            "Selected account does not own a FID please select an account that owns a FID";
          alertOpen.value = true;
          warpcastLoading.value = false;
          return;
        }

        let token = "";

        try {
          const data = await generateApiToken();
          if (data.success) {
            token = data.data;
          } else {
            alertMsg.value = `Error in generating Auth token: ${data.data}`;
            alertOpen.value = true;
            warpcastLoading.value = false;
            return;
          }
        } catch (e) {
          alertMsg.value = String(e);
          alertOpen.value = true;
          warpcastLoading.value = false;
          return;
        }

        const arg = { secret: token, expiresAt: 1777046287381 };

        await chrome.scripting.executeScript({
          target: { tabId: lastTab.id },
          func: addWarpAuthToken,
          args: [arg],
        });
        warpcastLoading.value = false;
        window.close();
      });
    };

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

    return {
      name,
      pk,
      onCancel,
      alertOpen,
      alertMsg,
      clipboardOutline,
      paste,
      accountsModal,
      changeSelectedAccount,
      selectedAccount,
      accounts,
      copyOutline,
      toastState,
      deepLink,
      swiwModal,
      farcasterSWIWAithorize,
      swloading,
      promptForSignIn,
      warpcastLoading,
      window,
      exitWallet,
      alertHeader,
    };
  },
});
</script>
