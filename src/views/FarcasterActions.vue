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
          >These are experimental features might not work in all cases and might break
          when warpcast/farcaster make changes.</ion-label
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
          >Used for sign in with farcaster/warpcast QR, by scanning QR on pasteing
          link.</ion-label
        ></ion-item
      >
      <ion-item>
        <button @click="swiwModal = true" class="buttonFc">Sign in with farcaster</button>
      </ion-item>
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Used to login on farcaster.xyz without needing a mobile device</ion-label
        >
      </ion-item>
      <ion-item>
        <button @click="promptForSignIn" class="buttonFc">Login on Farcaster.xyz</button>
      </ion-item>
      <ion-item>
        <ion-label style="opacity: 0.9; font-size: 0.85rem"
          >Used to be able to associate a FID you own with a domain you own, for
          framesV2</ion-label
        >
      </ion-item>
      <ion-item>
        <button @click="jfsModal = true" class="buttonFc" style="font-size: 0.8rem">
          Generate JFS(JSON Farcaster Signature)
        </button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="dismissAlert"
      ></ion-alert>

      <SelectedAccountModal :refs="() => getRefs()" />

      <ion-modal :is-open="swiwModal" @didDismiss="deepLink = ''">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="swiwModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Authorize SIWF</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-segment
            style="width: auto; padding: 0.5rem; margin: 0.5rem"
            :value="currentSegment"
            mode="ios"
            @ion-change="segmentChange"
          >
            <ion-segment-button value="QR">
              <ion-label>Using QR</ion-label>
            </ion-segment-button>
            <ion-segment-button value="link">
              <ion-label>Using Link</ion-label>
            </ion-segment-button>
          </ion-segment>
          <template v-if="currentSegment === 'QR'">
            <ion-item>
              <ion-label
                ><h2>Try to scan QR</h2>
                <p style="font-size: 0.8rem">
                  (must be visible on current page, might fail if QR is small or too
                  complex)
                </p></ion-label
              >
            </ion-item>
            <ion-item>
              <ion-button @click="swiwModal = false" color="light">Cancel</ion-button>
              <ion-button @click="farcasterSWIWQRAuthorize"
                >Authorize using QR</ion-button
              >
            </ion-item>
          </template>
          <template v-else>
            <ion-item>
              <ion-label
                ><h2>Alternative: paste link from QR</h2>
                <p style="font-size: 0.7rem; opacity: 0.9">
                  Privy has copy link, if you see `I am on mobile` you can also right
                  click to copy. Link is similar to:
                  https://farcaster.xyz/~/siwf?channelToken=AXXXXXXX
                </p></ion-label
              >
            </ion-item>

            <ion-item>
              <ion-label>
                <p style="font-size: 0.7rem; opacity: 0.9">
                  Account needs to own a fid, WC API has become slow you might need to try
                  multiple, times if you don't get signed in
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-textarea
                style="overflow-y: scroll; width: 100%"
                aria-label="Enter deep link from Sign in with farcaste QR"
                :rows="4"
                :cols="8"
                v-model="deepLink"
              ></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-button @click="swiwModal = false" color="light">Cancel</ion-button>
              <ion-button @click="farcasterSWIWAuthorize"
                >Authorize using link</ion-button
              >
            </ion-item>
          </template>
        </ion-content>
      </ion-modal>

      <ion-modal
        :is-open="jfsModal"
        @didDismiss="
          jfsJSON = '';
          jfsResultJson = '';
          jfsResultCompact = '';
        "
      >
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="jfsModal = false">Close</ion-button>
            </ion-buttons>
            <ion-title>Authorize JFS</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label><h2>Paste JSON You Want to Sign</h2></ion-label>
          </ion-item>
          <ion-item>
            <ion-textarea
              style="overflow-y: scroll; width: 100%"
              aria-label="Enter deep link from Sign in with farcaste QR"
              :rows="4"
              :cols="8"
              v-model="jfsJSON"
            ></ion-textarea>
          </ion-item>

          <template v-if="jfsJSON && jfsFid && jfsResultJson">
            <ion-item>
              <ion-label><h2>Result</h2></ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                FID: <strong>{{ jfsFid }}</strong>
              </ion-label>
            </ion-item>
            <ion-item
              @click="copyText(jfsResultJson, getToastRef())"
              style="cursor: pointer"
            >
              JSON format (click to copy):
              <ion-icon class="copy-icon" :icon="copyOutline"></ion-icon>
            </ion-item>
            <ion-item>
              <ion-textarea
                style="width: 100%"
                aria-label="JFS result"
                :rows="3"
                :cols="10"
                :readonly="true"
                v-model="jfsResultJson"
              ></ion-textarea>
            </ion-item>
            <ion-item
              @click="copyText(jfsResultCompact, getToastRef())"
              style="cursor: pointer"
            >
              Compact format (click to copy):
              <ion-icon class="copy-icon" :icon="copyOutline"></ion-icon>
            </ion-item>
            <ion-item>
              <ion-textarea
                style="width: 100%"
                aria-label="JFS result"
                :rows="3"
                :cols="10"
                :readonly="true"
                v-model="jfsResultCompact"
              ></ion-textarea>
            </ion-item>
          </template>
          <ion-item>
            <ion-button @click="jfsModal = false" color="light">Cancel</ion-button>
            <ion-button @click="doJFS">Generate JFS</ion-button>
          </ion-item>
        </ion-content>
      </ion-modal>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
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
  IonSegmentButton,
  IonButton,
  IonAlert,
  IonSegment,
  onIonViewWillEnter,
  modalController,
  IonModal,
  IonButtons,
  IonTextarea,
  IonLoading,
  IonSearchbar,
  IonIcon,
  IonToast,
} from "@ionic/vue";
import { saveSelectedAccount, copyText, replaceAccounts } from "@/utils/platform";
import router from "@/router";
import type { Account } from "@/extension/types";
import UnlockModal from "@/views/UnlockModal.vue";
import { triggerListner } from "@/extension/listners";
import { copyOutline } from "ionicons/icons";

import {
  doSignInWithFarcaster,
  validateLinkData,
  getFidFromAddress,
  doSignInWithFarcasterQR,
} from "@/utils/farcaster/farcaster";
import { createJFS, validateCreateJFS } from "@/utils/farcaster/farcaster-JFS";

import { getAccounts, getSelectedAccount, unBlockLockout } from "@/utils/platform";
import { addWarpAuthToken, generateApiToken } from "@/utils/farcaster/farcaster-auth";
import { setUnlockModalState } from "@/utils/unlockStore";
import SelectedAccountModal from "@/views/modals/SelectAccountModal.vue";

const alertOpen = ref(false);
const alertMsg = ref("");
const swiwModal = ref(false);
const jfsModal = ref(false);
const deepLink = ref("");
const loading = ref(false);
const exitWallet = ref(false);
const alertHeader = ref("Error");
const currentSegment = ref("QR");
const jfsResultJson = ref("");
const jfsResultCompact = ref("");
const jfsJSON = ref("");
const jfsFid = ref("");

const accounts = ref([]) as Ref<Account[]>;
const filtredAccounts = ref([]) as Ref<Account[]>;
const accountsModal = ref(false) as Ref<boolean>;
const selectedAccount = (ref(null) as unknown) as Ref<Account>;
const toastState = ref(false);
const accountSearchBar = ref<InstanceType<typeof IonSearchbar> | null>(null);

const getToastRef = () => toastState;

const loadData = () => {
  loading.value = true;
  const pAccounts = getAccounts();
  const pSelectedAccount = getSelectedAccount();
  Promise.all([pAccounts, pSelectedAccount]).then((res) => {
    accounts.value = res[0];
    filtredAccounts.value = res[0];
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

const farcasterSWIWAuthorize = async () => {
  exitWallet.value = false;
  if (!deepLink.value) {
    alertMsg.value = "Please enter the deep link";
    alertOpen.value = true;
    return;
  }
  const linkData = validateLinkData(deepLink.value);
  if (!linkData) {
    alertMsg.value = "Invalid link pasted it does not contain a valid channel token";
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
  loading.value = true;
  try {
    const result = await doSignInWithFarcaster({
      link: deepLink.value,
    });

    if (result === -1) {
      alertMsg.value =
        "Selected account does not own a FID please select an account that owns a FID";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -2) {
      alertMsg.value = "Auth token generation failed";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -3) {
      alertMsg.value =
        "Error could read chanel token from data, make sure you have copied the correct link";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else {
      alertHeader.value = "OK";
      alertMsg.value =
        "Request sent successfully, if QR is still open, you will be signed in";
      alertOpen.value = true;
      loading.value = false;
      exitWallet.value = true;
    }
  } catch (e) {
    alertMsg.value = String(e);
    alertOpen.value = true;
  }
  loading.value = false;
};

const farcasterSWIWQRAuthorize = async () => {
  exitWallet.value = false;
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
  loading.value = true;
  try {
    const result = await doSignInWithFarcasterQR();

    if (result === -1) {
      alertMsg.value =
        "Selected account does not own a FID please select an account that owns a FID";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -2) {
      alertMsg.value =
        "Failed to read QR data, be sure QR is visible on, if is not working try using link";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -3) {
      alertMsg.value =
        "QR does not contain a valid channel token, make sure you are scanning a sign in with farcaster QR";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -4) {
      alertMsg.value = "Failed to extract sign params from QR";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else if (result === -5) {
      alertMsg.value = "Auth token generation failed";
      alertOpen.value = true;
      loading.value = false;
      return;
    } else {
      alertHeader.value = "OK";
      alertMsg.value =
        "Request sent successfully, if QR is still open, you will be signed in";
      alertOpen.value = true;
      loading.value = false;
      exitWallet.value = true;
    }
  } catch (e) {
    alertMsg.value = String(e);
    alertOpen.value = true;
  }
  loading.value = false;
};

const promptForSignIn = async () => {
  exitWallet.value = false;
  const targetUrls = ["warpcast.com", "farcaster.xyz"];
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    const lastTab = tabs[0];

    if (!lastTab) {
      alertMsg.value = "No active tab found";
      alertOpen.value = true;
      return;
    }

    if (!targetUrls.some((url) => lastTab.url?.includes(url))) {
      alertOpen.value = true;
      alertMsg.value = `You are not on ${targetUrls.join(" or ")}`;
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

    loading.value = true;

    let hasFid = 0 as number | null;

    try {
      hasFid = await getFidFromAddress(selectedAccount.value.address);
    } catch (e) {
      alertMsg.value = String(e);
      alertOpen.value = true;
      loading.value = false;
      return;
    }

    if (!hasFid) {
      alertMsg.value =
        "Selected account does not own a FID please select an account that owns a FID";
      alertOpen.value = true;
      loading.value = false;
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
        loading.value = false;
        return;
      }
    } catch (e) {
      alertMsg.value = String(e);
      alertOpen.value = true;
      loading.value = false;
      return;
    }

    const arg = { secret: token, expiresAt: 1777046287381 };

    await chrome.scripting.executeScript({
      target: { tabId: lastTab.id },
      func: addWarpAuthToken,
      args: [arg],
    });
    loading.value = false;
    window.close();
  });
};

const doJFS = async () => {
  if (!jfsJSON.value) {
    alertMsg.value = "Please enter the JSON you want to sign";
    alertOpen.value = true;
    return;
  }
  if (loading.value) {
    return;
  }
  const { error, fid, custodyAddress } = await validateCreateJFS(jfsJSON.value);

  if (error) {
    alertMsg.value = error;
    alertOpen.value = true;
    loading.value = false;
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
  loading.value = true;

  const { compactJfs, jsonJfs } = await createJFS(
    jfsJSON.value,
    fid,
    custodyAddress as string
  );

  jfsFid.value = fid;
  jfsResultJson.value = JSON.stringify(jsonJfs, null, 2);
  jfsResultCompact.value = compactJfs;
  loading.value = false;
};

const openModal = async () => {
  const modal = await modalController.create({
    component: UnlockModal,
    animated: true,
    focusTrap: false,
    backdropDismiss: false,
    componentProps: {
      unlockType: "farcaster",
    },
  });
  await modal.present();
  setUnlockModalState(true);
  const { role } = await modal.onWillDismiss();
  if (role === "confirm") return true;
  setUnlockModalState(false);
  return false;
};

const segmentChange = (e: CustomEvent) => {
  currentSegment.value = e.detail.value;
};

const dismissAlert = () => {
  alertOpen.value = false;
  alertHeader.value = "Error";
  exitWallet.value && window?.close();
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

const accountModalPresented = () => {
  if (accountSearchBar.value) {
    accountSearchBar?.value?.$el?.setFocus?.();
  }
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

const getRefs = () => {
  return {
    accountsModal,
    accountModalPresented,
    selectedAccount,
    changeSelectedAccount,
    filtredAccounts,
    searchAccount,
  };
};
</script>

<style scoped>
.buttonFc {
  position: relative;
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  color: #fff;
  cursor: pointer;
  background-color: #7d2ae8;
  transition: all 0.2s ease;
  text-transform: uppercase;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.buttonFc:active {
  transform: scale(0.96);
}

.buttonFc:before,
.buttonFc:after {
  position: absolute;
  content: "";
  width: 150%;
  left: 50%;
  height: 100%;
  transform: translateX(-50%);
  z-index: -1000;
  background-repeat: no-repeat;
}

.buttonFc:hover:before {
  top: -70%;
  background-image: radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, transparent 20%, #7d2ae8 20%, transparent 30%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, transparent 10%, #7d2ae8 15%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%);
  background-size: 10% 10%, 20% 20%, 15% 15%, 20% 20%, 18% 18%, 10% 10%, 15% 15%, 10% 10%,
    18% 18%;
  background-position: 50% 120%;
  animation: greentopBubbles 1.1s ease;
}

@keyframes greentopBubbles {
  0% {
    background-position: 5% 90%, 10% 90%, 10% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%,
      55% 90%, 70% 90%;
  }

  50% {
    background-position: 0% 80%, 0% 20%, 10% 40%, 20% 0%, 30% 30%, 22% 50%, 50% 50%,
      65% 20%, 90% 30%;
  }

  100% {
    background-position: 0% 70%, 0% 10%, 10% 30%, 20% -10%, 30% 20%, 22% 40%, 50% 40%,
      65% 10%, 90% 20%;
    background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  }
}

.buttonFc:hover::after {
  bottom: -70%;
  background-image: radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, transparent 10%, #7d2ae8 15%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%),
    radial-gradient(circle, #7d2ae8 20%, transparent 20%);
  background-size: 15% 15%, 20% 20%, 18% 18%, 20% 20%, 15% 15%, 20% 20%, 18% 18%;
  background-position: 50% 0%;
  animation: greenbottomBubbles 0.6s ease;
}

@keyframes greenbottomBubbles {
  0% {
    background-position: 10% -10%, 30% 10%, 55% -10%, 70% -10%, 85% -10%, 70% -10%, 70% 0%;
  }

  50% {
    background-position: 0% 80%, 20% 80%, 45% 60%, 60% 100%, 75% 70%, 95% 60%, 105% 0%;
  }

  100% {
    background-position: 0% 90%, 20% 90%, 45% 70%, 60% 110%, 75% 80%, 95% 70%, 110% 10%;
    background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  }
}
</style>
