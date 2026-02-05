<template>
    <div class="m-gcmsSearch">
        <!-- GCMS Search form -->
        <form
            class="m-gcmsSearch__form"
            method="GET"
            :action="actionUrl"
            @submit.prevent.once="$v.$touch"
            @submit.prevent="submit">

            <!-- Single Oil Name Field -->
            <div class="m-gcmsSearch__field">
                <!-- Hidden label -->
                <label class="hidden" :for="singleOilNameId">{{ getLabels(localization, 'Placeholder') }}</label>

                <!-- Input -->
                <input
                    :id="singleOilNameId"
                    v-model="singleOilName"
                    autocomplete="off"
                    :placeholder="getLabels(localization, 'Placeholder')"
                    type="text"
                    class="m-gcmsSearch__input a-input"
                    :class="$v.singleOilName.$error ? '-isInvalid' : ''"
                    aria-required="true"
                    :aria-invalid="$v.singleOilName.$error"
                    :aria-describedby="$v.singleOilName.$error ? errorId : null" />

                <!-- Display FE validation -->
                <div
                    v-if="$v.singleOilName.$error"
                    :id="errorId"
                    class="m-gcmsSearch__error e-formError">
                    <p v-if="$v.singleOilName.$error" class="e-formError__item">
                        {{ getLabels(localization, 'ErrorOilName') }}
                    </p>
                </div>
            </div>

            <!-- Submit button -->
            <button
                class="m-gcmsSearch__button"
                type="button"
                @click.once="$v.$touch"
                @click="submit($event)">
                {{ getLabels(localization, 'ViewReport') }}
            </button>
        </form>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';

    export default {
        name: 'MGcmsSearch',
        mixins: [ validationMixin, labels ],
        validations: {
            singleOilName: {
                required
            }
        },
        props: {
            actionUrl: {
                type: String,
                default: null
            },
            inputValue: {
                type: String,
                default: null
            },
            localization: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                singleOilName: null,
                singleOilNameId: 'm-gcmsSearch-single-oil-name',
                errorId: 'm-gcmsSearch-error'
            };
        },
        mounted() {
            if(this.inputValue) {
                this.singleOilName = this.inputValue;
            }
        },
        methods: {
            submit(event) {
                event.preventDefault();

                this.$v.$touch();

                if(!this.$v.$invalid && this.actionUrl) {
                    // Emit to parent
                    this.$emit('gcms-search-submitted');

                    // Go to search results page
                    window.location.href = `${this.actionUrl}?search=${this.singleOilName}`;
                }
            }
        }
    };
</script>
