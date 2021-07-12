<template>
    <audio ref="audio" id="audio"></audio>
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

import {mapGetters, mapActions} from 'vuex';
export default {
    data() {
        return {
            audio: null,
            nextAudio: null
        }
    },
    computed: {
        ...mapGetters({
            index: 'getIndex',
            isPlaying: 'isPlaying',
            duration: 'getDuration',
            time: 'getTime',
            queue: 'getQueue'
        })
    },
    methods: {
        ...mapActions(['setIsPlaying', 'setTime', 'setDuration', 'selectSong', 'togglePlaying']),
        initAudio() {
            this.audio = this.$refs.audio;

            this.addEventListeners();
        },
        addEventListeners() {
            this.audio.addEventListener('play', this.onAudioPlay)
            this.audio.addEventListener('pause', this.onAudioPause)
            this.audio.addEventListener('durationchange', this.onAudioDurationChange)
            this.audio.addEventListener('timeupdate', this.onAudioTimeUpdate)
            this.audio.addEventListener('ended', this.onAudioEnded)
        },
        onAudioDurationChange(e) {
            this.setDuration(this.audio.duration);
        },
        onAudioTimeUpdate(e) {
            this.setTime(this.audio.currentTime);
        }, 
        onAudioPause(e) {
            this.setIsPlaying(false)
        },
        onAudioPlay() {
            this.setIsPlaying(true)
        },
        onAudioEnded() {
            this.selectSong(this.getNextSongIndex());
        },
        getNextSongIndex() {
            if(this.index === this.queue.length - 1) return 0;
            return this.index + 1;
        }
    },
    watch: {
        index: function(i) {
            if(this.nextAudio && this.nextAudio.index === i) {
                this.audio = this.nextAudio.audio;
                this.addEventListeners();
            }
            else {
                this.audio.src = convertSong(this.queue[i].path)
            }
            this.nextAudio = null;
            this.audio.play();
        },
        queue: function(s) {
            if(this.index === 0) {
                this.audio.src = convertSong(this.queue[this.index].path);
                this.audio.play();
            }
        },
        isPlaying: function(p) {
            if(p) this.audio.play();
            else this.audio.pause();
        },
        time: function(t) {
            if(this.duration > 0 && this.duration - this.time < 3) {
                this.nextAudio = {
                    index: this.getNextSongIndex(),
                    audio: document.createElement('audio')
                }
                this.nextAudio.audio.src = convertSong(this.queue[this.nextAudio.index].path);
            }
        }
    },
    mounted() {
        this.initAudio();
        if(this.queue) {
            // set first song
        }
        this.$root.$on('timeSet', (percentage) => {
            this.audio.currentTime = percentage * this.audio.duration;
        })

        window.addEventListener('keydown', (e) => {
            if(e.key === "Space") {
                e.preventDefault();
                this.togglePlaying();
            }
        })
    }
}
</script>