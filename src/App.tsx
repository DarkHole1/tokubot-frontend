import { createMemo, type Component } from "solid-js";

import styles from "./App.module.css";
import {
  bindThemeParamsCSSVars,
  useInitData,
  useThemeParams,
} from "@tma.js/sdk-solid";
import EmojiList from "./components/EmojiList";

const App: Component = () => {
  const tp = useThemeParams();
  bindThemeParamsCSSVars(tp());

  const initData = useInitData();
  const startParam = createMemo(() => initData()?.startParam);
  const showUserID = createMemo(
    () => startParam()?.split("_")[1] ?? initData()?.user?.id
  );

  return (
    <div class={styles.App}>
      <EmojiList
        userId={Number(showUserID())}
        isMyList={showUserID() == initData()?.user?.id}
      />
    </div>
  );
};

export default App;
