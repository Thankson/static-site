<template>
    <section
        class="o-imeaPersonalInfoSection text-base pb-20"
    >
        <h2 class="font-bold text-xl mb-20">
            {{ formLabels.PersonalInfoTitle }}
        </h2>
        <div
            v-show="!showPersonalInfoForm"
            class="leading-tight mb-20"
        >
            <p>{{ customerName }}</p>
            <p>{{ customerPhoneNumber }}</p>
            <p class="break-all">{{ customerEmailValue }}</p>
            <p v-if="hasPrefilledDobData">
                {{ customerBirthDateFormatted }}
            </p>
        </div>
        <button
            v-if="!showPersonalInfoForm"
            class="text-green underline mb-20"
            :aria-label="formLabels.Edit"
            @click.prevent="openPersonalInfoForm"
        >
            {{ formLabels.Edit }}
        </button>
        <div v-if="showPersonalInfoForm">
            <div v-html="formLabels.NoteText"></div>
            <ImeaPersonalInfoFormMx
                v-if="isMx"
                form-id="self"
                :is-collapse-open="showPersonalInfoForm"
                :labels="formLabels"
                :form-for-self-info="true"
                :pre-filled-data="preFilledData"
            />
            <ImeaPersonalInfoForm
                v-else
                form-id="self"
                :is-collapse-open="showPersonalInfoForm"
                :labels="formLabels"
                :form-for-self-info="true"
                :pre-filled-data="preFilledData"
            />
        </div>
    </section>
</template>
<script>
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import ImeaPersonalInfoFormMx from './imea-personal-info-form-mx.vue';
    import ImeaPersonalInfoForm from './imea-personal-info-form.vue';

    export default {
        name: 'OImeaPersonalInfoSection',
        components: {
            ImeaPersonalInfoFormMx,
            ImeaPersonalInfoForm
        },
        mixins: [localizationMixin],
        data() {
            return {
                customerBirthDay: '',
                customerBirthMonth: '',
                customerBirthYear: '',
                customerEmailValue: '',
                customerName: '',
                customerPhoneNumber: '',
                showPersonalInfoForm: false
            };
        },
        computed: {
            customerBirthDateFormatted() {
                return replaceTokenArray(
                    this.localization?.Data?.PreFilledData?.DOB?.Format,
                    [this.customerBirthMonth, this.customerBirthDay, this.customerBirthYear]
                );
            },
            formLabels() {
                return this.localization?.Labels || {};
            },
            hasPrefilledDobData() {
                return this.customerBirthDay && this.customerBirthMonth && this.customerBirthYear;
            },
            isMx() {
                return this.$env?.Country === 'Mexico' || false;
            },
            preFilledData() {
                return this.localization?.Data?.PreFilledData || {};
            }
        },
        created() {
            eventBus.$on('updateFullName', (isSelfForm, fullName) => {
                // update customer's name on top of the section
                if(isSelfForm && fullName) this.customerName = fullName;
            });
        },
        beforeDestroy() {
            eventBus.$off('updateFullName');
        },
        mounted() {
            this.$nextTick(() => {
                // update customer's prefilled name on digital-sign & top section
                let middleName = this.preFilledData?.MiddleName;
                if(this.isMx) {
                    middleName = '';
                }
                this.customerName = `${this.preFilledData?.FirstName} ${
                    middleName
                        ? middleName + ' '
                        : ''
                }${this.preFilledData?.LastName}${
                    this.preFilledData?.SecondLastName
                        ? ' ' + this.preFilledData?.SecondLastName
                        : ''
                }`;
                eventBus.$emit('updateFullName', true, this.customerName);
                this.customerEmailValue = this.preFilledData?.Email;
                this.customerPhoneNumber = this.preFilledData?.FormattedPhoneNumber;

                this.customerBirthDay = this.preFilledData?.DOB?.Day;
                this.customerBirthMonth = this.preFilledData?.DOB?.Month;
                this.customerBirthYear = this.preFilledData?.DOB?.Year;
            });
        },
        methods: {
            openPersonalInfoForm() {
                this.showPersonalInfoForm = true;
            }
        }
    };
</script>
