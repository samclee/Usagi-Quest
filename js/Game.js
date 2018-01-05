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
  // generate room
  this.generateRoom(new Phaser.Point(3, 3));
  // create UI
  this.game.add.sprite(500, 0, 'bar');
  this.UI = {};
  this.UI.floor = this.game.add.text(530, 30, 'Floor: XX', {fontSize: '32px'});
  this.UI.hp = this.game.add.text(530, 100, 'HP: XX', {fontSize: '32px'});

  // test

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
} // Game.update()

UsagiNamespace.Game.prototype.render = function()
{
  this.game.debug.text(this.player.pos.x + ', ' + this.player.pos.y, 550, 100);
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
  gridCoords = this.findOpen();
  this.enemies.e1.setPos(gridCoords.x, gridCoords.y);
  this.room[gridCoords.y][gridCoords.x] = 'e1';
  this.enemies.e1.setDir();
  this.enemies.e1.hp = 8;
  this.visible = true;
  gridCoords = this.findOpen();
  this.enemies.e2.setPos(gridCoords.x, gridCoords.y);
  this.room[gridCoords.y][gridCoords.x] = 'e2';
  this.enemies.e2.setDir();
  this.enemies.e2.hp = 8;
  this.visible = true;

  this.player.room = this.room;
  this.enemies.e1.room = this.room;
  this.enemies.e2.room = this.room;
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
  this.room = [];
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
  var destChar = this.room[destPos.y][destPos.x];
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
    this.gamestate.generateRoom(this.pos);
  }

  this.gamestate.enemies.e1.act();
  this.gamestate.enemies.e2.act();
} // Player.act()

UsagiNamespace.Game.Player.prototype.move = function(destPos)
{
  // edit the room grid
  this.room[this.pos.y][this.pos.x] = 'o';
  this.pos = destPos;
  this.room[this.pos.y][this.pos.x] = 'p';

  // move the sprite position
  var destPosWorld = {x : (destPos.x - 1)*100, y : (destPos.y - 1)*100};
  this.game.add.tween(this).to(destPosWorld, 100, Phaser.Easing.Exponential.Out, true);
} // Player.move()



// ----- Enemy Object -----
UsagiNamespace.Game.Enemy = function(game, gamestate, frame, id)
{
  Phaser.Sprite.call(this, game, 0, 0, 'objects');
  this.hp = 8;
  this.gamestate = gamestate;
  this.room = [];
  this.frame = frame;
  this.id = id;
  this.pos = new Phaser.Point(0, 0);
  this.nextDir = new Phaser.Point(0, 0);
  this.setDir();

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
  var destChar = this.room[destPos.y][destPos.x];

  if(destChar === 'o')
  {
    this.move(destPos);
  }
  else
  {
    this.nextDir.x *= -1;
    this.nextDir.y *= -1;
  }
} // Enemy.act

UsagiNamespace.Game.Enemy.prototype.move = function(destPos)
{
  // edit the room grid
  this.room[this.pos.y][this.pos.x] = 'o';
  this.pos = destPos;
  this.room[this.pos.y][this.pos.x] = this.id;

  // move the sprite position
  var destPosWorld = {x : (destPos.x - 1)*100, y : (destPos.y - 1)*100};
  this.game.add.tween(this).to(destPosWorld, 100, Phaser.Easing.Exponential.Out, true);
} // Player.move()

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