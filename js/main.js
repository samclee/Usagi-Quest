var UsagiNamespace = UsagiNamespace || {};

UsagiNamespace.game = new Phaser.Game(700, 500, Phaser.AUTO, null, false, false);

UsagiNamespace.game.state.add("PreloadState", UsagiNamespace.Preload);
UsagiNamespace.game.state.add("GameState", UsagiNamespace.Game);

UsagiNamespace.game.state.start("PreloadState");