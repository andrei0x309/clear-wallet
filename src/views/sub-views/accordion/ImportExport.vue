<template>
  <input
    ref="importFile"
    type="file"
    accept=".json"
    class="file-input-cls"
    id="importFile"
    aria-hidden="true"
    style="display: none"
    inert
  />
  <ion-item class="ion-no-padding no-inner-border">
    <ion-label>Import Additional Accounts</ion-label>
    <ion-button color="warning" @click="importAcc">Import</ion-button>
  </ion-item>
  <ion-item class="ion-no-padding export-border">
    <ion-label>Export All Accounts</ion-label>
    <ion-button color="warning" @click="exportAcc">Export</ion-button>
  </ion-item>
</template>

<script lang="ts" setup>
import { ref, Ref, Reactive } from "vue";
import { getAccounts, replaceAccounts, unBlockLockout } from "@/utils/platform";
import { decrypt, encrypt, getCryptoParams } from "@/utils/webCrypto";
import { Account, Settings } from "@/extension/types";
import { IonItem, IonLabel, IonButton } from "@ionic/vue";
import { exportFile } from "@/utils/misc";
import { useUnlockModal } from "@/composables/useUnlockModal";

const props = defineProps<{
  refs: () => {
    alertMsg: Ref<string>;
    alertOpen: Ref<boolean>;
    alertHeader: Ref<string>;
    settings: Reactive<{ s: Settings }>;
    noAccounts: Ref<boolean>;
  };
}>();

const { alertMsg, alertOpen, alertHeader, settings, noAccounts } = props.refs();

const importFile = (ref(null) as unknown) as Ref<HTMLInputElement>;

const encPass = ref("");

const { openUnlockModal } = useUnlockModal();

const showAlert = (msg: string, header = "Error") => {
  alertMsg.value = msg;
  alertOpen.value = true;
  alertHeader.value = header;
};

const validateFile = async () => {
  try {
    importFile.value.click();
    await new Promise((resolve) => {
      importFile.value.addEventListener("change", () => {
        resolve("");
      });
    });

    if (!importFile.value?.value?.length) {
      return {
        error: "Import json file is missing",
      };
    }
    const reader = new FileReader();
    const readerPromise = new Promise((resolve) => {
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
    });
    reader.readAsText(importFile.value?.files?.[0] as File);
    return await readerPromise;
  } catch {
    return {
      error: "Parsing JSON file",
    };
  }
};

const promptForPassword = async (accounts: Account[]) => {
  let isCorectPass = false;
  do {
    encPass.value = (await openUnlockModal("importExport")) as string;
    if (!encPass.value) {
      showAlert("Password is required!");
      return false;
    }
    try {
      const cryptoParams = await getCryptoParams(encPass.value);
      if (accounts?.[0]?.encPk) {
        await decrypt(accounts[0].encPk, cryptoParams);
      }
      isCorectPass = true;
    } catch {
      isCorectPass = false;
      showAlert("Password is incorrect!");
    }
  } while (!isCorectPass);
  unBlockLockout();
  return true;
};

const importAcc = async () => {
  const validation = (await validateFile()) as { error: any };
  if (validation.error) {
    showAlert(validation.error);
    return;
  }
  const accounts = await getAccounts();
  const newAccounts = ((validation as unknown) as { json: Account[] }).json;
  const filterExistingAccounts = newAccounts.filter(
    (a) => !accounts.find((acc) => acc.address === a.address)
  );

  if (!filterExistingAccounts.length) {
    showAlert("Imported file does not contain any new accounts.");
    return;
  }

  if (settings?.s?.enableStorageEnctyption) {
    const hasPass = await promptForPassword(accounts);
    if (hasPass) {
      const cryptoParams = await getCryptoParams(encPass.value);
      const accProm = filterExistingAccounts.map(async (a) => {
        if (a.pk.length === 64) {
          a.pk = `0x${a.pk}`;
        }
        a.encPk = await encrypt(a.pk, cryptoParams);
        a.pk = "";
        return a;
      });
      const encNewAccounts = await Promise.all(accProm);
      await replaceAccounts([...accounts, ...encNewAccounts]);
      showAlert("Successfully imported new accounts.", "Success");
      noAccounts.value = false;
    }
    return false;
  } else {
    await replaceAccounts([...accounts, ...filterExistingAccounts]);
    showAlert("Successfully imported new accounts.", "Success");
    noAccounts.value = false;
  }
  unBlockLockout();
};

const exportAcc = async () => {
  console.log(settings?.s?.enableStorageEnctyption, "enableStorageEnctyption");
  const accounts = await getAccounts();
  if (!accounts.length) {
    showAlert("You need at least one account to export.");
  }
  if (settings?.s?.enableStorageEnctyption) {
    const hasPass = await promptForPassword(accounts);
    if (hasPass) {
      const cryptoParams = await getCryptoParams(encPass.value);
      const accProm = accounts.map(async (a) => {
        a.pk = await decrypt(a.encPk, cryptoParams);
        return {
          name: a.name,
          pk: a.pk,
          address: a.address,
        };
      });
      const encNewAccounts = await Promise.all(accProm);
      exportFile("wallet_export.json", JSON.stringify(encNewAccounts, null, 2));
      showAlert("Successfully exported accounts.", "Success");
    }
    return false;
  } else {
    exportFile(
      "wallet_export.json",
      JSON.stringify(
        accounts.map((a) => ({ name: a.name, pk: a.pk, address: a.address })),
        null,
        2
      )
    );
    showAlert("Successfully exported accounts.", "Success");
  }
  unBlockLockout();
};
</script>
