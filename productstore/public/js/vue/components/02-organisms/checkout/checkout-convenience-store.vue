<template>
    <div class="o-checkConvenience">
        <a-loading-spinner class="ml-40" :visible="loading" />

        <div v-if="!loading" class="o-checkConvenience__row">
            <ul class="o-checkConvenience__list">
                <li class="o-checkConvenience__item">
                    <label
                        class="o-checkConvenience__label sr-only"
                        :for="storeId">

                        {{ storeLabel }}
                    </label>

                    <v-select
                        :id="storeId"
                        ref="selectStore"
                        :class="{ '-error': $v.$dirty && $v.selectedStore.$invalid }"
                        :options="storeText"
                        :values="storeValues"
                        :initial="null"
                        :is-disabled="true"
                        :is-required="true"
                        :aria-invalid="$v.$dirty && $v.selectedStore.$invalid"
                        :aria-describedby="$v.$dirty && $v.selectedStore.$invalid ? storeErrorId : null"
                        @change="({ value }) => selectedStore = value"
                    />

                    <span
                        v-if="$v.$dirty && $v.selectedStore.$invalid"
                        :id="storeErrorId"
                        class="o-checkConvenience__error">

                        {{ storeErrorLabel }}
                    </span>
                </li>

                <li v-if="modalContent && infoLabel" class="o-checkConvenience__item -bottom">
                    <button
                        class="o-checkConvenience__info"
                        type="button"
                        @click="$modal.show()">

                        {{ infoLabel }}
                    </button>
                </li>
            </ul>
        </div>

        <modal v-if="modalContent" width="700px">
            <template v-slot:content>
                <div v-html="modalContent" />
            </template>
        </modal>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { requiredIf } from 'vuelidate/lib/validators';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'OCheckoutConvenienceStore',
        mixins: [ safeId, validationMixin ],
        safeIds: [
            'storeErrorId',
            'storeId'
        ],
        validations() {
            return {
                selectedStore: {
                    required: requiredIf(() => {
                        return this.rawTotal === null || this.rawTotal > 0;
                    })
                }
            };
        },
        props: {
            infoLabel: {
                type: String,
                default: 'Convenience store information'
            },
            modalContent: {
                type: String,
                default: ''
            },
            rawTotal: {
                type: Number,
                default: null
            },
            storeErrorLabel: {
                type: String,
                default: 'Please select a convenience store'
            },
            storeLabel: {
                type: String,
                default: 'Select convenience store'
            }
        },
        data() {
            return {
                selectedStore: '',
                storeErrorId: '',
                storeId: ''
            };
        },
        computed: {
            ...mapState('cardIssuers', ['cardIssuers', 'loaded', 'loading']),

            storeText() {
                return [
                    this.storeLabel,
                    ...this.cardIssuers.map(({ Name }) => Name)
                ];
            },
            storeValues() {
                return [
                    null,
                    ...this.cardIssuers.map(({ Id }) => Id)
                ];
            }
        },
        watch: {
            selectedStore() {
                this.emitUpdate();
            }
        },
        created() {
            this.$on('show-error', this.showError);
            this.$on('check-error', this.checkError);

            if(!this.loaded) {
                this.getCardIssuers(this.$env.Country);
            }
        },
        methods: {
            ...mapActions('cardIssuers', ['getCardIssuers']),
            checkError() {
                this.$v.$touch();
                this.emitUpdate();
            },
            emitUpdate() {
                this.$emit('update', {
                    hasError: this.$v.$invalid,
                    store: this.selectedStore
                });
            },
            showError() {
                this.$v.$touch();

                this.$refs['selectStore'].focus();
            }
        }
    };
</script>
