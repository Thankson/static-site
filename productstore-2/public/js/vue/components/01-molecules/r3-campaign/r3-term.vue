<template>
    <div class="m-r3Term">
        <m-checkbox
            ref="term"
            v-model="checked"
            :name="name"
            :label="label"
            :label-mods="`${fieldError ? ' -error' : ''}`"
            :is-cn="true"
        >
        </m-checkbox>
        <div v-if="fieldError" class="e-formError">
            <p class="e-formError__item" role="alert" v-html="fieldErrorMsg"></p>
        </div>

        <r3-term-modals
            v-if="withModal"
            ref="modals"
            :checkbox-label-extend="checkboxLabelExtend"
        ></r3-term-modals>
    </div>
</template>

<script>
    import R3TermModals from './r3-term-modals.vue';
    export default {
        name: 'MR3Term',
        components: {
            R3TermModals
        },
        props: {
            name: {
                type: String,
                default: ''
            },
            value: {
                type: Boolean,
                default: false
            },
            checkboxLabel: {
                type: String,
                default: ''
            },
            checkboxLabelExtend: {
                type: Array,
                default: () => ([])
            },
            fieldError: {
                type: Boolean,
                default: false
            },
            fieldErrorMsg: {
                type: String,
                default: ''
            }
        },
        computed: {
            checked: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            label() {
                let res = this.checkboxLabel;
                this.checkboxLabelExtend.forEach((i) => {
                    const placeholder = `<a href="#" class="text-green ${i.name} z-1">${i.text}</a>`;
                    res = res.replace(i.placeholder, placeholder);
                });
                return res;
            },
            // used to controll my modals could be got into `this.$modalStore` `fe-library/_common/source/js/vue/plugins/modal/mixins/setup.js`
            // for `mixin mounted` is exec earlier
            withModal() {
                return !!this.checkboxLabelExtend.length;
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.bindTermsLink();
            });
        },
        methods: {
            openTermModal(i) {
                const id = `${i.name}-id`;
                this.$refs.modals.showModal(id);
            },
            bindTermsLink() {
                if(this.$refs['term']) {
                    this.checkboxLabelExtend.forEach(i => {
                        const termLink = this.$refs['term'].$el.querySelector(`.${i.name}`);
                        if(termLink) {
                            termLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                this.openTermModal(i);
                                return false;
                            });
                        }
                    });
                }
            }
        }
    };
</script>
