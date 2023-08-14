<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group :value="defaultAccordionOpen" v-if="!loading">
        <ion-accordion value="1">
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
                  <ion-label>Enable Storage Encryption</ion-label>
                  <ion-toggle
                    :key="updateKey"
                    @ion-change="changeEncryption"
                    slot="end"
                    :checked="settings.s.enableStorageEnctyption"
                  ></ion-toggle>
                </ion-item>
                <ion-item>
                  This will require to input an encrypto key when storage is locked.
                </ion-item>
              </ion-list>
              <ion-item :disabled="!settings.s.enableStorageEnctyption">
                <ion-label>Enable Auto Lock</ion-label>
                <ion-toggle
                  :key="updateKey"
                  @ion-change="changeAutoLock"
                  slot="end"
                  :checked="settings.s.lockOutEnabled"
                ></ion-toggle>
              </ion-item>
              <ion-list>
                <ion-item
                  :disabled="
                    !settings.s.enableStorageEnctyption || !settings.s.lockOutEnabled
                  "
                >
                  <ion-label>Auto-lock Period: (2-120) minutes</ion-label>
                </ion-item>
                <ion-item
                  :disabled="
                    !settings.s.enableStorageEnctyption || !settings.s.lockOutEnabled
                  "
                >
                  <ion-input
                    :key="updateKey"
                    v-model="settings.s.lockOutPeriod"
                    type="number"
                  ></ion-input>
                </ion-item>
                <ion-item
                  :disabled="
                    !settings.s.enableStorageEnctyption || !settings.s.lockOutEnabled
                  "
                >
                  <ion-button @click="setTime">Set Auto-lock</ion-button>
                </ion-item>
              </ion-list>
              <ion-list>
                <ion-item>
                  <ion-label>Permanent Lock</ion-label>
                  <ion-toggle
                    @ion-change="changePermaLock"
                    :key="updateKey"
                    slot="end"
                    :disabled="!settings.s.enableStorageEnctyption"
                    :checked="settings.s.encryptAfterEveryTx"
                  ></ion-toggle>
                </ion-item>
                <ion-item
                  >Will require decrypt pass before any sign or transaction</ion-item
                >
              </ion-list>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion value="2">
          <ion-item slot="header" color="light">
            <ion-label>Theme</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-list>
              <ion-radio-group :value="radioTheme">
                <ion-item>
                  <ion-radio slot="start" value="system" @click="changeTheme('system')" />
                  <ion-label>System Default</ion-label>
                </ion-item>
                <ion-item>
                  <ion-radio slot="start" value="dark" @click="changeTheme('dark')" />
                  <ion-label>Dark</ion-label>
                </ion-item>
                <ion-item>
                  <ion-radio slot="start" value="light" @click="changeTheme('light')" />
                  <ion-label>Light</ion-label>
                </ion-item>
              </ion-radio-group>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion value="3">
          <ion-item slot="header" color="light">
            <ion-label>About</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <p>
              Clear EVM Wallet (CLW) is a fully open-source wallet built with Vue, Ionic,
              and Ethers.
            </p>
            <p>
              It emulates Metamask Wallet and can be used as a drop-in replacement, right
              now if you have both extensions, CLW will overwrite Metamask.
            </p>
            <p>
              Main philosophy of the wallet is: no trackers, full control, export/import
              JSONs with accounts, fast generate new accounts, and wipe everything with
              one click.
            </p>
            <p>
              Github Repo:
              <a href="#" @click="openTab('https://github.com/andrei0x309/clear-wallet')"
                >LINK</a
              >
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
            <p>
              Crypto-Leftists Discord
              <a href="#" @click="openTab('https://discord.gg/gzA4bTCdhb')">LINK</a>
            </p>
          </div>
        </ion-accordion>
        <ion-accordion value="4">
          <ion-item slot="header" color="light">
            <ion-label> Import / Export Accounts</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item>
              <ion-label>Import Additional Accounts</ion-label>
              <input ref="importFile" type="file" accept=".json" />
              <ion-button color="warning" @click="importAcc">Import</ion-button>
            </ion-item>
            <ion-item>
              <ion-label>Export All Accounts</ion-label>
              <ion-button color="warning" @click="exportAcc">Export</ion-button>
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion value="5">
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
      </ion-accordion-group>
      <ion-toast
        :is-open="toastState"
        @didDismiss="toastState = false"
        :message="toastMsg"
        :duration="1500"
      ></ion-toast>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
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
              <ion-input label="password" v-model="mpPass" type="password"></ion-input>
            </ion-item>
          </ion-list>
          <div v-else>
            <ion-list>
              <ion-item>
                <ion-label>New Password</ion-label>
              </ion-item>
              <ion-item>
                <ion-input label="password" v-model="mpPass" type="password"></ion-input>
              </ion-item>
            </ion-list>
            <ion-list>
              <ion-item>
                <ion-label>Confirm</ion-label>
              </ion-item>
              <ion-item>
                <ion-input
                  label="password"
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

<script lang="ts">
import { defineComponent, ref, reactive, Ref } from "vue";
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
  IonAccordion,
  IonAccordionGroup,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonAlert,
  IonToast,
} from "@ionic/vue";

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
    IonLoading,
    IonList,
    IonToggle,
    IonModal,
    IonInput,
    IonAccordion,
    IonAccordionGroup,
    IonRadioGroup,
    IonRadio,
    IonButtons,
    IonAlert,
    IonToast,
  },
  setup() {
    const loading = ref(true);
    const mpModal = ref(false);
    const mpPass = ref("");
    const mpConfirm = ref("");
    const updateKey = ref(0);
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const toastState = ref(false);
    const toastMsg = ref("");
    const alertHeader = ref("Error");
    const importFile = (ref(null) as unknown) as Ref<HTMLInputElement>;
    type ModalPromisePassword = null | {
      resolve: (p?: unknown) => void;
      reject: (p?: unknown) => void;
    };
    const modalGetPassword = ref(null) as Ref<ModalPromisePassword>;
    const noAccounts = ref(true);
    const defaultAccordionOpen = ref("0");
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
      updateKey.value++;
      defaultAccordionOpen.value = "1";
    };

    const changeAutoLock = async () => {
      settings.s.lockOutEnabled = !settings.s.lockOutEnabled;
      updateKey.value++;
      await saveSettings();
      defaultAccordionOpen.value = "1";
    };

    const changePermaLock = async () => {
      settings.s.encryptAfterEveryTx = !settings.s.encryptAfterEveryTx;
      updateKey.value++;
      await saveSettings();
      defaultAccordionOpen.value = "1";
    };

    const changeTheme = async (theme: "system" | "light" | "dark") => {
      document.body.classList.remove(radioTheme.value);
      document.body.classList.add(theme);
      radioTheme.value = theme;
      settings.s.theme = theme;
      await saveSettings();
      defaultAccordionOpen.value = "2";
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
      if (settings.s.lockOutPeriod < 2 || settings.s.lockOutPeriod > 120) {
        loading.value = false;
        alertMsg.value = "Auto-lock period must be between 2 and 120";
        alertOpen.value = true;
        return;
      }
      settings.s.lockOutPeriod = Math.trunc(settings.s.lockOutPeriod);
      await saveSettings();
      loading.value = false;
      toastMsg.value = "Auto-lock period was set";
      toastState.value = true;
    };

    const modalDismiss = () => {
      setEncryptToggle(settings.s.enableStorageEnctyption);
    };

    return {
      wipeStorage,
      loading,
      mpModal,
      settings,
      saveSettings,
      changeEncryption,
      mpPass,
      mpConfirm,
      confirmModal,
      updateKey,
      alertOpen,
      alertMsg,
      modalDismiss,
      setTime,
      toastState,
      toastMsg,
      importAcc,
      exportAcc,
      importFile,
      modalGetPassword,
      noAccounts,
      alertHeader,
      changeAutoLock,
      defaultAccordionOpen,
      changeTheme,
      openTab,
      radioTheme,
      changePermaLock,
    };
  },
});
</script>
