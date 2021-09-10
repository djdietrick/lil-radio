<template>
    <Grid :columns="columns" :data="songList" initialSortedCol="artist" :customSort="customCustomSort" @updateSelected="passUpdateSelected($event)"/>
</template>

<script>
import Grid from './Grid.vue';
import moment from 'moment';
export default {
    props: {
        songList: {
            required: true,
            type: Array
        }
    },
    data() {
        return {
            columns: [
                {
                    name: 'title',
                    label: 'Title',
                    sortable: true,
                    field: 'title',
                    align: 'left',
                    width: 28
                },
                {
                    name: 'artist',
                    label: 'Artist',
                    field: row => row.artist.name,
                    sortable: true,
                    align: 'left',
                    width: 20
                },
                {
                    name: 'album',
                    label: 'Album',
                    field: row => row.album.title,
                    sortable: true,
                    align: 'left',
                    width: 30
                },
                {
                    name: 'duration',
                    label: 'Duration',
                    field: 'duration',
                    align: 'left',
                    format: val => `${this.formatTime(val)}`,
                    width: 7
                },
                {
                    name: 'track',
                    label: '#',
                    field: 'track',
                    align: 'left',
                    width: 5
                }
            ]
        }
    },
    components: {
        Grid
    },
    methods: {
        customCustomSort(data, sortBy, desc) {
            let ret = [];
            let mult = desc
            if(sortBy === 'artist') {
                let byArtist = {};
                let artistIdToName = {};
                for(let song of data) {
                    if(!byArtist[song.artist.id]) byArtist[song.artist.id] = [];
                    byArtist[song.artist.id].push(song);
                    artistIdToName[song.artist.id] = song.artist.name;
                }
                
                for(let key of Object.keys(byArtist)) {
                    byArtist[key].sort((l, r) => {
                        if(l.album.id === r.album.id) {
                            if(l.disk === r.disk) {
                                return (l.track - r.track) * mult;
                            } else {
                                return (l.disk - r.disk) * mult;
                            }
                        } else {
                            return l.album.title < r.album.title;
                        }
                    })
                }
                let sortedIds = Object.keys(byArtist).sort((l, r) => {
                    let lname = artistIdToName[l], rname = artistIdToName[r];
                    if(lname < rname) return -1 * mult; 
                    else if (lname > rname) return 1 * mult;
                    return 0;
                })
                console.log(byArtist);
                for(let id of sortedIds) {
                    ret.push(...byArtist[id])
                }
            } else if(sortBy === 'title') {
                ret = data.sort((l, r) => {
                    if(l.title < r.title) {
                        return -1 * mult;
                    } else if (l.title > r.title) {
                        return 1 * mult;
                    } 
                    return 0;
                })
            } else if(sortBy === 'album') {
                let byAlbum = {};
                let albumIdToTitle = {};
                for(let song of data) {
                    if(!byAlbum[song.album.id]) byAlbum[song.album.id] = [];
                    byAlbum[song.album.id].push(song);
                    albumIdToTitle[song.album.id] = song.album.title;
                }
                for(let key of Object.keys(byAlbum)) {
                    byAlbum[key].sort((l, r) => {
                        if(l.disk === r.disk) {
                            return (l.track - r.track) * mult;
                        } else {
                            return (l.disk - r.disk) * mult;
                        }
                    })
                }
                let sortedIds = Object.keys(byAlbum).sort((l, r) => {
                    let lname = albumIdToTitle[l], rname = albumIdToTitle[r];
                    if(lname < rname) return -1 * mult;
                    else if (lname > rname) return 1 * mult;
                    return 0;
                })
                for(let id of sortedIds) {
                    ret.push(...byAlbum[id])
                }
            }
            return ret;
        },
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
        passUpdateSelected(e) {
            this.$emit('updateSelected', e)
        }
    }
}
</script>