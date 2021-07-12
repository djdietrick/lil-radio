<template>
    <div class="controller">
        <div class="controller__progress q-mx-xl">
            <q-linear-progress rounded size="20px" :value="progress" color="primary" @click="onClick">
                <div class="absolute-full flex flex-center" ref="progress">
                    <q-badge color="white" text-color="accent" :label="progressText"/>
                </div>
            </q-linear-progress>
        </div>
        <div class="controller__details">
            <div class="controller__details__title">
                {{selectedSong.title}}
            </div>
            <div class="controller__details__artist">
                {{selectedSong.artist.name}}
            </div>
            <div class="controller__details__album">
                {{selectedSong.album.title}}
            </div>
        </div>
        <div class="controller__controls">
            <q-btn round flat icon="fast_rewind" @click="skipBack"/>
            <q-btn round flat :icon="isPlaying ? 'pause' : 'play_arrow'" @click="togglePlaying"/>
            <q-btn round flat icon="fast_forward" @click="skipForward"/>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import moment from 'moment';
export default {
    computed: {
        ...mapGetters({
            queue: 'getQueue',
            index: 'getIndex',
            isPlaying: 'isPlaying',
            time: 'getTime',
            duration: 'getDuration'
        }),
        selectedSong() {
            if(!this.queue) return {
                title: '',
                album: {
                    title: ''
                },
                artist: {
                    name: ''
                }
            };

            return this.queue[this.index]
        },
        progress() {
            return this.time / this.duration;
        },
        progressText() {
            if(!this.duration) return '';
            return `${this.formatTime(this.time)} / ${this.formatTime(this.duration)}`
        }
    },
    methods: {
        ...mapActions(['togglePlaying', 'selectSong']),
        onClick(e) {
            let progress = this.$refs.progress;
            console.log(progress);
            let rect = progress.getBoundingClientRect();

            let left = rect.x;
            let width = rect.width;
            let clickX = e.x;

            let percentage = (clickX - left) / width;
            if (percentage < 0.005) percentage = 0;
            this.$root.$emit('timeSet', percentage);
        },
        skipBack() {
            if(this.time > 5.0 || this.index === 0) {
                this.$root.$emit('timeSet', 0.0);
            } else {
                this.selectSong(this.index - 1);
            }
        },
        skipForward() {
            if(this.index === this.queue.length - 1) {
                this.selectSong(0);
            } else {
                this.selectSong(this.index + 1);
            }
        },
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
    }
}
</script>

<style lang="scss" scoped>
.controller {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 2rem 3rem;
    grid-template-columns: 1fr 1fr;
    place-items: center;

    &__progress {
        grid-column: 1 / -1;
        width: 100%;
        height: 100%;
    }
    &__controls {
        grid-column: 2 / -1;
    }
    &__details {
        grid-column: 1 / 2;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        place-items: center;

        &__title {
            grid-row: 1 / -1;
            grid-column: 1 / 2;
            font-size: 2rem;
            font-weight: 300;
        }
        &__artist {
            grid-row: 1 / 2;
            grid-column: 2 / 3;
        }
        &__album {
            grid-row: 2 / 3;
            grid-column: 2 / 3;
        }
    }

}
</style>