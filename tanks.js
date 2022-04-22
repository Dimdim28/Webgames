'use strict';

const gamezone = document.querySelector('.gamezone');
const hangar = document.querySelector('.hangar');
const hp = document.querySelector('.hpnumber');
const points = document.querySelector('.pointsnumber');
const leftpanel = document.querySelector('.leftPanel');

const GAMEZONEWIDTH = gamezone.getBoundingClientRect().width;
const GAMEZONEHEIGHT = gamezone.getBoundingClientRect().height;

let k = 0;
const fps = 1000 / 60;

const ints = {
  run: false,
  bullet: false,
};

let player = {
  el: null,
  x: GAMEZONEWIDTH / 2,
  y: GAMEZONEHEIGHT / 2,
  run: false,
  side: '',
  fire: true,
  points: 0,
};

class BigTank {
  constructor(collection = new Map()) {
    const KEYS = collection.keys();
    const SIDE_ARRAY = ['top', 'left', 'bottom', 'right'];
    for (const key of KEYS) {
      this[key] = collection.get(key);
    }
    for (const key of SIDE_ARRAY) {
      this[key] = `url(sprites/${collection.get('image')}-${key}.png)`;
    }
  }
  active() {
    if (k === 0) {
      player = Object.assign(player, this);
      game();
      console.log(player);
    }
  }
  die() {
    this.el.parentNode.removeChild(this.el);
  }
}

class SmallTank extends BigTank {
  constructor(collection = new Map()) {
    super(collection);
    this.width = collection.get('size');
    this.height = collection.get('size');
  }
}

class Enemy extends SmallTank {
  constructor(collection = new Map()) {
    super(collection);
    this.name = collection.get('name');
    this.points = collection.get('points');
    this.x = collection.get('x');
    this.y = collection.get('y');
    this.side = collection.get('side');
  }

  find() {
    this.el = document.querySelector(`.${this.name}`);
  }

  back() {
    this.el.style.backgroundImage = this[this.side];
  }

  spawn() {
    const div = document.createElement('div');
    div.className = `${this.name}`;
    div.style.display = 'block';
    if (this.name === 'enemy2') {
      this.x -= this.width;
    } else if (this.name === 'enemy3') {
      this.x -= this.width;
      this.y -= this.height;
    } else if (this.name === 'enemy4') {
      this.y -= this.height;
    }
    div.style.left = `${this.x}px`;
    div.style.top = `${this.y}px`;
    div.style.height = `${this.height}px`;
    div.style.width = `${this.width}px`;
    div.classList.add('enemy');
    gamezone.append(div);
    this.find();
    this.back();

  }
  move() {
    if (this.side === 'top') {
      if (this.y > 0) {
        if (Math.abs(this.y + this.height / 2 - player.y - player.height / 2) <
        this.height / 4) {
          if (this.x + this.width < player.x) {
            turn(this, 'right', this.height, this.width);
          } else if (this.x > player.x + player.width) {
            turn(this, 'left', this.height, this.width);
          } else { collision(player, this); }
        } else {
          this.y -= this.speed;
          this.el.style.top = `${this.y}px`;
        }
      } else {
        turn(this, 'right', this.height, this.width);
        return 0;
      }


    } else if (this.side === 'right') {
      if (this.x < gamezone.getBoundingClientRect().width - this.width) {
        if (Math.abs(this.x + this.width / 2 - player.x - player.width / 2) <
        this.height / 4) {
          if (this.y > player.y + player.height) {
            turn(this, 'top', this.width, this.height);
          } else if (this.y + this.height < player.y) {
            turn(this, 'bottom', this.width, this.height);
          } else { collision(player, this); }
        } else {
          this.x += this.speed;
          this.el.style.left = `${this.x}px`;
        }
      } else {
        turn(this, 'bottom', this.width, this.height);
        return 0;
      }

    } else if (this.side === 'bottom') {
      if (this.y < gamezone.getBoundingClientRect().height - this.height) {
        if (Math.abs(this.y + this.height / 2 - player.y - player.height / 2) <
         this.height / 4) {
          if (this.x + this.width < player.x) {
            turn(this, 'right', this.height, this.width);
          } else if (this.x > player.x + player.width) {
            turn(this, 'left', this.height, this.width);
          } else { collision(player, this); }
        } else {
          this.y += this.speed;
          this.el.style.top = `${this.y}px`;
        }
      } else {
        turn(this, 'left', this.height, this.width);
        return 0;
      }


    } else if (this.side === 'left') {
      if (this.x > 0) {
        if (Math.abs(this.x + this.width / 2 - player.x - player.width / 2) <
        this.height / 4) {
          if (this.y > player.y + player.height) {
            turn(this, 'top', this.width, this.height);
          } else if (this.y + this.height < player.y) {
            turn(this, 'bottom', this.width, this.height);
          } else { collision(player, this); }
        } else {
          this.x -= this.speed;
          this.el.style.left = `${this.x}px`;
        }
      } else {
        turn(this, 'top', this.width, this.height);
        return 0;
      }
    }
  }
}

const M4_INFO_ARRAY = [
  ['speed', 10],
  ['hp', 1000],
  ['damage', 400],
  ['image', 'm4'],
  ['size', 77],
  ['bulletspeed', 5],
  ['bullettime', 2000],
  ['bulletsize', 16],
];
const M4_INFO = new Map(M4_INFO_ARRAY);

const KV2_INFO_ARRAY = [
  ['speed', 5],
  ['hp', 1300],
  ['damage', 800],
  ['image', 'kv2'],
  ['size', 150],
  ['bulletspeed', 10],
  ['bullettime', 1600],
  ['bulletsize', 20],
];
const KV2_INFO = new Map(KV2_INFO_ARRAY);

const AMX_INFO_ARRAY = [
  ['speed', 15],
  ['hp', 700],
  ['damage', 300],
  ['image', 'amx'],
  ['size', 77],
  ['bulletspeed', 30],
  ['bullettime', 800],
  ['bulletsize', 12],
];
const AMX_INFO = new Map(AMX_INFO_ARRAY);

const BTR_INFO_ARRAY = [
  ['speed', 20],
  ['hp', 500],
  ['damage', 100],
  ['image', 'btr'],
  ['size', 77],
  ['bulletspeed', 20],
  ['bullettime', 100],
  ['bulletsize', 8],
];
const BTR_INFO = new Map(BTR_INFO_ARRAY);

const WAFEN_INFO_ARRAY = [
  ['speed', 20],
  ['hp', 2000],
  ['damage', 1000],
  ['image', 'wafen'],
  ['height', 100],
  ['width', 75],
  ['bulletspeed', 30],
  ['bullettime', 500],
  ['bulletsize', 15],
];
const WAFEN_INFO = new Map(WAFEN_INFO_ARRAY);

const M4 = new SmallTank(M4_INFO);
const AMX = new SmallTank(AMX_INFO);
const KV2 = new SmallTank(KV2_INFO);
const BTR = new SmallTank(BTR_INFO);
const WAFEN = new BigTank(WAFEN_INFO);

const ENEMY1_INFO_ARRAY = [
  ['speed', 10],
  ['hp', 1000],
  ['damage', 400],
  ['image', 'enemy'],
  ['size', 77],
  ['bulletspeed', 5],
  ['bullettime', 2000],
  ['bulletsize', 16],
  ['points', 100],
  ['name', 'enemy1'],
  ['x', 0],
  ['y', 0],
  ['side', 'right']
];
const ENEMY1_INFO = new Map(ENEMY1_INFO_ARRAY);

const ENEMY2_INFO_ARRAY = [
  ['speed', 10],
  ['hp', 1000],
  ['damage', 400],
  ['image', 'enemy'],
  ['size', 77],
  ['bulletspeed', 5],
  ['bullettime', 2000],
  ['bulletsize', 16],
  ['points', 100],
  ['name', 'enemy2'],
  ['x', hangar.getBoundingClientRect().left -
   leftpanel.getBoundingClientRect().width],
  ['y', 0],
  ['side', 'bottom']
];
const ENEMY2_INFO = new Map(ENEMY2_INFO_ARRAY);

const ENEMY3_INFO_ARRAY = [
  ['speed', 10],
  ['hp', 1000],
  ['damage', 400],
  ['image', 'enemy'],
  ['size', 77],
  ['bulletspeed', 5],
  ['bullettime', 2000],
  ['bulletsize', 16],
  ['points', 100],
  ['name', 'enemy3'],
  ['x', hangar.getBoundingClientRect().left -
  leftpanel.getBoundingClientRect().width],
  ['y', gamezone.getBoundingClientRect().height],
  ['side', 'left']
];
const ENEMY3_INFO = new Map(ENEMY3_INFO_ARRAY);

const ENEMY4_INFO_ARRAY = [
  ['speed', 10],
  ['hp', 1000],
  ['damage', 400],
  ['image', 'enemy'],
  ['size', 77],
  ['bulletspeed', 5],
  ['bullettime', 2000],
  ['bulletsize', 16],
  ['points', 100],
  ['name', 'enemy4'],
  ['x', 0],
  ['y', gamezone.getBoundingClientRect().height],
  ['side', 'top']
];
const ENEMY4_INFO = new Map(ENEMY4_INFO_ARRAY);

const enemy1 = new Enemy(ENEMY1_INFO);
const enemy2 = new Enemy(ENEMY2_INFO);
const enemy3 = new Enemy(ENEMY3_INFO);
const enemy4 = new Enemy(ENEMY4_INFO);

function init() {
  const div = document.createElement('div');
  div.className = 'gamer';
  div.style.display = 'block';
  div.style.left = `${player.x}px`;
  div.style.top = `${player.y}px`;
  div.style.backgroundImage = player.top;
  div.style.height = `${player.height}px`;
  div.style.width = `${player.width}px`;
  gamezone.append(div);
  player.el = document.querySelector('.gamer');
  points.textContent = `${player.points}`;
  hp.textContent = `${player.hp}`;
}

function turn(tank, side, width, height) {
  tank.run = true;
  tank.side = side;
  tank.el.style.backgroundImage = tank[side];
  tank.height = height;
  tank.width = width;
  tank.el.style.height = `${tank.height}px`;
  tank.el.style.width = `${tank.width}px`;
}

function controllers() {
  const WIDTH = player.width;
  const HEIGHT = player.height;
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') {
      turn(player, 'top', WIDTH, HEIGHT);
    } else if (e.code === 'KeyD') {
      turn(player, 'right', HEIGHT, WIDTH);
    } else if (e.code === 'KeyS') {
      turn(player, 'bottom', WIDTH, HEIGHT);
    } else if (e.code === 'KeyA') {
      turn(player, 'left', HEIGHT, WIDTH);
    } else if (e.code === 'ShiftLeft') {
      if (player.side === 'top') {
        addbullet(player.width / 2 -
        player.bulletsize / 2, -player.bulletsize);
      } else if (player.side === 'right') {
        addbullet(player.width,
          player.height / 2 - player.bulletsize / 2);
      } else if (player.side === 'bottom') {
        addbullet(player.width / 2 -
        player.bulletsize / 2, player.height + player.bulletsize / 2);
      } else if (player.side === 'left') {
        addbullet(-player.bulletsize,
          player.height / 2 - player.bulletsize / 2);
      }
    }
  });

  document.addEventListener('keyup', e => {
    const codes = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
    if (codes.includes(e.code)) player.run = false;
  });
}

function SetInt(func) {
  setInterval(() => {
    func();
  }, fps);
}

function collision(player, enemy) {
  const playerHealth = player.hp;
  player.hp -= enemy.hp;
  enemy.hp -= playerHealth;
  ShowPoints();
}


function run() {
  if (player.run) {
    if (player.side === 'top')
      (player.y > 0) ? player.y -= player.speed : player.y;
    else if (player.side === 'right')
      (player.x < gamezone.getBoundingClientRect().width -
    player.width) ? player.x += player.speed : player.x;
    else if (player.side === 'bottom')
      (player.y < gamezone.getBoundingClientRect().height -
    player.height) ? player.y += player.speed : player.y;
    else if (player.side === 'left')
      (player.x > 0) ? player.x -= player.speed : player.x;
    player.el.style.top = `${player.y}px`;
    player.el.style.left = `${player.x}px`;
  }
}

function moveBullLeftTop(direction, bullet) {
  (bullet.getBoundingClientRect()[direction] >
  gamezone.getBoundingClientRect()[direction] + player.bulletsize) ?
    bullet.style[direction] = `${parseInt(bullet.style[direction]
      .replace('px', ''), 10) -
  player.bulletspeed}px` :
    bullet.parentNode.removeChild(bullet);
}

function playerbullets() {
  const bullets = document.querySelectorAll('.bullet');
  bullets.forEach(bullet => {
    const direction = bullet.getAttribute('direction');
    (direction === 'top' || direction === 'left') ?
      moveBullLeftTop(direction, bullet) : null;

    if (direction === 'bottom') {
      if (bullet.getBoundingClientRect().bottom <
      gamezone.getBoundingClientRect().bottom - player.bulletsize) {
        bullet.style.top = `${parseInt(bullet.style.top.replace('px', ''), 10) +
         player.bulletspeed}px`;
      } else { bullet.parentNode.removeChild(bullet); }
    } else if (direction === 'right') {
      if (bullet.getBoundingClientRect().right <=
       gamezone.getBoundingClientRect().right - player.bulletsize) {
        bullet.style.left = `${parseInt(bullet.style.left
          .replace('px', ''), 10) +
        player.bulletspeed}px`;
      } else { bullet.parentNode.removeChild(bullet); }
    }
  });
}

function ShowPoints() {
  points.textContent = `${player.points}`;
  hp.textContent = `${player.hp}`;
}

function intervalls() {
  ints.run = SetInt(run);
  ints.playerbullets = SetInt(playerbullets);
  ints.enemmove = SetInt(moveenemies);
}

function addbullet(x, y) {
  if (player.fire === true) {
    const BULLET_EL = `<div class="bullet" direction = ${player.side}
     style = "left: ${player.x + x}px; top: ${player.y + y}px;
      width:${player.bulletsize}px; height:${
  player.bulletsize
}px"></div>`;
    gamezone.insertAdjacentHTML('beforeend', BULLET_EL);
    player.fire = false;
    setTimeout(() => (player.fire = true), player.bullettime);
  }
}

function game() {
  init();
  spawnenemies();
  controllers();
  intervalls();
  k++;
}

const ENEMIES = [enemy1, enemy2, enemy3, enemy4];

function spawnenemies() {
  for (const enemy of ENEMIES) {
    enemy.spawn();
  }
}

function moveenemies() {
  for (const enemy of ENEMIES) {
    enemy.move();
  }
}

setTimeout(() => {
  enemy1.die();
}, 2000);
