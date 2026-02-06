import { mapActions, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters('env', ['soldOutHostGet'])
    },
    mounted() {
        if(this.soldOutHostGet === null) {
            this.setSoldOutHost(this.$env);
        }
    },
    methods: {
        ...mapActions('env', ['setSoldOutHost'])
    }
};
