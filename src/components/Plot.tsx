import { Component } from "solid-js";
import { StatsEntry } from "./WeeklyStats";
import * as d3 from "d3";

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

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data().map((entry) => entry.date)) as [Date, Date])
    .range([marginLeft(), width() - marginRight()])
    .nice();

  const y = d3
    .scaleLinear()
    .domain(
      d3.extent(data().map((entry) => entry.watchedMinutes)) as [number, number]
    )
    .range([marginLeft(), width() - marginRight()])
    .nice();

  const line = d3
    .line<StatsEntry>()
    .x((d) => x(d.date))
    .y((d) => y(d.watchedMinutes));

  return <svg width={width()} height={height()}>
    <path fill="none" stroke="white" stroke-width="1.5" d={line(data())!} />
    <g>
      {data().map((d, i) => (<circle cx={x(d.date)} cy={y(d.watchedMinutes)} r="2.5" />))}
    </g>
  </svg>;
};

export default Plot;
