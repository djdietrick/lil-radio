<template>

    <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white" height-hint="98">
        <q-toolbar>
            <q-tabs align="left" v-model="selected" dense>
                <q-tab name="artists" label="Artists"></q-tab>
                <q-tab name="albums" label="Albums"></q-tab>
                <q-tab name="songs" label="Songs"></q-tab>
            </q-tabs>
            <q-space></q-space>
            <q-input dense align="right" class="browser__header__search q-my-sm" v-model="search" 
                clearable outlined placeholder="Search"></q-input>
        </q-toolbar>
    </q-header>

    <component :is="selected"></component>

</q-layout>
<!-- <q-layout container style="height: 100vh" view="">
    <div class="browser__header bg-primary">
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
</q-layout> -->
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

        &__search {
            width: 30vw;
        }
    }
}

</style>
