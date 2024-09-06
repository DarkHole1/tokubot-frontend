import { Component, createEffect, createSignal, Match, Show, Switch } from "solid-js";

import styles from "../App.module.css";
import {
  addMinutes,
  compareDesc,
  format,
  parseJSON,
  startOfDay,
} from "date-fns";
import Plot from "./Plot";
import { ADT } from "ts-adt";

type Stats =
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      stats: StatsEntry[];
    };

export type StatsEntry = {
  plannedMinutes: number;
  watchedMinutes: number;
  date: Date;
};

type ProfilesLoader = ADT<{
  loading: {};
  loaded: {
    profiles: Profiles;
  };
}>;

type Profiles = {
  shikimori?: string;
  anilist?: string;
  myanimelist?: string;
};

const getStats = (stats: Stats) =>
  stats.status == "loaded" ? stats.stats : null;

const hasShikiProfile = (profiles: ProfilesLoader) => profiles._type == 'loaded' ? Boolean(profiles.profiles.shikimori) : false

const WeeklyStats: Component<{
  userId: number;
}> = (props) => {
  const [stats, setStats] = createSignal<Stats>({
    status: "loading",
  });
  const [profiles, setProfiles] = createSignal<ProfilesLoader>({
    _type: "loading",
  });

  createEffect(async () => {
    setStats({
      status: "loading",
    });

    const res = await fetch(`/api/stats/weekly?id=${props.userId}`);
    const data = await res.json();

    const entries: StatsEntry[] = data.map((entry: any) => ({
      ...entry,
      date: parseJSON(entry.date),
    }));

    const groupEntries = new Map<string, StatsEntry[]>();

    for (const entry of entries) {
      const day = format(entry.date, "y-M-d");
      let arr = groupEntries.get(day);
      if (!arr) {
        arr = [];
        groupEntries.set(day, arr);
      }

      arr.push(entry);
    }

    const filteredEntries = Array.from(groupEntries.values())
      .map((group) => group.sort((a, b) => compareDesc(a.date, b.date))[0])
      .map((entry) => ({
        ...entry,
        date: addMinutes(
          startOfDay(entry.date),
          -entry.date.getTimezoneOffset()
        ),
      }));
    const relativeEntries = filteredEntries.map((entry) => ({
      plannedMinutes: Math.max(
        0,
        entry.plannedMinutes - filteredEntries[0].plannedMinutes
      ),
      watchedMinutes: Math.max(
        0,
        entry.watchedMinutes - filteredEntries[0].watchedMinutes
      ),
      date: entry.date,
    }));

    setStats({
      status: "loaded",
      stats: relativeEntries,
    });

    if (relativeEntries.length == 0) {
      setProfiles({ _type: "loading" });
      const res = await fetch(`/api/links?id=${props.userId}`);
      const data = await res.json();

      setProfiles({ _type: 'loaded', profiles: data })
    }
  });

  return (
    <>
      <div>Статистика просмотренного</div>
      <div class={[styles.hint, styles.mb].join(" ")}>за неделю</div>
      <div>
        <Show when={getStats(stats())} fallback={"Loading plot"}>
          {(stats) => (<Switch>
            <Match when={stats().length > 3}>
              <Plot
                data={stats()}
                width={350}
                height={308}
                marginLeft={50}
                marginRight={20}
                marginTop={20}
                marginBottom={20}
              />
            </Match>
            <Match when={stats().length > 0 || (stats().length == 0 && hasShikiProfile(profiles()))}>
              На вас пока что маловато статистики. Подождите пару дней (и посмотрите аниме) :3
            </Match>
            <Match when={profiles()._type == 'loaded' && !hasShikiProfile(profiles())}>
              Кажется вы ещё не добавили профиль на Шики в Руби
            </Match>
          </Switch>
          )}
        </Show>
      </div>
    </>
  );
};

export default WeeklyStats;
