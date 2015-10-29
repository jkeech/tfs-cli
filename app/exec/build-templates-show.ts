import cmdm = require('../lib/tfcommand');
import cm = require('../lib/common');
import buildifm = require('vso-node-api/interfaces/BuildInterfaces');
import buildm = require('vso-node-api/BuildApi');
import argm = require('../lib/arguments');
var trace = require('../lib/trace');

export function describe(): string {
    return 'show the details of a specific template';
}

export function getCommand(): cmdm.TfCommand {
    // this just offers description for help and to offer sub commands
    return new TemplatesShow;
}

// requires auth, connect etc...
export var isServerOperation: boolean = true;

// unless you have a good reason, should not hide
export var hideBanner: boolean = false;

export class TemplatesShow extends cmdm.TfCommand {
    requiredArguments = [argm.PROJECT_NAME, argm.TEMPLATE_ID];

    public exec(args: string[], options: cm.IOptions): Q.Promise<buildifm.BuildDefinitionTemplate> {
        trace('build-templates-show.exec');
        var buildapi: buildm.IQBuildApi = this.getWebApi().getQBuildApi();

        return this.checkArguments(args, options).then( (allArguments) => {
            return buildapi.getTemplate(allArguments[argm.PROJECT_NAME.name], allArguments[argm.TEMPLATE_ID.name]);;
        });
    }

    public output(data: buildifm.BuildDefinitionTemplate): void {
        if (!data) {
            throw new Error('no template supplied');
        }

        console.log('name:        ' + data.name);
        console.log('id:          ' + data.id);
        console.log('description: ' + data.description);
        console.log('category:    ' + data.category);
        console.log();
        console.log(JSON.stringify(data, null, 2));
    }
}
