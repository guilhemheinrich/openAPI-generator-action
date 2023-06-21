import { XOasObject, OperationObject, XParameterObject, ParameterObject, PathItemObject, RequestBodyObject, SchemaObject } from '@ts-stack/openapi-spec';
import mustache from 'mustache'
import path from 'path'
import * as fs from 'fs-extra'
import lastify from './mustache_lastify'

const operation_type = ['put', 'post', 'delete', 'get', 'patch']
type OperationType = typeof operation_type[number]

interface ParameterI {
    name: string
    required: boolean
}

interface Mustache_DictionaryI {
    operation_name: string
    operation_type: OperationType
    isPost?: boolean
    path: string
    headers?: { [key: string]: string }
    query_parameters?: ParameterI[]
    path_parameters?: ParameterI[]
    cookie_parameters?: ParameterI[]
    header_parameters?: ParameterI[]
    body?: {[content_type: string] : ParameterI[]}
}

interface Mustache_LogicI {
    hasBody?: boolean
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
                    mustache_dictionary.body['application/json'].push({
                        name: property_key,
                        required: !!schema.required && schema.required.includes(property_key)
                    })
                    console.log(property_key)
                }
            }
        }

    }

    parametersLoop(parameter: ParameterObject, mustache_dictionary: Mustache_DictionaryI) {
        switch (parameter.in) {
            case 'header':
                if (!mustache_dictionary.header_parameters) mustache_dictionary.header_parameters = []
                mustache_dictionary.header_parameters.push({
                    name: parameter.name,
                    required: !!parameter.required
                })
                break;
            case 'path':
                if (!mustache_dictionary.path_parameters) mustache_dictionary.path_parameters = []
                mustache_dictionary.path_parameters.push({
                    name: parameter.name,
                    required: !!parameter.required
                })
                break;
            case 'query':
                if (!mustache_dictionary.query_parameters) mustache_dictionary.query_parameters = []
                mustache_dictionary.query_parameters.push({
                    name: parameter.name,
                    required: !!parameter.required
                })
                break
            case 'cookie':
                if (!mustache_dictionary.cookie_parameters) mustache_dictionary.cookie_parameters = []
                mustache_dictionary.cookie_parameters.push({
                    name: parameter.name,
                    required: !!parameter.required
                })
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
                    console.log(nested_dictionary)
                }

            }
        }
    }

    digest(mustache_template: string, output_folder: string, extension: string) {
        fs.ensureDirSync(output_folder)
        for (const view of this.operation_dictionary) {
            // Complete logic needed
            const added_logic:Mustache_DictionaryI & Mustache_LogicI = JSON.parse(JSON.stringify(view))
            added_logic.hasBody = ['put', 'post', 'patch'].includes(view.operation_type)
            const output = mustache.render(mustache_template, lastify(added_logic))
            fs.writeFileSync(path.resolve(output_folder, view.operation_name + extension), output, { encoding: "utf-8" })
        }
    }

    // Required for beeing able to use the syntax:
    // from my_client
    // my_client.api_action(...)
    add_python_init(mustache_template: string,output_folder: string) {
        fs.ensureDirSync(output_folder)
        const output = mustache.render(mustache_template, this.operation_dictionary)
        fs.writeFileSync(path.resolve(output_folder, '__init__.py'), output, { encoding: "utf-8" })
    }
}