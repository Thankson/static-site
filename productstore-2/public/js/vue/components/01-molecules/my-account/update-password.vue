<template>
    <div class="m-updatePassword">
        <h3 v-if="!editing" class="text-gray-150 font-medium text-sm leading-base uppercase mb-5">{{ labels.title }}</h3>
        <em v-if="updated" class="text-green italic font-medium text-2xl block -mr-5 mt-5 mb-18" role="alert">
            {{ labels.updatedSuccess }}
        </em>
        <button
            v-if="!editing"
            ref="showFormButton"
            type="button"
            :aria-label="labels.updateAriaLabel"
            class="justify-center w-full text-center text-base text-green leading-base uppercase block bg-white border-green border-1 rounded w-full py-15 mb-44"
            @click="[editing = true, gtmTrackAction({id: 243}, $event)]"
        >
            {{ labels.update }}
        </button>

        <form v-if="editing" class="w-full pb-20" @submit="updatePassword">
            <div class="pb-20">
                <label class="text-gray-150 font-medium text-sm leading-base uppercase mb-5" for="fpassword">{{ labels.newPassword }}</label>
                <a-input-glimpse
                    ref="fPassword"
                    :attributes="{
                        'Id': 'fpassword',
                        'Name': 'fpassword',
                        'MinLength': '1',
                        'MaxLength': '100',
                        'Placeholder': labels.placeholderNew,
                        'Criteria': labels.criteria
                    }"
                    :init-hidden="true"
                    show-label="Show Password"
                    hide-label="Hide Password"
                    autocomplete="off"
                    :input-classname="error && !passAllCriteria ? '-isInvalid a-input -text text-sm' : 'a-input -text text-sm'"
                    :has-criteria="true"
                    v-on:passCriteria="checkAllCriteria($event)"
                >
                </a-input-glimpse>
            </div>
            <div class="pb-20">
                <label class="text-gray-150 font-medium text-sm leading-base uppercase mb-5" for="fpassword-confirm">{{ labels.confirmPassword }}</label>
                <a-input-glimpse
                    ref="fPasswordConfirm"
                    :attributes="{
                        'Id': 'fpassword-confirm',
                        'Name': 'fpassword-confirm',
                        'MinLength': '1',
                        'MaxLength': '100',
                        'Placeholder': labels.placeholderConfirm
                    }"
                    :init-hidden="true"
                    show-label="Show Password"
                    hide-label="Hide Password"
                    autocomplete="off"
                    :input-classname="error && passAllCriteria ? '-isInvalid a-input -text text-sm' : 'a-input -text text-sm'"
                >
                </a-input-glimpse>
            </div>
            <div class="text-right font-normal -mt-5 mb-25">
                <em v-if="error" class="e-formError__item float-left text-left w-full xl:w-250 not-italic" role="alert">{{ error }}</em>
                <button
                    class="a-button -outline mr-4 md:mr-6"
                    :class="isJp ? '' : '-sm'"
                    type="button"
                    :aria-label="labels.cancelAriaLabel"
                    @click="[cancelEdit(), gtmTrackAction({id: 241}, $event)]"
                >
                    {{ labels.cancel }}
                </button>
                <button
                    class="a-button"
                    :class="isJp ? '-saveJp' : 'w-100 py-5 inline-block text-center'"
                    type="submit"
                    :aria-label="labels.saveAriaLabel"
                    @click="gtmTrackAction({id: 242}, $event)"
                >
                    {{ labels.save }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
    import api from '@api/routes/customeraccount/forgotpassword/updatepassword';

    export default {
        name: 'UpdatePassword',
        props: {
            labels: {
                type: Object,
                default() {
                    return {};
                }
            }
        },

        data() {
            return {
                passAllCriteria: false,
                editing: false,
                error: '',
                updated: false
            };
        },

        computed: {
            isJp() {
                return this.$env.Country === 'Japan';
            }
        },

        watch: {
            editing(newVal) {
                this.error = '';
                if(newVal) {
                    this.updated = false;
                    this.$nextTick(() => this.$refs.fPassword.$el.querySelector('input').focus());
                }
            }
        },

        methods: {
            cancelEdit() {
                this.editing = false;
                this.$nextTick(() => this.$refs['showFormButton']?.focus());
            },
            checkAllCriteria(val) {
                this.passAllCriteria = val;
            },
            async updatePassword(event) {
                event.preventDefault();
                const password = this.$refs.fPassword.input;
                const passwordConfirm = this.$refs.fPasswordConfirm.input;
                if(this.passAllCriteria) {
                    if(!password) {
                        this.error = this.labels.errors.criteria;
                        return;
                    }
                    if(password !== passwordConfirm) {
                        this.error = this.labels.errors.match;
                    } else {
                        const response = await api.post({ NewPassword: password, ConfirmPassword: passwordConfirm });
                        if(response.success) {
                            this.editing = false;
                            this.updated = true;
                            this.error = '';
                            this.$nextTick(() => this.$refs['showFormButton']?.focus());
                        }
                    }
                } else {
                    this.error = this.labels.errors.criteria;
                }
            }
        }
    };
</script>
