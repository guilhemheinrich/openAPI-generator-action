import { Mustache_DictionaryI, ParameterI } from "../../OperationParser";
import { OperationTemplate } from "../OperationTemplate";


const PYTHON_OPERATION_TEMPLATE = new OperationTemplate(generate)

function _generate_parameters_arguments(parameters: ParameterI[] | undefined, comment?: string) {
   if (parameters && parameters.length > 0) {
       return `    # ${comment}
       , ${parameters.map((parameter) => parameter.name).join(', ')}
       `
   } else {
       return ''
   }
}
function generate(data: Mustache_DictionaryI) {
    const template = `
    import requests

    def ${data.operation_name}(
        host
        ${_generate_parameters_arguments(data.path_parameters, 'Path parameters')}
        ${_generate_parameters_arguments(data.query_parameters, 'Query parameters')}
        ${data.body && data.body['application/json'] ? _generate_parameters_arguments(data.body['application/json'], 'Body parameters') : ''}
        ${['put', 'post', 'patch'].includes(data.operation_type) ? `,
        # Optional body content
        optional_json_content = {}` : ''}
        , headers = None
    ):
        ${data.path_parameters ? `final_path = "{{& path}}".format(
            ${data.path_parameters.map((parameter) => `"${parameter.name}" = ${parameter.name}`).join(', ')}
        )` : 'final_path = "{{& path}}"'}
        
        ${['put', 'post', 'patch'].includes(data.operation_type) ? `${data.body && data.body['application/json'] ? `# Body parameters (required)
        required_body_content = {
            ${data.body['application/json'].map((parameter) => `"${parameter.name}": ${parameter.name}`).join(', ')}
        }` : '' }
        json_content = {
            **optional_json_content
            ${ data.body && data.body['application/json'].length > 0 ? `,
            **required_body_content` : ''}
        }` : ''}
        
        response = requests.${data.operation_type}(
            url = host + final_path,
            headers = headers${data.query_parameters && data.query_parameters.length > 0 ? `,
            params = {
                ${data.query_parameters.map((parameter) => `"${parameter.name}": ${parameter.name}`).join(',\n')}
            }` : ''}
            ${['put', 'post', 'patch'].includes(data.operation_type) ? `,
            json = json_content` : ''}
        )

        return response

    `        
    return template
}

export default PYTHON_OPERATION_TEMPLATE