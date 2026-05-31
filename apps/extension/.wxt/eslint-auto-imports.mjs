const globals = {
  "ConnectScreen": true,
  "ContentScriptContext": true,
  "InvalidMatchPattern": true,
  "MatchPattern": true,
  "MenuScreen": true,
  "MigrationError": true,
  "ScratchpadEditor": true,
  "browser": true,
  "createIframeUi": true,
  "createIntegratedUi": true,
  "createShadowRootUi": true,
  "defineAppConfig": true,
  "defineBackground": true,
  "defineConfig": true,
  "defineContentScript": true,
  "defineUnlistedScript": true,
  "defineWxtPlugin": true,
  "fakeBrowser": true,
  "injectScript": true,
  "storage": true,
  "useAppConfig": true,
  "useAuth": true,
  "useCallback": true,
  "useContext": true,
  "useEffect": true,
  "useMemo": true,
  "useReducer": true,
  "useRef": true,
  "useState": true
}

export default {
  name: "wxt/auto-imports",
  languageOptions: {
    globals,
    sourceType: "module",
  },
};
