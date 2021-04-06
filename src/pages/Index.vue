<template>
  <q-page class="flex flex-center main-page">
    <div class="main-page--left">

    </div>
    <div class="main-page--right">

    </div>
  </q-page>
</template>

<script>
import dataurl from 'dataurl';
import fs from 'fs';
import axios from 'axios';
import {mapActions} from 'vuex';

function convertSong(path) {
  const data = fs.readFileSync(path);
  return dataurl.convert({
    data,
    mimetype: 'audio/mp3'
  });
}

export default {
  name: 'PageIndex',
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