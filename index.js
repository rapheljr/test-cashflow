const puppeteer = require('puppeteer');
const users = require('./users.json');

const visitPage = (url) => {
  return new Promise((res, rej) => {
    puppeteer.launch({ headless: false }).then(browser => {
      browser.newPage().then(page => {
        page.goto(url).then(() => {
          res(page);
        });
      });
    }).catch(reason => rej(reason));
  });
};

const login = (username, password) => (page) => {
  return new Promise((res, rej) => {
    page.type('#username-input', username).then(() => {
      page.type('#password-input', password).then(() => {
        page.click('#login-button').then(() => {
          page.waitForSelector('#host-btn');
          res(page);
        });
      });
    });
  });
};

const hostGame = (page) => new Promise((res, rej) => {
  const hostButton = '#host-btn';
  const gameId = '.game-id';
  page.waitForSelector(hostButton).then(() =>
    page.click(hostButton).then(() => {
      page.waitForSelector(gameId).then(() =>
        page.$eval(gameId, e => e.innerText).then(gameLink => {
          console.log(gameLink);
          res('' + 1);
        }))
    })).catch(err => rej(err));
});

const joinGame = (gameId) => page => new Promise((res, rej) => {
  const joinButton = '#join-btn';
  const gameIdInput = 'input[name="gameID"]';
  page.waitForSelector(joinButton).then(() =>
    page.click(joinButton).then(() => {
      page.waitForSelector(gameIdInput).then(() => {
        page.type(gameIdInput, gameId).then(() =>
          page.click('input[value="Enter"]'))
          .then(() => {
            res(page)
          })
      }
      );
    })
  ).catch(err => rej(err));
});

const playGame = (hostPage) => {
  const playButton = '#start-btn';
  hostPage.waitForSelector(playButton).then(() =>
    hostPage.click(playButton, { delay: 3000 }));
};

const loginUser = ({ username, password }) =>
  visitPage('http://localhost:8000').then(login(username, password));

const startGame = ([aPage, bPage, cPage]) => {
  hostGame(aPage).then(gameId => {
    Promise.all([bPage, cPage].map(joinGame(gameId))).then(() =>
      playGame(aPage));
  });
};

const main = () =>
  Promise.all([users.a, users.b, users.c].map(loginUser))
    .then(startGame);

main();
