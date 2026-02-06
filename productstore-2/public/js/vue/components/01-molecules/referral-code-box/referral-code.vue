<template>
    <div class="m-referralCode" :class="tailwindMods">
        <div v-if="!isSubmited" class="m-referralCode__header">
            <h3 class="m-referralCode__title"> {{ labels.Title }} </h3>
            <div class="m-referralCode__tooltip">
                <m-tooltip>
                    <div v-html="labels.Tooltip.Text"></div>
                </m-tooltip>
            </div>
        </div>
        <div class="m-referralCode__body">
            <form v-if="!isSubmited" class="m-referralCode__form">
                <div class="m-referralCode__input">
                    <div class="m-formField -text">
                        <input-basic
                            :id="referralCodeId"
                            :name="referralCodeName"
                            :value="inputValue"
                            :tailwind-mods="hasError ? '-isInvalid -referralCode' : '-referralCode'"
                            @input="setValue"
                        ></input-basic>
                        <div v-if="hasError" class="m-referralCode__error">
                            <span class="material-icons a-icon -inherit mt-3 mr-5 text-red" aria-hidden="true">error_outline</span>
                            <span class="m-referralCode__text -error">{{ labels.Error.Text }}</span>
                        </div>
                    </div>
                </div>
                <div class="m-referralCode__button">
                    <button class="a-button -referralCode">
                        {{ labels.Button.Text }}
                    </button>
                </div>
            </form>
            <div v-if="!hasError && isSubmited" class="m-referralCode__confirmation" aria-live="polite">
                <span class="material-icons a-icon -inherit mt-3 mr-5 " aria-hidden="true">done</span>
                <span class="m-referralCode__text">{{ labels.Confirmation.Text }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MReferralCodeBox',
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            hasError: {
                type: Boolean,
                default: false
            },
            isSubmited: {
                type: Boolean,
                default: false
            },
            referralCodeId: {
                type: String,
                default: 'referralcode'
            },
            referralCodeName: {
                type: String,
                default: 'referralcode'
            },
            tailwindMods: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                inputValue: null
            };
        },
        methods: {
            setValue(value) {
                this.inputValue = value;
            }
        }
    };
</script>
