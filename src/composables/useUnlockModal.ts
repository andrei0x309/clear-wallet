import { modalController } from "@ionic/vue";
import UnlockModal from "@/views/UnlockModal.vue";
import { setUnlockModalState } from "@/utils/unlockStore";
import { blockLockout } from "@/utils/platform";

export function useUnlockModal() {
  const openUnlockModal = async (unlockType: string): Promise<boolean | string> => {
    const modal = await modalController.create({
      component: UnlockModal,
      animated: true,
      focusTrap: false,
      backdropDismiss: false,
      componentProps: {
        unlockType,
      },
    });

    await modal.present();
    setUnlockModalState(true);

    const { role, data } = await modal.onWillDismiss();
    
    if (role === "confirm") {
      blockLockout();
      setUnlockModalState(false);
      return data as string;
    }

    setUnlockModalState(false);
    return false;
  };

  return {
    openUnlockModal,
  };
}