import client from '../utils/graphql';
import gql from 'graphql-tag';

const state = {
    stations: []
}

const getters = {
    getStations: state => state.stations
}

const mutations = {
    setStations: (state, stations) => state.stations = stations
}

const actions = {
    async fetchStations({commit}) {
        const res = await client.query({
            query: gql`query {
                Stations {
                    id
                    name
                }
            }`
        })
        console.log(res);
        commit('setStations', res.data.Stations)
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}