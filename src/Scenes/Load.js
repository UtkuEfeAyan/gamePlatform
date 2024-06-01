class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json", "tilemap_packed_industry.png", "tilemap-backgrounds_packed.png");
        console.log();


        // Load tilemap information
        this.load.image("industry_tiles", "tilemap_packed_industry.png");
        console.log();

        this.load.image("tilemap_tiles", "tilemap_packed.png");       
                          // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        console.log();


        this.load.spritesheet("tilemap_sheet2", "tilemap_packed_industry.png",  {
            frameWidth: 18,
            frameHeight: 18
        });
        console.log();



        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");


        // Load background music
        this.load.audio("backgroundMusic", "Tricky.mp3");


        // Load sound effects
        this.load.audio("jumpSound", "jump.mp3");
        this.load.audio("landSound", "land.mp3");
        this.load.audio("walkSound", "walk.mp3");
        //this.load.audio("trailSound", "trail.mp3"); it was too much noise
    }

    create() {
        this.anims.create({
            key: 'land',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: 'tile_',
                start: 4,
                end: 5,
                zeroPad: 4,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });


        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}