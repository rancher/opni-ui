<script>
import bb, { area, selection } from 'billboard.js';
import { randomStr } from '@/utils/string';
import day from 'dayjs';
import { formatSi } from '@/utils/units';

const SELECTED_RADIUS = 7;

export default {
  name:       'TimeSeries',
  components: { },
  props:      {
    regions: {
      type:    Array,
      default: () => []
    },
    dataSeries: {
      type:     Object,
      required: true
    },

    // name of data series to use as x axis. If null, index is used
    xKey: {
      type:    String,
      default: 'x'
    },

    // TODO use DATE_FORMAT and TIME_FORMAT prefs instead
    // date/time format for x axis labels
    xFormat: {
      type:    String,
      default: '%H:%M %d %b'
    },

    chartId: {
      type:    String,
      default: () => randomStr(4)
    }
  },
  data() {
    return {
      showReset:              false,
      chart:                  null,
      lastOver:               null,
      initialRegionSelection: null
    };
  },

  computed: {
    api() {
      return {
        ...this.chart,
        highlightData:   this.highlightData,
        unHighlightData: this.unHighlightData
      };
    }
  },

  watch: {
    regions() {
      if (this.regions.length === 0) {
        this.chart.regions.remove();
      } else {
        this.chart.regions(this.regions);
      }
    }
  },
  mounted() {
    this.createChart();

    this.$emit('onDataShown', this.chart.data.shown().map(s => s.id), this.api);
  },

  methods: {
    createChart() {
      const columns = [];
      const colors = {};

      Object.entries(this.dataSeries).map(([key, val]) => {
        columns.push( [key, ...val.data]);
        if (val.color) {
          colors[key] = val.color;
        }
      });

      const data = {
        columns,
        colors,
        x:         this.xKey,
        type:      area(),
        selection: { enabled: selection(), draggable: false },
        onover:    (d, f, g ) => {
          this.$set(this, 'lastOver', d);
          if (this.initialRegionSelection) {
            this.$emit('regionDrag', this.getSelection());
          }
          this.$emit('over', d, columns);
        },
        onout: (d) => {
          this.$emit('out', d, columns);
        },
        onshown: (d) => {
          this.$emit('onDataShown', d, this.api);
        },
        onhidden: (d) => {
          this.$emit('onDataHidden', d, this.api);
        },
        onclick: (d) => {
        },
        onselected:   this.onSelected,
        onunselected: this.onUnselected,
        axes:         {
          Normal: 'y2', Suspicious: 'y', Anomaly: 'y'
        },
      };

      this.chart = bb.generate(
        {
          data,
          bindto:  { element: `#${ this.chartId }` },
          axis:   {
            x: {
              type:   'timeseries',
              tick: {
                format: this.xFormat, fit: true, width: 50, height: 200
              },
              height: 40,
            },
            y: {
              min:     0,
              padding: { bottom: 0 },
              type:    'indexed',
              tick:    {
                format(y) {
                  return formatSi(y);
                }
              }
            },
            y2: {
              show: true,
              tick:    {
                format(y) {
                  return formatSi(y);
                }
              }
            }
          },
          // point:   { focus: { expand: { enabled: false }, only: false }, select: { r: SELECTED_RADIUS } },
          legend:  {
            show: false, position: 'inset', inset: { step: 4 }
          },
          tooltip: { contents: this.formatTooltip },
          grid:    {
            x: { show: true },
            y: { show: true }
          },
          regions:    this.regions,
          transition:  { duration: 0 },
          onrendered: (d) => {
            this.$emit('onRendered', d, this.api);
            this.repositionHighlights();
          },
        }
      );
    },

    showTooltip(tooltip) {
      this.chart.tooltip.show(tooltip);
    },

    hideTooltip() {
      this.chart.tooltip.hide();
    },

    formatTooltip(data) {
      let out = "<div class='simple-box'>";

      out += `<div class="strong mb-5">${ day(data[0].x).format('MMMM D - HH:mm:ss') }</div>`;
      data.forEach((category) => {
        out += `<div><div class="color mr-5" style="background-color:${ this.dataSeries[category.id].color }"></div>${ category.name }: ${ category.value }</div>`;
      });

      return `${ out }</div>`;
    },

    resetZoom() {
      this.onZoomStart();
      this.chart.unzoom();
      this.showReset = false;
    },

    onZoomStart() {
      const allRects = document.querySelectorAll('.highlight-rect');

      allRects.forEach((rect) => {
        rect.style.display = 'none';
      });
    },

    onZoomEnd() {
      this.showReset = true;
    },

    onSelected(d, element) {
      this.$emit('selected', d);
      if (this.dataSeries[d.id].shouldHighlight) {
        const highlightRect = this.createHighlightRect(element, d.index);

        element.parentNode.insertBefore(highlightRect, element);
      }
    },

    onUnselected(d, element) {
      this.$emit('unselected', d);
      const highlight = document.querySelector(`#highlight-${ d.index }`);

      if (highlight) {
        highlight.remove();
      }
    },

    highlightData(id, filter) {
      const data = this.dataSeries[id]?.data || [];

      const relevantIndices = data.reduce((all, point, idx) => {
        if (!filter || filter(point)) {
          all.push(idx);
        }

        return all;
      }, []);

      this.chart.select(id, relevantIndices, true);
    },

    unHighlightData() {
      const allRects = document.querySelectorAll('.highlight-rect');

      allRects.forEach(rect => rect.remove());
      this.chart.unselect();
    },

    createHighlightRect(element, idx) {
      const out = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      out.setAttribute('height', 286);
      out.setAttribute('width', (SELECTED_RADIUS * 2) + 4);
      out.setAttribute('x', element.cx.baseVal.value - SELECTED_RADIUS - 2);
      out.classList.add('highlight-rect');
      out.id = `highlight-${ idx }`;

      return out;
    },

    repositionHighlights() {
      const allRects = document.querySelectorAll('.highlight-rect');

      allRects.forEach((rect) => {
        const idx = (rect.id || '').match(/[0-9]+$/g)[0];
        const circleClass = `.bb-circle-${ idx }`;
        const circleElem = document.querySelector(circleClass);

        if (circleElem) {
          const newRect = rect.cloneNode(true);

          newRect.setAttribute('x', circleElem.cx.baseVal.value - SELECTED_RADIUS - 2 );
          newRect.style.display = 'inherit';
          rect.parentNode.replaceChild(newRect, rect);
        } else {
          rect.remove();
        }
      });
    },

    mouseDown() {
      this.$set(this, 'initialRegionSelection', this.lastOver);
    },

    mouseUp() {
      this.$emit('regionSelected', this.getSelection());
      this.$set(this, 'initialRegionSelection', null);
    },

    getSelection() {
      if (this.lastOver === this.initialRegionSelection) {
        return null;
      }

      const selection = [day(this.initialRegionSelection.x.valueOf()), day(this.lastOver.x.valueOf())];

      if (selection[1].isBefore(selection[0])) {
        selection.reverse();
      }

      return {
        from: selection[0],
        to:   selection[1]
      };
    }
  }
};
</script>

<template>
  <div>
    <div :id="chartId" @mousedown="mouseDown" @mouseup="mouseUp">
      ...
    </div>
    <slot class="legend" name="legend" v-bind="api" />
  </div>
</template>

<style lang="scss">
.timeseries {
  .bb>svg{
    overflow: inherit !important;
  }
  .bb-main {
    fill: var(--input-label);

    .domain {
      fill: none;
      stroke: var(--default-text);
      stroke-width: 1px;
    }

    .bb-grid{
      stroke: var(--input-border);
      stroke-width: 1px;
    }

    .bb-axis-y>g:last-of-type {
      transform: translate(0,5px);
    }

    .bb-chart-lines .bb-lines .bb-line {
      fill: none;
    }

    .bb-area {
      opacity: 0.25 !important
    }

    .highlight-rect {
      fill: var(--error);
      fill-opacity: 0.25;

      // animation: fadeIn ease-in 1;
      // animation-fill-mode: forwards;
      // animation-duration: 0.25s;
    }

    @keyframes fadeIn {
      from { fill-opacity: 0; }
      to { fill-opacity: 0.25; }
    }

    .bb-selected-circles circle{
      fill:none;
    }

    .bb-zoom-brush{
      fill: var(--primary-banner-bg)
    }
  }

  g.bb-legend  {
    fill: var(--input-label);
    > g.bb-legend-background > rect {
      fill: none;
    }
  }

  // g.bb-legend-item-hidden:not(.bb-legend-item-focused) {
  //   opacity: 0.3;
  // }

  .bb-tooltip-container {
    .simple-box {
      $padding: 15px;

      background: var(--simple-box-bg) 0% 0% no-repeat padding-box;
      box-shadow: 0px 0px 10px var(--simple-box-shadow);
      border: 1px solid var(--simple-box-border);
      border-radius: var(--border-radius);
      padding: $padding;

      .strong {
        font-weight: bold;
        font-size: 14px;
        line-height: 14px;
      }

      .color {
        $size: 10px;

        display: inline-block;
        width: $size;
        height: $size;
      }

      .top {
        line-height: 24px;
        font-size: 18px;
        border-bottom: 1px solid var(--simple-box-divider);
        padding-bottom: $padding;
        margin: 0 -15px 10px -15px;
        padding: 0 15px 15px 15px;
        align-items: center;
        display: flex

        & BUTTON {
          padding: 0;
          height: fit-content;
          align-self: flex-start;
        }

        & H2{
          margin-bottom: 0;
        }
      }

      .content {
        padding: $padding;
      }
    }
  }
}
</style>
