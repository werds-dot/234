import { ref } from 'vue'

export type AppView = 'main' | 'skills'

// Module-level singleton ref so the workbench entry (LeftPanel) and the shell
// (App) share one view state without a full router dependency. This is the
// Vue analogue of the Next.js /skills route.
const view = ref<AppView>('main')

export function useAppView() {
  return {
    view,
    goToSkills: () => {
      view.value = 'skills'
    },
    goToMain: () => {
      view.value = 'main'
    },
  }
}
