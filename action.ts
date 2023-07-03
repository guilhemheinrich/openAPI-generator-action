import * as core from '@actions/core'
import * as github from '@actions/github'
import {languages} from './src/OperationParser'
import path from 'path'
import main from './index'

try {
    // `who-to-greet` input defined in action metadata file
    const openAPI_description_path = core.getInput('openAPI_description_path');
    console.log(`Resolved openAPI description file path ${path.resolve(openAPI_description_path)}!`);
    const destination_path = core.getInput('destination_path');
    console.log(`Resolved openAPI description file path ${path.resolve(destination_path)}!`);
    const targeted_language = core.getInput('targeted_language');
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    if (!Object.keys(languages).includes(targeted_language)) core.setFailed(`${targeted_language} is not in the set of available languages.
    Valid values are:
        [${languages.join(', ')}]`)
    main.init(openAPI_description_path, destination_path, targeted_language as typeof languages[number])
        .then(
            
        )
        .catch((reason) => {
            core.setFailed(reason)
        })

        
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }