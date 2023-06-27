import * as core from '@actions/core'
import { XOasObject } from '@ts-stack/openapi-spec';
import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs-extra'
import OperationParser from './src/OperationParser'


const languages = [
    'python',
    'R'
] as const
    
const main = {
    async init(config_path: string, destination: string, targeted_language: typeof languages[number]) {
        if (!languages.includes(targeted_language)) core.setFailed(`${targeted_language} is not a valid language.\n Valid languages are:\n  ${languages.join('\n')}`)
        try {
            // async/await syntax
            const openapi_config: XOasObject = await $RefParser.dereference(JSON.parse(fs.readFileSync(config_path, 'utf-8'))) as XOasObject
            const operation_generator = new OperationParser(openapi_config)
            operation_generator.build()
            console.log(fs.readdirSync(__dirname))
            console.log(fs.pathExistsSync(`${__dirname}/src/templates/${targeted_language}/Operation.mustache`))
            const operation_template = fs.readFileSync(`${__dirname}/src/templates/${targeted_language}/Operation.mustache`, 'utf-8')
            
            let extension = '.txt'
            switch (targeted_language) {
                case 'python':
                    extension = '.py';
                    break;
                case 'R':
                    extension = '.R';
                    break;
            }
            operation_generator.digest(operation_template, destination, extension)
        }
        catch (err) {
            if (err instanceof Error) core.setFailed(err.message)

        }
    }
}
 export default main
