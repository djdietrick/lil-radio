<template>
    <div class="settings">
        <div class="settings__dirs">
            <div class="settings__dirs__title q-mb-lg">Music Directories</div>
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
            <div class="settings__dirs__input">
                <q-input label="New directory" class="settings__dirs__input__input" outlined v-model="newDir" :error="dirError" :error-message="dirErrorMsg"></q-input>
                <q-btn label="Add" @click="addDir" class="settings__dirs__input__btn" :disable="newDir.length == 0"></q-btn>
            </div>
            <!-- <label class="settings__dirs__input">
                Add directory
                <input type="file" webkitdirectory directory @change="addDir">
            </label> -->
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
            dirList: [],
            dirError: false,
            dirErrorMsg: ''
        }
    },
    computed: {
        ...mapGetters({
            settings: 'getSettings',
        }),
    },
    methods: {
        ...mapActions(['fetchSettings', 'updateSetting', 'addDirectory', 'removeDirectory', 'checkDirectory']),
        getMusicDirsSetting() {
            for(let setting of this.settings) {
                if(setting.name === 'MUSIC_DIRS') {
                    return setting.value;
                }
            }
            return [];
        },
        addDir() {
            this.dirError = false;
            let finalPath = this.newDir.replace(/\\/g, '/');
            //if(finalPath[finalPath.length - 1] != '/') finalPath += '/';
            this.$q.dialog({
                title: 'New Directory',
                message: `Do you want to add ${finalPath} as a tracked directory?`,
                cancel: true,
                persistant: false
            }).onOk(async () => {
                // await this.updateSetting({
                //     name: 'MUSIC_DIRS',
                //     value: newValue
                // })
                let valid = await this.checkDirectory(finalPath);
                if(valid) {
                    this.newDir = '';
                    await this.addDirectory(finalPath);
                    this.setDirList();
                } else {
                    this.dirError = true;
                    this.dirErrorMsg = 'Path is not a directory, please try again'
                }
            })
        },
        removeDir(i) {
            this.$q.dialog({
                title: 'Remove Directory',
                message: `Do you want to remove ${this.dirList[i]}?`,
                cancel: true,
                persistant: false
            }).onOk(async () => {
                let dir = this.dirList[i]
                this.dirList.splice(i,1);
                // this.updateSetting({
                //     name: 'MUSIC_DIRS',
                //     value: this.dirList.join(';')
                // })
                this.removeDirectory(dir);
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
            display: grid;
            grid-template-columns: 80% 1fr;
            align-items: center;
            cursor: pointer;
            transition: 0.2s ease-in-out;

            &__input {
                transform: translateY(0.7rem);
            }

            &__btn {
                margin-left: 1rem;
                height: 80%;
                background-color: $area;
                color: white;
                transition: 0.2s ease-in-out;

                &:hover {
                    background-color: $primary;
                    transform: scale(1.02);
                }
            }
        }

        &__list {
            margin-bottom: 2rem;

            &__item {
                background-color: $area;
                width: 30rem;
                &:not(:last-child) {
                    margin-bottom: 1rem;
                }
            }
        }
    }
}
    
</style>