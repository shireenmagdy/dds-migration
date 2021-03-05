const generator = require('./generator')

const regexTypes = {
    ba: '^.*; (?<billingAccountNumber>[^:]*)?:(?<json>{.*})(; ){0,1}\\),$',
    ca: '^.*; (?<ca>[^:]*)?:(?<json>{.*})(; ){0,1}\\),$',
    pp: '^.*; (?<subscriberId>[^:]*)?:(?<json>{.*})(; ){0,1}\\),$',
    sub: '^.*; (?<msisdn>[^:]*)?:(?<json>{.*})(; ){0,1}\\),$',
}

const groupTypes = {
    ba: [
        {name: 'billingAccountNumber'},
        {name: 'json', type: 'json', root: true}
    ],
    ca: [
        {name: 'ca', skip: true},
        {name: 'json', type: 'json', root: true}
    ],
    pp: [
        {name: 'subscriberId'},
        {name: 'json', type: 'json', root: true}
    ],
    sub: [
        {name: 'sub', skip: true},
        {name: 'json', type: 'json', root: true}
    ],
}

// e.g. latin1
const encodingTypes = {
    ba: null,
    ca: null,
    pp: null,
    sub: null,
}

const type = process.argv[2]
const inputFolder = process.argv[3]
const outputFolder = process.argv[4]
const maxLinesPerOutput = process.argv[5]
if (!type || !inputFolder || !outputFolder) {
    console.log(`Usage index.js type inputFolder outputFolder maxLinesPerOutput`)
    return
}

const regexString = regexTypes[type]
if (!regexString) {
    console.log(`Invalid type: ${type}, try one of ba|ca|pp|sub`)
}
console.log(`Starting for type ${type} inputFolder ${inputFolder} and outputFolder ${outputFolder}`)
generator.generate({
    encoding: encodingTypes[type],
    inputFolder: inputFolder,
    // inputEncoding: 'win1253',
    outputFolder: outputFolder,
    maxLinesPerOutput: maxLinesPerOutput,
    // regexpString: '^.*; \\d{4,5}(; ){1,2}(?<msisdn>69\\d{8})?(?<nonMsisdn>\\d{10})?(?<other>.{9})?:(?<json>{.*})(; ){0,1}\\),$',
    // NP_MIG_Exp_210222-2.csv
    regexpString: regexString,
    groups: groupTypes[type],
    // just for testing
    // lineDuplication: 1000
})

