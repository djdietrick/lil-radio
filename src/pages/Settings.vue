<template>
    <div class="settings">
        <div class="settings__dirs">
            <div class="settings__dirs__title">Music Directories</div>
            <q-list class="settings__dirs__list">
                <q-item v-for="(dir, i) in dirList" :key="i" class="settings__dirs__list__item">
                    <q-item-section>
                        <q-item-label>{{dir}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn flat icon="close" @click="removeDir(i)"></q-btn>
                    </q-item-section>
                </q-item>
            </q-list>
            <label class="settings__dirs__input">
                Add directory
                <input type="file" webkitdirectory directory @change="addDir">
            </label>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import gql from 'graphql-tag';


export default {
    data() {
        return {
            newDir: '',
            dirList: []
        }
    },
    computed: {
        ...mapGetters({
            settings: 'getSettings',
        }),
    },
    methods: {
        ...mapActions(['fetchSettings', 'updateSetting']),
        getMusicDirsSetting() {
            for(let setting of this.settings) {
                if(setting.name === 'MUSIC_DIRS') {
                    return setting.value;
                }
            }
            return [];
        },
        addDir(e) {
            let path1 = e.target.files[0].path;
            let path2 = e.target.files[0].webkitRelativePath;
            path1 = path1.replace(/\\/g, '/')
            let path1arr = path1.split('/');
            let end = path2.replace('\\', '/').split('/')[0];
            let finalPath = '';
            for(let chunk of path1arr) {
                finalPath += chunk;
                if(chunk == end)
                    break;
                finalPath += '/';
            }
            let newValue = this.getMusicDirsSetting() + 
                (this.dirList.length > 0 ? ';' : '') + finalPath;
            this.$q.dialog({
                title: 'New Directory',
                message: `Do you want to add ${finalPath} as a tracked directory?`,
                cancel: true,
                persistant: false
            }).onOk(async () => {
                await this.updateSetting({
                    name: 'MUSIC_DIRS',
                    value: newValue
                })
                this.setDirList();
            })
        },
        removeDir(i) {
            this.$q.dialog({
                title: 'Remove Directory',
                message: `Do you want to remove ${this.dirList[i]}?`,
                cancel: true,
                persistant: false
            }).onOk(async () => {
                this.dirList.splice(i,1);
                this.updateSetting({
                    name: 'MUSIC_DIRS',
                    value: this.dirList.join(';')
                })
            })
        },
        setDirList() {
            let musicDirSetting = this.getMusicDirsSetting();
            if(musicDirSetting.length === 0) this.dirList = [];
            else this.dirList = this.getMusicDirsSetting().split(';');
        }
    },
    async created() {
        await this.fetchSettings();
        this.setDirList();
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

        &__title {
            font-size: 1.4rem;
            font-weight: 300;
        }
        &__input {
            input {
                display: none;
            }
            border: 2px solid $primary;
            padding: 1rem;
            cursor: pointer;
            border-radius: 0.3rem;
            transition: 0.2s ease-in-out;

            &:hover {
                background-color: $hover;
            }
        }

        &__list {
            margin-bottom: 2rem;

            &__item {
                background-color: $area;
                width: 30rem;
            }
        }
    }
}
    
</style>