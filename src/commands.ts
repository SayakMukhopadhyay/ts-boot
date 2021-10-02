import { Command } from 'commander';
import inquirer from 'inquirer';
import { resolve } from 'path';
import { render } from 'mustache';

import { copySync, readdirSync, readFile, readFileSync, writeFile } from 'fs-extra';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json'); // require is used since package.json is not part of the root dire1

export class Commands {
  program: Command;

  constructor() {
    this.program = new Command();
    this.program.version(version);
    this.create().build().watch().test().lint();
  }

  public run(): Promise<Command> {
    return this.program.parseAsync();
  }

  private create() {
    this.program
      .command('create <project>')
      .description('Create a Typescript project')
      .option('-t, --template <templateNme>', 'Specify template')
      .action(async (project, options) => {
        let template = options.template;
        if (!template) {
          template = (
            await inquirer.prompt([
              {
                type: 'list',
                name: 'templateNme',
                message: 'Select the template',
                choices: this.getTemplateChoices()
              }
            ])
          ).templateNme;
        }
        const templateFolder = readdirSync(resolve(__dirname, '../templates', template));
        templateFolder
          .filter((item) => item !== '.tsboot.json')
          .forEach((item) => {
            copySync(resolve(__dirname, '../templates', template, item), resolve(process.cwd(), project, item));
          });
        const files = this.getAllFilesRecursive(resolve(process.cwd(), project));
        await Promise.all(
          files.map(async (file) => {
            const fileData = (await readFile(file)).toString();
            const rendered = render(fileData, { projectName: project });
            await writeFile(file, rendered);
          })
        );
      });
    return this;
  }

  private build() {
    this.program
      .command('build')
      .description('Build a Typescript file/project')
      .action(() => {
        console.log('build');
      });
    return this;
  }

  private watch() {
    this.program
      .command('watch')
      .description('Build a Typescript file/project')
      .action(() => {
        console.log('watch');
      });
    return this;
  }

  private test() {
    this.program
      .command('test')
      .description('Build a Typescript file/project')
      .action(() => {
        console.log('test');
      });
    return this;
  }

  private lint() {
    this.program
      .command('lint')
      .description('Build a Typescript file/project')
      .action(() => {
        console.log('lint');
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
}
