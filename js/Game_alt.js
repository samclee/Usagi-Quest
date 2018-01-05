var UsagiNamespace = UsagiNamespace || {};

UsagiNamespace.Game = function(){};

UsagiNamespace.Game.prototype = Object.create(Phaser.State.prototype);
UsagiNamespace.Game.prototype.constructor = UsagiNamespace.Game;

UsagiNamespace.Game.prototype = 
{
  create : function()
  {
    // game bg
    this.game.add.sprite(0, 0, 'background');
    // Controls
    this.cursors = this.game.input.keyboard.createCursorKeys();
    // create and init Game variables
    this.floorNum = 99;
    this.room = [];
    this.directions = { left: new Phaser.Point(-1, 0),
                        right: new Phaser.Point(1, 0),
                        up: new Phaser.Point(0, -1),
                        down: new Phaser.Point(0, 1) };
    // generate room
    this.room = this.generateRoom(new Phaser.Point(3, 3));
    // create Objects
    this.player = new UsagiNamespace.Game.Player(this.game, 3, 3, 25, this.room);
    this.stairs = this.game.add.sprite(0, 0, 'objects');
    this.stairs.frame = 5;
    // create UI
    this.game.add.sprite(500, 0, 'bar');
    this.UI = {};
    this.UI.floor = this.game.add.text(530, 30, 'Floor: XX', {fontSize: '32px'});
    this.UI.hp = this.game.add.text(530, 100, 'HP: XX', {fontSize: '32px'});

    // test
    this.foo = "adfadsfasdfasfsadfsda";
    console.log('\'this\' of create', this);
    console.log(this.player);
  },

  update : function()
  {
    // UI
    this.UI.hp.text = 'HP: ' + this.player.hp;

    // input
    if(this.cursors.left.justPressed())
    {
      this.player.act(this.directions.left);
    } // left pressed
    if(this.cursors.right.justPressed())
    {
      this.player.act(this.directions.right);
    } // left pressed
    if(this.cursors.up.justPressed())
    {
      this.player.act(this.directions.up);
    } // left pressed
    if(this.cursors.down.justPressed())
    {
      this.player.act(this.directions.down);
    } // left pressed
  },

  generateRoom : function(playerPos)
  {
    var template = [ ['x','x','x','x','x','x','x'],
                    ['x','o','o','o','o','o','x'],
                    ['x','o','o','o','o','o','x'],
                    ['x','o','o','o','o','o','x'],
                    ['x','o','o','o','o','o','x'],
                    ['x','o','o','o','o','o','x'],
                    ['x','x','x','x','x','x','x'] ];
    // place player
    template[playerPos.y][playerPos.x] = 'p';

    //place stairs
    //var openSpot = this.findOpen();
    //this.stairs.x = (openSpot.x - 1) * 100;
    //this.stairs.y = (openSpot.y - 1) * 100;

    console.log('\'this\' of generateRoom()',this);
    console.log(this.player);
    return template;
  }
};



// ----- Player Object -----
UsagiNamespace.Game.Player = function(game, x, y, hp, room)
{
  Phaser.Sprite.call(this, game, (x-1)*100, (y-1)*100, 'objects');
  this.hp = hp;
  this.room = room;
  this.pos = new Phaser.Point(x, y)
  this.frame = 0;
  this.room[y][x] = 'p';
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
  var destChar = this.room[destPos.x][destPos.y];
  this.lastDir = dir;

  if(destChar === 'x')
  {
    // move the hurt box
    this.hurtBox.x = this.lastDir.x*100;
    this.hurtBox.y = this.lastDir.y*100;
  } // turn to edge
  else if(destChar === 'o')
  {
    this.move(destPos);
  } // move to open space
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

  // move the hurt box
  this.hurtBox.x = this.lastDir.x*100;
  this.hurtBox.y = this.lastDir.y*100;
} // Player.move()

function print2D(room)
{
  console.log('----------------');
  for(var i = 0; i < room.length; i++)
  {
    console.log(room[i]);
  }
}