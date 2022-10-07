<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRoute, useRouter} from "vue-router";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  setup () {
    const route = useRoute()
const router = useRouter()
const { param, rid } = route.query;
console.log(route?.query,'zzzzzzzzzzzzzzz')


switch (route?.query?.route ?? "") {
  case "sign-msg": {
    router.push({
      path: `/sign-msg/${rid}/${param}`
    });
    break;
  }
  case "sign-tx": {
    router.push({
      path: `/sign-tx/${rid}/${param}`
    });
    break;
  }
  case "switch-network": {
    router.push({
      path: `/switch-network/${rid}/${param}`
    });
    break;
  }
  default: {
    router.push({ path: "/", })
  }
}
  }
});
</script>
