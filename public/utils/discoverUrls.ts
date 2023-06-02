import { Range } from "./time";
import Rison from 'rison';

/**
 * To derive these queries I'm going to the discover page and doing the following:
 *    1. Add all the filters I want manually
 *    2. Copy the url that's generated
 *    3. Split that url between the _a and _g query parameters
 *    4. Take those two queries separately and past them into https://observablehq.com/@nyurik/rison-online-decoder-encoder
 *    5. Hand tune the json that the rison decoder created
 */

export function clusterUrl(range: Range, clusterId: string, anomalyLevel?: AnomalyLevel) {
    const from = range.start.toISOString();
    const to = range.end.toISOString();

    const g = {
        "filters": [],
        "refreshInterval": {
            "pause": true,
            "value": 0
        },
        "time": {
            "from": from,
            "to": to
        },
    };

    const a = {
        "columns": ["_source"],
        "filters": [{
            "$state": {
                "store": "appState"
            },
            "meta": {
                "alias": null,
                "disabled": false,
                "key": "cluster_id",
                "negate": false,
                "params": {
                    "query": clusterId
                },
                "type": "phrase"
            },
            "query": {
                "match_phrase": {
                    "cluster_id": clusterId
                }
            }
        },
        {
            "$state": {
                "store": "appState"
            },
            "meta": {
                "alias": null,
                "disabled": false,
                "key": "anomaly_level",
                "negate": false,
                "params": {
                    "query": anomalyLevel || ""
                },
                "type": "phrase"
            },
            "query": {
                "match_phrase": {
                    "anomaly_level": anomalyLevel || ""
                }
            }
        }],
        "interval": "auto",
        "query": {
            "language": "kuery",
            "query": ""
        },
        "sort": []
    };

    return getUrlPrefix() + `_a=${Rison.encode(a)}&_g=${Rison.encode(g)}`;
}

function getUrlPrefix() {
    const appPrefix = (location as any)?.pathname.match(/.*\/app\//)[0];
    return `${appPrefix}discover#/?`;
}

export type AnomalyLevel = 'Anomaly' | 'Normal';