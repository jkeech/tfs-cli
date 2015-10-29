import cmdm = require('../lib/tfcommand');
import cm = require('../lib/common');
import buildifm = require('vso-node-api/interfaces/BuildInterfaces');
import buildm = require('vso-node-api/BuildApi');
import argm = require('../lib/arguments');
import Q = require('q');
var trace = require('../lib/trace');

export function describe(): string {
    return 'get a list of build templates for a project';
}

export function getCommand(): cmdm.TfCommand {
    // this just offers description for help and to offer sub commands
    return new TemplatesList;
}

// requires auth, connect etc...
export var isServerOperation: boolean = true;

// unless you have a good reason, should not hide
export var hideBanner: boolean = false;

export class TemplatesList extends cmdm.TfCommand {
    requiredArguments = [argm.PROJECT_NAME];
    optionalArguments = [argm.TEMPLATE_ID];

    public exec(args: string[], options: cm.IOptions): Q.Promise<buildifm.BuildDefinitionTemplate[]> {
        trace('build-templates-list.exec');
        var buildapi: buildm.IQBuildApi = this.getWebApi().getQBuildApi();
        
        return this.checkArguments(args, options).then( (allArguments) => {
            if (allArguments[argm.TEMPLATE_ID.name]) {
                return buildapi.getTemplate(allArguments[argm.PROJECT_NAME.name], allArguments[argm.TEMPLATE_ID.name])
                .then((template) => {
                    return [template];
                });
            }
            return buildapi.getTemplates(allArguments[argm.PROJECT_NAME.name]);
        });
    }

    public output(data: buildifm.BuildDefinitionTemplate[]): void {
        if (!data) {
            throw new Error('no templates supplied');
        }

        if (data.length == 1) {
            // This should only happen if the specific template id was passed in. In this case,
            // we only want to print the contents of the template JSON out.
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            for (var i = 0; i < data.length; i++) {
                if (i > 0) {
                    console.log();
                }
                console.log('name:        ' + data[i].name);
                console.log('id:          ' + data[i].id);
                console.log('description: ' + data[i].description);
                console.log('category:    ' + data[i].category);
            }
        }
    }
}
