<template>
    <div class="o-cartAccordion">
        <accordion
            arrow-size="-md"
            :title="title"
            title-el="h2"
            :mod-title="`-cartAccordion`"
            mod-toggler="-cartAccordion"
            :content-id="contentId"
            :toggle-id="toggleId"
            :visible="openAccordion"
            @show="onShow"
            @hide="() => $emit('hide')">

            <template v-slot:icon="$accordion">
                <span class="text-2xl leading-none">
                    <a-icon size="inherit" :class="[ $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                        keyboard_arrow_down
                    </a-icon>
                </span>
            </template>

            <div class="o-cartAccordion__content">
                <perfect-scrollbar ref="scroll">
                    <div class="o-cartAccordion__scroll">
                        <slot />
                    </div>
                </perfect-scrollbar>

                <div class="o-cartAccordion__mask" :class="[maskClass, {'invisible': scrollPosition === 'top'}]"></div>
                <div class="o-cartAccordion__mask -bottom" :class="[maskClass, {'invisible': scrollPosition === 'bottom'}]"></div>
            </div>

        </accordion>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OCartAccordion',
        mixins: [ safeId ],
        safeIds: [
            'contentId',
            'toggleId'
        ],
        props: {
            title: {
                type: String,
                required: true
            },
            maskClass: {
                type: String,
                default: ''
            },
            openAccordion: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                contentId: '',
                toggleId: '',
                scrollPosition: null
            };
        },
        created() {
            this.$on('update', this.updateScroll);
        },
        mounted () {
            if(this.$refs['scroll']?.$el) {
                this.$refs['scroll'].$el.addEventListener('scroll', this.handleMask);
            }
        },
        destroyed () {
            if(this.$refs['scroll']?.$el) {
                this.$refs['scroll'].removeEventListener('scroll', this.handleMask);
            }
        },
        methods: {
            onShow() {
                this.$emit('show');
                this.updateScroll();
            },
            updateScroll() {
                this.$nextTick(() => this.$refs['scroll'].update());
            },
            handleMask() {
                const scrollEl = this.$refs['scroll'].$el;
                if(!scrollEl.scrollTop) {
                    this.scrollPosition = 'top';
                    return;
                }
                if(scrollEl.scrollTop === (scrollEl.scrollHeight - scrollEl.clientHeight)) {
                    this.scrollPosition = 'bottom';
                    return;
                }
                this.scrollPosition = null;
            }
        }
    };
</script>
