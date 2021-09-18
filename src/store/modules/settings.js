import client from '../utils/graphql';
import gql from 'graphql-tag';
import Vue from 'vue';

const state = {
    settings: []
}

const getters = {
    getSettings: state => state.settings,
    getSetting: (state, name) => {
        for(let setting of state.settings) {
            if(setting.name === name) return setting;
        }
        return null;
    }
}

const mutations = {
    setSettings: (state, settings) => Vue.set(state, 'settings', settings),
    updateSetting: (state, setting) => {
        for(let i = 0; i < state.settings.length; i++) {
            if(state.settings[i].name === setting.name) {
                state.settings[i] = setting;
                return
            }
        }
        state.settings.push(setting);
    }
}

const actions = {
    async fetchSettings({commit}) {
        const res = await client.query({
            query: gql`query {
                Settings {
                    name
                    value
                }
            }`
        })
        commit('setSettings', res.data.Settings)
    },
    async updateSetting({commit}, setting) {
        const res = await client.mutate({
            mutation: gql`mutation ($name: String!, $value: String!) {
                updateSetting(name: $name, value: $value) {
                    name
                    value
                }
            }`,
            variables: {
                name: setting.name,
                value: setting.value
            }
        })
        commit('updateSetting', setting);
    },
    async addDirectory({commit}, dir) {
        const res = await client.mutate({
            mutation: gql`mutation ($dir: String) {
                addDirectory(dir: $dir) {
                    name
                    value
                }
            }`,
            variables: {
                dir
            }
        })
        commit('updateSetting', res);
    },
    async removeDirectory({commit, dir}) {
        const res = await client.mutate({
            mutation: gql`mutation ($dir: String) {
                removeDirectory(dir: $dir) {
                    name
                    value
                }
            }`,
            variables: {
                dir
            }
        })
        commit('updateSetting', res);
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}