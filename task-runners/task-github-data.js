const fs = require('fs');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const token = process.env.GITHUB_TOKEN;

const doFetch = true;
const brandJSON = process.env.DS_URL;
const styles = require('../dist/styles.json');
const urls = require('../dist/urls.json');

const outputDir = 'dist';
const outputFilename = `${outputDir}/github.json`;

const chunkArray = (arr, chunkSize) => {
  var index = 0;
  var arrayLength = arr.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    myChunk = arr.slice(index, index + chunkSize);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}


const startTimer = (time) => {
  var i = time;
  var countdownTimer = setInterval(function () {
    console.log(`fetching again in ${i} seconds`);
    i = i - 1;
    if (i <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
}

// function fetchGithubData(dataSet) {
//   let wait = dataSet.index === 0 ? 0 : 10000;
//   return new Promise(resolve => {
//     startTimer(wait / 1000);
//     setTimeout(() => {
//       dataSet.urls.forEach(url => {
//         //test
//       });
//       resolve('finished');
//     }, wait);
//   });

// }

// async function githubFn(dataSet) {
//   let data = await fetchGithubData(dataSet);
//   return data;

// }

function fetchGithubData(url) {
  // return url;
  let occurrenceArr = [];
  return fetch(url, {
      method: 'GET',
      withCredentials: true,
      headers: {
        Authorization: 'token ' + token,
        'user-agent': 'node.js',
      },
    })
    .then(resp => resp.json())
    .then(json => {
      console.log(json);
      if (!json.incomplete_results && typeof json.items === 'object') {
        json.items.forEach(occurrence => {
          let occObj = {
            file: occurrence.name,
            link: occurrence.html_url,
          };
          occurrenceArr.push(occObj);
        });
      }
      let gitHubData = {
        results: occurrenceArr,
        count: occurrenceArr.length,
      };
      return gitHubData;
    })
    .catch(e => {
      console.log(e);
      return e;
    });
}

async function githubFn(url) {
  let data = await fetchGithubData(url);
  console.log(`fetched ${url}`);
  return data;
}

const buildStyleData = async () => {
  // Wipe github-data file
  fs.writeFileSync(outputFilename, JSON.stringify([]));
  // Split into 6 chunks
  let chunks = chunkArray(urls, 6);
  let interval = 60000;
  // let interval = 1000;
  for (let index = 0; index < chunks.length; index++) {
    let currentSet = chunks[index];
    (async (index) => {
      await setTimeout(async function() {
        let foundItems = [];
        for (const url in currentSet) {
          let gitHubData1 = await githubFn(currentSet[url].main);
          let gitHubData2 = await githubFn(currentSet[url].donations);
          let dataObj = {
            name: currentSet[url].name,
            main: {
              results: gitHubData1.results,
              count: gitHubData1.count
            },
            donations: {
              results: gitHubData2.results,
              count: gitHubData2.count
            }
          }
          // let dataObj = {
          //   name: currentSet[url].name,
          //   donations: {
          //     results: currentSet[url].donations
          //   },
          //   main: {
          //     results: currentSet[url].main
          //   }
          // }
          foundItems.push(dataObj);
        }
        try {
          const readFile = fs.readFileSync(outputFilename);
          let fileData = JSON.parse(readFile.toString());
          foundItems = fileData.concat(foundItems);
          fs.writeFileSync(outputFilename, JSON.stringify(foundItems, null, 2));

        } catch (err) {
          fs.writeFileSync(outputFilename, JSON.stringify(foundItems, null, 2));
        }
        if (index + 1 !== chunks.length) {
          startTimer(interval / 1000);
        }
      }, interval * index);
    })(index);
  }
};

buildStyleData();