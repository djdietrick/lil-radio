const state = {
    queue: null,
    playIndex: 0,
    isPlaying: false,
    playStats: {
        duration: 0.0,
        time: 0.0
    }
}

const getters = {
    getQueue: state => state.queue,
    getIndex: state => state.playIndex,
    isPlaying: state => state.isPlaying,
    getPlayStats: state => state.playStats,
    getDuration: state => state.playStats.duration,
    getTime: state => state.playStats.time
}

const mutations = {
    setQueue: (state, queue) => (state.queue = queue),
    setIndex: (state, index) => (state.playIndex = index),
    togglePlaying: (state) => (state.isPlaying = !state.isPlaying),
    setIsPlaying: (state, p) => (state.isPlaying = p),
    setDuration: (state, d) => (state.playStats.duration = d),
    setTime: (state, t) => (state.playStats.time = t)
}

const actions = {
    setQueue({commit}, queue) {
        commit('setQueue', queue);
    },
    selectSong({commit}, index) {
        commit('setIndex', index);
    },
    togglePlaying({commit}) {
        commit('togglePlaying');
    },
    setIsPlaying({commit}, p) {
        commit('setIsPlaying', p);
    },
    setDuration({commit}, d) {
        commit('setDuration', d);
    },
    setTime({commit}, t) {
        commit('setTime', t);
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}