import { ref, watch } from 'vue'


const unlockModalState = ref(false)

export const unlockModalStateSubscribe = (callback: (state: boolean) => void) => {
    watch(unlockModalState, callback)
}

export const setUnlockModalState = (state: boolean) => {
    if ( state !== unlockModalState.value ) {
        unlockModalState.value = state
    }
}