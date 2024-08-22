import { Component, createEffect, createSignal } from "solid-js";
import c3 from "c3";

import styles from "../App.module.css";

type Stats =
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      stats: StatsEntry[];
    };

type StatsEntry = {
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

    setStats({
      status: "loaded",
      stats: data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      })),
    });
  });

  createEffect(() => {
    const currentStats = stats();
    if (currentStats.status != "loaded") {
      return;
    }

    const chart = c3.generate({
      bindto: chartElement,
      // type: 'step',
      data: {
        json: currentStats.stats,
        x: "date",
        // xFormat: '%Y-%m-%dT%H:%M:%S.%fZ',
        keys: {
          x: "date",
          value: ["watchedMinutes"],
        },
      },
      legend: {
        show: false
      },
      color: {
        pattern: ['#ffffff']
      },
      axis: {
        x: {
          type: "timeseries",
          show: false
        //   tick: {
        //     count: 10,
        //     format: "%Y-%m-%d",
        //   },
        },
        y: {
            show: false
        //   label: {
        //     text: "Время, минут",
        //     position: "outer-middle",
        //   },
        },
      },
      interaction: {
        enabled: false
      }
    //   grid: {
    //     x: { show: true },
    //     y: { show: true },
    //   },
    });
  });

  return (
    <>
      <div>Статистика просмотренного</div>
      <div class={[styles.hint, styles.mb].join(" ")}>за неделю</div>
      <div ref={chartElement} class={styles.chart}>Chart will be here</div>
    </>
  );
};

export default WeeklyStats;
