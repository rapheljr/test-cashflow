const puppeteer = require('puppeteer');
const users = require('./users.json');

const time = 500;

const delay = { delay: time };
const size = {
  width: 1790,
  height: 970,
};

const visitPage = (url) => {
  return new Promise((res, rej) => {
    puppeteer.launch({ headless: false }).then(browser => {
      browser.newPage().then(page => {
        page.goto(url).then(() => {
          page.setViewport(size);
          res(page);
        });
      });
    }).catch(reason => rej(reason));
  });
};

const login = (username, password) => (page) => {
  return new Promise((res, rej) => {
    page.type('#username-input', username)
      .then(() => page.type('#password-input', password))
      .then(() => page.click('#login-button', delay))
      .then(() => page.waitForSelector('#host-btn'));
    res(page);
  });
};

const register = (username, password) => (page) => {
  return new Promise((res, rej) => {
    page.type('#username-input', username)
      .then(() => page.type('#password-input', password))
      .then(() => page.click('#register-button', delay))
      .then(() => page.waitForSelector('#host-btn'));
    res(page);
  });
};

const hostGame = (page) => new Promise((res, rej) => {
  const hostButton = '#host-btn';
  const gameId = '#game-id';
  page.waitForSelector(hostButton)
    .then(() => page.click(hostButton, delay))
    .then(() => page.waitForSelector(gameId))
    .then(() => page.$eval(gameId, element => element.innerText))
    .then(text => res(text.split(': ')[1]))
    .catch(err => rej(err));
});

const joinGame = (gameId) => page => new Promise((res, rej) => {
  const joinButton = '#join-btn';
  const inputField = '#input-game-id';
  const enterButton = '#enter-game';
  page.waitForSelector(joinButton)
    .then(() => page.click(joinButton, delay))
    .then(() => page.waitForSelector(inputField))
    .then(() => page.type(inputField, gameId))
    .then(() => page.click(enterButton, delay))
    .then(() => res(page))
    .catch(err => rej(err))
});

const playGame = (hostPage) => {
  const playButton = '#start-btn';
  hostPage.waitForSelector(playButton)
    .then(() => hostPage.click(playButton, delay))
};

const loginUser = ({ username, password }) =>
  // visitPage('https://cashflow-holmes-dev.herokuapp.com/register').then(register(username, password));
  // visitPage('https://cashflow-holmes-dev.herokuapp.com/login').then(login(username, password));
  visitPage('http://localhost:8000/login').then(login(username, password));
// visitPage('http://localhost:8000/register').then(register(username, password));

const startGame = ([host, ...guests]) => {
  const all = [host, ...guests];
  hostGame(host)
    .then(gameId => Promise.all(guests.map(joinGame(gameId)))
      .then(() => playGame(host))
      .then(() => Promise.all(all.map(close)))
    );
};

const close = page => {
  const link = 'a[href="/game-board"]';
  page.waitForSelector(link)
    .then(() => page.click(link, delay))
};

const main = (numberOfPlayers = 2) => {
  const players = Object.values(users).slice(0, numberOfPlayers);
  Promise.all(players.map(loginUser))
    .then(startGame)
}

const numberOfPlayers = process.argv[2];
main(numberOfPlayers);
