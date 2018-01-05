var UsagiNamespace = UsagiNamespace || {};

UsagiNamespace.Game = function(){};

UsagiNamespace.Game.prototype = Object.create(Phaser.State.prototype);
UsagiNamespace.Game.prototype.constructor = UsagiNamespace.Game;

UsagiNamespace.Game.prototype.create = function()
{
  // game bg
  this.game.add.sprite(0, 0, 'background');
  // Controls
  this.cursors = this.game.input.keyboard.createCursorKeys();
  // create and init Game variables
  this.floorNum = 0;
  this.room = [];
  this.directions = { left: new Phaser.Point(-1, 0),
                      right: new Phaser.Point(1, 0),
                      up: new Phaser.Point(0, -1),
                      down: new Phaser.Point(0, 1) };
  // create Objects
  this.player = new UsagiNamespace.Game.Player(this.game, 15, this);
  
  this.stairs = this.game.add.sprite(0, 0, 'objects');
  this.stairs.frame = 5;

  this.enemies = {
    e1: new UsagiNamespace.Game.Enemy(this.game, this, 1, 'e1'),
    e2: new UsagiNamespace.Game.Enemy(this.game, this, 2, 'e2')
  };

  this.trees = {
    t1: new UsagiNamespace.Game.Tree(this.game, this, 't1'),
    t2: new UsagiNamespace.Game.Tree(this.game, this, 't2'),
    t3: new UsagiNamespace.Game.Tree(this.game, this, 't3')
  }

  this.item = new UsagiNamespace.Game.Item(this.game, this, 'i');

  // generate room
  this.generateRoom(new Phaser.Point(3, 3));
  // create UI
  this.game.add.sprite(500, 0, 'bar');
  this.UI = {};
  this.UI.floor = this.game.add.text(520, 30, 'Floor: XX', {fontSize: '32px'});
  this.UI.hp = this.game.add.text(520, 100, 'HP: XX', {fontSize: '32px'});

  // test
  this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACE);
} // Game.create()

UsagiNamespace.Game.prototype.update = function()
{
  // UI
  this.UI.hp.text = 'HP: ' + this.player.hp + '/15';
  this.UI.floor.text = 'Floor: ' + this.floorNum;

  // input
  if(this.cursors.left.justPressed())
  { this.player.act(this.directions.left); }
  if(this.cursors.right.justPressed())
  { this.player.act(this.directions.right); }
  if(this.cursors.up.justPressed())
  { this.player.act(this.directions.up); }
  if(this.cursors.down.justPressed())
  { this.player.act(this.directions.down); }

  // test
  if(this.spaceKey.justPressed())
  {
    console.log("hi");
  }
} // Game.update()

UsagiNamespace.Game.prototype.render = function()
{
  for(var i = 1; i < 6; i++)
  {
    for(var j = 1; j < 6; j++)
    {
      this.game.debug.text(this.room[j][i], (i-1)*100 + 50, (j-1)*100 + 50);
    }
  }
} // Game.render()



// ----- Room creation functions -----
UsagiNamespace.Game.prototype.generateRoom = function(playerCoords)
{
  this.floorNum++;
  this.room = [ ['x','x','x','x','x','x','x'],
                ['x','o','o','o','o','o','x'],
                ['x','o','o','o','o','o','x'],
                ['x','o','o','o','o','o','x'],
                ['x','o','o','o','o','o','x'],
                ['x','o','o','o','o','o','x'],
                ['x','x','x','x','x','x','x'] ];
  // place player
  this.room[playerCoords.y][playerCoords.x] = 'p';

  // place stairs
  var gridCoords = this.findOpen();
  this.room[gridCoords.y][gridCoords.x] = 's';
  this.stairs.x = (gridCoords.x - 1)*100;
  this.stairs.y = (gridCoords.y - 1)*100;

  // place enemies, set hp, set new directions
  for(var e in this.enemies)
  {
    gridCoords = this.findOpen();
    this.enemies[e].setPos(gridCoords.x, gridCoords.y);
    this.room[gridCoords.y][gridCoords.x] = e;
    this.enemies[e].reset();
  }

  // place trees, make visible
  for(var t in this.trees)
  {
    gridCoords = this.findOpen();
    this.trees[t].setPos(gridCoords.x, gridCoords.y);
    this.room[gridCoords.y][gridCoords.x] = t;
    this.trees[t].visible = true;
  }

  // place item
  gridCoords = this.findOpen();
  this.item.setPos(gridCoords.x, gridCoords.y);
  this.room[gridCoords.y][gridCoords.x] = 'i';
  this.item.visible = true;

} // Game.generateRoom

UsagiNamespace.Game.prototype.findOpen = function()
{
  var rx = this.game.rnd.integerInRange(2,6);
  var ry = this.game.rnd.integerInRange(2,6);

  do{
    rx = this.game.rnd.integerInRange(2,6);
    ry = this.game.rnd.integerInRange(2,6);
  }
  while(this.room[ry][rx] !== 'o');

  return {x: rx, y: ry};
} // Game.findOpen



// ----- Player Object -----
UsagiNamespace.Game.Player = function(game, hp, gamestate)
{
  Phaser.Sprite.call(this, game, 200, 200, 'objects');
  this.hp = hp;
  this.gamestate = gamestate;
  this.pos = new Phaser.Point(3, 3)
  this.frame = 0;
  this.lastDir = new Phaser.Point(0, 1);

  this.hurtBox = this.addChild(game.make.sprite(this.lastDir.x*100,
                                                this.lastDir.y*100,'sword'));
  this.hurtBox.alpha = 0.5;

  this.game.add.existing(this);
} // Player constructor

UsagiNamespace.Game.Player.prototype = Object.create(Phaser.Sprite.prototype);
UsagiNamespace.Game.Player.prototype.constructor = UsagiNamespace.Game.Player;

UsagiNamespace.Game.Player.prototype.act = function(dir)
{
  var destPos = Phaser.Point.add(this.pos, dir);
  var destChar = this.gamestate.room[destPos.y][destPos.x];
  this.lastDir = dir;
  // move the hurt box
  this.hurtBox.x = this.lastDir.x*100;
  this.hurtBox.y = this.lastDir.y*100;

  if(destChar === 'o')
  {
    this.move(destPos);
  } // move to open space
  else if(destChar === 's')
  {
    this.move(destPos);
    if(this.gamestate.floorNum < 10)
    {
      this.gamestate.generateRoom(this.pos);
    }
    else
    {
      this.game.state.start('GameOverState', true, false, this.hp);
    }
    
  } // walk down stairs
  else if(destChar[0] === 'e')
  {
    this.gamestate.enemies[destChar].rcvDmg(this.game.rnd.integerInRange(2, 5));
  } // attack enemy
  else if(destChar[0] === 't')
  {
    this.gamestate.trees[destChar].die();
  } // chop tree
  else if(destChar === 'i')
  {
    this.gamestate.item.die();
    this.hp += 5;
    if(this.hp > 15)
    {
      this.hp = 15;
    }
  } // eat item

  for(var e in this.gamestate.enemies)
  {
    this.gamestate.enemies[e].act();
  }
} // Player.act()

UsagiNamespace.Game.Player.prototype.move = function(destPos)
{
  // edit the room grid
  this.gamestate.room[this.pos.y][this.pos.x] = 'o';
  this.pos = destPos;
  this.gamestate.room[this.pos.y][this.pos.x] = 'p';

  // move the sprite position
  var destPosWorld = {x : (destPos.x - 1)*100, y : (destPos.y - 1)*100};
  this.game.add.tween(this).to(destPosWorld, 100, Phaser.Easing.Exponential.Out, true);
} // Player.move()

UsagiNamespace.Game.Player.prototype.rcvDmg = function(amt)
{
  this.hp -= amt;
  if(this.hp <= 0)
  {
    this.game.state.start('GameOverState', true, false, this.hp);
  }
} // Player.recDmg()



// ----- Enemy Object -----
UsagiNamespace.Game.Enemy = function(game, gamestate, frame, id)
{
  Phaser.Sprite.call(this, game, 0, 0, 'objects');
  this.hp = 8;
  this.gamestate = gamestate;
  this.frame = frame;
  this.id = id;
  this.pos = new Phaser.Point(0, 0);
  this.nextDir = new Phaser.Point(0, 0);
  this.setDir();

  // hp bar
  this.hp_bg = this.addChild(game.make.sprite(10, -10,'hp_bar'));
  this.hp_bg.frame = 0;
  this.cur_hp = this.addChild(game.make.sprite(10, -10,'hp_bar'));
  this.cur_hp.frame = 1;

  this.game.add.existing(this);
} // enemy constructor

UsagiNamespace.Game.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
UsagiNamespace.Game.Enemy.prototype.constructor = UsagiNamespace.Game.Enemy;

UsagiNamespace.Game.Enemy.prototype.setPos = function(nx, ny)
{
  this.pos.x = nx;
  this.pos.y = ny;
  this.x = (this.pos.x - 1) * 100;
  this.y = (this.pos.y - 1) * 100;
} // Enemy.setPos

UsagiNamespace.Game.Enemy.prototype.setDir = function()
{
  var nx = this.game.rnd.integerInRange(-1,1);
  var ny = this.game.rnd.integerInRange(-1,1);

  do{
    nx = this.game.rnd.integerInRange(-1,1);
    ny = this.game.rnd.integerInRange(-1,1);
  }
  while((nx + ny) === 0);

  this.nextDir.x = nx;
  this.nextDir.y = ny;
} // Enemy.setDir

UsagiNamespace.Game.Enemy.prototype.act = function()
{
  var destPos = Phaser.Point.add(this.pos, this.nextDir);
  var destChar = this.gamestate.room[destPos.y][destPos.x];

  if(destChar === 'o')
  {
    this.move(destPos);
  }
  else if(destChar === 'p')
  {
    this.gamestate.player.rcvDmg(this.game.rnd.integerInRange(1, 4));
  }
  else
  {
    this.nextDir.x *= -1;
    this.nextDir.y *= -1;
  }
} // Enemy.act

UsagiNamespace.Game.Enemy.prototype.move = function(destPos)
{
  if(this.hp <= 0) { return; }

  // edit the room grid
  this.gamestate.room[this.pos.y][this.pos.x] = 'o';
  this.pos = destPos;
  this.gamestate.room[this.pos.y][this.pos.x] = this.id;

  // move the sprite position
  var destPosWorld = {x : (destPos.x - 1)*100, y : (destPos.y - 1)*100};
  this.game.add.tween(this).to(destPosWorld, 100, Phaser.Easing.Exponential.Out, true);
} // Enemy.move()

UsagiNamespace.Game.Enemy.prototype.rcvDmg = function(amt)
{
  this.hp -= amt;
  if(this.hp <= 0)
  {
    this.hp = 0;
    this.gamestate.room[this.pos.y][this.pos.x] = 'o';
    this.visible = false;
  } // dead
  this.cur_hp.scale.x = (this.hp / 8);
} // Enemy.rcvDmg

UsagiNamespace.Game.Enemy.prototype.reset = function()
{
  this.setDir();
  this.hp = 8;
  this.cur_hp.scale.x = 1;
  this.visible = true;
}



// ----- Tree object -----
UsagiNamespace.Game.Tree = function(game, gamestate, id)
{
  Phaser.Sprite.call(this, game, 0, 0, 'tree');
  this.gamestate = gamestate;
  this.id = id;
  this.pos = new Phaser.Point(0, 0);

  this.game.add.existing(this);
} // Tree constructor

UsagiNamespace.Game.Tree.prototype = Object.create(Phaser.Sprite.prototype);
UsagiNamespace.Game.Tree.prototype.constructor = UsagiNamespace.Game.Tree;

UsagiNamespace.Game.Tree.prototype.setPos = function(nx, ny)
{
  this.pos.x = nx;
  this.pos.y = ny;
  this.x = (this.pos.x - 1) * 100;
  this.y = (this.pos.y - 1) * 100;
} // Tree.setPos()

UsagiNamespace.Game.Tree.prototype.die = function()
{
  this.gamestate.room[this.pos.y][this.pos.x] = 'o';
  this.visible = false;
} // Tree.die()

// ----- Item object -----
UsagiNamespace.Game.Item = function(game, gamestate, id)
{
  Phaser.Sprite.call(this, game, 0, 0, 'objects');
  this.frame = 3;
  this.gamestate = gamestate;
  this.id = id;
  this.pos = new Phaser.Point(0, 0);

  this.game.add.existing(this);
} // Item constructor

UsagiNamespace.Game.Item.prototype = Object.create(Phaser.Sprite.prototype);
UsagiNamespace.Game.Item.prototype.constructor = UsagiNamespace.Game.Item;

UsagiNamespace.Game.Item.prototype.setPos = function(nx, ny)
{
  this.pos.x = nx;
  this.pos.y = ny;
  this.x = (this.pos.x - 1) * 100;
  this.y = (this.pos.y - 1) * 100;
} // Item.setPos()

UsagiNamespace.Game.Item.prototype.die = function()
{
  this.gamestate.room[this.pos.y][this.pos.x] = 'o';
  this.visible = false;
} // Item.die()


// ----- Utility -----
function print2D(room)
{
  console.log('----------------');
  for(var i = 0; i < room.length; i++)
  {
    console.log(room[i]);
  }
}

function oneOrNegOne()
{
  if(Math.random() > 0.5)
  {
    return -1;
  }
  return 1;
}