import { Command } from "commander";
import inquirer from "inquirer";

const {version} = require("../package.json")

export class Commands {
    program: Command

    constructor() {
        this.program = new Command()
        this.program.version(version)
        this.create().build().watch().test().lint()
    }

    public run() {
        return this.program.parseAsync()
    }

    private create() {
        this.program
            .command('create <project>')
            .description('Create a Typescript project')
            .option('-t, --template <templateNme>', 'Specify template')
            .action(async (project, options) => {
                let template = options.template
                if (!template) {
                    template = (await inquirer.prompt([{
                        type: "list",
                        name: "templateNme",
                        message: "Select the template",
                        choices: [{
                            name: "Basic",
                            value: "basic"
                        }, {
                            name: "Library",
                            value: "library"
                        }]
                    }])).templateNme
                }
                console.log(`${project}:${template}`)
            })
        return this
    }

    private build() {
        this.program
            .command('build')
            .description('Build a Typescript file/project')
            .action(() => {
                console.log("build")
            })
        return this
    }

    private watch() {
        this.program
            .command('watch')
            .description('Build a Typescript file/project')
            .action(() => {
                console.log("watch")
            })
        return this
    }

    private test() {
        this.program
            .command('test')
            .description('Build a Typescript file/project')
            .action(() => {
                console.log("test")
            })
        return this
    }

    private lint() {
        this.program
            .command('lint')
            .description('Build a Typescript file/project')
            .action(() => {
                console.log("lint")
            })
        return this
    }
}
