let gameInfo;
let spaceshipSpeed = [];
let margins = [0, 0, 0, 0, 0];
let ufoTimers = [];
let ufos = document.querySelectorAll(".spaceships");
let columnNo = 1;
let ufoFirstNum = [];
let ufoSecondNum = [];
let ufoCorrectAns;
let gameOver = false;

let hitCount = 0;
let missCount = 0;
let hitPercentage = 0;

const movementInterval = 50
const easySpeeds = {"min": 0.1, "max": 3};
const hardSpeeds = {"min": 3.1, "max": 6};
let lastUfoHeight = 0;

const INITIAL_TIMER_VALUE = 90;
let timeLeft = INITIAL_TIMER_VALUE;

const gameSound = document.getElementById("audio-game");
const winSound = document.getElementById("audio-win");
const explodeSound = document.getElementById("audio-explode");
const laserSound = document.getElementById("audio-laser");

let autoplayPending = true;

const adjustGameHeight = () => {
    const bodyHeight = document.querySelector("body").offsetHeight;

    const gameScrHeight = document.querySelector(".container").offsetHeight;
    console.log(`Original gamescreen height is: ${gameScrHeight}px`);
    const gameIntHeight = document.querySelector(".game-panel").offsetHeight;

    console.log(`Body height: ${bodyHeight}, Game height: ${gameScrHeight+gameIntHeight}`);

    if (bodyHeight < gameScrHeight+gameIntHeight) {
        // game screen is passed the device height
        // adjust the height to correct dimensions
        document.querySelector(".container").style.height = `${bodyHeight-gameIntHeight}px`;
        console.log(`New gamescreen height is: ${bodyHeight-gameIntHeight}px`);
    }

    scrollTo(0,document.querySelector(".game-panel").scrollHeight);
}

const ufoClicked = (event) => {
    ufoClick = event.target;
    console.log(`Ufo #${ufoClick.id} was clicked.`);

    // Move ufo to the clicked UFO's column
    columnNo = parseInt(ufoClick.id);
    cannon.style.gridColumn=columnNo;

    // Shoot selected UFO
    processShootSpaceship();
}

for (let i = 0; i < ufos.length; i++) {
    ufos[i].addEventListener("click", ufoClicked);
}

// Calculate ufo and cannon dimensions based on screen width
const container = document.querySelector(".container");
if (container.clientHeight < 400) {
    alert(`Screen height is not enough to play this game (height=${container.clientHeight}px).\nSwith to portrait mode.`);
}

if (container.clientWidth < 800) {
    // Make any adjustment to the game screen height
    adjustGameHeight();
 
    const ufoWidth = Math.floor((container.clientWidth-8) / 5);
    const ufoHeight = Math.floor(ufoWidth/2)
    console.log(`UFO width: ${ufoWidth}, Ufo height: ${ufoHeight}`);

    const smallUFOs = document.querySelectorAll(".spaceships");
    for (let i = 0; i < smallUFOs.length; i++) {
        smallUFOs[i].style.width = `${ufoWidth}px`;
        smallUFOs[i].style.height = `${ufoHeight}px`;
    }

    const smallCannon = document.getElementById("cannon");
    smallCannon.style.height = `${ufoHeight*2}px`;
    smallCannon.style.width = "100%";

    const gPanel = document.querySelector(".game-panel");
    gPanel.style.width = container.offsetWidth;

    // Re-adjust some of the game panel info
    document.getElementById("time-left").innerHTML = `Time left:&nbsp;<span id="time-left-value">90</span>s`;
    document.getElementById("hit-percent").innerHTML = `Hit ratio:&nbsp;<span id="hit-percent-value">0</span>%`;

    //alert("Set browser width to at least 800 pixel or maximize browser window");

}

const spaceshipBounds = document.querySelector(".spaceships").getBoundingClientRect();
const spaceshipHeight = spaceshipBounds.bottom - spaceshipBounds.top;

const cannon = document.getElementById("cannon");
const cannonBounds = cannon.getBoundingClientRect();
const cannonTop = cannonBounds.top;

console.log(`Cannon top: ${cannonTop} Spaceship height: ${spaceshipHeight}`);

const moveUfoDown = (spaceship, speed, index) => {

    ufoTimers.push(setInterval(()=>{
        let marginTop = spaceship.style.marginTop;
        
        marginTop = Number(marginTop.substring(0, marginTop.indexOf("px")));
        marginTop += speed;
        spaceship.style.marginTop = marginTop + "px";
    
        const ufoBounds = spaceship.getBoundingClientRect();

        const lasers = document.querySelectorAll(".lasers");
        //lasers[index].style.height = (cannonTop-ufoBounds.bottom) + "px";

        //console.log(`UFO top: ${ufoBounds.top} UFO bottom: ${ufoBounds.bottom} Next bottom: ${ufoBounds.bottom + spaceshipHeight}`)

        // MARK: Commented out, use spaceship bounds instead for comparison.
        //const cannonUpdatedBounds = document.getElementById("cannon").getBoundingClientRect();
        //if (cannonTop != cannonUpdatedBounds.top) {
        if (cannonTop <= ufoBounds.bottom) {
            // Halt movement of all spaceships
            stopAllSpaceships();
            // alert("collision detected!")


            gameSound.pause();

            if (checkIfSoundIsMuted() === false) {
                explodeSound.load()
                explodeSound.play()
            }

            // Clear contents of game-container
            gameContainer = document.querySelector(".container");
            gameContainer.innerHTML = `<h1>GAME OVER</h1>\
                                       <h2 style="color:lightgrey">YOU LOST!</h2>\
                                       <br>\
                                       <br>\
                                       <p style="color:lightgreen; font-size=1.5rem; font-weight=bolder">THE ALIENS WERE ABLE TO OVERRUN YOUR BASE</p>`;
            gameContainer.style.color = "black";
            gameContainer.style.justifyContent = "center";

            if (container.clientWidth >= 800) {
                gameContainer.style.height = "90vh"
            } else {
                adjustGameHeight();
                //gameContainer.style.height = "85vh"
            }
            
            gameContainer.style.fontSize = "1.25rem"
            gameContainer.style.display = "flex";
            gameContainer.style.flexBasis = "100%"
            gameContainer.style.flexDirection = "column";
            gameContainer.style.textAlign = "center"


            // stop timer since the game is now over
            clearInterval(gameTimer);
            gameOver = true;

        }
    }, movementInterval));
}

const moveSpaceShips = function() {
    console.log("ufos size: " + ufos.length);
    for (let i = 0; i < ufos.length; i++) {
        moveUfoDown(ufos[i], spaceshipSpeed[i], i);
    }
}

const stopAllSpaceships = () => {
    for (let i = 0; i < ufoTimers.length; i++) {
        clearInterval(ufoTimers[i]);
    }
}

const generateRandomSpeeds = () => {
    let speeds = gameInfo.difficulty === "easy" ? easySpeeds : hardSpeeds;

    // Empty speed array
    spaceshipSpeed.length = 0;    

    for (let i = 0; i < 5; i++) {
        const speed = Math.random() * (speeds.max-speeds.min) + speeds.min;
        spaceshipSpeed.push(Math.ceil(speed));
    }

    console.log("Random speeds generated.");
    console.log("spaceship speeds: " + spaceshipSpeed);
}

const checkIfUfoNumberExists = (first, second) => {
    let retVal = false;

    for (let i = 0; i < ufoFirstNum.length; i++) {
        if (ufoFirstNum[i] === first && ufoSecondNum[i] === second) {
            retVal = true;
            break;
        }
    }

    return retVal;
}

const generateUfoNumbersAndAnswer = () => {

    // Empty ufo numbers
    ufoFirstNum.length = 0;
    ufoSecondNum.length = 0;

    const ufoQuestions = document.querySelectorAll(".math-questions");

    for (let i = 0; i < 5; i++) {
        const firstNum = Math.floor(Math.random() * 25) + 1;
        const secondNum = Math.floor(Math.random() * 9) + 1;

        if (checkIfUfoNumberExists(firstNum, secondNum) === false) {
            ufoFirstNum.push(firstNum);
            ufoSecondNum.push(secondNum);
    
            console.log(`UFO #${i} equation: ${ufoFirstNum[i]} + ${ufoSecondNum[i]}`)
    
            // Update space with correct number
            //ufos[i].innerText = `${firstNum} + ${secondNum}`;    
            ufoQuestions[i].innerHTML = `${firstNum} + ${secondNum}`;    
        } else {
            console.log("Duplicate equation was generated! Retrying...")
            i--;
            continue;
        }
    }

    // Generate index for correct answer
    const correctAnswerIndex = Math.floor(Math.random() * 4);
    ufoCorrectAns = ufoFirstNum[correctAnswerIndex] + ufoSecondNum[correctAnswerIndex];
    console.log("Correct answer index: " + correctAnswerIndex + " Correct answer: " + ufoCorrectAns);

    // Update answer on cannon
    const answer = document.getElementById("cannon-data");
    answer.innerText = ufoCorrectAns;

}

const checkIfUFOIsHit = () => {
    // Check if selected ufo contains the right expression
    const first = ufoFirstNum[columnNo-1];
    const second = ufoSecondNum[columnNo-1];

    console.log(`Equation based on grid position: ${first} + ${second}. Grid position: ${columnNo}`)

    if (first + second === ufoCorrectAns) {
        console.log("It's a HIT!");
        return true;
    } else {
        console.log("It's a MISS!");
        return false;
    }
} 

const checkIfSoundIsMuted = ()=> {
    const mute = document.getElementById("mute-game");
    if (mute.classList.contains("mute-active")) {
        return true;
    } else {
        return false;
    }
}

const resetSpaceShipLocation = () => {
    margins = [0, 0, 0, 0 , 0];
    
    for (let i = 0; i < ufos.length; i++) {
        ufos[i].style.marginTop = "0px";
    }

    moveSpaceShips();
}

if (sessionStorage.hasOwnProperty("alienGameInfo")) {
    gameInfo = JSON.parse(sessionStorage.getItem("alienGameInfo"));

    // Check if we need to load a saved game or start the game from scratch
    if (gameInfo.gameLoaded === true) {

        // Check if saved game is available
        if (localStorage.hasOwnProperty("alienAdditionSaveData") === true) {
            // Load game data
            const loadSaveData = JSON.parse(localStorage.getItem("alienAdditionSaveData"));

            spaceshipSpeed.length = 0;
            ufoFirstNum.length = 0;
            ufoSecondNum.length = 0;

            // Load saved game
            for (let i = 0; i < 5; i++) {
                // Load all ufo speeds
                spaceshipSpeed.push(loadSaveData.speeds[i]);

                // Load all ufo margins
                ufos[i].style.marginTop = loadSaveData.marginTops[i];

                // Load all ufo math expressions
                ufoFirstNum.push(loadSaveData.ufoNumbers[i].first);
                ufoSecondNum.push(loadSaveData.ufoNumbers[i].second);
                ufos[i].innerText = `${ufoFirstNum[i]} + ${ufoSecondNum[i]}`

            }

            // Load correct answer
            ufoCorrectAns = loadSaveData.correctAnswer;
            cannon.innerText = ufoCorrectAns;

            // Load hits, misses to html
            hitCount = loadSaveData.hits;
            document.getElementById("hit-count-value").innerText = hitCount;
            missCount = loadSaveData.misses;
            document.getElementById("miss-count-value").innerText = missCount;

            // Load time remaining in html
            document.getElementById("time-left-value").innerText = loadSaveData.timeLeft;


            // Calculate and update hit percentage
            if (hitCount + missCount === 0) {
                hitPercentage = 0;
            } else {
                hitPercentage = (hitCount / (hitCount + missCount)) * 100;
                hitPercentage = hitPercentage.toFixed(1);
            }
            
            document.getElementById("hit-percent-value").innerText = hitPercentage;

            // Load mute status
            const mute = document.getElementById("mute-game");

            if (loadSaveData.muteActive === true) {
                mute.classList.add("mute-active");
                document.getElementById("mute-game-value").innerText = "YES";
            } else {
                mute.classList.remove("mute-active");
                document.getElementById("mute-game-value").innerText = "NO";
            }

            // Load time remaining
            timeLeft = loadSaveData.timeLeft;
            document.getElementById("time-left-value").innerText = timeLeft;

        } else {
            // No saved data. Proceed to player info
            document.location.href = "../index.html";
        }
        

    } else {
        // Game will be started from scratch

        // Generate random speeds to use for the spaceships
        generateRandomSpeeds();

        // Generate numbers for the ufos and the cannon
        generateUfoNumbersAndAnswer();
    }

} else {
    console.log("Game difficulty level not set. Restarting game.")
    document.location.href = "../index.html";
}

if (gameInfo === undefined) {
    document.location.href = "../index.html";
}

// Start moving the spaceships
moveSpaceShips();

let muteStatus = false;
// Check if there's a mute setting saved in the local storage
if (localStorage.hasOwnProperty("alienAudioMuted")) {
    // get mute status
    muteStatus = localStorage.getItem("alienAudioMuted");
}

if (muteStatus == "true") {
    document.getElementById("mute-game").classList.add("mute-active");
    gameSound.muted = true;
    document.getElementById("mute-game-value").innerText = "YES";
} else {
    document.getElementById("mute-game").classList.remove("mute-active");
    const promise = gameSound.play();
    if (promise !== undefined) {
        promise.then(_ => {
            // Autoplay started!
            autoplayPending = false;
        }).catch(error => {
            // Autoplay is being prevented by the browser.
            alert("Browser is preventing game music to be auto-played.\nPressing game control keys will correct this issue.");
            // Indicate that auto-play is not allow
            autoplayPending = true;
        });
    } 
    gameSound.muted = false;
    document.getElementById("mute-game-value").innerText = "NO";
}


// Load player name info and difficulty level
document.getElementById("player-name-value").innerText = gameInfo.name;
document.getElementById("difficulty-value").innerText = gameInfo.difficulty.toUpperCase();

// Start game timer
const gameTimer = setInterval(()=>{

    // decrement timer
    timeLeft--;

    if (timeLeft <= 0) {
        // Timer countdown has expired, that means the game is over.
        console.log("Timer has expired. Game over.")

        // stop timer
        clearInterval(gameTimer);
        stopAllSpaceships();


        gameSound.pause();

        if (checkIfSoundIsMuted() === false) {
            winSound.load()
            winSound.play()
        }

        // Game over since time has run out.
        // Clear contents of game-container
        gameContainer = document.querySelector(".container");
        gameContainer.innerHTML = `<h1>GAME OVER</h1>\
                                    <h2 style="color:lightgreen">CONGRATULATIONS!</h2>\
                                    <br>\
                                    <br>\
                                    <br>\
                                    <p style="color:lightgreen; font-weight=bold">YOU WERE ABLE TO COMPLETE THE GAME.</p>\
                                    <p style="color:white; font-weight=bold">CHECK DATA BELOW FOR YOUR SCORES.</p>`;
        gameContainer.style.color = "black";
        gameContainer.style.justifyContent = "center";
        if (container.clientWidth >= 800) {
            gameContainer.style.height = "90vh"
        } else {
            adjustGameHeight();
            //gameContainer.style.height = "85vh"
        }
        gameContainer.style.fontSize = "1.25rem"
        gameContainer.style.display = "flex";
        gameContainer.style.flexBasis = "100%"
        gameContainer.style.flexDirection = "column";
        gameContainer.style.textAlign = "center"
        
    } 

    // Update timer remaining
    document.getElementById("time-left-value").innerText = timeLeft;


}, 1000);

// Restart game click listener
document.getElementById("restart-game").addEventListener("click", ()=>{
    document.location.href = "../html/playerinfo.html";
})

// Save game click listener
document.getElementById("save-game").addEventListener("click", ()=>{
    console.log("Save game was clicked");

    if (timeLeft === 0 || gameOver === true) {
        console.log("Can't save a game when the game is over.")
        return;
    }

    let marginTopArray = [];
    for (let i = 0; i < ufos.length; i++) {
        marginTopArray.push(ufos[i].style.marginTop);
    }

    const mute = document.getElementById("mute-game");

    let muteActive = false;
    if (mute.classList.contains("mute-active")) {
        muteActive = true
    } 

    // Save the following: player's name, difficulty, current math expression and correct answer, hits, misses, time remaining
    const saveInfo = {"player" :gameInfo.name, "difficulty": gameInfo.difficulty,
                      "ufoNumbers":[{first: ufoFirstNum[0], second: ufoSecondNum[0]},
                                    {first: ufoFirstNum[1], second: ufoSecondNum[1]},
                                    {first: ufoFirstNum[2], second: ufoSecondNum[2]},
                                    {first: ufoFirstNum[3], second: ufoSecondNum[3]},
                                    {first: ufoFirstNum[4], second: ufoSecondNum[4]}],
                      "speeds": [spaceshipSpeed[0], spaceshipSpeed[1], spaceshipSpeed[2], spaceshipSpeed[3], spaceshipSpeed[4]],
                      "correctAnswer": ufoCorrectAns, "hits": hitCount, "misses": missCount, "timeLeft": timeLeft,
                      "marginTops": marginTopArray, "muteActive": muteActive};

    localStorage.setItem("alienAdditionSaveData", JSON.stringify(saveInfo));
    
    console.log("The following info was saved: " + saveInfo);

    document.getElementById("status-value").innerText = "Game was saved successfully."

})

// Mute game click listener
document.getElementById("mute-game").addEventListener("click", ()=>{
    console.log("Mute option was toggled");

    const mute = document.getElementById("mute-game");
    mute.classList.toggle("mute-active");

    if (mute.classList.contains("mute-active")) {
        document.getElementById("mute-game-value").innerText = "YES";
        gameSound.muted = true;
        explodeSound.pause();
        laserSound.pause();
        winSound.pause();
    } else {
        document.getElementById("mute-game-value").innerText = "NO";
        if (gameOver === false && timeLeft >= 0) {
            gameSound.play()
        }
        gameSound.muted = false;
    }

    localStorage.setItem("alienAudioMuted", gameSound.muted);
}
)

const checkAutoPlayMusic = () => {
    if (autoplayPending == true) {
        const mute = document.getElementById("mute-game");
        if (mute.classList.contains("mute-active") === false) {
            if (gameOver === false && timeLeft >= 0) {
                gameSound.play()
            }
            gameSound.muted = false;
        }
    }
}
// Key press listener to process cannon movements
document.addEventListener("keydown",(event)=>{    

    // Check if there's a need to process key presses.
    if (gameOver === true || timeLeft === 0) {
        return;
    }

    const statusMsg = document.getElementById("status-value").innerText;
    if (statusMsg !== "Press ARROW LEFT or RIGHT to move and SPACE to fire.") {
        document.getElementById("status-value").innerText = "Press ARROW LEFT or RIGHT to move and SPACE to fire.";
    }

    if(event.key=="ArrowRight")
    {
        console.log("Arrow Left key was pressed!");
        if(columnNo < 5) {
            columnNo+=1;
            cannon.style.gridColumn=columnNo;
        }

        // Check if music autoplay restriction needs to be corrected.
        checkAutoPlayMusic();
    }

    else if(event.key=="ArrowLeft")
    {
        console.log("Arrow Left key was pressed!");
        if (columnNo > 1) {
            columnNo-=1;
            cannon.style.gridColumn=columnNo;
        }
        // Check if music autoplay restriction needs to be corrected.
        checkAutoPlayMusic();
    }
    else if(event.key==" ")
    {
        console.log("SPACE key was pressed!");
        
        processShootSpaceship();

    }
    else
    {
        console.log("Key pressed is not a valid input!");
    }

});

const processShootSpaceship = () => {
    // Check if music autoplay restriction needs to be corrected.
    checkAutoPlayMusic();

    shootUFOWithLaser();

    if (checkIfUFOIsHit() === true) {
        stopAllSpaceships();
        resetSpaceShipLocation();
        
        // Update number of hits
        hitCount++;
        // Update hit count display
        document.getElementById("hit-count-value").innerText = hitCount;

    } else {
        missCount++;
        // Update hit count display
        document.getElementById("miss-count-value").innerText = missCount;
    }

    // Update percentage hit
    hitPercentage = (hitCount / (hitCount + missCount)) * 100;
    hitPercentage = hitPercentage.toFixed(1);

    if (hitPercentage < 0.1) {
        // Update percent hit value
        document.getElementById("hit-percent-value").innerText = 0;
    } else if (hitPercentage >= 100) {
        // Update percent hit value
        document.getElementById("hit-percent-value").innerText = 100;
    } 
    else {
        // Update percent hit value
        document.getElementById("hit-percent-value").innerText = hitPercentage;
    }

    

    console.log(`Hit percentage: ${hitPercentage}%`);

    // // By default, always change speed and equations when cannon is fired.
    // generateRandomSpeeds();
    // generateUfoNumbersAndAnswer();
}

const shootUFOWithLaser = () => {
    //stopAllSpaceships();

    if (checkIfSoundIsMuted() === false) {
        laserSound.load()
        laserSound.play()
    }

    //const lasers = document.querySelectorAll(".laser-line");
    const ufoBounds = document.querySelectorAll(".spaceships");
    // lasers[columnNo-1].innerHTML = "&nbsp";
    // lasers[columnNo-1].style.height = cannonTop - ufoBounds[columnNo-1];
    const ufoTarget = ufoBounds[columnNo-1];
    const targetBounds = ufoTarget.getBoundingClientRect();
    console.log("Target bound: ")
    console.log(targetBounds)

    const laser = document.getElementById("laser");
    laser.style.top = 0;
    
    if (container.clientWidth >= 800) {
        laser.style.left = `${targetBounds.right-76}px`;
    } else {
        laser.style.left = `${targetBounds.right-(ufos[0].offsetWidth/2)-1}px`;
    }
    laser.style.height = cannonTop+"px";
    laser.innerHTML = "&nbsp";
    // lasers[columnNo-1].innerHTML = "&nbsp";
    // lasers[columnNo-1].style.height = cannonTop - ufoBounds[columnNo-1];

    setTimeout(()=> {
        //lasers[columnNo-1].innerHTML = "";
        laser.innerHTML = "";
        //moveSpaceShips();
        // By default, always change speed and equations when cannon is fired.
        generateRandomSpeeds();
        generateUfoNumbersAndAnswer();

    }, 100);

}






