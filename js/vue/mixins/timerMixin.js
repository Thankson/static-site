export default {
    data() {
        return {
            activeTimers: [] // 响应式数据仅用于界面展示:ml-citation{ref="6" data="citationList"}
        };
    },
    created() {
        this._timerPool = new Set(); // 使用非响应式存储避免性能损耗:ml-citation{ref="1" data="citationList"}
    },
    methods: {
        // 添加定时器到管理池
        $addTimer(fn, delay, isInterval = true) {
            const timerId = isInterval ? setInterval(fn, delay) : setTimeout(() => {
                fn();
                this.$removeTimer(timerId); // 自动清理一次性定时器:ml-citation{ref="8" data="citationList"}
            }, delay);

            this._timerPool.add(timerId);
            this.activeTimers.push({
                id: timerId,
                type: isInterval ? 'interval' : 'timeout',
                createTime: Date.now()
            });
            return timerId;
        },

        // 移除单个定时器
        $removeTimer(timerId) {
            if(this._timerPool.has(timerId)) {
                clearTimeout(timerId);
                clearInterval(timerId);
                this._timerPool.delete(timerId);
                this.activeTimers = this.activeTimers.filter(t => t.id !== timerId);
            }
        },

        // 清除所有定时器
        $clearAllTimers() {
            this._timerPool.forEach(id => {
                clearTimeout(id);
                clearInterval(id);
            });
            this._timerPool.clear();
            this.activeTimers = [];
        }
    },
    beforeDestroy() {
        this.$clearAllTimers(); // 组件销毁自动清理:ml-citation{ref="8" data="citationList"}
    }

};
