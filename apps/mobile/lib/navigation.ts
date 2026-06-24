import { router } from 'expo-router';

const HOME_ROUTE = '/(tabs)';

/**
 * Pop the current screen when there is navigation history, otherwise fall back
 * to the dashboard. Prevents "dead" back buttons on screens that were opened as
 * the first route (deep link, reload, or notification tap).
 */
export const goBackOrHome = () => {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(HOME_ROUTE as never);
};
