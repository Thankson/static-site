<template>
    <div id="cExpForm" class="custExpForm w-full relative" style="max-width: 370px;">
        <button class="flex w-full uppercase text-green font-semibold" :class="{'mb-16': showForm, 'hidden': submitSuccess}" aria-hidden="true" @click="showForm = !showForm"><span class="inline">{{ shareButtonTitle }}</span><i aria-hidden="true" class="inline pl-8"><svg xmlns="http://www.w3.org/2000/svg" width="24.961" height="24.961" viewBox="0 0 24.961 24.961"><defs></defs><path d="M22.5-12.48V-15H15.645l-2.52,2.52Zm-15,0h3.105l8.613-8.613a.529.529,0,0,0,0-.879L16.992-24.2a.573.573,0,0,0-.879,0L7.5-15.586Zm17.52-15a2.364,2.364,0,0,1,1.729.732,2.364,2.364,0,0,1,.732,1.729v15a2.462,2.462,0,0,1-.732,1.758A2.32,2.32,0,0,1,25.02-7.5H7.5L2.52-2.52v-22.5a2.364,2.364,0,0,1,.732-1.729A2.364,2.364,0,0,1,4.98-27.48Z" transform="translate(-2.52 27.48)" style="fill: #30862d" /></svg></i>
        </button>

        <div class="custExpForm__row -form" :class="{'sr-only': !showForm}">
            <h3 class="sr-only">{{ shareButtonTitle }}</h3>

            <form>
                <div class="w-full mb-16">
                    <label class="block uppercase" for="cExpFormTitle">{{ formFieldTitle.label }}</label>
                    <input id="cExpFormTitle" v-model="reviewTitleValue" class="w-full block rounded border p-8" type="text" :name="formFieldTitle.name" :maxlength="reviewTitleMax">

                    <p class="block text-right text-sm text-gray italic pt-6">
                        <em class="font-semibold pr-2" v-text="(reviewTitleMax - reviewTitleValue.length)"></em> <span>characters remaining</span>
                    </p>
                </div>

                <div class="w-full mb-16">
                    <label class="block uppercase" for="cExpFormStory">{{ formFieldContent.label }}</label>
                    <textarea id="cExpFormStory" class="w-full block rounded border p-8" :name="formFieldContent.name" rows="5" cols="30"></textarea>
                </div>

                <div class="block">
                    <div class="flex mb-40">
                        <button type="button" aria-labelledby="custExpLabel" aria-describedby="custExperienceTerms" @click="termsIsChecked = !termsIsChecked">
                            <span type="button" :class="{'hidden': termsIsChecked}" aria-hidden="true">
                                <svg class="text-green fill-current" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                            </span>
                            <span type="button" :class="{'hidden': !termsIsChecked}" aria-hidden="true">
                                <svg class="text-green fill-current" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                            </span>
                        </button>

                        <h4 id="custExpLabel" class="text-base pl-10">{{ terms.labelBegin }} <span class="sr-only">{{ terms.labelEnd }}</span> <button type="button" class="text-green underline cursor-pointer" aria-hidden="true" :tabindex="showTerms ? -1 : 0" @click="showTerms = !showTerms">{{ terms.labelEnd }}</button></h4>
                    </div>

                    <div class="flex justify-center items-center fixed w-screen h-screen top-0 left-0 z-4" :class="{'sr-only': !showTerms}">
                        <div class="absolute w-full h-full top-0 left-0 z-1" style="background: rgba(0,0,0,.25)" @click="showTerms = !showTerms"></div>
                        <div class="bg-white rounded shadow relative p-40 mx-auto z-2" style="max-width: 350px;">
                            <p id="custExperienceTerms" class="text-sm">
                                {{ terms.content }}
                            </p>
                            <button type="button" class="text-xl text-gray absolute top-0 right-0 p-10 pr-16 z-1" aria-hidden="true" :tabindex="showTerms ? 0 : -1" @click="showTerms = !showTerms">&#10005;</button>
                        </div>
                    </div>

                    <input v-model="termsIsChecked" class="termsCheckbox hidden" type="checkbox" name="" value="" aria-hidden="true">
                </div>

                <div>
                    <button class="bg-green text-white uppercase text-center rounded w-full p-16" type="button" style="max-width: 170px">{{ submitText }}</button>
                </div>
            </form>
        </div>

        <div class="custExpForm__row -success" :class="{'hidden': !submitSuccess}">
            <h3 class="custExpForm__title -success">{{ success.title }}</h3>
            <p class="custExpForm__message -success">{{ success.message }}</p>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'CustomerExpForm',
        props: {
            formFieldContent: {
                type: Object,
                default: () => {}
            },
            formFieldTitle: {
                type: Object,
                default: () => {}
            },
            shareButtonTitle: {
                type: String,
                default: ''
            },
            submitText: {
                type: String,
                default: ''
            },
            success: {
                type: Object,
                default: () => {}
            },
            terms: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                closeTabIndex: '-1',
                reviewTitleMax: 32,
                reviewTitleValue: '',
                showForm: false,
                showTerms: false,
                submitSuccess: false,
                termsIsChecked: false
            };
        },
        methods: {
            submitExperience() {
            // Requires POST Data
            },
            limit(event, dataProp, limit) {
                if(this[dataProp].length >= limit) {
                    event.preventDefault();
                }
            }
        }
    };
</script>
