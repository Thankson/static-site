<template>
    <form
        class="m-guiCodeForm"
        novalidate
        @submit.prevent="onSubmit">

        <label
            class="m-guiCodeForm__label"
            :for="inputId">

            {{ inputLabel }}
        </label>

        <div class="md:flex items-start">
            <div class="m-guiCodeForm__inputWrap">
                <slot name="input" v-bind="slotProps">
                    <input
                        :id="inputId"
                        ref="input"
                        v-model="value"
                        :class="inputClassNames"
                        type="text"
                        :placeholder="inputPlaceholder"
                        required
                        aria-required="required"
                        :aria-invalid="isError"
                        :aria-describedby="isError ? inputErrorId : null"
                        :readonly="isReadonly"
                    />
                </slot>

                <div class="mb-8"></div>

                <div
                    v-if="isError"
                    :id="inputErrorId"
                    class="m-guiCodeForm__error">

                    {{ errorLabel }}
                </div>

                <div aria-live="polite">
                    <p
                        v-if="isSuccess"
                        class="m-guiCodeForm__success">

                        {{ successLabel }}
                    </p>
                </div>
            </div>

            <button
                type="submit"
                class="m-guiCodeForm__submit -outline md:relative"
                :class="isReadonly ? '-disabled': ''"
                :aria-disabled="isReadonly">

                <span role="text">
                    {{ submitLabel }}

                    <span class="m-guiCodeForm__loader">
                        <a-loading-spinner
                            class="-m-0"
                            size="sm"
                            :visible="isLoading"
                        />
                    </span>
                </span>
            </button>
        </div>
    </form>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import guiCodeFormMixin from '../../../mixins/gui-code-form';

    export default {
        name: 'MGuiCodeForm',
        mixins: [ guiCodeFormMixin, safeId ],
        safeIds: [
            'inputId',
            'inputErrorId'
        ],
        props: {
            isError: {
                type: Boolean,
                default: false
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            isSuccess: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                inputId: '',
                inputErrorId: '',
                value: ''
            };
        },
        computed: {
            inputClassNames() {
                return [
                    'm-guiCodeForm__input',
                    this.isError ? '-isInvalid' : '',
                    this.isReadonly ? '-disabled' : ''
                ];
            },
            slotProps() {
                return {
                    inputErrorId: this.inputErrorId,
                    inputId: this.inputId,
                    inputClassNames: this.inputClassNames,
                    isError: this.isError,
                    value: this.value
                };
            }
        },
        watch: {
            inputValue() {
                this.value = this.inputValue;
            }
        },
        mounted() {
            this.value = this.inputValue;
        },
        methods: {
            focusInput() {
                this.$refs.input?.focus();
            },
            onSubmit() {
                if(this.isReadonly) return;

                this.$emit('submit', {
                    value: this.value
                });
            }
        }
    };
</script>
