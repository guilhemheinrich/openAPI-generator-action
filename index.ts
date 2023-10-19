import * as core from '@actions/core'
import { XOasObject } from '@ts-stack/openapi-spec';
import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs-extra'
import {languages} from './src/OperationParser'
import OperationParser from './src/OperationParser'
import axios from 'axios'
    
const main = {
    async init(config_path: string, destination: string, targeted_language: typeof languages[number]) {
        if (!languages.includes(targeted_language)) core.setFailed(`${targeted_language} is not a valid language.\n Valid languages are:\n  ${languages.join('\n')}`)
        try {
            // async/await syntax
            const openapi_config: XOasObject = await $RefParser.dereference(JSON.parse(fs.readFileSync(config_path, 'utf-8'))) as XOasObject
            const operation_generator = new OperationParser(openapi_config)
            operation_generator.build()
            await operation_generator.digest(targeted_language, destination)

        }
        catch (err) {
            if (err instanceof Error) core.setFailed(err.message)

        }
    }
}
 export default main
