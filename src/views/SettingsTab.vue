<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group v-if="!loading">
  <ion-accordion value="1">
    <ion-item slot="header" color="light">
      <ion-label>Security</ion-label>
    </ion-item>
    <div class="ion-padding" slot="content">
      <ion-list>
      <ion-list>
            <ion-item>
              <ion-label>Enable Storage Encryption</ion-label>
              <ion-toggle :key="updateKey" @ion-change="changeEncryption" slot="end" :checked="settings.s.enableStorageEnctyption"></ion-toggle>
            </ion-item>
            <ion-item>
              This will require to input an encrypto key when storage is locked.
            </ion-item>
          </ion-list>
          <ion-item :disabled="!settings.s.enableStorageEnctyption">
            <ion-label>Enable Auto Lock</ion-label>
            <ion-toggle :key="updateKey"  slot="end" :checked="settings.s.lockOutEnabled"></ion-toggle>
          </ion-item>
          <ion-list>
          <ion-item  :disabled="!settings.s.enableStorageEnctyption || settings.s.lockOutEnabled">
            <ion-label>Auto-lock Period: (2-120) minutes</ion-label>
          </ion-item> 
          <ion-item  :disabled="!settings.s.enableStorageEnctyption || settings.s.lockOutEnabled">
          <ion-input :key="updateKey"  v-model="settings.s.lockOutPeriod" type="number"></ion-input>
        </ion-item>
        <ion-item  :disabled="!settings.s.enableStorageEnctyption || settings.s.lockOutEnabled">
          <ion-button @click="setTime">Set Auto-lock</ion-button>
      </ion-item>
      </ion-list>
          <ion-list>
            <ion-item>
              <ion-label>Permanent Lock</ion-label>
              <ion-toggle :key="updateKey" slot="end" :disabled="!settings.s.enableStorageEnctyption" :checked="settings.s.encryptAfterEveryTx"></ion-toggle>
            </ion-item>
            <ion-item>Will require decrypt pass before any sign or transaction</ion-item>
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
              <ion-radio-group :value="settings.s.theme">
                  <ion-item>
                    <ion-radio
                      slot="start"
                      value="system"
                    />
                    <ion-label>System Default</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-radio
                      slot="start"
                      value="dark"
                    />
                    <ion-label>Dark</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-radio
                      slot="start"
                      value="light"
                    />
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
      About text
    </div>
  </ion-accordion>
  <ion-accordion value="4">
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
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-modal
        :is-open="mpModal"
        @did-dismiss="mpModal=false;modalDismiss()"
      >
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button @click="mpModal=false">Close</ion-button>
              </ion-buttons>
              <ion-title>Create Encryption Password</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list v-if="settings.s.enableStorageEnctyption">
          <ion-item>
            <ion-label>Old Passord</ion-label>
          </ion-item> <ion-item>
          <ion-input v-model="mpPass" type="password"></ion-input>
        </ion-item>
      </ion-list>
      <div v-else>
            <ion-list>
          <ion-item>
            <ion-label>New Password</ion-label>
          </ion-item> <ion-item>
          <ion-input v-model="mpPass" type="password"></ion-input>
        </ion-item>
      </ion-list>
      <ion-list>
          <ion-item>
            <ion-label>Confirm</ion-label>
          </ion-item> <ion-item>
          <ion-input v-model="mpConfirm" type="password"></ion-input>
        </ion-item>
      </ion-list>
    </div>
      <ion-item>
          <ion-button @click="confirmModal">Confirm</ion-button>
        </ion-item>
          </ion-content>
      </ion-modal>
      <ion-alert
      :is-open="alertOpen"
      header="Error"
      :message="alertMsg"
      :buttons="['OK']"
      @didDismiss="alertOpen=false"
    ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { storageWipe, getSettings, setSettings, getAccounts, saveSelectedAccount, replaceAccounts } from "@/utils/platform";
import { decrypt, encrypt } from "@/utils/webCrypto"
// import { Account } from '@/extension/type'
import type { Settings } from "@/extension/types"
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
  IonToast
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
    IonToast
  },
  setup() {
    const loading = ref(true);
    const mpModal = ref(false);
    const mpPass = ref('');
    const mpConfirm = ref('');
    const updateKey = ref(0);
    const alertOpen = ref(false);
    const alertMsg = ref('');
    const toastState = ref(false);
    const toastMsg = ref('');

    const wipeStorage = async () => {
      loading.value = true;
      await storageWipe();
      loading.value = false;
    };
    const settings = reactive({
      s: null as unknown as Settings
    }) as { s: Settings}
    
    const saveSettings = async () => {
      loading.value = true
      settings.s.lockOutPeriod = settings.s.lockOutPeriod * 6e4
      await setSettings(settings.s)
      loading.value = false
    }

    const setEncryptToggle = (state: boolean) => {
      settings.s.enableStorageEnctyption = state
      updateKey.value++
    }

    const changeEncryption = async () => {
      loading.value = true
      mpModal.value = true
      loading.value = false
    }

    const confirmModal = async () => {
      loading.value = true
      if(mpPass.value.length  < 3) {
        loading.value = false
        alertMsg.value = 'Password is too short. More than 3 characters are required.';
        alertOpen.value = true
        setEncryptToggle(settings.s.enableStorageEnctyption)
        return
      }

      if (!settings.s.enableStorageEnctyption) {
        if (mpPass.value !== mpConfirm.value) {
        loading.value = false
        alertMsg.value = 'Password and confirm password do not match';
        alertOpen.value = true
        setEncryptToggle(settings.s.enableStorageEnctyption)
        return
      }
      let accounts = await getAccounts()
      const accProm = accounts.map(async a => {
        a.encPk = await encrypt(mpPass.value, a.pk)
        a.pk = ''
        console.log(a)
        return a
      })
      accounts = await Promise.all(accProm)
      console.log(accounts)
      await replaceAccounts(accounts)
      await saveSelectedAccount(accounts[0])
      setEncryptToggle(true)
      await setSettings(settings.s)
      mpPass.value = ''
      mpConfirm.value = ''
      mpModal.value = false
      } else {
        try {
        let accounts = await getAccounts()
        const accProm = accounts.map(async a => {
          if(a.encPk) {
            a.pk = await decrypt(a.encPk, mpPass.value)
          }
          return a
        })
        accounts = await Promise.all(accProm)
        await replaceAccounts(accounts)
        await saveSelectedAccount(accounts[0])
        setEncryptToggle(false)
        settings.s.lockOutEnabled = false
        settings.s.encryptAfterEveryTx = false
        await setSettings(settings.s)
        mpPass.value = ''
        mpConfirm.value = ''
        mpModal.value = false
        } catch {
        loading.value = false
        alertMsg.value = 'Decryption failed, password is not correct.';
        alertOpen.value = true
        setEncryptToggle(settings.s.enableStorageEnctyption)
        return
        }
      }

    // settings.s.enableStorageEnctyption = true;
    loading.value = false
    }
      

    onIonViewWillEnter( () => {
      getSettings().then((storeSettings) =>
      {
        settings.s = storeSettings
        settings.s.lockOutPeriod = (settings.s.lockOutPeriod / 6e4)
        loading.value = false
      })
      
    })

    const setTime = async () => {
      loading.value = true
       if ( settings.s.lockOutPeriod < 2 || settings.s.lockOutPeriod > 120){
        loading.value = false
        alertMsg.value = 'Auto-lock period must be between 2 and 120';
        alertOpen.value = true
        return
       }
       settings.s.lockOutPeriod = Math.trunc(settings.s.lockOutPeriod)
       await saveSettings()
       loading.value = false
       toastMsg.value = 'Auto-lock period was set';
       toastState.value = true
    }

    const modalDismiss = () => {
      setEncryptToggle(settings.s.enableStorageEnctyption)
    }

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
      toastMsg
    };
  },
});
</script>
