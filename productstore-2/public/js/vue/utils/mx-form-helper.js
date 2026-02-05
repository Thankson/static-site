// See http://tfs.melaleuca.net:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/251240

export const isValidClabeCardNumber = (clabeCardNumber) => {
    return /^([0-9]{16}|[0-9]{18})$/.test(clabeCardNumber);
};

export const isValidRfcNumber = (rfcNumber) => {
    return /^(?<Initials>[A-ZÑ&]{3,4})(?<Year>[0-9]{2})(?<Month>0[1-9]|1[0-2])(?<Day>0[1-9]|[12][0-9]|3[01])(?<Random>[0-9A-Z]{3})$/.test(rfcNumber);
};

export const isValidCurpNumber = (curpNumber) => {
    return /^(?<LettersGeneratedFromName>[A-ZÑ][AEIOUXÑ][A-ZÑ]{2})(?<Year>[0-9]{2})(?<Month>0[1-9]|1[0-2])(?<Day>0[1-9]|[12][0-9]|3[01])(?<Gender>[HMX])(?<State>AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)(?<NameConsonants>[B-DF-HJ-NP-TV-ZÑ]{2}[A-ZÑ])(?<Random>[0-9A-ZÑ]{2})$/.test(curpNumber);
};
