// Inits
console.log("toto");

window.onload = function init() {
  var game = new GF();
  game.start();
};


// GAME FRAMEWORK STARTS HERE
var GF = function(){
    // Vars relative to the canvas
    var canvas, ctx, w, h; 

    // etat du jeu
    var tempsTotal=0;
  
    var etats = {
        menuPrincipal : 0,
        jeuEnCours : 1,
        gameOver : 2,
    };
    var etatCourant = etats.jeuEnCours;
    
    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps; 
    // for time based animation
    var delta, oldTime = 0;
  
    // vars for handling inputs
    var inputStates = {};

    // The monster !
    var monster = {
      x:200,
      y:200,
      speed:100, // pixels/s this time !
      boundingCircleRadius: 70  
    };

    var img = new Image();   // Crée un nouvel objet Image
    img.src = 'sprite_jeu_web/player.png'; // Définit le chemin vers sa source


    // array of balls to animate
    var ballArray = [];
  
  
    var measureFPS = function(newTime){
      
         // test for the very first invocation
         if(lastTime === undefined) {
           lastTime = newTime; 
           return;
         }
      
        //calculate the difference between last & current frame
        var diffTime = newTime - lastTime; 

        if (diffTime >= 1000) {
            fps = frameCount;    
            frameCount = 0;
            lastTime = newTime;
        }

        //and display it in an element we appended to the 
        // document in the start() function
       fpsContainer.innerHTML = 'FPS: ' + fps; 
       frameCount++;
    };
  
     // clears the canvas content
     function clearCanvas() {
       ctx.clearRect(0, 0, w, h);
     }
  
     // Functions for drawing the monster and maybe other objects
     function drawMyMonster(x, y) {
       // draw a big monster !
       // head
   
       // save the context
       ctx.save();
         //ctx.rotate(0.2*Math.PI);
         ctx.drawImage(img, x-100, y-100,200,200);
        // ctx.fillStyle="#FF0000";
         //ctx.fillRect(x-100, y-100,200,200);
       // translate the coordinate system, draw relative to it
       ctx.translate(x-50, y-50);

         /*
       // (0, 0) is the top left corner of the monster.
       ctx.strokeRect(0, 0, 100, 100);

       // eyes
       ctx.fillRect(20, 20, 10, 10);
       ctx.fillRect(65, 20, 10, 10);

       // nose
       ctx.strokeRect(45, 40, 10, 40);
  
       // mouth
       ctx.strokeRect(35, 84, 30, 10);
  
       // teeth
       ctx.fillRect(38, 84, 10, 10);
       ctx.fillRect(52, 84, 10, 10);
  */
       // Draw bounding circle
       ctx.beginPath();
       ctx.arc(50, 50, monster.boundingCircleRadius, 0, 2*Math.PI);
       ctx.stroke();
      // restore the context

      ctx.restore(); 
    }
  
  function timer(currentTime) {
    var delta = currentTime - oldTime;
    oldTime = currentTime;
    return delta;
    
  }
    var mainLoop = function(time){
       // Clear the canvas
          clearCanvas();
      
      if(monster.dead) {
        etatCourant = etats.gameOver;
      }
      
      switch(etatCourant) {
        case etats.jeuEnCours: 
          //main function, called each frame 
          measureFPS(time);
      
          // number of ms since last frame draw
          delta = timer(time);
          tempsTotal += delta;
         ctx.fillText((tempsTotal/1000).toFixed(2) , 100, 100);
       
          // draw the monster
          drawMyMonster(monster.x, monster.y);
      
          // Check inputs and move the monster
          updateMonsterPosition(delta);
 
          // update and draw balls
          updateBalls(delta);
          break;
        case etats.gameOver:
          //console.log("GAME OVER");
          ctx.fillText("GAME OVER", 100, 100);
          ctx.fillText("Press SPACE to start again", 100, 150);
          
          if(inputStates.space) {
            console.log("space enfoncee");
            createBalls(4);
            monster.dead = false;
            etatCourant = etats.jeuEnCours;
          }
          break;
      
      }
        requestAnimationFrame(mainLoop);
    };
  

    function updateMonsterPosition(delta) {
      monster.speedX = monster.speedY = 0;
        // check inputStates
        if (inputStates.left) {
            monster.speedX = -monster.speed;
        }
        if (inputStates.up) {
           monster.speedY = -monster.speed;
        }
       if (inputStates.right) {
            monster.speedX = monster.speed;
        }
        if (inputStates.down) {
            monster.speedY = monster.speed;
        } 
        if (inputStates.space) {
        }
        if (inputStates.mousePos) { 
        }
       if (inputStates.mousedown) { 
            monster.speed = 500;
        } else {
          // mouse up
          monster.speed = 100;
        }
      
        // COmpute the incX and inY in pixels depending
        // on the time elasped since last redraw
        monster.x += calcDistanceToMove(delta, monster.speedX);
        monster.y += calcDistanceToMove(delta, monster.speedY);
   }
  
 function updateBalls(delta) {
      // for each ball in the array
    for(var i=0; i < ballArray.length; i++) {
      var ball = ballArray[i];
      
      // 1) move the ball
      ball.move(delta);   
  
      // 2) test if the ball collides with a wall
      testCollisionWithWalls(ball);
      
      // teste collisions avec monstre
    /*  if(circleCollide(ball.x, ball.y, ball.radius,
                       monster.x, monster.y, monster.boundingCircleRadius)) {
        //console.log("collision");
        ball.color = 'red';
        monster.dead = true;
      }*/
      
      if(circRectsOverlap(monster.x-50, monster.y-50, 100, 100, ball.x, ball.y, ball.radius)) {
                            
        //console.log("collision");
        ball.color = 'red';
        monster.dead = true;

      }
  
      // 3) draw the ball
      ball.draw(ctx);
  }
} 
  
  // Teste collisions entre cercles

  
  function testCollisionWithWalls(ball) {
    // left
    if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.angle = -ball.angle + Math.PI;
    } 
    // right
    if (ball.x > w - (ball.radius)) {
        ball.x = w - (ball.radius);
        ball.angle = -ball.angle + Math.PI; 
    }     
    // up
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.angle = -ball.angle;     
    }     
    // down
    if (ball.y > h - (ball.radius)) {
        ball.y = h - (ball.radius);
        ball.angle =-ball.angle; 
    } 
}
  
    function getMousePos(evt) {
        // necessary to take into account CSS boudaries
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
      
  function createBalls(numberOfBalls) {
      for(var i=0; i < numberOfBalls; i++) {
        // Create a ball with random position and speed. 
        // You can change the radius
        var ball =  new Ball(w*Math.random(),
                          h*Math.random(),
                          (2*Math.PI)*Math.random(),        
                          50,
                          30);
    
        if(!circleCollide(ball.x, ball.y, ball.radius,
                       monster.x, monster.y, monster.boundingCircleRadius)) {
        // On la rajoute au tableau
        ballArray[i] = ball;
        } else {
          i--;     
        }
      }
   }                                

  
    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
      
        // Canvas, context etc.
        canvas = document.querySelector("#myCanvas");
  
        // often useful
        w = canvas.width; 
        h = canvas.height;  
  
        // important, we will draw with this object
        ctx = canvas.getContext('2d');

        // default police for text
        ctx.font="20px Arial";
      
       //add the listener to the main, window object, and update the states
      window.addEventListener('keydown', function(event){
          if (event.keyCode === 37) {
             inputStates.left = true;
          } else if (event.keyCode === 38) {
             inputStates.up = true;
          } else if (event.keyCode === 39) {
             inputStates.right = true;
          } else if (event.keyCode === 40) {
             inputStates.down = true;
          }  else if (event.keyCode === 32) {
             inputStates.space = true;
          }
      }, false);

      //if the key will be released, change the states object 
      window.addEventListener('keyup', function(event){
          if (event.keyCode === 37) {
             inputStates.left = false;
          } else if (event.keyCode === 38) {
             inputStates.up = false;
          } else if (event.keyCode === 39) {
             inputStates.right = false;
          } else if (event.keyCode === 40) {
             inputStates.down = false;
          } else if (event.keyCode === 32) {
             inputStates.space = false;
          }
      }, false);
      
      // Mouse event listeners
      canvas.addEventListener('mousemove', function (evt) {
          inputStates.mousePos = getMousePos(evt);
      }, false);

      canvas.addEventListener('mousedown', function (evt) {
            inputStates.mousedown = true;
            inputStates.mouseButton = evt.button;
      }, false);

      canvas.addEventListener('mouseup', function (evt) {
          inputStates.mousedown = false;
      }, false);      

        // We create tge balls: try to change the parameter
        createBalls(4); 

        // start the animation
        requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};