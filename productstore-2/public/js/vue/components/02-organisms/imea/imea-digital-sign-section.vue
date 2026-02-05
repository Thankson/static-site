<template>
    <div class="o-imeaDigitalSignSection text-sm">
        <h2 class="font-bold text-xl mb-20">
            {{ labels.DigitalSignTitle }}
        </h2>
        <div class="flex flex-col md:flex-row">
            <div class="flex-1 md:mr-15">
                <div
                    v-for="(checkbox, i) in checkboxesArray"
                    :key="`${checkbox.Name}-${i}`"
                    class="mb-20"
                >
                    <m-checkbox
                        v-model="checkboxesState[checkbox.Name]"
                        :aria-required="true"
                        :aria-describedby="`${checkbox.Name}Error`"
                        :label="checkbox.Text"
                        :label-mods="`font-normal -items-start${
                            hasCheckboxError(checkbox.Name) ? ' -error' : ''
                        }`"
                        @input="pushToDataLayer($event, checkbox.Text)"
                    />
                    <FormFieldErrorMessage
                        :id="`${checkbox.Name}Error`"
                        :is-visible="hasCheckboxError(checkbox.Name)"
                        :msg="checkbox.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="mt-20 md:mt-0 md:ml-15 flex-1 text-base leading-tight">
                <p v-html="labels.Undertaking"></p>
            </div>
        </div>
        <div class="my-20 md:w-1_2">
            <!-- Self Digital Sign -->
            <div>
                <label
                    class="font-medium"
                    for="selfDigitalSign"
                >{{ customerName }}</label
                >
                <input-basic
                    id="selfDigitalSign"
                    v-model="selfDigitalSign"
                    :tailwind-mods="
                        $v.selfDigitalSign.$error ? '-isInvalid' : null
                    "
                    :aria-required="true"
                    :aria-invalid="!$v.selfDigitalSign.$error"
                />
                <p
                    :class="
                        $v.selfDigitalSign.$error ? 'text-red' : null
                    "
                    v-html="labels.SignMatchText"
                ></p>
            </div>
            <!-- Spouse Digital Sign -->
            <div v-if="spouseName" class="mt-40">
                <label
                    class="font-medium"
                    for="selfDigitalSign"
                >{{ spouseName }}</label
                >
                <input-basic
                    id="selfDigitalSign"
                    v-model="spouseDigitalSign"
                    :tailwind-mods="
                        $v.spouseDigitalSign.$error ? '-isInvalid' : null
                    "
                    :aria-required="true"
                    :aria-invalid="!$v.spouseDigitalSign.$error"
                />
                <p
                    :class="
                        $v.spouseDigitalSign.$error ? 'text-red' : null
                    "
                    v-html="labels.SignMatchText"
                ></p>
            </div>
        </div>
    </div>
</template>
<script>
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';

    export default {
        name: 'OImeaDigitalSignSection',
        components: {
            FormFieldErrorMessage
        },
        mixins: [localizationMixin, validationMixin],
        validations() {
            const validations = {
                checkboxesState: {}
            };
            if(this.hasCheckboxes) {
                this.checkboxesArray.forEach(obj => {
                    if(obj.Required) {
                        validations.checkboxesState[obj.Name] = {
                            checked: value => value
                        };
                    }
                });
            }
            validations.selfDigitalSign = {
                required,
                signature: signature => {
                    return signature === this.customerName;
                }
            };
            if(this.spouseName) {
                validations.spouseDigitalSign = {
                    required,
                    signature: signature => {
                        return signature === this.spouseName;
                    }
                };
            }
            return validations;
        },
        props: {
            customerName: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            spouseName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                checkboxesArray: [],
                checkboxesState: {},
                selfDigitalSign: '',
                spouseDigitalSign: ''
            };
        },
        computed: {
            hasCheckboxes() {
                return !!this.labels?.Checkboxes?.length;
            }
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        mounted() {
            this.$nextTick(() => {
                if(this.hasCheckboxes) {
                    this.checkboxesArray = this.labels.Checkboxes;
                    this.checkboxesArray.forEach(obj => {
                        this.$set(this.checkboxesState, obj.Name, obj.Checked);
                    });
                }
            });
        },
        methods: {
            hasCheckboxError(checkboxName) {
                const v = this.$v.checkboxesState[checkboxName];
                return v && v.$dirty && !v.checked;
            },
            pushToDataLayer(event, text) {
                if(event) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'IMEA Form',
                        eA: 'Checkbox',
                        eL: text
                    });
                }
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        if(this.hasCheckboxes) {
                            const selectedCheckboxes = this.checkboxesArray.map(obj => ({
                                Name: obj.Name,
                                Checked: this.checkboxesState[obj.Name]
                            }));
                            const formData = {
                                SelectedCheckboxes: selectedCheckboxes
                            };
                            eventBus.$emit('getInput', formData, true);
                        } else eventBus.$emit('getInput', false, true);
                    } else eventBus.$emit('getInput', false, false);
                });
            }
        }
    };
</script>
