<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent, onBeforeMount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSettings } from "@/utils/platform";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { param, rid } = route.query;

    onBeforeMount(() => {
      getSettings().then((settings) => {
        if (settings.theme !== "system") {
          document.body.classList.remove(settings.theme === "dark" ? "light" : "dark");
          document.body.classList.add(settings.theme);
        }
      });
    });

    onMounted(() => {
      switch (route?.query?.route ?? "") {
        case "sign-msg": {
          router.push({
            path: `/sign-msg/${rid}/${param}`,
          });
          break;
        }
        case "sign-tx": {
          router.push({
            path: `/sign-tx/${rid}/${param}`,
          });
          break;
        }
        case "switch-network": {
          router.push({
            path: `/switch-network/${rid}/${param}`,
          });
          break;
        }
        case "request-network": {
          router.push({
            path: `/request-network/${rid}/${param}`,
          });
          break;
        }
        case "wallet-error": {
          router.push({
            path: `/wallet-error/${rid}/${param}`,
          });
          break;
        }
        default: {
          router.push({ path: "/" });
        }
      }
    });
  },
});
</script>
