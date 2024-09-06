import { Component, createEffect, createSignal, Show } from "solid-js";

import styles from "../App.module.css";
import {
  addMinutes,
  compareDesc,
  format,
  parseJSON,
  startOfDay,
} from "date-fns";
import Plot from "./Plot";

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

const getStats = (stats: Stats) =>
  stats.status == "loaded" ? stats.stats : null;

const WeeklyStats: Component<{
  userId: number;
}> = (props) => {
  const [stats, setStats] = createSignal<Stats>({
    status: "loading",
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
  });

  return (
    <>
      <div>Статистика просмотренного</div>
      <div class={[styles.hint, styles.mb].join(" ")}>за неделю</div>
      <div>
        <Show when={getStats(stats())} fallback={"Loading plot"}>
          {(stats) => (
            <Plot
              data={stats()}
              width={350}
              height={308}
              marginLeft={50}
              marginRight={20}
              marginTop={20}
              marginBottom={20}
            />
          )}
        </Show>
      </div>
    </>
  );
};

export default WeeklyStats;
