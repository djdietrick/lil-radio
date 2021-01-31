<template>
  <q-page class="flex flex-center">
    <q-media-player
      type="audio"
      :sources="sources">

    </q-media-player>
  </q-page>
</template>

<script>
import dataurl from 'dataurl';
import fs from 'fs';

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
      sources: [
        {
          src: convertSong('C:/Temp/test.mp3'),
          type: 'audio/mp3'
        }
      ]
    }
  },
  methods: {
    
  }
}
</script>
