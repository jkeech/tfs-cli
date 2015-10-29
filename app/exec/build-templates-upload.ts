import cmdm = require('../lib/tfcommand');
import cm = require('../lib/common');
import buildifm = require('vso-node-api/interfaces/BuildInterfaces');
import buildm = require('vso-node-api/BuildApi');
import argm = require('../lib/arguments');
import fs = require('fs');
import Q = require('q');
var trace = require('../lib/trace');

export function describe(): string {
    return 'upload a build template to a team project';
}

export function getCommand(): cmdm.TfCommand {
    // this just offers description for help and to offer sub commands
    return new TemplateUpload;
}

// requires auth, connect etc...
export var isServerOperation: boolean = true;

// unless you have a good reason, should not hide
export var hideBanner: boolean = false;

export class TemplateUpload extends cmdm.TfCommand {
    requiredArguments = [argm.PROJECT_NAME, argm.TEMPLATE_PATH];

    public exec(args: string[], options: cm.IOptions): Q.Promise<boolean> {
        trace('build-templates-upload.exec');
        var buildapi: buildm.IQBuildApi = this.getWebApi().getQBuildApi();
        var defer = Q.defer<boolean>();
        this.checkArguments(args, options).then( (allArguments) => {
            var templatePath = allArguments[argm.TEMPLATE_PATH.name];
            var project = allArguments[argm.PROJECT_NAME.name];
            trace('templatePath: ' + templatePath);
            trace('project: ' + project);

            if (fs.existsSync(templatePath)) {
                var contents = fs.readFileSync(templatePath, 'utf-8');
                var template = <buildifm.BuildDefinitionTemplate>JSON.parse(contents);

                trace('uploading template ' + template.id);
                buildapi.saveTemplate(template, project, template.id)
                .then((savedTemplate) => {
                    defer.resolve(savedTemplate != null);
                })
                .fail((reason) => {
                    defer.reject(reason);
                });
            }
            else {
                var error = 'specified template file ' + templatePath + ' does not exist.';
                trace(error);
                defer.reject(error);
            }
        }).fail(function (err) {
            trace('Failed to gather inputs. Message: ' + err.message);
            defer.reject(err);
        });

        return defer.promise;
    }

    public output(result: boolean): void {
        if (result) {
            console.log("Build template created/updated successfully");
        }
        else {
            console.log("Error creating/updating build template");
        }
    }
}
