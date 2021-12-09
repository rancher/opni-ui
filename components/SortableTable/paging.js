import { ROWS_PER_PAGE } from '@/store/prefs';
import { PAGE } from '@/config/query-params';

export default {
  computed: {
    count() {
      return this.paging === 'async' ? this.pagingAsyncCount : this.filteredRows.length;
    },

    perPage() {
      let out = this.rowsPerPage || 0;

      if ( out <= 0 ) {
        out = parseInt(this.$route.query.limit, 10) || 0;
      }

      if ( out <= 0 ) {
        out = parseInt(this.$store.getters['prefs/get'](ROWS_PER_PAGE), 10) || 0;
      }

      // This should ideally never happen, but the preference value could be invalid, so return something...
      if ( out <= 0 ) {
        out = 10;
      }

      return out;
    },

    indexFrom() {
      return Math.max(0, 1 + this.perPage * (this.page - 1));
    },

    indexTo() {
      return Math.min(this.count, this.indexFrom + this.perPage - 1);
    },

    totalPages() {
      return Math.ceil(this.count / this.perPage );
    },

    showPaging() {
      return this.paging && this.totalPages > 1;
    },

    pagingDisplay() {
      const opt = {
        ...(this.pagingParams || {}),

        count: this.count,
        pages: this.totalPages,
        from:  this.indexFrom,
        to:    this.indexTo,
      };

      return this.$store.getters['i18n/t'](this.pagingLabel, opt);
    },

    pagedRows() {
      if ( this.paging ) {
        return this.filteredRows.slice(this.indexFrom - 1, this.indexTo);
      } else {
        return this.filteredRows;
      }
    }
  },

  data() {
    return {
      loadingPage: false,
      loadedPages: 1,
      page:        (this.paging !== 'async' ? this.$route.query[PAGE] : null) || 1
    };
  },

  watch: {
    pagedRows() {
      // Go to the last page if we end up "past" the last page because the table changed

      const from = this.indexFrom;
      const last = this.count;

      if ( this.page > 1 && from > last ) {
        this.setPage(this.totalPages);
      }
    },

    sortFields(old, neu) {
      if ( old.join(',') === neu.join(',') ) {
        // Nothing really changed

      }

      // Go back to the first page when sort changes
      this.setPage(1);
    }
  },

  methods: {
    setPage(num) {
      if (this.page === num) {
        return;
      }
      this.page = num;

      if ( this.paging === 'async') {
        return;
      }

      if ( num === 1 ) {
        this.$router.applyQuery({ [PAGE]: undefined });
      } else {
        this.$router.applyQuery({ [PAGE]: num });
      }
    },

    goToPage(which) {
      let page;

      switch (which) {
      case 'first':
        page = 1;
        break;
      case 'prev':
        page = Math.max(1, this.page - 1 );
        break;
      case 'next':
        page = Math.min(this.totalPages, this.page + 1 );
        this.loadNextPage(page);
        break;
      case 'last':
        page = this.totalPages;
        break;
      }

      this.setPage(page);
    },

    async loadNextPage(page) {
      if (page > this.loadedPages) {
        this.loadingPage = true;

        await this.pagingAsyncLoadNextPage();
        this.loadingPage = false;
      }
    }
  }
};
