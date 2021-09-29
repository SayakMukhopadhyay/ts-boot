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
        this.program.parse()
    }

    private create() {
        this.program
            .command('create <project>')
            .description('Create a Typescript project')
            .action(async project => {
                const answer = await inquirer.prompt([{
                    type: "input",
                    name: "template_type",
                    message: "Select the template"
                }])
                console.log(`${project}:${answer}`)
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
