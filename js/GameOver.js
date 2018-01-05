var UsagiNamespace = UsagiNamespace || {};

UsagiNamespace.GameOver = function(){};

UsagiNamespace.GameOver.prototype = Object.create(Phaser.State.prototype);
UsagiNamespace.GameOver.prototype.constructor = UsagiNamespace.GameOver;

UsagiNamespace.GameOver.prototype.init = function(hp)
{
  this.hp = hp;
} // GameOver.preload()

UsagiNamespace.GameOver.prototype.create = function()
{
  this.game.stage.backgroundColor = "#f0e68c";
  var t = this.game.add.text(0, 0, this.hp, {fontSize: '32px'});
  this.outKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
} // GameOver.create()

UsagiNamespace.GameOver.prototype.update = function()
{
  if(this.outKey.justPressed())
  {
    this.game.state.start('GameState');
    //console.log('outta here');
  }
} // GameOver.update()