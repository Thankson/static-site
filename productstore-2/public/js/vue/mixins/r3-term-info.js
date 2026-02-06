export default {
    data() {
        return {
            terms: []
        };
    },
    mounted () {
        const agreements = this.getLocalizationProp('Data.Agreements', []);
        this.terms = agreements.map((agreement, i) => {
            const Modals = (agreement.Modals || []).map((modal, index) => ({
                name: `${modal.Name.toLowerCase()}-${index}`,
                placeholder: `{${index}}`,
                text: modal.Text,
                termTitle: modal.ModalTitle,
                termContent: modal.ModalContent
            }));
            return {
                ...agreement,
                Name: `${agreement.Name}-${i}`,
                Modals,
                // this `term` field is default value
                term: false
            };
        });
    }
};
