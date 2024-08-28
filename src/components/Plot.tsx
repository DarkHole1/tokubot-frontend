import { Component, createEffect } from "solid-js";
import { StatsEntry } from "./WeeklyStats";
import * as d3 from "d3";

const formatDelta = (v: number) => {
  const suffixes = ["d", "h", "m"];
  const parts = [v / 60 / 24, (v / 60) % 24, v % 60]
    .map((p) => Math.floor(p))
    .map((p, i) => (p > 0 ? `${p}${suffixes[i]}` : ""))
    .filter((p) => p.length > 0);

  return parts.join(" ");
};

const Plot: Component<{
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  data: StatsEntry[];
}> = (props) => {
  const width = () => props.width ?? 640;
  const height = () => props.height ?? 400;
  const marginTop = () => props.marginTop ?? 20;
  const marginRight = () => props.marginRight ?? 20;
  const marginBottom = () => props.marginBottom ?? 20;
  const marginLeft = () => props.marginLeft ?? 20;
  const data = () => props.data;

  let axisBottomRef!: SVGGElement;
  let axisLeftRef!: SVGGElement;

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data().map((entry) => entry.date)) as [Date, Date])
    .range([marginLeft(), width() - marginRight()])
    .nice();

  const y = d3
    .scaleLinear()
    .domain(
      d3.extent(data().map((entry) => entry.watchedMinutes)) as [number, number]
    )
    .range([height() - marginBottom(), marginTop()])
    .nice();

  const line = d3
    .line<StatsEntry>()
    .x((d) => x(d.date))
    .y((d) => y(d.watchedMinutes));

  createEffect(() => {
    d3.select(axisBottomRef).call(d3.axisBottom(x).ticks(7));
  });

  createEffect(() => {
    d3.select(axisLeftRef).call(
      d3.axisLeft(y).tickFormat((v) => formatDelta(v.valueOf()))
    );
  });

  return (
    <svg width={width()} height={height()}>
      <g
        ref={axisBottomRef}
        transform={`translate(0,${height() - marginBottom()})`}
      ></g>
      <g ref={axisLeftRef} transform={`translate(${marginLeft()},0)`}></g>
      <path fill="none" stroke="white" stroke-width="1.5" d={line(data())!} />
      <g>
        {data().map((d, i) => (
          <circle
            cx={x(d.date)}
            cy={y(d.watchedMinutes)}
            r="2.5"
            fill="white"
          />
        ))}
      </g>
    </svg>
  );
};

export default Plot;
