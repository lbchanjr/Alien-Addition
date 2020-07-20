// if (localStorage.hasOwnProperty("alienAudioMuted")) {
//     const audioIsMuted = localStorage.getItem("alienAudioMuted");
//     if (audioIsMuted == "false") {
//         document.getElementById("audio-menu").play()
//     }

// }

document.querySelector("#start-game").addEventListener("click", ()=>{

    // Check if name field is empty
    const name = document.querySelector("#player-name").value;
    if (name === undefined || name.trim() === "") {
        alert("Player name should not be left empty!");
    } else {
        const difficulty = document.querySelector("#difficulty-select");
        const level = difficulty.options[difficulty.selectedIndex].value;

        const gameInfo = {"name": name, "difficulty":level, "gameLoaded": false};

        sessionStorage.setItem("alienGameInfo", JSON.stringify(gameInfo));
        
        document.location.href = "../html/alienmath.html";
    }
})