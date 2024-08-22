import { createMemo, Match, Switch, type Component } from "solid-js";

import styles from "./App.module.css";
import {
  bindThemeParamsCSSVars,
  useInitData,
  useThemeParams,
} from "@tma.js/sdk-solid";
import EmojiList from "./components/EmojiList";
import EmojiRating from "./components/EmojiRating";
import WeeklyStats from "./components/WeeklyStats";

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
      <Switch>
        <Match when={startParam() == "emoji_rating"}>
          <EmojiRating />
        </Match>
        <Match
          when={
            startParam()?.startsWith("emoji_") && isFinite(Number(showUserID()))
          }
        >
          <EmojiList
            userId={Number(showUserID())}
            isMyList={showUserID() == initData()?.user?.id}
          />
        </Match>
        <Match
          when={
            startParam()?.startsWith("stats_") && isFinite(Number(showUserID()))
          }
        >
          <WeeklyStats userId={Number(showUserID())} />
        </Match>
      </Switch>
    </div>
  );
};

export default App;
