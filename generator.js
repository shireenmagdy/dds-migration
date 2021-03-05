const fs = require('fs')
const ObjectID = require('bson-objectid')
const lineByLine = require('n-readlines')
const iso88597 = require('iso-8859-7')

const generate = ({encoding, inputFolder, outputFolder, maxLinesPerOutput, regexpString, groups, lineDuplication}) => {
    fs.mkdirSync(outputFolder, {recursive: true})
    console.log(`starting generation for ${inputFolder} using regexp ${regexpString}`)
    let i = 1;
    let writeI = 0
    let outputFile
    let invalidOutFile
    let outputFileI = 1
    let regexp = new RegExp(regexpString, 'gm')
    let invalidLines = 0

    const inputFiles = fs.readdirSync(inputFolder)
    inputFiles.forEach((inputFile) => {
        const liner = new lineByLine(`${inputFolder}/${inputFile}`)
        let lineData

        const work = async () => {
            while (lineData = liner.next()) {
                let line
                if (encoding) {
                    // e.g. latin1
                    line = iso88597.decode(lineData.toString(encoding)).toString()
                } else {
                    line = lineData.toString()
                }
                //skip empty lines
                if (line.length === 0) {
                    i++
                } else {
                    if (i === 1) {
                        // the header
                    } else {
                        // there are line feeds due to max line chars
                        let nextLine = line
                        while (nextLine.length >= 32766 && !nextLine.endsWith('),')) {
                            nextLine = iso88597.decode(liner.next().toString('latin1')).toString()
                            line = line + nextLine
                            i++
                        }

                        // create a new outputFile
                        if ((!maxLinesPerOutput && !writeI) || writeI % maxLinesPerOutput === 0) {
                            if (outputFile) {
                                outputFile.end()
                            }
                            const outputFilePath = `${outputFolder}/${inputFile}_out_${outputFileI}`
                            const invalidOutputFilePath = `${outputFolder}/${inputFile}_invalid_out_${outputFileI}`
                            outputFileI++
                            console.log(`creating output: ${outputFilePath}`)
                            outputFile = fs.createWriteStream(outputFilePath, {flags: 'a', encoding: 'utf8'})
                            invalidOutFile = fs.createWriteStream(invalidOutputFilePath, {flags: 'a', encoding: 'utf8'})
                        }
                        regexp.lastIndex = 0
                        let match = regexp.exec(line)
                        let document = {}
                        let invalidDocument

                        try {
                            groups.forEach(g => {
                                if (match.groups[g.name]) {
                                    let groupData
                                    if (g.type === 'json') {
                                        try {
                                            groupData = JSON.parse(match.groups[g.name])
                                        } catch (e) {
                                            console.log(`invalid json on line ${i}`)
                                            invalidDocument = {line: i, lineText: line}
                                            throw e
                                        }
                                    } else {
                                        groupData = match.groups[g.name]
                                    }
                                    if (!g.skip) {
                                        if (g.root) {
                                            document = {...document, ...groupData}
                                        } else {
                                            document[g.name] = groupData
                                        }
                                    }
                                }
                            })
                        } catch (e) {
                            // invalid document
                        }
                        if (invalidDocument) {
                            invalidLines++
                            let written = invalidOutFile.write(JSON.stringify(invalidDocument) + '\n')
                            if (!written) {
                                await new Promise(resolve => invalidOutFile.once('drain', resolve))
                            }
                        } else {
                            let written = outputFile.write(JSON.stringify(document) + '\n')
                            if (!written) {
                                await new Promise(resolve => outputFile.once('drain', resolve))
                            }
                        }

                        // just for testing
                        if (lineDuplication) {
                            console.log(`duplicating ${lineDuplication} times on line ${i}`)
                            for (let i = 0; i < lineDuplication; i++) {
                                let written = outputFile.write(JSON.stringify(document) + '\n')
                                if (!written) {
                                    await new Promise(resolve => outputFile.once('drain', resolve))
                                }
                            }
                        }
                        writeI++
                    }
                    i++
                }
            }
            console.log(`Skipped lines ${invalidLines}`)
        }
        work()
    })

}

exports.generate = generate
