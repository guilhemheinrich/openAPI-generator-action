import * as core from '@actions/core'
import { XOasObject } from '@ts-stack/openapi-spec';
import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs-extra'
import OperationParser from './src/OperationParser'

const main = {
    async init(config_path: string, destination: string) {
        try {
            // async/await syntax
            const openapi_config: XOasObject = await $RefParser.dereference(JSON.parse(fs.readFileSync(config_path, 'utf-8'))) as XOasObject
            const operation_generator = new OperationParser(openapi_config)
            operation_generator.build()

            const python_template = fs.readFileSync('./src/templates/python/Operation.mustache', 'utf-8')
            operation_generator.digest(python_template, destination, '.py')
        }
        catch (err) {
            if (err instanceof Error) core.setFailed(err.message)

        }
    }
}
 export default main
