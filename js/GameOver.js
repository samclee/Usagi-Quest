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
  this.t = this.game.add.text(this.game.width / 2, 100, this.hp, {fontSize: '32px'});
  this.t.anchor.set(0.5);
  this.usagi = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'end_usagi');
  this.usagi.animations.add('lose', [0, 1, 2], 5, true);
  this.usagi.animations.add('win', [3, 4, 5, 4], 5, true);
  this.usagi.anchor.set(0.5);

  if(this.hp > 0)
  {
    this.t.text = 'You Win! \n Press Space to play again';
    this.usagi.animations.play('win');
  }
  else
  {
    this.t.text = 'Try Again! \n Press Space to play again';
    this.usagi.animations.play('lose');
  }

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