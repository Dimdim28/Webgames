'use strict';

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
    this.reload = false;
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
    if (this.name === 'enemy2' || this.name === 'enemy3') {
      this.x -= this.width;
    } 
     if (this.name === 'enemy3' || this.name === 'enemy4') {
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
  
  difference(size, side){
    return Math.abs(this[side] + this[size] / 2 - player[side] - player[size] / 2);
  }
  
  border(usableSize, speed, size, sign, side){
    const DIFFERENCE = this.difference(size, side);
    if(sign * this[side] > usableSize){
if(DIFFERENCE  < this[size]/4){
  if(side ==='y'){
    turnToCollision(this,
      'right',
      'left',
      this.x + this.width < player.x,
      this.x > player.x + player.width
    );
  }else if(side === 'x'){
    turnToCollision(
      this,
      'top',
      'bottom',
      this.y > player.y + player.height,
      this.y + this.height < player.y
    );
  }
}else{
  this[side] -= sign *speed;
  if(side === 'y'){
    this.el.style.top = `${this.y}px`;
  }else{
    this.el.style.left = `${this.x}px`;
  }
}
    }else{
      if(this.side ==='top'){
        turn(this, 'right', this.height, this.width);
      }else if(this.side === 'right'){
        turn(this, 'bottom', this.width, this.height);
      }else if(this.side === 'bottom'){
        turn(this, 'left', this.width, this.height);
      }else if(this.side === 'left'){
        turn(this, 'top', this.width, this.height);
      }
      return 0;
    }
  }

  move() {
    if (this.side === 'top') {
      this.border(0, this.speed, 'height', 1, 'y');
    } else if (this.side === 'right') {
      const widthUsable = -(gamezone.getBoundingClientRect().width - this.width);
      this.border(widthUsable, this.speed, 'width', -1, 'x');
    } else if (this.side === 'bottom') {
      const heightUsable = -(gamezone.getBoundingClientRect().height - this.height);
      this.border(heightUsable, this.speed, 'height', -1, 'y');
    } else if (this.side === 'left') {
      this.border(0, this.speed, 'width', 1, 'x');
    }
  }
  shoot() {
    if (!this.reload) {
      this.reload = true;
      setTimeout(() => {
        oneBullet(this);
        this.reload = false;
      }, this.bullettime + Math.floor(Math.random() * 5000));
    }
  }
}
