import * as core from '@actions/core'
import * as github from '@actions/github'
import path from 'path'
import main from './index'

try {
    // `who-to-greet` input defined in action metadata file
    const openAPI_description_path = core.getInput('openAPI_description_path');
    console.log(`Resolved openAPI description file path ${path.resolve(openAPI_description_path)}!`);
    const destination_path = core.getInput('destination_path');
    console.log(`Resolved openAPI description file path ${path.resolve(destination_path)}!`);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    main.init(openAPI_description_path, destination_path, 'python')
        .then(
            
        )
        .catch((reason) => {
            core.setFailed(reason)
        })

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }