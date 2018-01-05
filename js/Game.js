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
  this.player = new UsagiNamespace.Game.Player(this.game, 25, this);
  this.stairs = this.game.add.sprite(0, 0, 'objects');
  this.stairs.frame = 5;
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
  this.UI.hp.text = 'HP: ' + this.player.hp;
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
  for(var i = 0; i < 7; i++)
  {
    for(var j = 0; j < 7; j++)
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

  this.player.room = this.room;
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

  game.add.existing(this);
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
    console.log('hit stairs');
    this.move(destPos);
    this.gamestate.generateRoom(this.pos);
  }
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

function print2D(room)
{
  console.log('----------------');
  for(var i = 0; i < room.length; i++)
  {
    console.log(room[i]);
  }
}