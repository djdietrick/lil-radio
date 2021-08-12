var Selectable = {
    data() {
        return {
            selected: [],
            shift: false,
            ctrl: false
        }
    },
    methods: {
        toggleSelect(i) {
            if(this.shift) {
                if(this.selected.length == 0) {
                    this.selected = [i];
                    this.selectedPivot = i;
                } else {
                    let pivotInd = this.selectedPivot;
                    let clickInd = i;
                    let start = pivotInd < clickInd ? pivotInd : clickInd;
                    let end =  pivotInd < clickInd ? clickInd : pivotInd;
                    this.selected = [];
                    for(let j = start; j <= end; j++) {
                        this.selected.push(j);
                    }
                }
            } else if(this.ctrl) {
                if(this.selected.indexOf(i) < 0) {
                    this.selected.push(i);
                    this.selectedPivot = i;
                }
            } else {
                this.selected = [i];
                this.selectedPivot = i;
            }
        },
        isSelected(i) {
            return this.selected.indexOf(i) >= 0;
        },
    },
    created() {
        window.addEventListener('keydown', (e) => {
            if(e.key == "Shift") {
                this.shift = true;
            } else if(e.key == "Control") {
                this.ctrl = true;
            }
        })
        window.addEventListener('keyup', (e) => {
            if(e.key == "Shift") {
                this.shift = false;
            } else if(e.key == "Control") {
                this.ctrl = false;
            }
        })
    }
}

export default Selectable;