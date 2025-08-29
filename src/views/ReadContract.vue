<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Read From Contract</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button @click="selectSavedAction" expand="block"
        >Load saved read action</ion-button
      >
      <ion-item>
        <template v-if="selectedAbi">
          <p>Selected Abi: {{ selectedAbi }}</p>
        </template>
        <template v-else>
          <p>No Abi selected</p>
        </template>

        <ion-button style="margin-left: 0.4rem" @click="openAbiListModal()" expand="block"
          >Load Abi</ion-button
        >
      </ion-item>
      <ion-item>
        <ion-icon
          :icon="clipboardOutline"
          @click="paste('pasteContract')"
          style="margin-right: 0.5rem; cursor: pointer"
        />
        <ion-input
          label="Contract Address(*)"
          label-placement="stacked"
          v-model="contractAddress"
          id="pasteContract"
          placeholder="0x..."
          type="text"
          style="font-size: 0.8rem"
        ></ion-input>
      </ion-item>
      <ion-item button>
        <ion-button @click="openModalAddContact()">
          Load address from contacts
        </ion-button>
      </ion-item>
      <ion-item button>
        <template v-if="!functions.length">
          <p>Select Abi with functions to enable function selection</p>
        </template>
        <template v-else>
          <template v-if="functionName">
            <p>Selected Function: {{ functionName }}</p>
            <ion-button @click="selectFunction()" expand="block">Change</ion-button>
          </template>
          <template v-else>
            <p>No Function selected</p>
            <ion-button @click="selectFunction()" expand="block">Select</ion-button>
          </template>
        </template>
        <!-- <ion-input
          aria-label="function signature"
          placeholder="exists(uint256)"
          v-model="functionName"
        ></ion-input> -->
      </ion-item>
      <template v-if="functionName">
        <ion-item>
          <ion-label>PARAMS NOTES:</ion-label>
        </ion-item>
        <ion-list>
          <ion-item
            >Will be evaluated in sandbox using js eval in order to pass complex types
            like [1,2 [1,0x...]]</ion-item
          >
          <ion-item
            >Strings must be passed using qoutes example '0x3...1A2', or ['param1',
            'param2'] for multiple params.</ion-item
          >
          <ion-item
            >Params are sent exactly as they are, numbers are not parsed to UINT256
            format.
          </ion-item>
          <ion-item>SET PARAMS: </ion-item>
          <ion-list class="param-list">
            <ion-item v-for="(param, index) in params" :key="index">
              <ion-item>
                <ion-label style="font-size: 0.85rem"
                  >P:{{ Number(index) + 1 }} name: {{ param.name }} type: ({{
                    param.type
                  }})</ion-label
                >
              </ion-item>
              <ion-item>
                <ion-input
                  aria-label="value"
                  v-model="param.value"
                  placeholder="ex: 1 or 0x22 or 'hello' or [1, 2] etc "
                  type="text"
                ></ion-input>
              </ion-item>
            </ion-item>
          </ion-list>
          <ion-item v-if="!params?.length">
            <ion-label>Function has no params</ion-label>
          </ion-item>
        </ion-list>
      </template>
      <ion-item>
        <ion-textarea
          label="Result"
          label-placement="stacked"
          style="overflow-y: scroll"
          :rows="10"
          :cols="40"
          :value="result"
          readonly
        ></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-button @click="saveActionInStorage">Save Action</ion-button>
        <ion-button @click="executeAction">Execute Action</ion-button>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>

      <iframe
        title="eval-sandbox"
        @load="sandboxLoaded = true"
        ref="evalFrame"
        src="eval-sandbox.html"
        style="display: none"
      ></iframe>
    </ion-content>

    <ion-modal :is-open="saveActionModal" @will-dismiss="saveActionModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="saveActionModal = false">Close</ion-button>
          </ion-buttons>
          <ion-title>Select</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list style="margin-bottom: 4rem">
          <ion-item>
            <ion-input
              label="Name(*)"
              label-placement="stacked"
              v-model="name"
              placeholder="ex: Get lens hande from id"
              type="text"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-button @click="saveActionModal = false">Cancel</ion-button>
            <ion-button @click="saveAction">Save</ion-button>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts" setup>
import { Ref, ref, onMounted, onBeforeUnmount } from "vue";
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
  IonIcon,
  IonTextarea,
  modalController,
  IonList,
  IonAlert,
  IonModal,
  IonButtons,
} from "@ionic/vue";
import { paste, readCASet, getAbis } from "@/utils/platform";
import { clipboardOutline } from "ionicons/icons";
import type { ContractAction } from "@/extension/types";
import { ethers } from "ethers";
import { getCurrentProvider } from "@/utils/wallet";
import AbiList from "./AbiList.vue";
import AbiSelectFunction from "./AbiSelectFunction.vue";
import SavedReadWriteActionList from "./SavedReadWriteActionList.vue";
import SelectedContacts from "./ContactsSelect.vue";

const savedModalState = ref(false);
const saveActionModal = ref(false);
const alertOpen = ref(false);
const alertMsg = ref("");
const name = ref("");
const contractAddress = ref("");
const functionName = ref("");
const params = ref([]) as Ref<{ value: string; type: string; name: "" }[]>;
const result = ref("");
const evalFrame = ref() as Ref<HTMLIFrameElement>;
let messagePromiseResolve: (v: unknown) => void = () => {};
const sandboxLoaded = ref(false);
const abiContent = ref("");
const selectedAbi = ref("");
const alertHeader = ref("");
let parsedAbi: any;
const functions = ref([]) as Ref<string[]>;

const openAbiListModal = async () => {
  const modal = await modalController.create({
    component: AbiList,
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "confirm") {
    abiContent.value = data.content;
    selectedAbi.value = data.name;
    parsedAbi = JSON.parse(abiContent.value);
    functions.value = parsedAbi
      .filter((fn: any) => fn.type === "function")
      .map((fn: any) => fn.name);
  }
};

const selectFunction = async () => {
  const modal = await modalController.create({
    component: AbiSelectFunction,
    componentProps: {
      functions: functions.value,
    },
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "confirm") {
    functionName.value = data;
    params.value = parsedAbi
      .find((fn: any) => fn.name === data)
      .inputs.map((input: any) => {
        return { value: "", type: input.type, name: input.name };
      });
  }
};

const selectSavedAction = async () => {
  const modal = await modalController.create({
    component: SavedReadWriteActionList,
    componentProps: {
      type: "read",
    },
  });

  modal.present();
  const { data, role } = (await modal.onWillDismiss()) as {
    data: ContractAction;
    role: string;
  };

  if (role === "confirm") {
    const content = await getAbis(data.abi);
    if (!content) {
      alertMsg.value =
        "Abi not found in storage, be sure Abi with name " + data.abi + " exists.";
      alertOpen.value = true;
      return;
    }

    abiContent.value = content;
    functionName.value = data.functionName;
    params.value = Object.values(data.params);
    contractAddress.value = data.contract;
    selectedAbi.value = data.abi;
    parsedAbi = JSON.parse(abiContent.value);

    functions.value = parsedAbi
      .filter((fn: any) => fn.type === "function")
      .map((fn: any) => fn.name);
  }
};

const saveActionInStorage = () => {
  if (!functionName.value) {
    alertMsg.value = "Function Name is required";
    alertOpen.value = true;
    return;
  }
  if (!contractAddress.value) {
    alertMsg.value = "Contract Address is required";
    alertOpen.value = true;
    return;
  }
  if (abiContent.value === "") {
    alertMsg.value = "Abi is required";
    alertOpen.value = true;
    return;
  }
  saveActionModal.value = true;
};

const executeAction = async () => {
  if (sandboxLoaded.value === false) {
    alertMsg.value = "Sandbox for eval not loaded yet, please wait";
    alertOpen.value = true;
    return;
  }

  if (!contractAddress.value) {
    alertMsg.value = "Contract Address is required";
    alertOpen.value = true;
    return;
  }

  if (!functionName.value) {
    alertMsg.value = "Function Name is required";
    alertOpen.value = true;
    return;
  }

  if (!parsedAbi) {
    alertMsg.value = "Abi is required";
    alertOpen.value = true;
    return;
  }

  alertHeader.value = "Error";

  const provider = await getCurrentProvider();
  const encodeParamsTypes = [];

  let evalParams: any[] = [];
  try {
    evalParams = await Promise.all(
      params.value.map(async (param) => await getEvalValue(param.value))
    );
  } catch {
    alertMsg.value = "Error parsing params, check params types";
    alertOpen.value = true;
    return;
  }

  try {
    if (functionName.value?.includes("(")) {
      const paramsTypes = functionName.value
        .split("(")[1]
        .split(")")[0]
        .split(",")
        .map((param) => param.trim());
      if (paramsTypes.length !== evalParams.length) {
        alertMsg.value = "Params count mismatch";
        alertOpen.value = true;
        return;
      }
      encodeParamsTypes.push(...paramsTypes);
    }
  } catch {
    alertMsg.value =
      "Function Siganture wrong format (ex: 'functionName(uint256,string)')";
    alertOpen.value = true;
    return;
  }

  const fnName = functionName.value.includes("(")
    ? functionName.value.split("(")[0]
    : functionName.value;

  const contract = new ethers.Contract(contractAddress.value, parsedAbi, provider);

  try {
    const res = await contract[fnName](...evalParams);
    result.value = res.toString();

    alertMsg.value = "Value from contract fetched check result area!";
    alertHeader.value = "OK";
    alertOpen.value = true;
    return;
  } catch (e) {
    alertMsg.value = "Function call failed, check params, contract address and ABI";
    alertOpen.value = true;
    return;
  }
};

const saveAction = async () => {
  if (!name.value) {
    alertMsg.value = "Name is required";
    alertOpen.value = true;
    return;
  }
  const action = {
    name: name.value,
    contract: contractAddress.value,
    functionName: functionName.value,
    params: params.value,
    abi: selectedAbi.value,
  };

  await readCASet(action);
  saveActionModal.value = false;
  alertMsg.value = "Action saved successfully";
  alertHeader.value = "OK";
  alertOpen.value = true;
  return;
};

const messageHandler = (event: any) => {
  messagePromiseResolve(event?.data?.result);
};

onMounted(() => {
  window.addEventListener("message", messageHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", messageHandler);
});

const getEvalValue = (evalString: string) => {
  return new Promise((resolve) => {
    if (!evalFrame.value?.contentWindow?.postMessage) {
      return;
    }
    messagePromiseResolve = resolve;
    evalFrame.value?.contentWindow?.postMessage({ code: evalString }, "*");
  });
};

const openModalAddContact = async () => {
  const modal = await modalController.create({
    component: SelectedContacts,
    componentProps: {},
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();
  if (role === "confirm") {
    contractAddress.value = data.address;
  }
};

const handleFnChange = (event: any) => {
  functionName.value = event.detail.value;
};
</script>

<style>
.param-list {
  --border-width: 1px; /* Set your desired border width */
}

.param-list ion-item {
  border-top: var(--border-width) solid #0ece6e;
}

.param-list ion-item:last-child {
  border-bottom: var(--border-width) solid #0ece6e;
}
</style>
