/*
 * Copyright 2021 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Command } from 'commander';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import { render } from 'mustache';
import execa from 'execa';

import { copySync, readdirSync, readFile, readFileSync, writeFile } from 'fs-extra';

export class Commands {
  program: Command;
  version: string;

  constructor() {
    this.version = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8').toString()).version;
    this.program = new Command();
    this.program.version(this.version);
    this.create();
  }

  public run(): Promise<Command> {
    return this.program.parseAsync();
  }

  private create() {
    this.program
      .command('create <projectName>')
      .description('Create a Typescript project')
      .option('-t, --template <templateNme>', 'Specify template')
      .action(async (projectName, options) => {
        let template = options.template;
        if (!template) {
          template = (
            await prompt([
              {
                type: 'list',
                name: 'templateNme',
                message: 'Select the template',
                choices: this.getTemplateChoices()
              }
            ])
          ).templateNme;
        }
        const projectDescription = (
          await prompt([
            {
              type: 'input',
              name: 'projectDescription',
              message: 'Enter the project description'
            }
          ])
        ).projectDescription;
        const templateFolder = readdirSync(resolve(__dirname, '../templates', template));
        templateFolder
          .filter((item) => item !== '.tsboot.json')
          .forEach((item) => {
            copySync(resolve(__dirname, '../templates', template, item), resolve(process.cwd(), projectName, item));
          });
        const files = this.getAllFilesRecursive(resolve(process.cwd(), projectName));
        await Promise.all(
          files.map(async (file) => {
            const fileData = (await readFile(file)).toString();
            const rendered = render(fileData, { projectName, projectDescription });
            await writeFile(file, rendered);
          })
        );
        const targetDirectory = resolve(process.cwd(), projectName);
        const dependencies = this.getDependencies(template);
        console.log('Installing dependencies...');
        let execOutput = execa.sync('npm', ['i', ...dependencies.dependencies], { cwd: targetDirectory });
        console.log(execOutput.stdout);
        execOutput = execa.sync('npm', ['i', '-D', ...dependencies.devDependencies], { cwd: targetDirectory });
        console.log(execOutput.stdout);
      });
    return this;
  }

  private getAllFilesRecursive(path: string): string[] {
    const files = readdirSync(path, { withFileTypes: true });
    const allFiles = [];
    for (const file of files) {
      if (file.isDirectory()) {
        allFiles.push(...this.getAllFilesRecursive(resolve(path, file.name)));
      } else {
        allFiles.push(resolve(path, file.name));
      }
    }
    return allFiles;
  }

  private getTemplateChoices() {
    return readdirSync(resolve(__dirname, '../templates'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const config = JSON.parse(
          readFileSync(resolve(__dirname, '../templates', dirent.name, '.tsboot.json'), 'utf8').toString()
        );
        return {
          name: config.templateName,
          value: dirent.name
        };
      });
  }

  private getDependencies(template: string) {
    const config = JSON.parse(
      readFileSync(resolve(__dirname, '../templates', template, '.tsboot.json'), 'utf8').toString()
    );
    return {
      dependencies: config.dependencies,
      devDependencies: config.devDependencies
    };
  }
}
