<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Network</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button @click="templateModal=true" expand="block">Add from popular chain list</ion-button>
      <ion-item>
        <ion-label>Name</ion-label>
        <ion-input v-model="name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>ChainId</ion-label>
        <ion-input v-model="chainId"  type="number"></ion-input>
      </ion-item>
      <ion-item button>
        <ion-icon :icon="clipboardOutline" @click="paste('pasteRpc')" />
        <ion-label>RPC URL</ion-label>
        <ion-input id="pasteRpc" v-model="rpc" ></ion-input>
      </ion-item>
      <ion-item>
        <ion-button  @click="onCancel">Cancel</ion-button>
        <ion-button @click="onAddNetwork">Add Network</ion-button>
      </ion-item>
      <ion-alert
      :is-open="alertOpen"
      header="Error"
      :message="alertMsg"
      :buttons="['OK']"
      @didDismiss="alertOpen=false"
    ></ion-alert>
    </ion-content>
    
    <ion-modal :is-open="templateModal" @will-dismiss="templateModal=false">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="templateModal=false">Close</ion-button>
            </ion-buttons>
            <ion-title>Select</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list  style="margin-bottom: 4rem;">
              <ion-list-header>
                <ion-label>Networks</ion-label>
              </ion-list-header>

              <ion-segment  :value="currentSegment" @ion-change="segmentChange">
  <ion-segment-button value="mainnets">
    <ion-label>Main Networks</ion-label>
  </ion-segment-button>
  <ion-segment-button value="testnets">
    <ion-label>Test Networks</ion-label>
  </ion-segment-button>
</ion-segment>

              <div v-if="currentSegment==='mainnets'" >
              <ion-list class="ion-padding" v-for="network of Object.values(mainNets)" :key="network.chainId">
                <ion-item button style="cursor:pointer;" @click="fillTemplate(network)">
                  <ion-avatar style="margin-right: 1rem;">
    <img :alt="network.name" :src="getUrl('assets/chain-icons/' + network.icon)" />
  </ion-avatar><ion-label>{{network.name}}</ion-label>
                </ion-item>
              </ion-list>
            </div>
            <div v-else>
              <ion-list class="ion-padding" v-for="network of Object.values(testNets)" :key="network.chainId">
                <ion-item button style="cursor:pointer;" @click="fillTemplate(network)">
                  <ion-avatar style="margin-right: 1rem;">
    <img :alt="network.name" :src="getUrl('assets/chain-icons/' + network.icon)" />
  </ion-avatar><ion-label>{{network.name}}</ion-label>
                </ion-item>
              </ion-list>
            </div>

          </ion-list>
        </ion-content>
      </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon,
   IonModal, IonList, IonSegment, IonSegmentButton, IonListHeader, IonButtons, IonAvatar, modalController, IonAlert
  } from "@ionic/vue";
import {  getNetworks, saveSelectedNetwork, saveNetwork, getUrl, paste } from "@/utils/platform";
import router from "@/router";
import { mainNets, testNets } from "@/utils/networks"

import { clipboardOutline } from "ionicons/icons";

export default defineComponent({
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon,
     IonModal, IonList, IonSegment, IonSegmentButton, IonListHeader, IonButtons, IonAvatar, IonAlert },
  setup: () => {
    const name = ref('')
    const chainId = ref(0)
    const rpc = ref('')
    const templateModal = ref(false)
    const currentSegment = ref('mainnets')
    const alertOpen = ref(false)
    const alertMsg = ref('')

    const resetFields = () => {
      name.value = ''
      chainId.value = 0
      rpc.value = ''
    }

    const onAddNetwork = async () => {
      if( Number(chainId.value) < 1){
            alertMsg.value = "Chain Id must be a valid decimal integer"
            return alertOpen.value = true
        }
        if (name.value.length < 2) {
          alertMsg.value = "Name must have at least 2 characters"
            return alertOpen.value = true
        }
        if (name.value.length > 99) {
            alertMsg.value = "Name must be less than 100 characters"
            return alertOpen.value = true
        }
        if (name.value.length > 99) {
          try{
            new URL(rpc.value)
          } catch {
            alertMsg.value = "RPC must be a valid URL"
            return alertOpen.value = true
          }
        }
        let p1 = Promise.resolve()
        const networks = await getNetworks()
        if( (Object.keys(networks).length ?? 0) < 1 ){
            p1 = saveSelectedNetwork({
                name: name.value,
                chainId: chainId.value,
                rpc: rpc.value
            })
        } else {

          if(chainId.value in networks){
            alertMsg.value = "Network already exists."
            return alertOpen.value = true
          }
        }
        const p2 = saveNetwork({
                name: name.value,
                chainId: chainId.value,
                rpc: rpc.value
        })
        await Promise.all([p1, p2])
        router.push('/')
        resetFields()
    }

    const segmentChange = (value: any) => {
      currentSegment.value = value.detail.value
    }

    const onCancel = () => {
        router.push('/')
    }

    const fillTemplate = (network: typeof mainNets[1] ) =>{
      name.value = network.name
      chainId.value = network.chainId
      rpc.value = network.rpc
      modalController.dismiss(null, 'cancel')
    }

    return {
        name,
        chainId,
        onAddNetwork,
        rpc,
        onCancel,
        paste,
        clipboardOutline,
        templateModal,
        currentSegment,
        mainNets,
        testNets,
        segmentChange,
        getUrl,
        fillTemplate,
        alertOpen,
        alertMsg
    }

  }
});
</script>
