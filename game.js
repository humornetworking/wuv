// the game itself
var game;

// the ball you are about to fire
var ball;

// the rectangle where you can place the ball and charge the launch power
var launchRectangle = new Phaser.Rectangle(250, 250, 200, 150);

// here we will draw the predictive trajectory
var trajectoryGraphics;

// a simply multiplier to increase launch power
var forceMult = 5;

// here we will store the launch velocity
var launchVelocity;

var speed = 4;

// function to be executed when the window loads
window.onload = function() {	
     // starting the game itself
	 game = new Phaser.Game(1500, 1000, Phaser.AUTO);
     game.state.add("PlayGame",playGame);
     game.state.start("PlayGame");
}

var playGame = function(game){};

playGame.prototype = {
     // preloading graphic assets (only the ball)
	preload: function(){
          
		game.stage.backgroundColor = "FFFD55"
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.load.image('victor', 'asset/sprite/victor.png');
		game.load.image('ball', 'asset/sprite/ball.png',50,50);
		game.load.image('background', 'asset/sprite/background.png');
		game.load.spritesheet('empleado', 'asset/sprite/empleado.png', 125, 210);
	},
     // function to be executed onche game has been created
  	create: function(){

        trajectoryGraphics = game.add.graphics(0, 0);          
        launchVelocity = new Phaser.Point(0, 0);

          // initializing Box2D physics
		game.physics.startSystem(Phaser.Physics.BOX2D);
        game.physics.box2d.gravity.y = 500;
		game.physics.box2d.setBoundsToWorld();
		  
		var background = game.add.sprite(0, 0, 'background');
		
		victor = game.add.sprite(1500/2, 1000/2, 'victor');
		victor.anchor.setTo(0.5, 0.5);
		victor.scale.setTo(0.7, 0.7);
		
		game.physics.box2d.enable(victor);
		
		empleado = game.add.sprite(1500/2, 1000/2, 'empleado');
		empleado.anchor.setTo(0.5, 0.5);
		empleado.scale.setTo(0.7, 0.7);
		

		game.physics.enable(empleado);
		
		
		empleado.animations.add('walk',[2,3,4,5,6,7,8]);
		
		victor.body.collideWorldBounds = true;
		empleado.body.collideWorldBounds = true;
		  
		  
		// waiting for player input then call placeBall function
         game.input.onDown.add(placeBall);
		  
		grupo = game.add.group();
		  
		  
	},
	update : function() {
	
	
		
	
	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
		empleado.scale.setTo(0.7, 0.7);
        empleado.x -= speed;
        empleado.angle = -15;
		empleado.animations.play('walk',14, true);
        
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
		empleado.scale.setTo(-0.7, 0.7);
        empleado.x += speed;
        empleado.angle = 15;
		empleado.animations.play('walk',14, true);
		
        
    } else {
		empleado.animations.stop('walk');
		empleado.frame = 5;
	}
	
	
	if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {
        empleado.y += speed;
        empleado.angle = 15;
        
    }
	else if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        empleado.y -= speed;
        empleado.angle = 15;
        
    }
	
	
	
	}
	

	
}


function enemyCallback() {
	console.log("Tengo sueño Mama !! ahhhh");
}


// this function will place the ball
function placeBall(e){
	
	//Elimino el rectangulo y lo posiciono donde esta el puntero del mouse
	grupo.callAll('kill');
	
	launchRectangle = new Phaser.Rectangle(game.input.mousePointer.x, game.input.mousePointer.y, 200, 150);
	
	let launchGraphics = game.add.graphics(0, 0);    
    launchGraphics.lineStyle(5, 0xff0000);
    launchGraphics.drawRect(game.input.mousePointer.x, game.input.mousePointer.y, launchRectangle.width, launchRectangle.height);   
	
	grupo.add(launchGraphics);
	
	

          // adding ball sprite
          ball = game.add.sprite(e.x, e.y, "ball");
		  ball.scale.setTo(0.4,0.4);
		  game.physics.box2d.enable(ball);
		  ball.body.setBodyContactCallback(victor, enemyCallback, this);
		  
          // enabling physics to ball sprite
          game.physics.box2d.enable(ball);
          // temporarily set ball gravity to zero, so it won't fall down
          ball.body.gravityScale = 0;
          // telling Box2D we are dealing with a circle shape
          ball.body.setCircle(ball.width / 2);
          // removing onDown listener
          game.input.onDown.remove(placeBall);
          // when the player ends the input call launchBall function
          game.input.onUp.add(launchBall);
          // when the player moves the input call chargeBall
          game.input.addMoveCallback(chargeBall);
     //}	
}

// this function will allow the player to charge the ball before the launch, and it's the core of the example
function chargeBall(pointer, x, y, down){
     // we does not allow multitouch, so we are only handling pointer which id is zero
     if(pointer.id == 0){
          // clearing trajectory graphics, setting its line style and move the pen on ball position
          trajectoryGraphics.clear();
          trajectoryGraphics.lineStyle(3, 0x00ff00);
          trajectoryGraphics.moveTo(ball.x, ball.y);
          // now we have two options: the pointer is inside the launch rectangle...
          if(launchRectangle.contains(x, y)){
               // ... and in this case we simply draw a line to pointer position
               trajectoryGraphics.lineTo(x, y);
               launchVelocity.x = ball.x - x;
               launchVelocity.y = ball.y - y;               
          }
          // ... but the pointer cal also be OUTSIDE launch rectangle
          else{
               // ... in this case we have to check for the intersection between launch line and launch rectangle
               var intersection = lineIntersectsRectangle(new Phaser.Line(x, y, ball.x, ball.y), launchRectangle);
               trajectoryGraphics.lineTo(intersection.x, intersection.y);
               launchVelocity.x = ball.x - intersection.x;
               launchVelocity.y = ball.y - intersection.y;
          } 
          // now it's time to draw the predictive trajectory  
          trajectoryGraphics.lineStyle(1, 0x00ff00);  
		  
          launchVelocity.multiply(forceMult, forceMult);
          for (var i = 0; i < 180; i += 6){
               var trajectoryPoint = getTrajectoryPoint(ball.x, ball.y, launchVelocity.x, launchVelocity.y, i);
               trajectoryGraphics.moveTo(trajectoryPoint.x - 3, trajectoryPoint.y - 3); 
               trajectoryGraphics.lineTo(trajectoryPoint.x + 3, trajectoryPoint.y + 3);
               trajectoryGraphics.moveTo(trajectoryPoint.x - 3, trajectoryPoint.y + 3);  
               trajectoryGraphics.lineTo(trajectoryPoint.x + 3, trajectoryPoint.y - 3);        
          }     
     }
}

// function to launch the ball
function launchBall(){
     // adjusting callbacks
     game.input.deleteMoveCallback(0);
     game.input.onUp.remove(launchBall);
     game.input.onDown.add(placeBall);
     // setting ball velocity
     ball.body.velocity.x = launchVelocity.x;
     ball.body.velocity.y = launchVelocity.y;
     // applying the gravity to the ball
     ball.body.gravityScale = 1;     
	 
	 
	 
}

// simple function to check for intersection between a segment and a rectangle
function lineIntersectsRectangle(l, r){
     return l.intersects(new Phaser.Line(r.left, r.top, r.right, r.top), true) ||
          l.intersects(new Phaser.Line(r.left, r.bottom, r.right, r.bottom), true) ||
          l.intersects(new Phaser.Line(r.left, r.top, r.left, r.bottom), true) ||
          l.intersects(new Phaser.Line(r.right, r.top, r.right, r.bottom), true);
}

// function to calculate the trajectory point taken from http://phaser.io/examples/v2/box2d/projected-trajectory
function getTrajectoryPoint(startX, startY, velocityX, velocityY, n) {
     var t = 1 / 60;    
     var stepVelocityX = t * game.physics.box2d.pxm(-velocityX); 
     var stepVelocityY = t * game.physics.box2d.pxm(-velocityY);    
     var stepGravityX = t * t * game.physics.box2d.pxm(-game.physics.box2d.gravity.x); 
     var stepGravityY = t * t * game.physics.box2d.pxm(-game.physics.box2d.gravity.y);
     startX = game.physics.box2d.pxm(-startX);
     startY = game.physics.box2d.pxm(-startY);    
     var tpx = startX + n * stepVelocityX + 0.5 * (n * n + n) * stepGravityX;
     var tpy = startY + n * stepVelocityY + 0.5 * (n * n + n) * stepGravityY;    
     tpx = game.physics.box2d.mpx(-tpx);
     tpy = game.physics.box2d.mpx(-tpy);    
     return {
          x: tpx, 
          y: tpy 
     };
}