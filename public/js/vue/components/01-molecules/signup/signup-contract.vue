<template>
    <div class="m-signupContract">
        <slot name="contract-title"></slot>
        <div>
            <div class="pl-16 py-10 mb-16 bg-white">
                <perfect-scrollbar ref="scroll">
                    <div class="m-rte pr-16 mb-44">
                        <slot name="ContractTerms"></slot>
                    </div>
                </perfect-scrollbar>
            </div>
            <div class="m-signupContract__desc">
                <slot name="ContractTip"></slot>
            </div>
            <div class="m-formField -checkbox flex items-center pr-1">
                <m-checkbox-list
                    script-id=""
                    :checkboxes="checkBox"
                    checkbox-error-mods="showError?'-error':''"
                    :show-errors="true"
                    @change="(payload) => onCheckboxListChange(payload)"
                />
            </div>
        </div>
        <v-button
            :disabled="disabled"
            class="bg-sky w-full a-button text-sm font-medium py-16 px-40 inline-block -sky"
            :class="{
                '-disabled': disabled
            }"
            type="button"
            @click="handleStepBtn">
            <slot name="btnLabel"></slot>
        </v-button>
        <div v-if="apiLoading" class="m-signupConfirm__loading">
            <a-loading-spinner
                :visible="apiLoading"
                aria-hidden="true"
                size="sm"
            />
        </div>
        <!-- validate error tip -->
        <!-- -->
        <div v-if="showError">
            <slot v-if="!isSignupAllRequiredChecked" name="checkTermsError"></slot>
            <slot v-if="!isReadAll" name="checkReadError"></slot>
        </div>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    export default {
        name: 'MSignupContract',
        mixins: [ localizationMixin, validationMixin ],
        props: {
            gtmId: {
                type: Number,
                default: 0
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            isCn: {
                type: Boolean,
                default: false
            },
            checkRead: {
                type: Boolean,
                default: false
            },
            checkBox: {
                type: Array,
                default: () => ([])
            },
            dsibo: {
                type: String,
                default: 'IBO'
            },
            apiLoading: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isSignupAllRequiredChecked: false,
                isReadAll: false,
                scrollPosition: null,
                validateReady: false,
                showError: false,
                cacheField: 'signup.contract' // 前缀 prefix 后缀 suffix
            };
        },
        computed: {
            checkValidate() {
                if(this.checkRead) {
                    return this.isReadAll && this.isSignupAllRequiredChecked;
                } else {
                    return this.isSignupAllRequiredChecked;
                }
            },
            cacheFullName() {
                return this.dsibo + '_' + this.cacheName;
            },
            disabled() {
                return this.apiLoading;
            }
        },
        mounted() {
            if(this.checkRead) {
                this.handleReadingAll();
            }
        },
        destroyed () {
            if(this.$refs['scroll']?.$el) {
                this.$refs['scroll'].removeEventListener('scroll', this.isScrolledToBottom);
            }
        },
        methods: {
            ...mapMutations('signup', ['UPDATE_CACHE']),
            updateCache() {
                // todo list
                let path = this.dsibo + '.' + this.cacheField;
                this.$store.commit('signup/UPDATE_CACHE', {
                    path: path,
                    value: true
                });
            },
            showErrorEvent() {
                if(!this.isReadAll || !this.isSignupAllRequiredChecked) {
                    this.showError = true;
                }
            },
            saveSignUpStorage() {
                // todo: save signUp storage cache;
            },
            onCheckboxListChange(payload, index) {
                this.isSignupAllRequiredChecked = payload.isAllRequiredChecked;
                // this.$set(this.isAllRequiredChecked, catIndex, payload.isAllRequiredChecked);
            },
            handleStepBtn() {
                this.showErrorEvent();
                if(this.checkValidate) {
                    // todolist:  updateCache();
                    this.updateCache();
                    this.$emit('stepEvent', 3);
                }
                // [openModalPrivacyTerms(), gtmTrackAction({id: ''}, $event)]
            },
            handleReadingAll() {
                if(this.$refs['scroll']?.$el && !this.isReadAll) {
                    this.$refs['scroll'].$el.addEventListener('scroll', this.isScrolledToBottom);
                }
                if(this.isReadAll) {
                    this.$refs['scroll'].$el.removeEventListener('scroll', this.isScrolledToBottom);
                }
            },
            isScrolledToBottom() {
                const scrollEl = this.$refs['scroll'].$el;
                if(this.isReadAll) {
                    return;
                }
                if(scrollEl.scrollTop === (scrollEl.scrollHeight - scrollEl.clientHeight)) {
                    this.scrollPosition = 'bottom';
                    this.isReadAll = true;
                    return;
                }
                console.log('isReadAll-----', this.isReadAll);
            }
        }
    };
</script>
