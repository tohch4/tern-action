import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import {writeFileSync} from 'fs';

export const tern = async () => {
  const image = core.getInput('image', { required: true });
  
  const prepareCommands: string[] = [
    `git clone https://github.com/tern-tools/tern.git`,
    `docker build . --file tern/Dockerfile --tag ternd`,
  ];
  
  const ternCommands: string[] = [
    `./tern/docker_run.sh workdir ternd "report -f json -i ${image}"`,
  ];

  core.info(`
    Using Configuration:

    image             : ${image}
  `);

  core.startGroup('prepare tern environment');
  for (let index in prepareCommands) {
    const errorCode = await exec(prepareCommands[index]);
    if (errorCode === 1 ) {
      core.setFailed('Tern scan failed.');
      throw new Error('Tern scan failed');
    }
  }
  core.endGroup();

  core.startGroup('Running tern scan');
  core.debug(
    `Running tern with the following commands: ${ternCommands.join(', ')}`,
  );

  let myOutput = '';
  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      },
    }
  };

  for (let index in ternCommands) {
    const errorCode = await exec(ternCommands[index], [], options);
    if (errorCode === 1 ) {
      core.setFailed('Tern scan failed.');
      throw new Error('Tern scan failed');
    }
  }
  core.endGroup();

  const workingDirectory = getWorkingDirectory()
  fs.writeFileSync("tern.log", myOuput, (err) => {
    if (err) {
      core.setFailed('Write tern.log failed');
      throw new Error('Write ten.log failed');
    }
    core.debug(
      `Ouput written to tern.log`
    );
  })

  core.startGroup('collection output');
  core.setOutput('output', myOutput);
  core.setOutput('file', "tern.log");

  core.endGroup();
};
