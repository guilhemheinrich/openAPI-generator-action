import { Mustache_DictionaryI, Parameter, ParameterI } from "../../OperationParser";
import { OperationTemplate } from "../OperationTemplate";


const PYTHON_OPERATION_TEMPLATE = new OperationTemplate(generate)
//! ChatGPT prompted
const PYTHON_PARSED_PARAMETERS_FUNCTION = (name: string) => {
    // Définir une liste de caractères autorisés dans un nom de variable Python
    const validCharacters = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    const preSanitized_string = name.replace(/\[\]/g, '_array');
    // Parcourir chaque caractère de la chaîne d'entrée
    const sanitizedString = preSanitized_string
        .split('')
        .map((char) => {
            // Vérifier si le caractère est valide
            if (validCharacters.test(char)) {
                return char;
            } else {
                return '_';
            }
        })
        .join('');

    // Vérifier si la chaîne résultante commence par un chiffre (ce qui n'est pas autorisé en Python)
    if (/^\d/.test(sanitizedString)) {
        return '_' + sanitizedString;
    }

    return sanitizedString;
}

const prefixed = (name: string, prefix: string) => {
    return prefix + '_' + name;
}

function _generate_parameters_arguments(parameters: Parameter[] | undefined, prefix: string, comment?: string) {
    if (parameters && parameters.length > 0) {
        return `# ${comment}
       , 
        ${parameters.map((parameter) => prefixed(parameter.parsedName(PYTHON_PARSED_PARAMETERS_FUNCTION), prefix)).join(', ')}
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
    ${_generate_parameters_arguments(data.path_parameters, 'path', 'Path parameters')}
    ${_generate_parameters_arguments(data.query_parameters, 'query', 'Query parameters')}
    ${data.body && data.body['application/json'] ? _generate_parameters_arguments(data.body['application/json'], 'body', 'Body parameters') : ''}
    ${['put', 'post', 'patch'].includes(data.operation_type) ? `,
    # Optional body content
    optional_json_content = {}` : ''},
    # Headers
    headers = None
):
    ${data.path_parameters ? `final_path = "${data.path}".format(
        ${data.path_parameters.map((parameter) => `${parameter.name} = ${prefixed(parameter.parsedName(PYTHON_PARSED_PARAMETERS_FUNCTION), 'path')}`).join(', ')}
    )` : 'final_path = "${data.path}"'}
    
    ${['put', 'post', 'patch'].includes(data.operation_type) ? `${data.body && data.body['application/json'] ? `# Body parameters (required)
    required_body_content = {
        ${data.body['application/json'].map((parameter) => `"${parameter.name}": ${prefixed(parameter.parsedName(PYTHON_PARSED_PARAMETERS_FUNCTION), 'body')}}`).join(', ')}
    }` : ''}
    json_content = {
        **optional_json_content${data.body && data.body['application/json'].length > 0 ? `,
        **required_body_content` : ''}           
    }` : ''}
    
    response = requests.${data.operation_type}(
        url = host + final_path,
        headers = headers${data.query_parameters && data.query_parameters.length > 0 ? `,
        params = {
            ${data.query_parameters.map((parameter) => `"${parameter.name}": ${prefixed(parameter.parsedName(PYTHON_PARSED_PARAMETERS_FUNCTION), 'query')}`).join(',\n')}
        }` : ''}${['put', 'post', 'patch'].includes(data.operation_type) ? `,
        json = json_content` : ''}           
    )

    return response

    `
    return template
}

export default PYTHON_OPERATION_TEMPLATE