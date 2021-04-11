<template>
    <div class="browser">
        <div class="browser__header">
            <q-tabs dense v-model="selected">
                <q-tab name="artists" label="Artists"></q-tab>
                <q-tab name="albums" label="Albums"></q-tab>
                <q-tab name="songs" label="Songs"></q-tab>
            </q-tabs>
            <q-input class="browser__header__search q-my-sm" v-model="search" clearable outlined></q-input>
        </div>
        <div class="browser__content">
            <component :is="selected" :search='search'/>
        </div>
    </div>
</template>

<script>
import ArtistBrowser from './ArtistBrowser.vue';
export default {
    components: {
        'artists': ArtistBrowser
    },
    data() {
        return {
            search: '',
            selected: 'artists'
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
        background-color: blueviolet;
    }
}

</style>
