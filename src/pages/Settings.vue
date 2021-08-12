<template>
    <div class="settings">
        <div class="settings__dirs">
            <div class="settings__dirs__title">Music Directories</div>
            <q-list>

            </q-list>
            <input type="file" webkitdirectory directory @change="addDir">
        </div>
    </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
    data() {
        return {
            newDir: ''
        }
    },
    computed: {
        ...mapGetters({
            settings: 'getSettings',
        })
    },
    methods: {
        ...mapActions(['fetchSettings']),
        addDir(e) {
            let path1 = e.target.files[0].path;
            let path2 = e.target.files[0].webkitRelativePath;
            path1 = path1.replace(/\\/g, '/')
            let path1arr = path1.split('/');
            let end = path2.replace('\\', '/').split('/')[0];
            let finalPath = '';
            for(let chunk of path1arr) {
                finalPath += chunk + '/';
                if(chunk == end)
                    break;
            }
            
        }
    },
    created() {
        this.fetchSettings();
    }
}
</script>

<style lang="scss" scoped>

.settings {
    height: 100vh;
    width: 100vw;
    padding: 3rem;
    display: grid;
    grid-template-rows: 1fr 1fr;

    &__dirs {
        height: 100%;
        width: 100%;
    }
}
    
</style>