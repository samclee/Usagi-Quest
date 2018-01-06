var UsagiNamespace = UsagiNamespace || {};

UsagiNamespace.Preload = function(){};

UsagiNamespace.Preload.prototype = Object.create(Phaser.State.prototype);
UsagiNamespace.Preload.prototype.constructor = UsagiNamespace.Preload;

UsagiNamespace.Preload.prototype.preload = function()
{
  this.game.load.image('background', './assets/grass.png');
  this.game.load.image('sword', './assets/sword.png');
  this.game.load.image('bar', './assets/UI_bg.png');
  this.game.load.image('tree', './assets/tree.png');

  this.game.load.spritesheet('hp_bar',  './assets/hp_bar.png',  80,   20);
  this.game.load.spritesheet('objects', './assets/objects.png', 100, 100);
  this.game.load.spritesheet('end_usagi', './assets/end_animation.png', 128, 128);

  this.game.scale.pageAlignHorizontally = true;
} // Preload.preload()

UsagiNamespace.Preload.prototype.create = function()
{
  this.game.state.start("GameState");
} // Preload.create()