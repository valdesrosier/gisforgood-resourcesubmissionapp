interface GCAppsConfiguration {
  arcgisClientId: string;
  portalUrl: string;
  layerUrl: string;
}

declare global {
  interface Window {
    __GCAPPS_CONFIG__?: GCAppsConfiguration;
  }
}

export const configuration: GCAppsConfiguration = window.__GCAPPS_CONFIG__ ?? {
  arcgisClientId: '',
  portalUrl: '',
  layerUrl: '',
};