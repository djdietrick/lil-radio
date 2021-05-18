import { deleteStation } from 'app/src-electron/server/controllers/station';
import axios from 'axios';

const state = {
    songs: []
};

const getters = {
    getSongs: state => state.songs
};

const mutations = {
    setSongs: (state, songs) => state.songs = songs
};

const actions = {
    async fetchSongs({commit}, query) {
        let res = await axios.post('http://localhost:5000', {
            query: `{
              Stations {
                id,
                name
              }
            }`
          });
        commit('setSongs', res.data.data.Songs);
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}
