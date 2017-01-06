var gameProperties = {
    screenWidth : 640,
    screenHeight: 480
}


var graphicAssets = {
   baseURL : 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue001/',
   crossOrigin : 'anonymous',
   tank : {name :'tank',URL :'assets/tank.png'},
   turret : {name :'turret',URL : 'assets/turret.png'},
   bullet : {name :'bullet',URL : 'assets/bullet.png'},
   background : {name : 'background',URL : 'assets/background.png'},
   flame : {name : 'flame',URL : 'assets/flame.png'},
   target : {name : 'target',URL : 'assets/target.png'},
   land : {name: 'land',URL : 'assets/land.png'}
} 

var gameState = function(game) {
   this.tankSprite = null;
   this.turretSprite;
   this.flameSprite;
   this.bulletSprite;
   this.background;
   this.targets;
   this.power = 300;
   this.powerText;
   this.cursors;
   this.key_left; 
   this.key_right;
   this.key_fire;
   this.game = game;
   this.emitter;
   this.land;
}


gameState.prototype = {

    init : function() {
      this.game.renderer.renderSession.roundPixels = true;
      this.game.world.setBounds(0,0,992,480);
      this.physics.startSystem(Phaser.Physics.ARCADE);
      this.physics.arcade.gravity.y = 200;

    },
    preload : function() {
      this.load.baseURL = graphicAssets.baseURL;
      this.load.crossOrigin = graphicAssets.crossOrigin;

      this.load.image(graphicAssets.tank.name,graphicAssets.tank.URL);
      this.load.image(graphicAssets.turret.name,graphicAssets.turret.URL);
      this.load.image(graphicAssets.bullet.name,graphicAssets.bullet.URL); 
      this.load.image(graphicAssets.background.name,graphicAssets.background.URL);
      this.load.image(graphicAssets.flame.name,graphicAssets.flame.URL); 
      this.load.image(graphicAssets.target.name,graphicAssets.target.URL);
      this.game.load.start()
    },
  
    create : function() {
        this.initGraphic(); 
        this.initPhysics();
        this.initInput();

    },

    update : function() {
        if(this.bulletSprite.exists) {
           if(this.bulletSprite.y > 420)  
             this.removeBullet();
           else {
             this.physics.arcade.overlap(this.bulletSprite,this.targets,this.hitTarget,null,this);
             this.bulletVsLand();
           }

        }else {
          this.checkPlayerInput();
          this.powerText.text = 'Power: ' + this.power;
        }
    },

    initInput : function() {
       this.cursors = this.game.input.keyboard.createCursorKeys();
       this.key_left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
       this.key_right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
       this.key_fire = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

       this.key_fire.onDown.add(this.fire,this);

    },

    initGraphic : function() {
       this.background = this.add.sprite(0,0,'background');
        
       this.land = this.add.bitmapData(992,480);
       this.land.draw('land');
       this.land.update();
       this.land.addToWorld();


       this.bulletSprite = this.add.sprite(0,0,'bullet');
       this.bulletSprite.exists = false;
       this.tankSprite = this.add.sprite(24,383,'tank');
       this.turretSprite = this.add.sprite(this.tankSprite.x + 30,this.tankSprite.y + 14,'turret');
       this.flameSprite = this.add.sprite(0,0,'flame');
       this.flameSprite.anchor.set(0.5,0.5);
       this.flameSprite.visible = true;


       this.power = 300;
       this.powerText = this.add.text(8,8,'Power : 300',{font:'18px Arial',fill : '#ffffff'});
       this.powerText.setShadow(1,1,'rgba(0,0,0,0.8)',1);
       this.powerText.fixedToCamera = true; 
      

      
    },

    initPhysics : function() {
       this.emitter = this.add.emitter(0,0,30);
       this.emitter.makeParticles('flame');
       this.emitter.setXSpeed(-120,120);
       this.emitter.setYSpeed(-100,-120);
       this.emitter.setRotation();


       this.targets = this.add.group(this.game.world,'targets',false,true,Phaser.Physics.ARCADE);
       this.targets.create(300,300,'target');
       this.targets.create(500,390,'target');
       this.targets.create(700,390,'target');
       this.targets.create(900,390,'target');

       this.targets.setAll('body.allowGravity',false); 

       this.physics.arcade.enable(this.bulletSprite); 
    
    },

    fire : function() {
       if(this.bulletSprite.exists) {
           return ;
       }else {
          this.bulletSprite.reset(this.turretSprite.x,this.turretSprite.y);
          var p = new Phaser.Point(this.turretSprite.x,this.turretSprite.y);
          p.rotate(p.x,p.y,this.turretSprite.rotation,false,34);
          this.flameSprite.x = p.x;
          this.flameSprite.y = p.y;
          this.flameSprite.alpha = 1;
          this.flameSprite.visible = true;
          this.add.tween(this.flameSprite).to({alpha : 0},100,"Linear",true);
          this.camera.follow(this.bulletSprite);
          this.physics.arcade.velocityFromRotation(this.turretSprite.rotation,this.power,this.bulletSprite.body.velocity);
      }
    },
   
    hitTarget : function(bullet,target) {
        this.emitter.at(target);
        this.emitter.explode(2000,10);
        target.kill();
        this.removeBullet();
    },
  
    removeBullet : function() {
       this.bulletSprite.kill();
       this.camera.follow();
       this.add.tween(this.camera).to({x : 0},1000,"Quint",true,1000);
    },

    checkPlayerInput : function() {
       if(this.key_left.isDown && this.power > 100) {
           this.power -= 2;

       }else if(this.key_right.isDown && this.power < 600) {
           this.power += 2;
       }

       if(this.cursors.up.isDown && this.turretSprite.angle > -90) {
           this.turretSprite.angle--;
       }else if(this.cursors.down.isDown && this.turretSprite.angle < 0) {
           this.turretSprite.angle++;
       }
    },

    bulletVsLand : function() {
       if(this.bulletSprite.x < 0 || this.bulletSprite.y > this.game.world.width || this.bulletSprite.y > this.game.height) {
          this.removeBullet();
          return ;
       }

       var x = Math.floor(this.bulletSprite.x);
       var y = Math.floor(this.bulletSprite.y);
       var rgba = this.land.getPixel(x,y);
       if(rgba.a > 0) {
           this.land.blendDestinationOut();
           this.land.circle(x,y,16,rgba(0,0,0,255));
           this.land.blendReset(); 
           this.land.update();
           this.removeBullet();
       }
    }


}


var game = new Phaser.Game(gameProperties.screenWidth,gameProperties.screenHeight,Phaser.CANVAS,'gameDiv');
game.state.add("game",gameState);
game.state.start("game");
