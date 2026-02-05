<template>
    <div v-clickoutside="shouldClear" class="m-createShoplists">
        <!-- Show spinner while API is being loaded -->
        <div v-if="showLoading && submitted" class="m-createShoplists__loading">
            <a-loading-spinner
                :visible="true"
                size="sm"
                class="m-createShoplists__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Create new list form -->
        <form
            class="m-createShoplists__form"
            :class="formMods"
            method="POST"
            @submit.prevent.once="$v.$touch"
            @submit.prevent="submit">
            <!-- List name field -->
            <div class="m-createShoplists__field">
                <!-- Hidden label -->
                <label
                    class="m-createShoplists__label"
                    :for="newListNameId" v-html="getLabels(localization, 'Labels.NewListPlaceholder', 'New List Name')"></label>

                <!-- Input -->
                <input
                    :id="newListNameId"
                    ref="new-list-name"
                    v-model="newListName"
                    name="new-list-name"
                    autocomplete="off"
                    :placeholder="getLabels(localization, 'Labels.NewListPlaceholder', 'New List Name')"
                    type="text"
                    class="m-createShoplists__input a-input"
                    :class="$v.newListName.$error ? '-isInvalid' : ''"
                    aria-required="true"
                    :aria-invalid="$v.newListName.$error"
                    :aria-describedby="$v.newListName.$error ? errorId : null" />
            </div>

            <!-- Submit button -->
            <button
                class="m-createShoplists__button a-button"
                type="button"
                @click.once="$v.$touch"
                @click="[submit(), gtmTrackAction({id: 401, text: newListName}, $event)]">
                {{ getLabels(localization, 'Labels.Create', 'Create') }}
            </button>

            <!-- Display FE validation error and API validation error -->
            <div
                v-if="!isSuccess"
                :id="errorId"
                class="m-createShoplists__error e-formError">
                <p v-if="$v.newListName.$error" class="e-formError__item" :class="errorMods" role="alert">
                    {{ getLabels(localization, 'Labels.NewListRequired', 'New list name is required') }}
                </p>
                <p v-for="(error, index) in apiError" :key="index" class="e-formError__item" :class="errorMods" role="alert">
                    {{ error }}
                </p>
            </div>

            <!-- Display success message -->
            <div v-if="showSuccess && isSuccess" class="m-createShoplists__success">
                <p class="flex items-center text-sm text-green" role="alert">
                    <i class="material-icons" aria-hidden="true">error_outline</i>
                    {{ replaceToken(getLabels(localization, 'Labels.NewListCreated'), brandNewList) }}
                </p>
            </div>
        </form>

        <!-- Modal - List with same name -->
        <m-shoplists-same-name-modal
            v-if="listSameName"
            ref="same-list-name-modal"
            :list="listSameName"
            :localization="localization">
        </m-shoplists-same-name-modal>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import eventBus from '../../../mixins/event-bus';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MShoplistsCreate',
        directives: {
            clickoutside: {
                bind(el, binding, vnode) {
                    el.clickOutsideEvent = function(event) {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };

                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },
        mixins: [ safeId, validationMixin, labels ],
        safeIds: [
            'newListNameId',
            'errorId'
        ],
        validations: {
            newListName: {
                required
            }
        },
        props: {
            formMods: {
                type: String,
                default: null
            },
            errorMods: {
                type: String,
                default: null
            },
            lists: {
                type: Array,
                default: () => []
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                apiError: [],
                newListName: null,
                newListNameId: null,
                errorId: null,
                submitted: false,
                showLoading: false,
                listSameName: null,
                showSuccess: false,
                brandNewList: null
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiError', 'storedApiLoading']),

            isSuccess() {
                if((this.apiError && this.apiError.length) || this.$v.newListName.$error) return false;
                return true;
            }
        },
        watch: {
            storedApiError() {
                if(this.submitted) this.apiError = this.storedApiError;
                else this.apiError = [];

                // Clear input if the form is submitted and API returns success
                if(!this.apiError.length && this.submitted && this.showLoading) {
                    this.newListName = null;
                    this.$v.$reset();
                    this.submitted = false;
                }
            },
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            },
            newListName() {
                if(this.newListName && this.showSuccess) {
                    this.showSuccess = false;
                }
            }
        },
        mounted() {
            this.showSuccess = false;
            this.submitted = false;
            this.apiError = [];

            eventBus.$on('reset-form', () => {
                this.resetForm();
            });
        },
        methods: {
            ...mapActions('shoppingLists', ['createList']),

            async submit() {
                const newListName = this.newListName;
                this.$v.$touch();

                if(!this.$v.$invalid) {
                    // Check if list name already exists
                    this.listSameName = await this.lists.find(list => list.ListName.toLowerCase() === this.newListName.toLowerCase().trim());

                    // If the name already exists, then opens a modal
                    if(this.listSameName) {
                        this.$nextTick(() => {
                            this.$refs['same-list-name-modal'].open();
                        });
                    } else {
                        this.submitted = true;
                        this.apiError = [];

                        // Save data
                        await this.createList({
                            payload: {
                                ListName: this.newListName,
                                Sku: null,
                                Configurations: null
                            }
                        });

                        if(this.isSuccess) {
                            this.showSuccess = true;
                            this.brandNewList = newListName;
                            this.newListName = null;
                            this.$v.$reset();
                        } else {
                            this.showSuccess = false;
                            this.brandNewList = null;
                        }
                    }
                }
            },
            resetForm() {
                this.apiError = [];
                this.newListName = null;
                this.$v.$reset();
                this.submitted = false;
                this.showSuccess = false;
            },
            replaceToken,
            shouldClear() {
                this.showSuccess = false;
            }
        }
    };
</script>
