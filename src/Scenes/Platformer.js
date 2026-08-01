class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1350;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.coinCounter = 0;
        this.wasOnGround = false;

        // Audio settings
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.volumeStep = 0.05;
        this.volumeMenuVisible = false;
        this.volumeSelection = "music";
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 30 tiles wide and 90 tiles tall.
        this.map = this.add.tilemap("platformer-level-1");

        // Add a tileset to the map
        this.tilemap_tiles = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.industry_tiles = this.map.addTilesetImage("tilemap_packed_industry", "industry_tiles");

        // Create layers
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tilemap_tiles, this.industry_tiles], 0, 0);
        this.decorLayer = this.map.createLayer("decor-n-non-interactibles", [this.tilemap_tiles, this.industry_tiles], 0, 0);
        this.industryGroundLayer = this.map.createLayer("industry-platforms", this.industry_tiles, 0, 0);
        this.industryDecorLayer = this.map.createLayer("industry-decor", this.industry_tiles, 0, 0);
        this.secret = this.map.createLayer("secret", [this.tilemap_tiles, this.industry_tiles], 0, 0);

        // Make layers collidable
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.industryGroundLayer.setCollisionByProperty({ collides: true });
        this.decorLayer.setCollisionByProperty({ collides: true });
        this.industryDecorLayer.setCollisionByProperty({ collides: true });
        this.secret.setCollisionByProperty({ collides: true });

        // Create coins
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        // Convert coins to Arcade Physics sprites
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        this.coinGroup = this.add.group(this.coins);

        // Set up player avatar
        my.sprite.player = this.physics.add.sprite(200, 1500, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.industryGroundLayer);
        this.physics.add.collider(my.sprite.player, this.secret);
        this.physics.add.collider(my.sprite.player, this.decorLayer);
        this.physics.add.collider(my.sprite.player, this.industryDecorLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
        });

        // Set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.rKey = this.input.keyboard.addKey('R');
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F3);

        // Movement VFX
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_2.png', 'spark_3.png'],
            scale: { start: 0.01, end: 0.04 },
            lifespan: 300,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();

        // trail VFX
        my.vfx.trail = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_04.png', 'star_06.png'],
            scale: { start: 0.02, end: 0.11 },
            lifespan: 400,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.trail.stop();

        // jumping VFX
        my.vfx.jumpingInstant = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_02.png', 'muzzle_02.png'],
            scale: { start: 0.1, end: 0.3 },
            lifespan: 200,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.jumpingInstant.stop();

        // Landing VFX similar to jumpingInstant
        my.vfx.landing = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_02.png', 'dirt_03.png'],
            scale: { start: 0.1, end: 0.2 },
            lifespan: 200,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.landing.stop();

        // Set world bounds to match the tilemap width only
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, Number.MAX_SAFE_INTEGER);

        // Ensure the player collides with the world bounds horizontally only
        my.sprite.player.body.setCollideWorldBounds(true, true, false, false);

        // Set camera bounds to match the tilemap size
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.35, 0.35);

        // Camera code
        this.cameras.main.setDeadzone(10, 10);
        this.cameras.main.setZoom(this.SCALE);

        // Play background music
        this.backgroundMusic = this.sound.add("backgroundMusic", { volume: this.musicVolume, loop: true });
        this.backgroundMusic.play(); 

        // Load sound effects
        this.jumpSound = this.sound.add("jumpSound", { volume: this.sfxVolume * 0.06 });
        this.landSound = this.sound.add("landSound", { volume: this.sfxVolume * 1.0 });
        this.walkSound = this.sound.add("walkSound", { volume: this.sfxVolume * 0.8 });
        //this.trailSound = this.sound.add("trailSound", { volume: 0.3 });

        this.createVolumeUI();
        this.refreshAudioVolumes();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.volumeMenuVisible = !this.volumeMenuVisible;
            this.volumePanelBg.setVisible(this.volumeMenuVisible);
            this.volumePanelText.setVisible(this.volumeMenuVisible);
            this.volumeHintText.setVisible(this.volumeMenuVisible);
            this.updateVolumeUI();
        }

        if (this.volumeMenuVisible) {
            if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
                this.volumeSelection = "music";
                this.updateVolumeUI();
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
                this.volumeSelection = "sfx";
                this.updateVolumeUI();
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
                this.adjustSelectedVolume(-this.volumeStep);
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
                this.adjustSelectedVolume(this.volumeStep);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }

        const moveLeft = cursors.left.isDown || this.wasd.left.isDown;
        const moveRight = cursors.right.isDown || this.wasd.right.isDown;
        const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up);

        if (moveLeft) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                if (!this.walkingSoundPlaying) {
                    this.walkSound.play();
                    this.walkingSoundPlaying = true;
                }
                my.vfx.walking.start();
                my.vfx.trail.stop();
            }
        } else if (moveRight) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                if (!this.walkingSoundPlaying) {
                    this.walkSound.play();
                    this.walkingSoundPlaying = true;
                }
                my.vfx.walking.start();
                my.vfx.trail.stop();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            this.walkSound.stop();
            this.walkingSoundPlaying = false;
            my.vfx.walking.stop();
            my.vfx.trail.stop();
        }

        // player jump
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.walking.stop();
            my.vfx.trail.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            //if (!this.trailSoundPlaying) {
            //   this.trailSound.play();
            //    this.trailSoundPlaying = true;
            //}
        }
        if (my.sprite.player.body.blocked.down && jumpPressed) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumpingInstant.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            my.vfx.trail.stop();
            this.jumpSound.play();
        }

        // play landing animation and VFX if player lands
        if (my.sprite.player.body.blocked.down && !this.wasOnGround) {
            this.landSound.play();
            my.sprite.player.anims.play('land');
            my.vfx.landing.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            
        }
        this.wasOnGround = my.sprite.player.body.blocked.down;
        

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Adjust camera scrollY to follow the player
        this.cameras.main.scrollY = my.sprite.player.y - this.cameras.main.height / 2;
    }

    createVolumeUI() {
        const textStyle = {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff'
        };

        this.volumePanelBg = this.add.rectangle(150, 70, 280, 120, 0x000000, 0.6)
            .setScrollFactor(0)
            .setDepth(1000)
            .setVisible(false);

        this.volumePanelText = this.add.text(20, 26, '', textStyle)
            .setScrollFactor(0)
            .setDepth(1001)
            .setVisible(false);

        this.volumeHintText = this.add.text(20, 118, 'P: toggle | Up/Down: select | Left/Right: change | F3: debug', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#c8d2ff'
        })
            .setScrollFactor(0)
            .setDepth(1001)
            .setVisible(false);

        this.updateVolumeUI();
    }

    adjustSelectedVolume(delta) {
        if (this.volumeSelection === "music") {
            this.musicVolume = Phaser.Math.Clamp(this.musicVolume + delta, 0, 1);
        } else {
            this.sfxVolume = Phaser.Math.Clamp(this.sfxVolume + delta, 0, 1);
        }

        this.refreshAudioVolumes();
        this.updateVolumeUI();
    }

    refreshAudioVolumes() {
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(this.musicVolume);
        }

        if (this.jumpSound) {
            this.jumpSound.setVolume(this.sfxVolume * 0.06);
        }

        if (this.landSound) {
            this.landSound.setVolume(this.sfxVolume * 1.0);
        }

        if (this.walkSound) {
            this.walkSound.setVolume(this.sfxVolume * 0.8);
        }
    }

    formatVolumeBar(volume) {
        const totalBars = 10;
        const filledBars = Math.round(volume * totalBars);
        return '[' + '#'.repeat(filledBars) + '-'.repeat(totalBars - filledBars) + ']';
    }

    updateVolumeUI() {
        const musicPointer = this.volumeSelection === "music" ? '>' : ' ';
        const sfxPointer = this.volumeSelection === "sfx" ? '>' : ' ';
        const musicPercent = Math.round(this.musicVolume * 100);
        const sfxPercent = Math.round(this.sfxVolume * 100);

        this.volumePanelText.setText(
            'Audio Settings\n' +
            `${musicPointer} Music ${this.formatVolumeBar(this.musicVolume)} ${musicPercent}%\n` +
            `${sfxPointer} SFX   ${this.formatVolumeBar(this.sfxVolume)} ${sfxPercent}%`
        );
    }
}
