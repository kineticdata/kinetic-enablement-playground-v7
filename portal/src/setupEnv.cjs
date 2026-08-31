const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const clearConsole = require('react-dev-utils/clearConsole');
const isInteractive = process.stdout.isTTY;

const envFile = path.join(process.cwd(), '.env.development.local');
console.log('ENV file is: ', envFile);

if (!fs.existsSync(envFile)) {
  if (isInteractive) {
    clearConsole();
    console.log(
      chalk.yellow(
        'It looks like you have not configured this React app to ' +
          'connect to a Kinetic Platform server yet.',
      ),
    );
    console.log(
      chalk.yellow(
        'Answer the following questions to complete the configuration. ' +
          'The results are stored in /packages/app/.env.development.local ' +
          'for further modification.',
      ),
    );
    console.log('\n');
    const questions = [
      {
        type: 'input',
        name: 'apiHost',
        message:
          'Enter the URL of the Kinetic Platform server the React ' +
          'app will connect to (e.g. https://SPACE_SLUG.kinops.io)',
      },
    ];
    inquirer.prompt(questions).then(answers => {
      if (answers.apiHost) {
        fs.writeFileSync(envFile, `REACT_APP_PROXY_HOST=${answers.apiHost}`);
        console.log(
          chalk
            .bgHex('#F36C24')
            .black(`Connecting to Kinetic Platform server: ${answers.apiHost}`),
        );
      } else {
        console.log(
          chalk.red(
            'You did not provide the URL of a Kinetic Platform server. ' +
              'This value is required to run the React app.',
          ),
        );
        throw new Error('Incomplete configuration');
      }
    });
  } else {
    console.log(
      chalk.red(
        'The .env.development.local file is required to run this React app. ' +
          'Run this command again in an interactive terminal to complete ' +
          'the configuration process.',
      ),
    );
    throw new Error('Unable to complete configuration');
  }
} else {
  const contents = fs
    .readFileSync(envFile, 'utf8')
    .match(/REACT_APP_PROXY_HOST=(.*?)$/m);
  if (contents && contents.length > 1) {
    console.log(
      chalk
        .bgHex('#F36C24')
        .black(`Connecting to Kinetic Platform server: ${contents[1]}`),
    );
  }
}
