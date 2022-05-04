// import './style.scss';

// import React, { Component, createRef } from 'react';
// import {
//   EuiBasicTable
// } from '@elastic/eui';
// import LogDrawer from '../../../LogDrawer';
// import { createColumns } from '../Basic/Basic';
// import { WorkloadBreakdown } from '../../../../utils/requests';
// import { sortBy } from 'lodash';

// const TYPE = 'workload';

// export interface WorkloadProps {
//   breakdown: WorkloadBreakdown[];
// }

// export default class Workload extends Component<WorkloadProps> {
//   render() {
//     const drawerRef = createRef<LogDrawer>();
//     const columns = createColumns('workload', drawerRef);

//     // const items = [
//     //   {
//     //     group: true,
//     //     name: 'Namespace: super-socks'
//     //   },
//     //   {
//     //     name: 'kubelet',
//     //     anomaly: 0,
//     //     suspicious: 2,
//     //     normal: 197000
//     //   },
//     // ];

//     const groups: {[key: string]: WorkloadBreakdown[] } = {};
//     this.props.breakdown.forEach(breakdown => {
//       const breakdowns = ( groups[breakdown.namespace] || [] );
//       breakdowns.push(breakdown);
//       groups[breakdown.namespace] = breakdowns;
//     });

//     Object.keys(groups)
//       .forEach((namespace) => groups[namespace] = sortBy(groups[namespace], 'anomalous'));

//     const rows = Object.entries(groups)
//       .reduce((agg, [namespace, breakdowns]) => {
//         agg.push({group: true, name: `Namespace: ${namespace}`}, ...breakdowns);
//         return agg;
//       }, [])


//     function getRowProps(item) {
//       return item.group ? { className: 'group' } : {};
//     }

//     return (
//         <div className="workload-breakdown">
//           <EuiBasicTable
//             tableCaption={TYPE}
//             items={rows}
//             columns={columns}
//             rowProps={getRowProps}
//           />
//           <LogDrawer ref={drawerRef} type={TYPE} />
//         </div>
//     );
//   }
// }
