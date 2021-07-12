<template>

    <q-layout view="hHh LpR fFf">

        <q-header bordered class="bg-primary text-white" height-hint="98">
            <q-toolbar>
                <!-- <q-tabs align="left" v-model="selected" dense>
                    <q-tab name="artists" label="Artists"></q-tab>
                    <q-tab name="albums" label="Albums"></q-tab>
                    <q-tab name="songs" label="Songs"></q-tab>
                </q-tabs> -->
                <q-toolbar-title>Browser</q-toolbar-title>
                <q-space></q-space>
                <q-input dense align="right" class="browser__header__search q-my-sm" v-model="search" 
                    clearable outlined placeholder="Search"></q-input>
            </q-toolbar>
        </q-header>
        
        <q-page-container>
            <q-page>
                <component :is="selected"></component>
            </q-page>
        </q-page-container>

        <q-footer elevated class="bg-white text-primary">
            <base-audio></base-audio>
        </q-footer>

    </q-layout>
</template>

<script>
import ArtistBrowser from './ArtistBrowser.vue';
import SearchBrowser from './SearchBrowser.vue';
import BaseAudio from '../audio/BaseAudio.vue';
export default {
    components: {
        'artists': ArtistBrowser,
        'search': SearchBrowser,
        'base-audio': BaseAudio
    },
    data() {
        return {
            search: ''
        }
    },
    computed: {
        selected() {
            if(this.search.length > 0)
                return 'search';
            return 'artists';
        }
    }
}
</script>

<style lang="scss" scoped>

.browser {
    display: grid;
    grid-template-rows: 70px 1fr;

    &__header {
        display: flex;

        &__search {
            width: 30vw;
        }
    }
}

</style>
