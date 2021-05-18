<template>
  <BaseBrowser />
</template>

<script>
import {mapActions} from 'vuex';

import BaseBrowser from '../components/browser/BaseBrowser.vue';

export default {
  name: 'PageIndex',
  components: {
    BaseBrowser
  },
  data() {
    return {
      stations: []
    }
  },
  methods: {
    ...mapActions(['fetchStations'])
  },
  created() {
    try {
      //this.$q.dark.set(true);
      this.fetchStations();
    } catch(e) {
      console.log(e);
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-page {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
</style>