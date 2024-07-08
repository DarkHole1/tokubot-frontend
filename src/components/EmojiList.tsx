import { Component, createEffect, createSignal, Index, Show } from "solid-js";

import styles from "../App.module.css";

type Reactions =
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      reactions: { [K: string]: number };
    };

const EmojiList: Component<{
  userId: number;
  isMyList: boolean;
}> = (props) => {
  const [reactions, setReactions] = createSignal<Reactions>({
    status: "loading",
  });

  createEffect(async () => {
    const id = props.userId;

    setReactions({
      status: "loading",
    });

    const res = await fetch(`/api/emoji?id=${id}`);
    const data = await res.json();

    setReactions({
      status: "loaded",
      reactions: data,
    });
  });

  const getReactions = () => {
    const r = reactions();
    if (r.status == "loaded") {
      return r.reactions;
    }
    return null;
  };

  return (
    <>
      <div>
        {props.isMyList // initData()?.user?.id == showUserID()
          ? "Ваши реакции"
          : "Реакции пользователя"}
      </div>
      <div class={[styles.hint, styles.mb].join(" ")}>за сегодня</div>
      <Show when={getReactions()} fallback={<div>Загружаем...</div>}>
        {(reactions) => (
          <>
            <Show when={Object.keys(reactions()).length == 0}>
              <div>Сегодня вы ещё не ставили реакции</div>
            </Show>
            <div class={styles["emoji-container"]}>
              <Index
                each={Object.entries(reactions())
                  .filter((r) => r[0] != "custom")
                  .sort((a, b) => b[1] - a[1])}
              >
                {(reaction) => (
                  <div class={styles["emoji-block"]}>
                    {reaction()[1]}
                    {reaction()[0]}
                  </div>
                )}
              </Index>
            </div>
            <Show when={reactions()["custom"]}>
              {(custom) => (
                <div class={styles.hint}>
                  ...и {custom()} пользовательских реакций
                </div>
              )}
            </Show>
          </>
        )}
      </Show>
    </>
  );
};

export default EmojiList;
