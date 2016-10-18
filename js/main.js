(function(){ //game start funct
//=====================
//==declare variables//
//=====================

//canvas
var canvas = document.querySelector("canvas");
var drawingSurface = canvas.getContext('2d');

//sprites and assets into arrays.
var sprites = [];
var assetsToLoad = [];
var messages = [];

//===============================
//==create sprites using tileset//
//===============================
var background = Object.create(spriteObject);
background.x = 0;
background.y = 0;
background.sourceY = 32;
background.sourceWidth = 512;
background.sourceHeight = 512;
background.width= 512;
background.height=512;
sprites.push(background);

var playerShip = Object.create(spriteObject);
playerShip.x = canvas.width / 2 - playerShip.width / 2;
playerShip.sourceX = 0;
playerShip.sourceWidth= 42;
playerShip.width = 42;
playerShip.y = 450;
sprites.push(playerShip);

//load tileset
var image = new Image();
image.addEventListener('load', loadHandler, false);
image.src = "./assets/tileset2.png";
assetsToLoad.push(image);

//asset loaded
var assetsLoaded = 0;

//=========================
//==     Game States   //==
//=========================

var LOADING = 0;
var PLAYING = 1;
var OVER = 2;
var gameState = LOADING;

//arrow key codes
var RIGHT = 39;
var LEFT = 37;
var SPACE = 32;
// game vars
var moveRight = false;
var moveLeft = false;
//missile vars
var missiles =[];
var shoot = false;
var spaceKeyDown = false;
// aliens
var alienTimer = 0;
var alienFrequency = 100;
var alienTwoTimer = 0;
var alienTwoFrequency = 250;
var aliens = [];

//score
var score = 0;
var scoreNeededToWin = 60;

//=========================
//==      Messages     //==
//=========================

var scoreDisplay = Object.create(messageObject);
scoreDisplay.font = "normal bold 30px 'Press Start 2P'";
scoreDisplay.fillStyle = "slateblue";
scoreDisplay.x = 400;
scoreDisplay.y = 10;
messages.push(scoreDisplay);

var gameOverMessage = Object.create(messageObject);
gameOverMessage.font = "normal bold 20px 'Press Start 2P'";
gameOverMessage.fillStyle = "red";
gameOverMessage.x = 126;
gameOverMessage.y = 236;
gameOverMessage.visible = false;
messages.push(gameOverMessage);


//=========================
//==Controller/Listener//==
//=========================

window.addEventListener('keydown',function(e){
    switch(e.keyCode){
        case LEFT:
        moveLeft = true;
        break;

        case RIGHT:
        moveRight = true;
        break;

        case SPACE:
        if(!spaceKeyDown){
            shoot = true;
            spaceKeyDown = true;
        }
    }    
},false);

window.addEventListener('keyup',function(e){
    switch(e.keyCode){
        case LEFT:
        moveLeft = false;
        break;

        case RIGHT:
        moveRight = false;
        break;
        
        case SPACE:
        spaceKeyDown = false;
        break;
    }
},false);

//=========================
//==     Animation     //==
//=========================
update();

//render update

function update(){
    requestAnimationFrame(update, canvas);

    switch(gameState){
        case LOADING:
        console.log('loading');
        break;

        case PLAYING:
        playGame();
        break;

        case OVER:
        endGame();
        break;
    }
    render();
}

//load handler fnct -- after loaded the listener is removed
function loadHandler(){
    assetsLoaded++;
    if (assetsLoaded === assetsToLoad.length){
        image.removeEventListener("load",loadHandler,false);
        gameState = PLAYING;
    }
}
//playgame function, handles the movement of character
function playGame(){
    if(moveLeft && !moveRight){
        playerShip.vx = -8;
    }
    if(moveRight && !moveLeft){
        playerShip.vx = 8
    }
    if (!moveLeft && ! moveRight){
        playerShip.vx=0;
    }
    if(shoot){
        fireMissile();
        shoot = false;
    }
    //rounds the number and sets movement by calculating x using vx and accounting for size of sprite
    //player cannot move out of canvas, can be made more verbose if I get confused. 
    playerShip.x = Math.max(0, Math.min(playerShip.x + playerShip.vx, canvas.width - playerShip.width));

    //move missiles
    for(var i = 0; i < missiles.length; i++){
        var missile = missiles[i];
        missile.y += missile.vy;
        if(missile.y < 0 - missile.height){
            removeObject(missile,missiles);
            removeObject(missile,sprites);
            i--;
        }
    }

    //alien stuff
    alienTimer++;
    alienTwoTimer++;

    if(alienTimer === alienFrequency){
        makeAlien();
        alienTimer = 0;
        if (alienFrequency > 2){
            alienFrequency --;
        }       
    }
    if(alienTwoTimer === alienTwoFrequency){
        makeAlienTwo();
        alienTwoTimer = 0;
        //if 
        // if (alienFrequency > 2){
        //     alienFrequency --;
        // }       
    }    
    //move aliens
    for(var i = 0; i < aliens.length; i++){
        var alien = aliens[i];
        //if alive move him down 1
        if(alien.state === alien.NORMAL){
            alien.y += alien.vy;
        }
        //if bottom of screen
        if(alien.y > canvas.height + alien.height){
            gameState = OVER;
        }
    }
//hit loop with destroy alien fnct
    for(var i = 0; i < aliens.length; i++){
        var alien = aliens[i];

        for(var j = 0; j < missiles.length; j++){
            var missile = missiles[j];
            if(hitTestRectangle(missile,alien) && alien.state === alien.NORMAL){
                destroyAlien(alien);
                score++;

                removeObject(missile,missiles);
                removeObject(missile,sprites);
                j--;
            }
        }
    }
    scoreDisplay.text = score;
    if(score === scoreNeededToWin){
        gameState = OVER;
    }   
}
//destroy alien 

function destroyAlien(alien){
    //change state
    alien.state = alien.EXPLODED;
    alien.update();
    setTimeout(removeAlien,500);
    function removeAlien(){
        removeObject(alien,aliens);
        removeObject(alien,sprites);
        removeObject(alienTwo,aliens);
        removeObject(alienTwo,sprites);
    }

}

function makeAlien(){
    var alien = Object.create(alienObject);
    var randomPosition = Math.floor(Math.random() * (canvas.width / alien.width));
    var randomVelocity = Math.random() + 2;
    alien.sourceX = 42;
    alien.y = 0 - alien.height;
    alien.x = randomPosition * alien.width;
    alien.vy = randomVelocity;
    sprites.push(alien);
    aliens.push(alien);
}

function makeAlienTwo(){
    var alienTwo = Object.create(alienObject);
    var randomPosition = Math.floor(Math.random() * (canvas.width / alienTwo.width));
    var randomVelocity = Math.random() + 0.5;
    alienTwo.sourceX = 74;
    alienTwo.sourceWidth = 52;
    alienTwo.width = 52;
    alienTwo.y = 0 - alienTwo.height;
    alienTwo.x = randomPosition * alienTwo.width;
    alienTwo.vy = randomVelocity;
    sprites.push(alienTwo);
    aliens.push(alienTwo);
    console.log('second alien');
}

function fireMissile(){
    var missile = Object.create(spriteObject);
    missile.sourceX = 158;
    missile.sourceWidth = 15;
    missile.SourceHeight = 26;
    missile.width = 15;
    missile.height = 26;

    //center it
    missile.x = playerShip.centerX() - missile.halfWidth();
    missile.y = playerShip.y - missile.height;

    //speed
    missile.vy = -8;

    sprites.push(missile);
    missiles.push(missile);

}

function endGame(){
    gameOverMessage.visible = true;
    if (score < scoreNeededToWin){
        gameOverMessage.text = "EARTH DESTROYED";
    }
    else{
        gameOverMessage.fillStyle = "green";
        gameOverMessage.x = 220;
        gameOverMessage.text = "EARTH SAVED";
    }
}


//render the canvas with stuff after loading
function render(){
    drawingSurface.clearRect(0, 0, canvas.width, canvas.height);
    if (sprites.length!== 0){
        for (var i = 0; i < sprites.length; i++){
            var sprite = sprites[i];
            drawingSurface.drawImage(
                image,
                sprite.sourceX, sprite.sourceY,
                sprite.sourceWidth, sprite.sourceHeight,
                Math.floor(sprite.x), Math.floor(sprite.y),
                sprite.width, sprite.height
            );
        }
    }
    if (messages.length !== 0){
        for (var i = 0; i < messages.length; i++){
            var message = messages[i];
            if (message.visible){
                drawingSurface.font = message.font;
                drawingSurface.fillStyle = message.fillStyle;
                drawingSurface.textBaseline = message.textBaseline;
                drawingSurface.fillText(message.text,message.x,message.y);
            }
        }
    }    
}


}()); //game start funct end