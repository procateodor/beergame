const delay = ms => new Promise(res => setTimeout(res, ms));

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

let BEER_POSITION = 0;
let BEER = null;
let GAME_STARTED = false;
let GAME = null;
let VELOCITY = 2.5;
let SPAWN_RATE = 2000;
let SCORE = 0;
let SCORE_ITEM = null;
let RECORD = null;

let WIN = false;

const checkKey = e => {
  e = e || window.event;

  if (e.keyCode == "37") {
    // left arrow
    if (BEER_POSITION > 0) {
      BEER_POSITION--;
      BEER.style.marginLeft = `${BEER_POSITION * (GAME.offsetWidth / 4)}px`;
    }
  } else if (e.keyCode == "39") {
    // right arrow
    if (BEER_POSITION < 3) {
      BEER_POSITION++;
      BEER.style.marginLeft = `${BEER_POSITION * (GAME.offsetWidth / 4)}px`;
    }
  }
};

const goneBlock = () => {
  const items = document.getElementsByClassName("item");
  const random = randomIntFromInterval(0, items.length - 1);
  items[random] ? (items[random].classList = "item-gone") : (WIN = true);
};

const showResult = () => {
  const gones = document.getElementsByClassName("item-gone");
  for (const gone of gones) {
    gone.style.border = "none";
    gone.style.background = "transparent";
  }

  const items = document.getElementsByClassName("item");
  for (const item of items) {
    item.style.border = "none";
    item.style.background = "transparent";
  }

  const beers = document.getElementsByClassName("sticla");
  for (const beer of beers) {
    beer.style.display = "none";
  }

  BEER.style.display = "none";
  SCORE_ITEM.style.display = "none";

  document.getElementById("decision").innerText = WIN ? "WINER" : "LOSER";
  document.getElementById("resultScore").innerText = `Score ${SCORE}`;

  if (SCORE > RECORD) {
    document.getElementById("bestScore").innerText = `New best score ${SCORE}`;
    localStorage.setItem("record", SCORE);
  } else {
    document.getElementById("bestScore").innerText = `Best score ${RECORD}`;
  }

  document.getElementById("result").style.display = "flex";

  document.getElementById("restartGame").onclick = () =>
    window.location.reload();
};

const generateBeer = async () => {
  let currentPosition = 0.0;
  const beerContainer = document.createElement("div");
  beerContainer.className = "sticlaContainer";

  const beer = document.createElement("img");
  beer.className = "sticla";
  beer.src = "/images/beer.png";

  const bearPosition = randomIntFromInterval(0, 3);

  beerContainer.style.marginLeft = `${bearPosition * (GAME.offsetWidth / 4)}px`;
  beerContainer.style.top = `${currentPosition}px`;

  beerContainer.appendChild(beer);
  GAME.appendChild(beerContainer);

  const frame = () => {
    const reach =
      window.innerHeight - beerContainer.offsetTop - GAME.offsetHeight / 8 <=
      GAME.offsetHeight / 8;

    if (reach) {
      if (bearPosition === BEER_POSITION) {
        GAME.removeChild(beerContainer);

        SCORE++;
        SCORE_ITEM.innerText = SCORE;

        if (SCORE > 1) {
          WIN = true;
        }

        if (SCORE % 2 === 0) {
          goneBlock();

          if (VELOCITY + 0.1 < 3.8) {
            VELOCITY += 0.1;
          }

          if (SPAWN_RATE - 100 > 500) {
            SPAWN_RATE -= 100;
          }
        }
      } else {
        GAME_STARTED = false;
        showResult();
      }
    }

    if (!GAME_STARTED) {
      clearInterval(idInterval);
    } else {
      currentPosition += 0.5 * VELOCITY;
      beerContainer.style.top = `${currentPosition}px`;
    }
  };

  const idInterval = setInterval(frame, 5);
};

const startGame = async loadingContainer => {
  loadingContainer.style.display = "none";

  if (window.innerWidth < 768) {
    document.getElementById("arrow-left").style.display = "block";
    document.getElementById("arrow-right").style.display = "block";

    document.getElementById("arrow-left").onclick = () => {
      if (BEER_POSITION > 0) {
        BEER_POSITION--;
        BEER.style.marginLeft = `${BEER_POSITION * (GAME.offsetWidth / 4)}px`;
      }
    };

    document.getElementById("arrow-right").onclick = () => {
      if (BEER_POSITION < 3) {
        BEER_POSITION++;
        BEER.style.marginLeft = `${BEER_POSITION * (GAME.offsetWidth / 4)}px`;
      }
    };
  }

  SCORE_ITEM.innerText = SCORE;
  GAME_STARTED = true;

  RECORD = localStorage.getItem("record")
    ? parseInt(localStorage.getItem("record"))
    : 0;

  document.onkeydown = checkKey;

  while (GAME_STARTED) {
    generateBeer();
    await delay(SPAWN_RATE);
  }
};

window.onload = async () => {
  GAME = document.getElementById("gameContainer");
  SCORE_ITEM = document.getElementById("score");
  const loadingMsg = document.getElementById("loadingMsg");
  const startBtn = document.getElementById("startGame");
  const loadingContainer = document.getElementById("loading");

  await delay(250);
  loadingMsg.innerText = "loading blocks";

  for (let index = 0; index < 32; index++) {
    await delay(60);
    const item = document.createElement("div");
    item.className = "item";

    GAME.appendChild(item);
  }

  loadingMsg.innerText = "loading image";
  await delay(250);
  GAME.style.backgroundImage = `url("assets/${randomIntFromInterval(
    0,
    10
  )}.jpg")`;

  loadingMsg.innerText = "loading beer";
  await delay(300);

  BEER_POSITION = randomIntFromInterval(0, 3);

  BEER = document.createElement("div");
  BEER.id = "beer";
  BEER.style.marginLeft = `${BEER_POSITION * (GAME.offsetWidth / 4)}px`;

  GAME.appendChild(BEER);

  await delay(100);
  loadingMsg.style.display = "none";
  startBtn.style.display = "block";

  startBtn.onclick = async () => {
    await startGame(loadingContainer);
  };
};
