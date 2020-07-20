// let audioIsMuted = true;

// // Set audio mute setting in the app
// const mute = document.getElementById("mute-game");
// mute.classList.add("mute-active");
// document.getElementById("mute-game-value").innerText = "YES"
// // Update localStorage
// localStorage.setItem("alienAudioMuted", audioIsMuted);


// const menuSound = document.getElementById("audio-menu");

// document.getElementById("mute-game").addEventListener("click", () => {
//     document.getElementById("mute-game").classList.toggle("mute-active");
//     if(document.getElementById("mute-game").classList.contains("mute-active")) {
//         audioIsMuted = true;
//         document.getElementById("mute-game-value").innerText = "YES"
//         menuSound.muted = true;
//     } else {
//         audioIsMuted = false;
//         document.getElementById("mute-game-value").innerText = "NO"
//         menuSound.play();
//         menuSound.muted = false;
//         menuSound.loop = true;
//     }

//     // Update localStorage
//     localStorage.setItem("alienAudioMuted", audioIsMuted);
// })

document.querySelector("#start").addEventListener("click", ()=>{
    document.location.href = "html/playerinfo.html"
})

document.querySelector("#rules").addEventListener("click", ()=>{
    document.location.href = "html/gamerules.html"
})

document.querySelector("#load").addEventListener("click", ()=>{

    if (localStorage.hasOwnProperty("alienAdditionSaveData") === true) {

        const loadedGameData = JSON.parse(localStorage.getItem("alienAdditionSaveData"));

        const gameInfo = {"name": loadedGameData.player, "difficulty":loadedGameData.difficulty, "gameLoaded": true};
        sessionStorage.setItem("alienGameInfo", JSON.stringify(gameInfo));
        
        alert("Saved game was loaded.");

        document.location.href = "html/alienmath.html";
    } else {
        alert("No saved game was found.\nStarting a new game.");
        document.location.href = "html/playerinfo.html"
    }

    
    
})
