const { spawn } = require("node:child_process");
const fs = require("fs");

const songsPath = "./songs";
const songs = fs.readdirSync(songsPath).filter((song) => song.endsWith(".mp3"));

let selected = 0;
let childProcess = null;

function showSongs(status = "") {
    console.clear();

    console.log("🎵 Welcome to the Music Player 🎵\n");

    for (let i = 0; i < songs.length; i++) {
        if (i === selected) {
            console.log(`> ${i + 1}: ${songs[i]}`);
        } else {
            console.log(`  ${i + 1}: ${songs[i]}`);
        }
    }

    console.log("\n↑ ↓ Select | Enter Play | P Pause | R Resume | S Stop | Q Quit");

    if (status) {
        console.log(`\n${status}`);
    }
}

function play() {
    if (childProcess) {
        childProcess.kill();
    }

    childProcess = spawn("afplay", [`${songsPath}/${songs[selected]}`]);

    showSongs(`▶ Playing: ${songs[selected]}`);

    childProcess.on("close", () => {
        childProcess = null;
    });
}

function pause() {
    if (childProcess) {
        childProcess.kill("SIGSTOP");
        showSongs(`⏸ Paused: ${songs[selected]}`);
    }
}

function resume() {
    if (childProcess) {
        childProcess.kill("SIGCONT");
        showSongs(`▶ Resumed: ${songs[selected]}`);
    }
}

function stop() {
    if (childProcess) {
        childProcess.kill();
        childProcess = null;
        showSongs(`⏹ Stopped playback`);
    } else {
        showSongs(`⏹ No song is currently playing`);
    }
}

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);

process.stdin.on("data", (input) => {
    if (input === "q") {
        if (childProcess) {
            childProcess.kill();
        }
        process.stdin.setRawMode(false);
        process.exit(0);
    }

    if (input === "\r") {
        play();
    }

    if (input.toLowerCase() === "p") {
        pause();
    }

    if (input.toLowerCase() === "r") {
        resume();
    }

    if (input.toLowerCase() === "s") {
        stop();
    }

    if (input === "\x1b[A") {
        if (selected > 0) {
            selected--;
            showSongs();
        }
    }
    if (input === "\x1b[B") {
        if (selected < songs.length - 1) {
            selected++;
            showSongs();
        }
    }
});

showSongs();