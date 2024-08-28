import { Component, createEffect, createSignal, Show } from "solid-js";
import c3 from "c3";

import styles from "../App.module.css";
import { compareDesc, format, startOfDay } from "date-fns";
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
  let chartElement!: HTMLDivElement;

  createEffect(async () => {
    setStats({
      status: "loading",
    });

    const res = await fetch(`/api/stats/weekly?id=${props.userId}`);
    const data = await res.json();

    const entries: StatsEntry[] = data.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
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

    const filteredEntries = Array.from(
      groupEntries
        .values()
        .map((group) => group.sort((a, b) => compareDesc(a.date, b.date))[0])
        .map((entry) => ({ ...entry, date: startOfDay(entry.date) }))
    );

    setStats({
      status: "loaded",
      stats: filteredEntries,
    });
  });

  createEffect(() => {
    const currentStats = stats();
    if (currentStats.status != "loaded") {
      return;
    }

    const chart = c3.generate({
      bindto: chartElement,
      data: {
        json: currentStats.stats,
        x: "date",
        keys: {
          x: "date",
          value: ["watchedMinutes"],
        },
      },
      legend: {
        show: false,
      },
      color: {
        pattern: ["#ffffff"],
      },
      axis: {
        x: {
          type: "timeseries",
          show: false,
        },
        y: {
          show: false,
        },
      },
      interaction: {
        enabled: false,
      },
    });
  });

  return (
    <>
      <div>Статистика просмотренного</div>
      <div class={[styles.hint, styles.mb].join(" ")}>за неделю</div>
      <div ref={chartElement} class={styles.chart}>
        Chart will be here
      </div>
      <div>
        <Show when={getStats(stats())} fallback={"Loading plot"}>
          {(stats) => <Plot data={stats()} />}
        </Show>
      </div>
    </>
  );
};

export default WeeklyStats;
