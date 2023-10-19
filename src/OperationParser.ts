import { XOasObject, OperationObject, XParameterObject, ParameterObject, PathItemObject, RequestBodyObject, SchemaObject } from '@ts-stack/openapi-spec';
import mustache from 'mustache'
import path from 'path'
import * as fs from 'fs-extra'
import lastify from './mustache_lastify'

import PythonOperation from './templates/python/Operation';
import PythonPrettifier from './templates/python/Sanitizer';
import ROperation from './templates/R/Operation';
import { OperationTemplate } from './templates/OperationTemplate';
import prettifier from './Prettifier';


export const languages = [
    'python',
    'R'
] as const

export function build_extension(lang: typeof languages[number]) {
    switch(lang) {
        case 'python':
            return '.py'
        case 'R':
            return '.R'
        default:
            return ''
    }
}


const operation_type = ['put', 'post', 'delete', 'get', 'patch']
type OperationType = typeof operation_type[number]

export interface ParameterI {
    name: string
    required: boolean
}

export class Parameter implements ParameterI{
    readonly name: string
    readonly required: boolean
    constructor(parameterConstructor: ParameterI) {
        this.name = parameterConstructor.name
        this.required = parameterConstructor.required
    }

    parsedName(parsingFunction: (name: string) => string = (name: string) => {
        return name
    }) {
        return parsingFunction(this.name)
    }
}

export interface Mustache_DictionaryI {
    operation_name: string
    operation_type: OperationType
    isPost?: boolean
    path: string
    headers?: { [key: string]: string }
    query_parameters?: Parameter[]
    path_parameters?: Parameter[]
    cookie_parameters?: Parameter[]
    header_parameters?: Parameter[]
    body?: {[content_type: string] : Parameter[]}
}

export default class OperationParser {
    XOas_object: XOasObject
    operation_dictionary: Mustache_DictionaryI[] =[]
    constructor(XOas_object: XOasObject) {
        this.XOas_object = XOas_object
    }

    operationLoop(operation: OperationObject, mustache_dictionary: Mustache_DictionaryI) {
        mustache_dictionary.operation_name = operation.operationId ? operation.operationId : 'anonymous_operation'

        if ('parameters' in operation) {
            for (let parameter of <XParameterObject[]>operation.parameters) {
                this.parametersLoop(parameter, mustache_dictionary)
            }
        }

        if ('requestBody' in operation) {
            if ('application/json' in (<RequestBodyObject>operation.requestBody).content) {
                mustache_dictionary.body = {
                    'application/json': []
                }
                const schema = (<RequestBodyObject>operation.requestBody).content['application/json'].schema as SchemaObject

                for (let property_key in schema.properties) {
                    if (!mustache_dictionary.body['application/json']) mustache_dictionary.body['application/json'] = []
                    mustache_dictionary.body['application/json'].push(new Parameter({
                        name: property_key,
                        required: !!schema.required && schema.required.includes(property_key)
                    }))
                    console.log(property_key)
                }
            }
        }

    }

    parametersLoop(parameter: ParameterObject, mustache_dictionary: Mustache_DictionaryI) {
        switch (parameter.in) {
            case 'header':
                if (!mustache_dictionary.header_parameters) mustache_dictionary.header_parameters = []
                mustache_dictionary.header_parameters.push(new Parameter({
                    name: parameter.name,
                    required: !!parameter.required
                }))
                break;
            case 'path':
                if (!mustache_dictionary.path_parameters) mustache_dictionary.path_parameters = []
                mustache_dictionary.path_parameters.push(new Parameter({
                    name: parameter.name,
                    required: !!parameter.required
                }))
                break;
            case 'query':
                if (!mustache_dictionary.query_parameters) mustache_dictionary.query_parameters = []
                mustache_dictionary.query_parameters.push(new Parameter({
                    name: parameter.name,
                    required: !!parameter.required
                }))
                break
            case 'cookie':
                if (!mustache_dictionary.cookie_parameters) mustache_dictionary.cookie_parameters = []
                mustache_dictionary.cookie_parameters.push(new Parameter({
                    name: parameter.name,
                    required: !!parameter.required
                }))
            default:
                break;
        }
    }

    build() {
        for (const path_key in this.XOas_object.paths) {
            const path = this.XOas_object.paths[path_key]
            const mustache_dictionary: Mustache_DictionaryI = {
                path: path_key,
                operation_name: 'Blank',
                operation_type: 'get',
            }
            if ('parameters' in path) {
                const parameters = path.parameters as ParameterObject[]
                // Iterate through parameters
                for (let parameter of parameters) {
                    this.parametersLoop(parameter, mustache_dictionary)
                }

            }
            let key: keyof PathItemObject
            for (key in path) {
                if (operation_type.includes(key)) {
                    const nested_dictionary: Mustache_DictionaryI = JSON.parse(JSON.stringify(mustache_dictionary))
                    const operation = path[key] as OperationObject
                    nested_dictionary.operation_type = key
                    this.operationLoop(operation, nested_dictionary)
                    this.operation_dictionary.push(nested_dictionary)
                }

            }
        }
    }

    async digest(lang: typeof languages[number], output_folder: string) {
        fs.ensureDirSync(output_folder)
        let template: OperationTemplate
        let prettyFunction: prettifier = (code: string) => Promise.resolve(code)
        switch (lang) {
            case 'python':
                template = PythonOperation
                //! Not yet properly supported
                // prettyFunction = PythonPrettifier
                break;
            case 'R':
                template = ROperation
                break;
            default:
                throw('No template found')
        }
        for (const view of this.operation_dictionary) {
            const output = template.generate(view)
            // TODO add sanitizing step
            const prettified = await prettyFunction(output)
            fs.writeFileSync(path.resolve(output_folder, view.operation_name + build_extension(lang)), prettified, { encoding: "utf-8" })
        }
    }

}