let currentSong = new Audio();
let songs = [];
let currentFolder = "songs";

const getSongs = async (folder) => {
    currentFolder = folder;
    songs = [];
    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songsData = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let fileName = element.href.split("/").pop().split("%5C").pop();
            let cleanName = decodeURIComponent(fileName).replace(".mp3", "");

            let songObj = {
                file: fileName,
                title: cleanName,
                artist: "Unknown Artist"
            };

            try {
                let res = await fetch(element.href);
                let blob = await res.blob();

                let tags = await new Promise((resolve, reject) => {
                    jsmediatags.read(blob, {
                        onSuccess: (tag) => resolve(tag.tags),
                        onError: (error) => reject(error)
                    });
                });

                if (tags.title) songObj.title = tags.title;
                if (tags.artist) songObj.artist = tags.artist;
            } catch (e) {
                console.error("Failed to read metadata for:", fileName, e);
            }

            songsData.push(songObj);
        }
    }
    return songsData;
}

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
};

const playMusic = (track) => {
    currentSong.src = `songs/${currentFolder}/${track}`;
    currentSong.play();

    let play = document.querySelector("#play");
    if (play) {
        play.src = "img/pause.svg";
        play.title = "Pause";
    }

    let songObj = songs.find(s => s.file === track);
    let cleanName = songObj ? songObj.title : track.replaceAll("%20", " ").replace(".mp3", "");
    document.querySelector(".songInfo").innerHTML = cleanName;
}

const main = async () => {

    const updateLibraryUI = async (folder) => {
        const mySongs = await getSongs(folder);
        songs = mySongs;
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        mySongs.forEach((song) => {
            let li = document.createElement("li");
            li.innerHTML = `
            <img src="img/music.svg" class="invert" alt="">
            <div class="info">
                <div class="songName">${song.title}</div>
                <div class="songArtist">${song.artist}</div>
            </div>
            <img src="img/player-play.svg" alt="" title="Play Now">
        `;

            li.addEventListener("click", () => {
                playMusic(song.file);
            });

            songUL.appendChild(li);
        });
    };

    const displayAlbums = async () => {
        let a = await fetch(`songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".card-container");
        cardContainer.innerHTML = "";

        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            let folder = e.href.split("/").filter(Boolean).pop();
            folder = folder.split("%5C").filter(Boolean).pop();

            if (folder && folder !== "songs" && folder !== ".." && !folder.includes(".")) {
                try {
                    let infoFetch = await fetch(`songs/${folder}/info.json`);
                    if (infoFetch.ok) {
                        let info = await infoFetch.json();
                        cardContainer.innerHTML += `
                            <div class="card" data-folder="${folder}">
                                <div class="imageContainer">
                                    <img src="songs/${folder}/cover.jpg" alt="${info.title}">
                                    <button class="play-button">
                                        <img src="img/play.svg" alt="Play">
                                    </button>
                                </div>
                                <h2>${info.title}</h2>
                                <p>${info.description}</p>
                            </div>
                        `;
                    }
                } catch (err) { }
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folderName = card.dataset.folder;
                await updateLibraryUI(folderName);
                if (songs.length > 0) playMusic(songs[0].file);
            });
        });
    }

    await displayAlbums();
    await updateLibraryUI("happy-hits");

    if (songs.length > 0) {
        currentSong.src = `songs/${currentFolder}/${songs[0].file}`;
        document.querySelector(".songInfo").innerHTML = songs[0].title;
    }

    let overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    document.querySelector(".burger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        overlay.classList.add("active");
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
        overlay.classList.remove("active");
    });

    let play = document.querySelector("#play");
    let seekbar = document.querySelector(".seekbar");

    if (play) {
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
                play.title = "Pause";
            }
            else {
                currentSong.pause();
                play.src = "img/player-play.svg";
                play.title = "Play";
            }
        })
    }

    seekbar.addEventListener("mousemove", (e) => {
        let rect = seekbar.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));

        let hoverTime = (currentSong.duration * percent) / 100;
        if (!isNaN(hoverTime)) {
            seekbar.title = formatTime(hoverTime);
        }
    });

    let isDragging = false;
    let wasPlayingBeforeDrag = false;

    const updateSeekbar = (e) => {
        let rect = seekbar.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));

        document.querySelector(".circle").style.left = percent + "%";
        seekbar.style.background = `linear-gradient(to right, white ${percent}%, #535353 ${percent}%)`;

        let targetTime = (currentSong.duration * percent) / 100;
        currentSong.currentTime = targetTime;
    };

    seekbar.addEventListener("mousedown", (e) => {
        isDragging = true;
        wasPlayingBeforeDrag = !currentSong.paused;
        if (wasPlayingBeforeDrag) {
            currentSong.pause();
        }
        updateSeekbar(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            updateSeekbar(e);
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            if (wasPlayingBeforeDrag) {
                currentSong.play();
                if (play) {
                    play.src = "img/pause.svg";
                    play.title = "Pause";
                }
            }
        }
    });

    currentSong.addEventListener("loadeddata", () => {
        let timeDiv = document.querySelector(".songTime");
        if (timeDiv) {
            timeDiv.innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        let timeDiv = document.querySelector(".songTime");
        if (timeDiv) {
            timeDiv.innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        }

        if (!isDragging && !isNaN(currentSong.duration)) {
            let percent = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            document.querySelector(".seekbar").style.background = `linear-gradient(to right, white ${percent}%, #535353 ${percent}%)`;
        }
    });

    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");
    let shuffleBtn = document.querySelector("#shuffle");
    let loopBtn = document.querySelector("#loop");

    let isShuffled = false;
    let isLooping = false;

    loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        currentSong.loop = isLooping;

        if (isLooping) {
            loopBtn.style.filter = "invert(0.5) sepia(1) saturate(5) hue-rotate(80deg)";
        } else {
            loopBtn.style.filter = "invert(1)";
        }
    });

    shuffleBtn.addEventListener("click", () => {
        isShuffled = !isShuffled;

        if (isShuffled) {
            shuffleBtn.style.filter = "invert(0.5) sepia(1) saturate(5) hue-rotate(80deg)";
        } else {
            shuffleBtn.style.filter = "invert(1)";
        }
    });

    previous.addEventListener("click", () => {
        let currentTrack = currentSong.src.split("/").pop();
        let index = songs.findIndex(s => s.file === currentTrack);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1].file);
        }
        else {
            playMusic(songs[songs.length - 1].file);
        }
    });

    next.addEventListener("click", () => {
        let currentTrack = currentSong.src.split("/").pop();
        let currentIndex = songs.findIndex(s => s.file === currentTrack);

        if (isShuffled) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * songs.length);
            } while (randomIndex === currentIndex && songs.length > 1);
            playMusic(songs[randomIndex].file);
        } else {
            if (currentIndex + 1 < songs.length) {
                playMusic(songs[currentIndex + 1].file);
            } else {
                playMusic(songs[0].file);
            }
        }
    });

    currentSong.addEventListener("ended", () => {
        if (!isLooping) {
            next.click();
        }
    });
};

main();