<template>
    <div class="grid">
        <div class="grid__headers">
            <div class="grid__header" v-for="col in columns" :key="col.name" @click="toggleSortedCol(col)" :style="{ width: col.width + '%' }">
                <span class="grid__header__text">{{col.label}}</span>
                <span class="grid__header__icon" v-if="sortedCol === col.name">
                    <q-icon :name="sortDir === 'asc' ? 'expand_less' : 'expand_more'"></q-icon>
                </span>
            </div>
        </div>
        <div class="grid__area">
            <div v-for="(row, i) in sortedData" :key="i" class="grid__row" @click="onClick(i)" :class="{grid__row__selected: isSelected(i)}">
                <div class="grid__row__cell" v-for="col in columns" :style="{ width: col.width + '%' }">
                    <span class="grid__row__cell__text">
                        {{getCellText(col, row)}}
                        <q-tooltip v-if="getCellText(col, row).length > col.width">{{getCellText(col, row)}}</q-tooltip>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Selectable from '../../mixins/Selectable';
import DoubleClickHandler from '../../mixins/DoubleClickHandler';
export default {
    props: {
        columns: {
            type: Array,
            required: true
            /*
            Model
            {
                {
                    name: 'title',
                    label: 'Title',
                    sortable: true,
                    field: 'title',
                    width: 20
                }
            }
            */
        },
        data: {
            type: Array,
            required: true
        },
        initialSortedCol: {
            type: String,
            default: null
        },
        customSort: {
            required: true
        }
    },
    data() {
        return {
            sortedCol: this.initialSortedCol || this.columns[0].name,
            sortDir: 'asc',
            localData: this.data
        }
    },
    methods: {
        toggleSortedCol(col) {
            if(!col.sortable) return;
            if(this.sortedCol !== col.name) {
                this.sortedCol = col.name;
                this.sortDir = 'asc';
            } else {
                this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            }       
        },
        getCellText(col, row) {
            let text = typeof col.field == 'string' ? row[col.field] : col.field(row)
            if(col.format) {
                text = col.format(text);
            }
            return text;
        },
        onSingleClick(i) {
            this.toggleSelect(i);
            this.$emit('updateSelected', this.selected);
        },
        onDoubleClick(i) {
            console.log("Double click");
        }
    },
    computed: {
        sortedData() {
            return this.customSort(this.data, this.sortedCol, this.sortDir === 'asc' ? 1 : -1);
        }
    },
    mixins: [
        Selectable,
        DoubleClickHandler
    ]
}
</script>

<style lang="scss">
.grid {
    height: 100%;
    width: 100%;
    position: relative;

    &__headers {
        width: 100%;
        height: 2rem;
        position: sticky;
        top: 0;
        background: white;
        border-bottom: 1px solid rgb(209, 209, 209);
    }
    &__header {
        height: 100%;
        display: inline-block;
        padding: 0.5rem 0.5rem;

        &__text {
            font-size: 0.8rem;
            font-weight: 500;
        }
        &__icon {
            margin-left: 0.5rem;
            font-size: 1rem;
        }
    }

    &__area {
        height: 100%;
        width: 100%;
        overflow-y: auto;
    }
    &__row {
        height: 2rem;
        border-top: 1px solid rgb(209, 209, 209);

        &__selected {
            background-color: $selected;
        }

        &__cell {
            height: 100%;
            display: inline-block;
            padding: 0.3rem 0.5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &__text {
                font-size: 0.8rem;
            }
        }
    }

    // Disable highlighting
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
}
    
</style>