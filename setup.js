#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a single supabase client for interacting with your database
const supabase = createClient('https://oudbhmhztluirtqlntjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGJobWh6dGx1aXJ0cWxudGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2NTE2NDIsImV4cCI6MjAyNjIyNzY0Mn0.DzAHC_utS_L4k6DN-nS787V5u_kypik9JriR81FQWCw')


// npx blsm <github-username> <repo-name>
const validateUsername = async (username) => {
    console.log('Validating username.... ' + username);
    try {
        const { data, error } = await supabase
            .from("Users")
            .select('username')
            .eq('username', username)
            .limit(1);
    

        // If username doesn't exist, insert it into the database
        if (data.length === 0) {
            console.log('User not found in the database, adding user....');
            const { data: insertedData, error: insertError } = await supabase
                .from('Users')
                .insert([{ username: username }]);
            
            if (insertError) {
                console.error('Error adding user to the database:', insertError.message);
                process.exit(1);
            }
            console.log('User added successfully!');
        }
    } catch (err) {
        console.error('Error validating username:', err.message);
        process.exit(1);
    }
}

const validateRepoName = async (repoName, username) => {
   try{
     console.log("Validating repo name....  " + repoName);
     const {data, error} = await supabase
        .from("Repos")
        .select('repo_name')
        .eq('repo_name', repoName)
        .eq('owner', username)
        .limit(1);

        if(data.length === 0){
            console.log('Repo not found in the database, adding repo....');
            const {data: insertedData, error: insertError} = await supabase
                .from('Repos')
                .insert([{repo_name: repoName, owner: username}]);
            
            if(insertError){
                console.error('Error adding repo to the database:', insertError.message);
                process.exit(1);
            }

            if(insertedData){
                
            }
            console.log('Repo added successfully!');
        
    
        }
   }
   
    catch(err){
         console.error('Error validating repo name:', err.message);
         process.exit(1);
}
}

const createFiles = async () => {
    const currentDir = process.cwd();
    // create .github if it doesn't exist
    const githubDir = path.join(currentDir, '.github');
    if (!fs.existsSync(githubDir)) {
        console.log("Creating .github directory....")
        fs.mkdirSync(githubDir);
    }

    // create workflows if it doesn't exist
    const workflowsDir = path.join(githubDir, 'workflows');
    if (!fs.existsSync(workflowsDir)) {
        console.log("Creating workflows directory....")
        fs.mkdirSync(workflowsDir);
    }

    // create scripts if it doesn't exist
    const scriptsDir = path.join(githubDir, 'scripts');
    
    if (!fs.existsSync(scriptsDir)) {
    console.log("Creating scripts directory....")
        fs.mkdirSync(scriptsDir);
    }

    // create the blsm.js file
    const blsmJS = path.join(scriptsDir, 'blsm.js');
    if (fs.existsSync(blsmJS)) {
        console.log('blsm.js already exists, please delete it and try again.');
        process.exit(1);
    }

    // get the repo id

    const {data : repoData, error: repoError} = await supabase
        .from('Repos')
        .select('id')
        .eq('repo_name', process.argv[3])
        .eq('owner', process.argv[2])
        .limit(1);

    if(repoError){
        console.error('Error getting repo id:', error.message);
        process.exit(1);
    }

    if(repoData.length === 0){
        console.error('Repo not found in the database');
        process.exit(1);
    }

    const blsmContent = `const axios = require('axios');

    const EVENT_NAME = process.env.EVENT_NAME || '';
    const REPO = process.env.REPO || '';
    const REPO_OWNER = process.env.USERNAME || '';
    
    // Commit related variables
    const COMMIT_MSG = process.env.COMMIT_MSG || '';
    const COMMIT_TIMESTAMP = process.env.COMMIT_TIMESTAMP || '';
    const COMMIT_ID = process.env.COMMIT_ID || '';
    const COMMIT_URL = process.env.COMMIT_URL || '';
    
    // Pull request related variables
    const PULL_REQUEST_NUMBER = process.env.PULL_REQUEST_NUMBER || '';
    const PULL_REQUEST_STATE = process.env.PULL_REQUEST_STATE || '';
    const PULL_REQUEST_TITLE = process.env.PULL_REQUEST_TITLE || '';
    const PULL_REQUEST_BODY = process.env.PULL_REQUEST_BODY || '';
    
    // Issue related variables
    const ISSUE_ACTION = process.env.ISSUE_ACTION || '';
    const ISSUE_BODY = process.env.ISSUE_BODY || '';
    const ISSUE_TITLE = process.env.ISSUE_TITLE || '';
    const ISSUE_NUMBER = process.env.ISSUE_NUMBER || '';
    const ISSUE_STATE = process.env.ISSUE_STATE || '';
    
    
    const dataFromAction = {
      type: EVENT_NAME,
      timestamp: COMMIT_TIMESTAMP,
      repoID: ${repoData[0].id}, // DO NOT CHANGE THIS, IF YOU DO, THE MICROSERVICE WILL NOT WORK AND YOU WILL NEED TO START OVER
      username: REPO_OWNER,
      repo: REPO,
      commitDetails: {
        message: COMMIT_MSG,
        timestamp: COMMIT_TIMESTAMP,
        commitID: COMMIT_ID,
        commitURL: COMMIT_URL,
      },
      pullRequestDetails: {
        number: PULL_REQUEST_NUMBER,
        state: PULL_REQUEST_STATE,
        title: PULL_REQUEST_TITLE,
        body: PULL_REQUEST_BODY,
      },
      issueDetails: {
        action: ISSUE_ACTION,
        body: ISSUE_BODY,
        title: ISSUE_TITLE,
        number: ISSUE_NUMBER,
        state: ISSUE_STATE,
      },
    
    }
    
    async function sendToBackend(data) {
      if (!data) {
        console.error('No data to send');
        return;
      }
      const JSONdata = JSON.stringify(data);
      console.log("full data")
      console.log(dataFromAction)
      console.log("json data", JSONdata)
    
      axios.post('https://blossom-ai-rose.vercel.app/api/blsm', JSONdata)
        .then(response => {
          console.log('Getting response from microservice...');
          console.log('Response from microservice:', response.status, response.statusText);
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    }
    
    
    sendToBackend(dataFromAction);
    `
    fs.writeFileSync(blsmJS, blsmContent);

    // create the workflow file
    const workflowFile = path.join(workflowsDir, 'blsm.yaml');
    if (fs.existsSync(workflowFile)) {
        console.log('blsm.yaml already exists, please delete it and try again.');
        process.exit(1);
    }
    const workflowContent = fs.readFileSync(path.join(__dirname, 'blsm.yaml'), 'utf-8');
    fs.writeFileSync(workflowFile, workflowContent);


    // if everything is there, print the success message
    console.log('Files created successfully!');
    console.log('\n----------------------------------------');
    console.log('Please make sure to update the blsm.yaml file');
    console.log('with the correct branch you want to track.');
    console.log('----------------------------------------\n');
}




 const main = async() => {
    if (process.argv.length < 4) {
        console.log('Please provide the correct arguments');
        process.exit(1);
    }


    // check if username is valid and in the database
    const username = process.argv[2];
    await validateUsername(username);

    // check if the repo name is and in the database
    const repoName = process.argv[3];
    await validateRepoName(repoName, username);


    // if everything is correct, create the files
    createFiles();
  }



 main().catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
 })