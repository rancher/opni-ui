import { sortBy } from "lodash";
import { Item } from "../components/Breakdowns/components/Basic/Basic";
import { BasicBreakdown } from "./requests";

export function getGroupBreakdown(breakdown: BasicBreakdown[]): Item[] {
    const grouping = {};
    breakdown.forEach(b => {
        grouping[b.clusterId] = grouping[b.clusterId] || [];
        grouping[b.clusterId].push(b);
    });

    Object.keys(grouping).forEach(groupKey => {
        grouping[groupKey] = sortBy(grouping[groupKey], [(group) => (group.anomaly || 0), (group) => (group.normal || 0)]).reverse()
    });

    const groupingArray = Object.entries(grouping)
        .map(([clusterId, values]) => [{group: true, name: `Cluster: ${clusterId}`}, ...(values as any)]);

    const sortedGroupingArray = sortBy(groupingArray, (group) => (group[1].anomaly || 0), (group) => (group[1].normal || 0)).reverse();

    return sortedGroupingArray.flat() as Item[];
}