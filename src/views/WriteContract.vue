<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Contract Write Action</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button @click="selectSavedAction" expand="block"
        >Load saved wite action</ion-button
      >
      <ion-item>
        <template v-if="selectedAbi">
          <p>Selected Abi: {{ selectedAbi }}</p>
        </template>
        <template v-else>
          <p>No Abi selected</p>
        </template>

        <ion-button @click="openAbiListModal()" expand="block">Load Abi</ion-button>
      </ion-item>
      <ion-item>
        <ion-icon :icon="clipboardOutline" @click="paste('pasteContract')" />
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
          <ion-list v-for="(param, index) in params" :key="index" class="param-list">
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
          </ion-list>
          <ion-item v-if="!params?.length">
            <ion-label>Function has no params</ion-label>
          </ion-item>
        </ion-list>
      </template>
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

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="loadingSend ? 0 : 4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      />

      <iframe
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

<script lang="ts">
import { Ref, defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
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
  modalController,
  IonList,
  IonAlert,
  IonLoading,
  IonButtons,
  IonModal,
} from "@ionic/vue";
import { paste, writeCASet, getAbis } from "@/utils/platform";
import { clipboardOutline } from "ionicons/icons";
import type { ContractAction } from "@/extension/types";
import { ethers } from "ethers";
import { getSelectedAddress } from "@/utils/wallet";
import AbiList from "./AbiList.vue";
import AbiSelectFunction from "./AbiSelectFunction.vue";
import SavedReadWriteActionList from "./SavedReadWriteActionList.vue";
import { walletPromptSendTx } from "@/extension/userRequest";
import SelectedContacts from "./ContactsSelect.vue";

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
    IonIcon,
    IonList,
    IonAlert,
    IonLoading,
    IonButtons,
    IonModal,
  },
  setup: () => {
    const savedModalState = ref(false);
    const saveActionModal = ref(false);
    const alertOpen = ref(false);
    const alertMsg = ref("");
    const name = ref("");
    const loadingSend = ref(false);
    const contractAddress = ref("");
    const functionName = ref("");
    const params = ref([]) as Ref<{ value: string; type: string; name: string }[]>;
    const evalFrame = ref() as Ref<HTMLIFrameElement>;
    let messagePromiseResolve: (v: unknown) => void = () => {};
    const sandboxLoaded = ref(false);
    const abiContent = ref("");
    const selectedAbi = ref("");
    const alertHeader = ref("");
    let parsedAbi: any;
    const functions = ref([]) as Ref<string[]>;
    const loading = ref(false);

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
          type: "write",
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
          return (alertOpen.value = true);
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
        return (alertOpen.value = true);
      }
      if (!contractAddress.value) {
        alertMsg.value = "Contract Address is required";
        return (alertOpen.value = true);
      }
      if (abiContent.value === "") {
        alertMsg.value = "Abi is required";
        return (alertOpen.value = true);
      }
      saveActionModal.value = true;
    };

    const executeAction = async () => {
      if (sandboxLoaded.value === false) {
        alertMsg.value = "Sandbox for eval not loaded yet, please wait";
        return (alertOpen.value = true);
      }

      if (!contractAddress.value) {
        alertMsg.value = "Contract Address is required";
        return (alertOpen.value = true);
      }

      if (!functionName.value) {
        alertMsg.value = "Function Name is required";
        return (alertOpen.value = true);
      }

      if (!parsedAbi) {
        alertMsg.value = "Abi is required";
        return (alertOpen.value = true);
      }

      alertHeader.value = "Error";

      // const provider = await getCurrentProvider();
      const encodeParamsTypes = [];
      const evalParams = await Promise.all(
        params.value.map(async (param) => await getEvalValue(param.value))
      );

      try {
        if (functionName.value?.includes("(")) {
          const paramsTypes = functionName.value
            .split("(")[1]
            .split(")")[0]
            .split(",")
            .map((param) => param.trim());
          if (paramsTypes.length !== evalParams.length) {
            alertMsg.value = "Params count mismatch";
            return (alertOpen.value = true);
          }
          encodeParamsTypes.push(...paramsTypes);
        }
      } catch {
        alertMsg.value =
          "Function Siganture wrong format (ex: 'functionName(uint256,string)')";
        return (alertOpen.value = true);
      }

      const fnName = functionName.value.includes("(")
        ? functionName.value.split("(")[0]
        : functionName.value;

      const iface = new ethers.Interface(parsedAbi);

      try {
        loadingSend.value = true;
        loading.value = true;
        const data = iface.encodeFunctionData(fnName, evalParams);

        const tx = {
          from: [await getSelectedAddress()][0],
          to: contractAddress.value,
          data,
          gasLimit: "0x0",
          gasPrice: "0x0",
        };

        const result = (await walletPromptSendTx(tx)) as {
          error?: string;
        };
        if (result?.error) {
          console.error(result);
          alertOpen.value = true;
          alertMsg.value = "Error sending transaction to chain";
          loading.value = false;
          return;
        } else {
          alertHeader.value = "OK";
          alertMsg.value = "Transaction sent successfully";
          alertOpen.value = true;
        }
      } catch (e) {
        console.error(e);
        alertMsg.value = "Function call failed, check params, contract address and ABI";
        loadingSend.value = false;
        loading.value = false;
        return (alertOpen.value = true);
      }
      loadingSend.value = false;
      loading.value = false;
    };

    const saveAction = async () => {
      if (!name.value) {
        alertMsg.value = "Name is required";
        return (alertOpen.value = true);
      }
      const action = {
        name: name.value,
        contract: contractAddress.value,
        functionName: functionName.value,
        params: params.value,
        abi: selectedAbi.value,
      };

      await writeCASet(action);
      saveActionModal.value = false;
      alertMsg.value = "Action saved successfully";
      alertHeader.value = "OK";
      return (alertOpen.value = true);
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

    const handleFnChange = (event: any) => {
      functionName.value = event.detail.value;
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

    return {
      saveActionModal,
      handleFnChange,
      clipboardOutline,
      evalFrame,
      alertOpen,
      alertMsg,
      alertHeader,
      functionName,
      paste,
      savedModalState,
      name,
      contractAddress,
      params,
      saveActionInStorage,
      executeAction,
      sandboxLoaded,
      openAbiListModal,
      selectedAbi,
      functions,
      selectFunction,
      saveAction,
      selectSavedAction,
      loading,
      loadingSend,
      openModalAddContact,
    };
  },
});
</script>
