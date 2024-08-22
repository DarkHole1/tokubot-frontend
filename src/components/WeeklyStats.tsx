import { Component, createEffect, createSignal } from "solid-js";

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

  return <pre>{getStats(stats())?.at(0)?.date.constructor.name}</pre>;
};

export default WeeklyStats;
