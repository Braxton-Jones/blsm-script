const axios = require('axios');

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
      repoID: 9, // DO NOT CHANGE THIS, IF YOU DO, THE MICROSERVICE WILL NOT WORK AND YOU WILL NEED TO START OVER
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
    