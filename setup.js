const { create } = require('domain');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load the environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    console.error('Please provide the SUPABASE_URL and SERVICE_KEY in the .env file');
    process.exit(1);
}
// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)


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
     console.log("Validating repo name...." + repoName);
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
            console.log('Repo added successfully!');
        
    
        }
   }
   
    catch(err){
         console.error('Error validating repo name:', err.message);
         process.exit(1);
}
}

const createFiles = () => {
    // create .github if it doesn't exist
    const githubDir = path.join(__dirname, '.github');
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
    const blsmJSContent = fs.readFileSync(path.join(__dirname, 'blsm.js'), 'utf-8');
    fs.writeFileSync(blsmJS, blsmJSContent);

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

const testSupabase = async () => {}

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
 });