<template>
    <form class="m-shareListForm">
        <span
            class="m-shareListForm__desc text-m block pb-25"
            role="text"
            v-html="tokenizedDescription">
        </span>
        <div class="m-shareListForm__form">
            <!-- Email Field -->
            <div v-if="email !== undefined" class="m-shareListForm__formGroup">
                <label class="m-shareListForm__label" for="email">{{ shareListEmail }}</label>
                <input-basic
                    id="email"
                    ref="Email"
                    name="email"
                    :placeholder="emailPlaceholder"
                    :value="email"
                    :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                    @keyup="error.email = undefined"
                    @input="setValue('email', $event)"
                />
                <em v-if="error.email" class="m-shareListForm__error">{{ error.email }}</em>
            </div>

            <!-- Text Area Field -->
            <div v-if="message !== undefined" class="m-shareListForm__formGroup">
                <label class="m-shareListForm__label" for="message">{{ shareListMessage }}</label>
                <text-area-basic
                    v-if="!isCn"
                    id="message"
                    ref="message"
                    class="m-shareListForm__textarea"
                    name="message"
                    rows="10"
                    :value="message"
                    :tailwind-mods="`bg-clear ${error.message ? '-isInvalid': ''}`"
                    @keyup="error.message = undefined"
                    @textArea="setValue('message', $event)"
                />
                <em v-if="error.message && !isCn" class="m-shareListForm__error">{{ error.message }}</em>
                <div
                    v-if="isCn"
                    id="message"
                    class="m-shareListForm__textarea -isCn"
                    v-html="message">
                </div>
            </div>

            <!-- Recipient Consent Checkbox -->
            <div class="m-shareListForm__formGroup">
                <m-checkbox
                    ref="consent"
                    v-model="consent"
                    name="consent"
                    :label="consentLabel"
                    :label-mods="`font-normal leading-tight text-sm md:text-base -m-4 tracking-tight ${error.consent ? '-error':''}`"
                    input-value="consent">
                </m-checkbox>
                <em v-if="error.consent" class="m-shareListForm__error" role="alert">{{ error.consent }}</em>
            </div>

            <!-- Action Buttons -->
            <div class="m-shareListForm__actions">
                <button
                    class="a-button -outline -full text-base py-10 mr-8"
                    type="button"
                    @click="[cancelShare(), gtmTrackAction({id: 176}, $event)]"
                >
                    {{ shareListCancel }}
                </button>
                <button
                    class="a-button text-base py-10 -full"
                    type="button"
                    @click="[submit(), gtmTrackAction({id: 175}, $event)]"
                >
                    {{ shareListSend }}
                </button>
            </div>

            <!-- Loading Spinner -->
            <a-loading-spinner :visible="loading" size="sm" />
        </div>
    </form>
</template>

<script>
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import shareApi from '@api/routes/shoppinglists/share';

    export default {
        name: 'MShareListForm',
        mixins: [ localizationMixin ],
        props: {
            consentLabel: {
                type: String,
                default: null
            },
            consentError: {
                type: String,
                default: null
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            requiredFieldText: {
                type: String,
                default: null
            },
            emailValidationText: {
                type: String,
                default: null
            },
            shareListDescription: {
                type: String,
                default: null
            },
            shareListEmail: {
                type: [Number, String],
                default: null
            },
            shareListMessage: {
                type: [Number, String],
                default: null
            },
            shareListEmailPlaceholder: {
                type: String,
                default: null
            },
            shareListMessagePlaceholder: {
                type: String,
                default: null
            },
            shareListCancel: {
                type: [Number, String],
                default: null
            },
            shareListSend: {
                type: [Number, String],
                default: null
            },
            scriptId: {
                type: [Number, String],
                default: null
            }
        },
        data() {
            return {
                loading: false,
                email: '',
                message: '',
                error: {},
                emailPlaceholder: '',
                consent: false
            };
        },
        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            },
            isJp() {
                return this.$env?.Country === 'Japan' || false;
            },
            tokenizedDescription() {
                return this.shareListDescription.replace('{listName}', this.listName);
            }
        },
        mounted() {
            this.message = this.shareListMessagePlaceholder;
            this.emailPlaceholder = this.shareListEmailPlaceholder;
        },
        methods: {
            cancelShare: function() {
                this.email = '';
                this.message = '';
                this.consent = false;
                this.$shelf.hide();
            },
            submit: async function () {
                if(this.loading) {
                    return;
                }
                this.error = {};
                this.loading = true;
                if(!this.validateFields()) {
                    this.loading = false;
                    return;
                }
                const data = {email: this.email, message: this.message, listId: this.listId};
                let response = await shareApi.post(data);
                if(response.success) {
                    this.loading = false;
                    this.cancelShare();
                }
            },
            validateFields: function() {
                let valid = true;

                if(!formHelper.isValidEmail(this.email)) {
                    this.error.email = this.emailValidationText;
                    valid = false;
                }
                if((!this.isJp && !this.message) || (!this.message.trim())) {
                    this.error.message = this.requiredFieldText;
                    valid = false;
                }
                if(!this.consent) {
                    this.error.consent = this.consentError;
                    valid = false;
                }

                return valid;
            },
            setValue: function (data, value) {
                this[data] = value;
            }
        }
    };
</script>
