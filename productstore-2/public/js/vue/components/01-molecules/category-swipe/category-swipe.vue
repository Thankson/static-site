<template>
    <div v-touch:swipe.left="nextCates" v-touch:swipe.right="preCates" class="m-categorySwipe">
        <nav class="m-categorySwipe__nav">
            <ul ref="cate" class="m-categorySwipe__list" :style="`left: ${-leftOffset}px;`">
                <li
                    v-for="(cate, index) in category"
                    :key="index" class="m-categorySwipe__classify"
                    :class="currentCategory === index ? '-isCurrent' : ''">
                    <button class="m-categorySwipe__btn" @click="setCurrentCate(index)"> {{ cate.Label }} </button>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MCategorySwipe',
        mixins: [ localizationMixin ],
        props: {
            category: {
                type: Array,
                default: null
            },
            current: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                leftOffset: 0,
                currCateShow: 0,
                currentCategory: 0
            };
        },
        watch: {
            current (val) {
                this.currentCategory = val;
            }
        },
        methods: {
            nextCates() {
                let len = this.$refs.cate.children.length;
                if(this.currCateShow < len - 1) {
                    if(this.$refs.cate.children[this.currCateShow + 1]) {
                        this.leftOffset = this.leftOffset + this.$refs.cate.children[this.currCateShow + 1].offsetWidth + this.$refs.cate.children[this.currCateShow].offsetWidth + 20;
                        this.currCateShow = this.currCateShow + 2;
                    } else {
                        this.leftOffset = this.leftOffset + this.$refs.cate.children[this.currCateShow].offsetWidth + 10;
                        this.currCateShow = this.currCateShow + 1;
                    }
                }
            },
            preCates() {
                if(this.currCateShow > 0) {
                    if(this.$refs.cate.children[this.currCateShow - 2]) {
                        this.leftOffset = this.leftOffset - this.$refs.cate.children[this.currCateShow - 2].offsetWidth - this.$refs.cate.children[this.currCateShow - 1].offsetWidth - 20;
                        this.currCateShow = this.currCateShow - 2;
                    } else {
                        this.leftOffset = this.leftOffset - this.$refs.cate.children[this.currCateShow - 1].offsetWidth - 10;
                        this.currCateShow = this.currCateShow - 1;
                    }
                }
            },
            setCurrentCate(cateId) {
                this.currentCategory = cateId;
                this.$emit('swipeCate', cateId);
            }
        }
    };
</script>
