<template>
  <q-page class="flex flex-center">
    
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
      ],
      stations: [],
      queue: []
    }
  },
  methods: {
    
  }
}
</script>
