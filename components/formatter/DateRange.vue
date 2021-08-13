<script>
import day from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from '@/store/prefs';
import { escapeHtml } from '@/utils/string';

export default {
  props: {
    tagName: {
      type:    String,
      default: 'span',
    },

    value: {
      type:     Object,
      required: true,
    },

    showDate: {
      type:    Boolean,
      default: true,
    },

    showTime: {
      type:    Boolean,
      default: true,
    },

  },

  computed: {
    fromDate() {
      const dateFormat = escapeHtml( this.$store.getters['prefs/get'](DATE_FORMAT));

      return day(this.value.from).format(dateFormat);
    },

    toDate() {
      if (day(this.value.from).isSame(day(this.value.to), 'day')) {
        return null;
      }

      const dateFormat = escapeHtml( this.$store.getters['prefs/get'](DATE_FORMAT));

      return day(this.value.to).format(dateFormat);
    },

    fromTime() {
      const timeFormat = escapeHtml( this.$store.getters['prefs/get'](TIME_FORMAT));

      return day(this.value.from).format(timeFormat);
    },

    toTime() {
      if (['day', 'hour', 'minute', 'second'].every(unit => day(this.value.from).isSame(day(this.value.to), unit))) {
        return null;
      }

      const timeFormat = escapeHtml( this.$store.getters['prefs/get'](TIME_FORMAT));

      return day(this.value.to).format(timeFormat);
    }
  },
};
</script>

<template>
  <component :is="tagName">
    <span>{{ fromDate }}</span>
    <span v-if="!toDate">{{ fromTime }}</span>
    <span v-if="toDate || toTime">-</span>
    <span v-if="toDate">{{ toDate }}</span>
    <span v-if="toTime">{{ toTime }}</span>
  </component>
</template>
