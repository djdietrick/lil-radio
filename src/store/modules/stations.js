import { deleteStation } from 'app/src-electron/sql/data/controllers/station';
import axios from 'axios';

const state = {
    stations: []
};

const getters = {
    getStations: state => state.stations
};

const mutations = {
    setStations: (state, stations) => state.stations = stations,
    addStation: (state, station) => state.stations.push(station),
    removeStation: (state, id) => state.stations = state.stations.filter(s => s.id = id),
    updateStation: (state, station) => {state.stations = state.stations.map(s => {
        if(s.id == station.id) return station;
        return s;
    })}
};

const actions = {
    async fetchStations({commit}) {
        let res = await axios.post('http://localhost:5000', {
            query: `{
              Stations {
                id,
                name
              }
            }`
          });
        commit('setStations', res.data.data.Stations);
    },
    async addStation({commit}, name) {
        let res = await axios.post('http://localhost:5000', {
            mutation: `{
                createStation(name: ${name}) {
                    id,
                    name
                }
            }`
        });
        commit('addStation', res.data.data);
    },
    async deleteStation({commit}, id) {
        await axios.post('http://localhost:5000', {
            mutation: `{
                deleteStation(id: ${id})
            }`
        });
        commit('removeStation', id);
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}
