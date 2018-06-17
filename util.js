const path = require('path');
const fs = require('fs');
const emoji = require('node-emoji');
const prompt = require('inquirer').prompt;
const { exec } = require('shelljs');
require('colors');

const REACT = 'React';
const NODE = 'Node';

const repos = {
    [REACT]: 'https://github.com/skellertor/react-starter.git',
}

const questions = [
    {
        type: 'list',
        name: 'projectType',
        message: "Choose a project type: ",
        choices: [REACT],
        default: 0
    },
    {
        type: 'input',
        name: 'projectName',
        message: 'Enter a project name: ',
        validate: (input) => {
            if (input.split(' ').length > 1) return Promise.reject('Project name must be one word. Try camelCase or under_scores');
            if (input.length === 0) return Promise.reject('Project name is required');
            return Promise.resolve(true);
        }
    },
    {
        type: 'input',
        name: 'projectDescription',
        message: 'Enter a project description: ',
        default: ''
    },
    {
        type: 'input',
        name: 'projectVersion',
        message: 'Enter a project version (semver): ',
        default: '1.0.0'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Authors name: ',
        default: 'Payclip'
    }
];

module.exports.prompt = function () {
    return prompt(questions)
        .then(createProjectDirectory)
        .then(cloneRepo)
        .then(createPackage)
        .then(removeGitLink)
        .then(installDependencies)
        .catch(err => console.error(err));
};

function createProjectDirectory(answers) {
    console.log(`${emoji.get('hourglass')} Creating project directory ...\n`.yellow);
    const { projectName } = answers;
    return new Promise((resolve, reject) => {
        const projectDirectory = `${path.join(process.cwd(), projectName)}`;
        const extendedAnswers = Object.assign({}, answers, { projectDirectory} );
        exec(`mkdir ${projectDirectory}`, (statusCode, stdout, stderr) => {
            if (statusCode > 0) return reject(stderr);
            console.log(`${emoji.get('white_check_mark')} Successfully created ${projectDirectory}\n`.underline.green);
            return resolve(extendedAnswers);
        });
    });
}

function cloneRepo(answers) {
    return new Promise((resolve, reject) => {
        const { projectDirectory, projectType } = answers;
        console.log(`${emoji.get('hourglass')} Cloning ${projectType} boilerplate ...\n`.yellow);
        const repo = repos[projectType];
        exec(`git clone ${repo} ${projectDirectory}`, (statusCode, stdout, stderr) => {
            if (statusCode > 0) return reject(stderr);
            console.log(`${emoji.get('white_check_mark')} Successfully cloned ${repo}\n`.underline.green);
            return resolve(answers);
        });
    });
}

function createPackage(answers) {
    return new Promise((resolve, reject) => {
        console.log(`${emoji.get('hourglass')} Creating project specific package.json ...\n`.yellow);
        const { projectDirectory, projectName, projectDescription, projectVersion, author } = answers;
        fs.readFile(`${path.join(projectDirectory, 'package.json')}`, 'utf8', (err, data) => {
            if (err) return reject(err);
            const config = JSON.parse(data);
            config.author = author;
            config.name = projectName;
            config.description = projectDescription;
            config.version = projectVersion;
            const configString = JSON.stringify(config, null, 2);
            fs.writeFile(`${path.join(projectDirectory, 'package.json')}`, configString, 'utf8', err => {
                if (err) return reject(err);
                console.log(`${emoji.get('white_check_mark')} Successfully created package.json\n`.underline.green);
                return resolve(answers);
            });
        });
    });
}

function removeGitLink(answers) {
    return new Promise((resolve, reject) => {
        console.log(`${emoji.get('hourglass')} Removing link to git repo ...\n`.yellow);
        const { projectDirectory } = answers;
        exec(`rm -rf ${path.join(projectDirectory, '.git')}`, (statusCode, stdout, stderr) => {
            if (statusCode > 0) return reject(stderr);
            console.log(`${emoji.get('white_check_mark')} Successfully unlinked from old git repo\n`.underline.green);
            return resolve(answers);
        });
    });
}

function installDependencies(answers) {
    return new Promise((resolve, reject) => {
        console.log(`${emoji.get('hourglass')} Installing dependencies ...\n`.yellow);
        const { projectDirectory } = answers;
        exec(`cd ${projectDirectory} && npm install`, (statusCode, stdout, stderr) => {
            if (statusCode > 0) return reject(stderr);
            console.log(`${emoji.get('white_check_mark')} Successfully installed dependencies\n`.underline.green);
            return resolve(answers);
        });
    });
}
