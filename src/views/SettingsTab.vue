<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Security</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-list>
              <ion-item v-if="noAccounts"
                >You need at least one account to touch this settings</ion-item
              >
              <ion-list :disabled="noAccounts">
                <ion-item>
                  <div style="display: flex; flex-direction: column">
                    <ion-item class="ion-no-padding no-inner-border">
                      <ion-label>Enable Storage Encryption</ion-label>
                      <ion-toggle
                        aria-label="Enable Storage Encryption"
                        @ion-change="changeEncryption"
                        slot="end"
                        :checked="settings.s?.enableStorageEnctyption"
                      ></ion-toggle>
                    </ion-item>
                    <p class="helper-label">
                      This will require to input an encrypto key when storage is locked.
                    </p>
                  </div>
                </ion-item>
              </ion-list>
              <ion-item :disabled="!settings.s?.enableStorageEnctyption">
                <div style="display: flex; flex-direction: column; width: 100%">
                  <ion-item class="ion-no-padding no-inner-border">
                    <ion-label>Enable Auto Lock</ion-label>
                    <ion-toggle
                      aria-label="Enable Auto Lock"
                      @ion-change="changeAutoLock"
                      slot="end"
                      :checked="settings.s?.lockOutEnabled"
                    ></ion-toggle>
                  </ion-item>
                  <p class="helper-label">
                    This will lock the private keys after a period of inactivity, set
                    bellow, permanent lock option takes precedence.
                  </p>
                  <ion-item
                    class="ion-no-padding no-inner-border"
                    :disabled="
                      !settings.s?.enableStorageEnctyption || !settings.s?.lockOutEnabled
                    "
                  >
                    <ion-label>Auto-lock Period: (2-120) minutes</ion-label>
                  </ion-item>
                  <ion-item class="ion-no-padding no-inner-border">
                    <ion-input
                      :disabled="
                        !settings.s?.enableStorageEnctyption ||
                        !settings.s?.lockOutEnabled
                      "
                      v-model="lockOutPeriod"
                      type="number"
                      style="
                        width: 110px;
                        margin-right: 10px;
                        border: 0.3rem solid var(--border-color);
                        padding: 0.4rem;
                      "
                    ></ion-input>
                    <ion-button
                      @click="setTime"
                      style="margin-left: auto"
                      :disabled="
                        !settings.s?.enableStorageEnctyption ||
                        !settings.s?.lockOutEnabled
                      "
                      >Set Auto-lock</ion-button
                    >
                  </ion-item>
                </div>
              </ion-item>
              <ion-list>
                <ion-item>
                  <div style="display: flex; flex-direction: column">
                    <ion-item class="ion-no-padding no-inner-border">
                      <ion-label>Permanent Lock</ion-label>
                      <ion-toggle
                        aria-label="Permanent Lock"
                        @ion-change="changePermaLock"
                        slot="end"
                        :disabled="!settings.s?.enableStorageEnctyption"
                        :checked="settings.s?.encryptAfterEveryTx"
                      ></ion-toggle>
                    </ion-item>
                    <p class="helper-label">
                      It will require the lock password before any signing of messages or
                      transactions.
                    </p>
                  </div>
                </ion-item>
              </ion-list>
              <ion-item>
                <div style="display: flex; flex-direction: column">
                  <ion-item class="ion-no-padding no-inner-border">
                    <ion-label>Show raw data when sending transactions</ion-label>
                    <ion-toggle
                      aria-label="Show raw Data when sending Transaction"
                      @ion-change="changeShowRawTransactionData"
                      slot="end"
                      :checked="settings.s?.showRawTransactionData"
                    ></ion-toggle>
                  </ion-item>
                  <p class="helper-label">
                    It will show the raw binary data of the transactions, might be useful
                    in some development cases.
                  </p>
                </div>
              </ion-item>
              <ion-item>
                <div style="display: flex; flex-direction: column">
                  <ion-item class="ion-no-padding no-inner-border">
                    <ion-label>Simulate asset changes</ion-label>
                    <ion-toggle
                      aria-label="Show raw Data when sending Transaction"
                      @ion-change="changeAssetTransactionSimulation"
                      slot="end"
                      :checked="settings.s?.enableAssetTransactionSimulation"
                    ></ion-toggle>
                  </ion-item>
                  <ion-item class="ion-no-padding no-inner-border">
                    <ion-textarea
                      @ion-input="changeAssetTransactionSimulationAlchemyKey"
                      :disabled="!settings.s?.enableAssetTransactionSimulation"
                      label="Alchemy Key"
                      label-placement="floating"
                      fill="outline"
                      placeholder="example: jTI2AsqMJUkp33r7frrf1SJnxt-Cf2X1"
                      :value="settings.s?.assetTransactionSimulationAlchemyKey"
                      style="font-size: 0.8rem; margin-bottom: 10px; margin-top: 10px"
                    ></ion-textarea>
                  </ion-item>
                  <p class="helper-label">
                    It will show potential changes to your assets when sending a
                    transaction. This features requires a valid Alchemy API Key, if you
                    have a free account a key can be used for up to 1k simulations per
                    day.
                  </p>
                </div>
              </ion-item>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Theme & Misc</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-list>
              <ion-radio-group :value="radioTheme">
                <ion-item @click="changeTheme('system')">
                  <ion-radio slot="start" value="system" />
                  <ion-label>System Default</ion-label>
                </ion-item>
                <ion-item @click="changeTheme('dark')">
                  <ion-radio slot="start" value="dark" />
                  <ion-label>Dark</ion-label>
                </ion-item>
                <ion-item @click="changeTheme('light')">
                  <ion-radio slot="start" value="light" />
                  <ion-label>Light</ion-label>
                </ion-item>
              </ion-radio-group>
              <ion-item>
                <ion-label style="font-size: 0.7rem"
                  >Convert Address to lowercase on copy</ion-label
                >
                <ion-toggle
                  aria-label="Convert Address to Lowercase on Copy"
                  @ion-change="changeCopyLowerCaseAddress"
                  slot="end"
                  :checked="settings.s?.copyLowerCaseAddress"
                ></ion-toggle>
              </ion-item>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label> Import / Export Accounts</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item class="ion-no-padding no-inner-border">
              <ion-label>Import Additional Accounts</ion-label>
            </ion-item>
            <ion-item class="ion-no-padding no-inner-border">
              <input ref="importFile" type="file" accept=".json" class="file-input-cls" />
            </ion-item>
            <ion-item
              class="ion-no-padding no-inner-border"
              style="display: flex; justify-self: center"
            >
              <ion-button color="warning" @click="importAcc">Import</ion-button>
            </ion-item>
            <ion-item class="ion-no-padding export-border">
              <ion-label>Export All Accounts</ion-label>
              <ion-button color="warning" @click="exportAcc">Export</ion-button>
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Danger</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item>
              <ion-label>WIPE All DATA</ion-label>
              <ion-button color="danger" @click="wipeStorage">PERMA WIPE</ion-button>
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>About</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <p>
              Clear EVM Wallet (CLW) is a fully open-source wallet built with Vue, Ionic,
              and Ethers.
            </p>
            <p>
              If a website does not detect Clear Wallet try selecting MetaMask, as this
              wallet also implements the metamask API. It's recommended to not have
              MetaMask enabled at the same time as Clear Wallet.
            </p>
            <p>
              Unlike most wallets, Clear Wallet has no ads, no analytics, no trackers, no
              bloatware, no telemetry, no data collection, no sponsored content, no
              sponsored DApps, no sponsored tokens, no sponsored NFTs, and no fees. It is
              a clean wallet with no revenue model, made by a single developer, if you
              want to support this project financially you can donate
              <a href="#" @click="openTab('https://blog.flashsoft.eu/tip-me')">here</a>
            </p>
            <p>
              Github Repo:
              <a href="#" @click="openTab('https://github.com/andrei0x309/clear-wallet')"
                >LINK</a
              >
            </p>
            <p>
              Docs Website:
              <a href="#" @click="openTab('https://clear-wallet.flashsoft.eu')">LINK</a>
            </p>
            <br />
            <p style="margin-bottom: 0.2rem">Places you can check me out:</p>
            <p>
              Github andrei0x309 -
              <a href="#" @click="openTab('https://github.com/andrei0x309')">LINK</a>
            </p>
            <p>
              Mirror Profile
              <a href="#" @click="openTab('https://mirror.xyz/andrei0x309.eth')">LINK</a>
            </p>
            <p>
              Blog Flashsoft
              <a href="#" @click="openTab('https://blog.flashsoft.eu')">LINK</a>
            </p>
          </div>
        </ion-accordion>
      </ion-accordion-group>
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        :message="toastMsg"
        :duration="1500"
      ></ion-toast>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-modal
        :is-open="mpModal"
        @did-dismiss="
          mpModal = false;
          modalDismiss();
        "
      >
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button
                @click="
                  modalGetPassword?.reject
                    ? (() => {
                        modalGetPassword.reject();
                        modalGetPassword = null;
                      })()
                    : (mpModal = false)
                "
                >Close</ion-button
              >
            </ion-buttons>
            <ion-title v-if="!settings.s.enableStorageEnctyption"
              >Create Encryption Password</ion-title
            >
            <ion-title v-else>Enter Encryption Password</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list v-if="settings.s.enableStorageEnctyption">
            <ion-item>
              <ion-label>Old Password</ion-label>
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="password"
                v-model="mpPass"
                type="password"
              ></ion-input>
            </ion-item>
          </ion-list>
          <div v-else>
            <ion-list>
              <ion-item>
                <ion-label>New Password</ion-label>
              </ion-item>
              <ion-item>
                <ion-input
                  aria-label="password"
                  v-model="mpPass"
                  type="password"
                ></ion-input>
              </ion-item>
            </ion-list>
            <ion-list>
              <ion-item>
                <ion-label>Confirm</ion-label>
              </ion-item>
              <ion-item>
                <ion-input
                  aria-label="password"
                  v-model="mpConfirm"
                  type="password"
                ></ion-input>
              </ion-item>
            </ion-list>
          </div>
          <ion-item>
            <ion-button
              @click="
                modalGetPassword?.resolve
                  ? (() => {
                      modalGetPassword.resolve();
                      modalGetPassword = null;
                    })()
                  : confirmModal()
              "
              >Confirm</ion-button
            >
          </ion-item>
        </ion-content>
      </ion-modal>
      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, reactive, Ref } from "vue";
import {
  storageWipe,
  getSettings,
  setSettings,
  getAccounts,
  saveSelectedAccount,
  replaceAccounts,
  openTab,
} from "@/utils/platform";
import { decrypt, encrypt, getCryptoParams } from "@/utils/webCrypto";
import { Account } from "@/extension/types";
import { exportFile } from "@/utils/misc";
import type { Settings } from "@/extension/types";
import type { IonTextareaCustomEvent, TextareaInputEventDetail } from "@ionic/core";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonLoading,
  onIonViewWillEnter,
  IonList,
  IonToggle,
  IonModal,
  IonInput,
  IonTextarea,
  IonAccordion,
  IonAccordionGroup,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonAlert,
  IonToast,
} from "@ionic/vue";

const loading = ref(true);
const mpModal = ref(false);
const mpPass = ref("");
const mpConfirm = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const toastState = ref(false);
const toastMsg = ref("");
const alertHeader = ref("Error");
const lockOutPeriod = defineModel({ default: 2 });
const importFile = (ref(null) as unknown) as Ref<HTMLInputElement>;
type ModalPromisePassword = null | {
  resolve: (p?: unknown) => void;
  reject: (p?: unknown) => void;
};
const modalGetPassword = ref(null) as Ref<ModalPromisePassword>;
const noAccounts = ref(true);
const radioTheme = ref("system") as Ref<"system" | "light" | "dark">;

const wipeStorage = async () => {
  loading.value = true;
  await storageWipe();
  loading.value = false;
};
const settings = reactive({
  s: (null as unknown) as Settings,
}) as { s: Settings };

const saveSettings = async () => {
  loading.value = true;
  await setSettings(settings.s);
  loading.value = false;
};

const setEncryptToggle = (state: boolean) => {
  settings.s.enableStorageEnctyption = state;
};

const changeAutoLock = async () => {
  settings.s.lockOutEnabled = !settings.s.lockOutEnabled;
  await saveSettings();
};

const changePermaLock = async () => {
  settings.s.encryptAfterEveryTx = !settings.s.encryptAfterEveryTx;
  await saveSettings();
};

const changeShowRawTransactionData = async () => {
  settings.s.showRawTransactionData = !settings.s.showRawTransactionData;
  await saveSettings();
};

const changeAssetTransactionSimulationAlchemyKey = async (
  e: IonTextareaCustomEvent<TextareaInputEventDetail>
) => {
  settings.s.assetTransactionSimulationAlchemyKey = e.detail.value || "";
  await saveSettings();
};

const changeAssetTransactionSimulation = async () => {
  settings.s.enableAssetTransactionSimulation = !settings.s
    .enableAssetTransactionSimulation;
  await saveSettings();
};

const changeCopyLowerCaseAddress = async () => {
  settings.s.copyLowerCaseAddress = !settings.s?.copyLowerCaseAddress;
  await saveSettings();
};

const changeTheme = async (theme: "system" | "light" | "dark") => {
  document.body.classList.remove(radioTheme.value);
  document.body.classList.add(theme);
  radioTheme.value = theme;
  settings.s.theme = theme;
  await saveSettings();
};

const changeEncryption = async () => {
  loading.value = true;
  mpModal.value = true;
  loading.value = false;
};

const confirmModal = async () => {
  loading.value = true;
  if (mpPass.value.length < 3) {
    loading.value = false;
    alertHeader.value = "Error";
    alertMsg.value = "Password is too short. More than 3 characters are required.";
    alertOpen.value = true;
    setEncryptToggle(settings.s.enableStorageEnctyption);
    return;
  }

  if (!settings.s.enableStorageEnctyption) {
    if (mpPass.value !== mpConfirm.value) {
      loading.value = false;
      alertHeader.value = "Error";
      alertMsg.value = "Password and confirm password do not match";
      alertOpen.value = true;
      setEncryptToggle(settings.s.enableStorageEnctyption);
      return;
    }
    let accounts = await getAccounts();
    const cryptoParams = await getCryptoParams(mpPass.value);
    const accProm = accounts.map(async (a) => {
      a.encPk = await encrypt(a.pk, cryptoParams);
      a.pk = "";
      return a;
    });
    accounts = await Promise.all(accProm);
    await replaceAccounts(accounts);
    await saveSelectedAccount(accounts[0]);
    setEncryptToggle(true);
    await setSettings(settings.s);
    mpPass.value = "";
    mpConfirm.value = "";
    mpModal.value = false;
  } else {
    try {
      let accounts = await getAccounts();
      const cryptoParams = await getCryptoParams(mpPass.value);
      const accProm = accounts.map(async (a) => {
        if (a.encPk) {
          a.pk = await decrypt(a.encPk, cryptoParams);
        }
        return a;
      });
      accounts = await Promise.all(accProm);
      await replaceAccounts(accounts);
      await saveSelectedAccount(accounts[0]);
      setEncryptToggle(false);
      settings.s.lockOutEnabled = false;
      settings.s.encryptAfterEveryTx = false;
      await setSettings(settings.s);
      mpPass.value = "";
      mpConfirm.value = "";
      mpModal.value = false;
    } catch (error) {
      loading.value = false;
      alertHeader.value = "Error";
      alertMsg.value = "Decryption failed, password is not correct.";
      alertOpen.value = true;
      setEncryptToggle(settings.s.enableStorageEnctyption);
      return;
    }
  }

  loading.value = false;
};

const validateFile = () => {
  return new Promise((resolve) => {
    try {
      if (!importFile.value?.value?.length) {
        return resolve({
          error: "Import json file is missing",
        });
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = JSON.parse(event?.target?.result as string);
        if (!json.length) {
          return resolve({
            error:
              'JSON format is wrong. Corrrect JSON format is: [{ "name": "Account Name", "pk": "Private Key", "address": "0x..." },{...}]',
          });
        }
        const test = json.some(
          (e: any) =>
            !("pk" in e) ||
            !("name" in e) ||
            !("address" in e) ||
            !(e.pk.length === 66 || e.pk.length === 64)
        );
        if (test) {
          return resolve({
            error:
              'JSON format is wrong. Corrrect JSON format is: [{ "name": "Account Name", "pk": "Private Key", "address": "0x..."  },{...}], Also PK must be valid (66 || 64 length) !',
          });
        }
        return resolve({ error: false, json });
      };
      reader.readAsText(importFile.value?.files?.[0] as File);
    } catch {
      return resolve({
        error: "Parsing JSON file",
      });
    }
  });
};

const getPassword = () => {
  return new Promise((resolve, reject) => {
    modalGetPassword.value = { resolve, reject };
    mpModal.value = true;
  });
};

const promptForPassword = async (accounts: Account[]) => {
  let isCorectPass = false;
  do {
    try {
      await getPassword();
      modalGetPassword.value = null;
    } catch {
      alertHeader.value = "Error";
      alertMsg.value = "Password is required!";
      alertOpen.value = true;
      mpModal.value = false;
      return false;
    }
    try {
      const cryptoParams = await getCryptoParams(mpPass.value);
      if (accounts?.[0]?.encPk) {
        await decrypt(accounts[0].encPk, cryptoParams);
      }
      isCorectPass = true;
    } catch {
      isCorectPass = false;
      alertHeader.value = "Error";
      alertMsg.value = "Password is wrong!";
      alertOpen.value = true;
    }
  } while (!isCorectPass);
  return true;
};

const importAcc = async () => {
  const validation = (await validateFile()) as { error: any };
  if (validation.error) {
    alertMsg.value = validation.error;
    alertOpen.value = true;
    return;
  }
  const accounts = await getAccounts();
  const newAccounts = ((validation as unknown) as { json: Account[] }).json;
  if (settings.s.enableStorageEnctyption) {
    const hasPass = await promptForPassword(accounts);
    if (hasPass) {
      const cryptoParams = await getCryptoParams(mpPass.value);
      const accProm = newAccounts.map(async (a) => {
        if (a.pk.length === 64) {
          a.pk = `0x${a.pk}`;
        }
        a.encPk = await encrypt(a.pk, cryptoParams);
        return a;
      });
      const encNewAccounts = await Promise.all(accProm);
      await replaceAccounts([...accounts, ...encNewAccounts]);
      alertHeader.value = "Success";
      alertMsg.value = "Successfully imported new accounts.";
      alertOpen.value = true;
      noAccounts.value = false;
    }
    return false;
  } else {
    await replaceAccounts([
      ...accounts,
      ...newAccounts.map((a) => {
        a.encPk = "";
        return a;
      }),
    ]);
    alertHeader.value = "Success";
    alertMsg.value = "Successfully imported new accounts.";
    alertOpen.value = true;
    noAccounts.value = false;
  }
};

const exportAcc = async () => {
  const accounts = await getAccounts();
  if (!accounts.length) {
    alertMsg.value = "You need at least one account to export.";
    alertOpen.value = true;
  }
  if (settings.s.enableStorageEnctyption) {
    const hasPass = await promptForPassword(accounts);
    if (hasPass) {
      const cryptoParams = await getCryptoParams(mpPass.value);
      const accProm = accounts.map(async (a) => {
        a.pk = await decrypt(a.encPk, cryptoParams);
        return a;
      });
      const encNewAccounts = await Promise.all(accProm);
      exportFile("wallet_export.json", JSON.stringify(encNewAccounts, null, 2));
    }
    return false;
  } else {
    exportFile("wallet_export.json", JSON.stringify(accounts, null, 2));
  }
};

onIonViewWillEnter(async () => {
  await Promise.all([
    getSettings().then((storeSettings) => {
      settings.s = storeSettings;
      lockOutPeriod.value = settings.s.lockOutPeriod;
      radioTheme.value = settings.s.theme;
    }),
    getAccounts().then((accounts) => {
      if (accounts.length) {
        noAccounts.value = false;
      }
    }),
  ]);
  loading.value = false;
});

const setTime = async () => {
  loading.value = true;
  if (lockOutPeriod.value < 2 || lockOutPeriod.value > 120) {
    loading.value = false;
    alertMsg.value = "Auto-lock period must be between 2 and 120";
    alertOpen.value = true;
    return;
  }
  settings.s.lockOutPeriod = Math.trunc(lockOutPeriod.value);
  await saveSettings();
  loading.value = false;
  toastMsg.value = "Auto-lock period was set";
  toastState.value = true;
};

const modalDismiss = () => {
  setEncryptToggle(settings.s.enableStorageEnctyption);
};
</script>

<style lang="css" scoped>
.helper-label {
  font-size: 0.82rem;
  opacity: 0.85;
  margin: -0.1rem 0 0.6rem 0;
}

.dark .file-input-cls {
  cursor: pointer;
  background-color: #222428;
}
.file-input-cls {
  cursor: pointer;
  background-color: #f4f5f8;
}

.dark .export-border {
  border-top: 1px solid #222;
}
.export-border {
  border-top: 1px solid #eee;
}
</style>
