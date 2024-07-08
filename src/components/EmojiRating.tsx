import { Component, createEffect, createSignal, Index, Show } from "solid-js";

import styles from "../App.module.css";

type Rating =
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      rating: { name: string; count: number }[];
    };

const EmojiRating: Component = () => {
  const [rating, setRating] = createSignal<Rating>({
    status: "loading",
  });

  createEffect(async () => {
    setRating({
      status: "loading",
    });

    const res = await fetch(`/api/emoji/rating`);
    const data = await res.json();

    setRating({
      status: "loaded",
      rating: data,
    });
  });

  const getRating = () => {
    const r = rating();
    if (r.status == "loaded") {
      return r.rating;
    }
  };

  const countReaction = (n: number) => {
    if (n > 1000) {
      return '☠️'
    }

    if (n > 500) {
      return '🤯'
    }

    if (n > 250) {
      return '😳'
    }

    if (n > 100) {
      return '😎'
    }

    if (n > 50) {
      return '😊'
    }

    if (n > 10) {
      return '👍'
    }

    if (n > 0) {
      return '👌'
    }
    return '🤔'
  }

  return (
    <Show when={getRating()} fallback={<div>Loading...</div>}>
      {(rating) => (
        <Index each={rating()}>
          {(row) => (
            <div class={styles["emoji-row"]}>
              <div class={styles["name"]}>{row().name}</div>
              <div>{row().count}{countReaction(row().count)}</div>
            </div>
          )}
        </Index>
      )}
    </Show>
  );
};

export default EmojiRating;
