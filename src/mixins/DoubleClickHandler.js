var DoubleClickHandler = {
    data() {
        return {
            clicks: 0,
            timer: null,
            delay: 200
        }
    },
    methods: {
        onClick(item) {
            this.clicks++;
            if(this.clicks === 1) {
                this.onSingleClick(item);
                this.timer = setTimeout(() => {
                    this.clicks = 0;
                }, this.delay);
            } else {
                clearTimeout(this.timer);
                this.onDoubleClick(item);
                this.clicks = 0;
            }
        },
        onSingleClick(item) {
            console.log("Single click");
        },
        onDoubleClick(item) {
            console.log("Double click")
        }
    }
}

export default DoubleClickHandler;