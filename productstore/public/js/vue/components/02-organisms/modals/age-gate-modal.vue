<template>
    <modal-content
        class="o-ageGate"
        width="470px"
        heading-class="o-ageGate__heading"
    >

        <template v-slot:heading>
            <div class="o-ageGate__row -title">
                {{ getLocalizationProp('Labels.Title') }}
            </div>
        </template>

        <template v-slot:body>
            <div class="o-ageGate__row -body">
                <p class="o-ageGate__desc">
                    {{ getLocalizationProp('Labels.Description') }}
                </p>

                <div class="o-ageGate__inner -body">
                    <div class="o-ageGate__select">
                        <v-select
                            v-if="getLocalizationProp('Labels.Day')"
                            id="days"
                            vmodel="day"
                            :options="daysRange"
                            :values="days"
                            :initial="days[0]"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            :aria-label="getLocalizationProp('Labels.Day')"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            :class="{ '-error': dayError }"
                            @change="setValue"
                        >
                        </v-select>
                    </div>

                    <div class="o-ageGate__select">
                        <v-select
                            v-if="getLocalizationProp('Labels.Month')"
                            id="month"
                            vmodel="month"
                            :options="monthsRange"
                            :values="months"
                            :initial="months[0]"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            :aria-label="getLocalizationProp('Labels.Month')"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            :class="{ '-error': monthError }"
                            @change="setValue"
                        >
                        </v-select>
                    </div>

                    <div class="o-ageGate__select">
                        <v-select
                            v-if="getLocalizationProp('Labels.Year')"
                            id="year"
                            vmodel="year"
                            :options="yearsRange"
                            :values="years"
                            :initial="years[0]"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            :aria-label="getLocalizationProp('Labels.Year')"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            :class="{ '-error': yearError }"
                            @change="setValue"
                        >
                        </v-select>
                    </div>
                </div>
            </div>
        </template>

        <template v-slot:footer>
            <div class="o-ageGate__row -footer">
                <div class="o-ageGate__inner -footer">
                    <button
                        class="o-ageGate__cta"
                        :aria-label="getLocalizationProp('Labels.SubmitAriaLabel')"
                        @click="submit">
                        {{ getLocalizationProp('Labels.Submit') }}
                    </button>
                    <div v-if="loading" class="o-ageGate__loading">
                        <a-loading-spinner :visible="loading" size="sm" />
                    </div>
                </div>

                <!-- Errors -->
                <div v-if="errorsMsgs.length" class="o-ageGate__errors">
                    <ul class="e-formError__list">
                        <li
                            v-for="(msg, index) in errorsMsgs"
                            :key="index"
                            class="e-formError__item"
                            role="alert">
                            {{ msg }}
                        </li>
                    </ul>
                </div>
            </div>
        </template>

    </modal-content>
</template>

<script>
    import api from '@api/routes/account/birthdate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import { range } from 'lodash';
    export default {
        name: 'OAgeGate',

        mixins: [ localizationMixin, validationMixin ],

        validations() {
            return {
                day: {
                    required
                },
                month: {
                    required
                },
                year: {
                    required
                }
            };
        },

        data() {
            return {
                day: null,
                dayError: null,
                errorsMsgs: [],
                loading: false,
                month: null,
                monthError: null,
                year: null,
                yearError: null
            };
        },

        computed: {
            days() {
                const days = this.daysRange;
                const daysArr = days.toLowerCase().replaceAll(' ', '').split(',');
                return daysArr;
            },
            daysRange() {
                const dRange = range(1, 32);
                dRange.unshift(this.getLocalizationProp('Labels.Day').toUpperCase());
                return dRange.toString();
            },
            months() {
                const month = this.monthsRange;
                const monthArr = month.toLowerCase().replaceAll(' ', '').split(',');
                return monthArr;
            },
            monthsRange() {
                const mRange = range(1, 13);
                mRange.unshift(this.getLocalizationProp('Labels.Month').toUpperCase());
                return mRange.toString();
            },
            years() {
                const year = this.yearsRange;
                const yearArr = year.toLowerCase().replaceAll(' ', '').split(',');
                return yearArr;
            },
            yearsRange() {
                const startYear = this.getLocalizationProp('Data.StartFromYear', '1940');
                const finalYear = new Date().getFullYear() + 1;
                const yRange = range(startYear, finalYear);
                yRange.unshift(this.getLocalizationProp('Labels.Year').toUpperCase());
                return yRange.toString();
            }
        },

        watch: {
            $v: {
                deep: true,
                handler() {
                    // All required fields
                    const requiredFields = this.$v.$params;
                    this.errorsMsgs = [];

                    for (let key of Object.keys(requiredFields)) {
                        // Passing boolean errors for each field
                        if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;

                        // Errors Messages
                        if(this[`${key}Error`]) {
                            const keyErrorCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
                            const labelError = `Labels.${keyErrorCapitalized}Error`;

                            this.errorsMsgs.push(this.getLocalizationProp(labelError));
                        }
                    }
                }
            },
            day(val) {
                if(val === this.days[0]) this.day = '';
            },
            month(val) {
                if(val === this.months[0]) this.month = '';
            },
            year(val) {
                if(val === this.years[0]) this.year = '';
            }
        },

        methods: {
            setValue(val) {
                this[val.model] = val.value;
            },

            async submit() {
                this.$v.$touch();

                if(!this.$v.$invalid) {
                    this.loading = true;

                    // Post data
                    const response = await api.post({
                        Day: this.day,
                        Month: this.month,
                        Year: this.year
                    });

                    // Response
                    if(response.success && response.data?.Success) {
                        this.loading = false;
                        this.$modal.hide();
                    } else {
                        // Response Error
                        const errorMsgs = response.data?.ErrorMessages;
                        if(errorMsgs?.length) {
                            errorMsgs.forEach(error => {
                                this.loading = false;
                                if(error.Translation) this.errorsMsgs.push(error.Translation);
                            });
                        }
                    }
                }
            }
        }
    };
</script>
