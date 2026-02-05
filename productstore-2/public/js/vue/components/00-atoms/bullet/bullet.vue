<template>
    <span class="a-bullet" :class="className"></span>
</template>

<script>
    export default {
        name: 'ABullet',
        props: {
            active: {
                type: Boolean,
                default: false
            },
            complete: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                activeClass: '-isActive',
                completeClass: '-isComplete'
            };
        },
        computed: {
            className() {
                let className = '';

                if(this.active) {
                    className = this.activeClass;
                } else if(this.complete) {
                    className = this.completeClass;
                }

                return className;
            }
        }
    };
</script>
