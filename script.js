window.onload = async function loadVoices() {
  const select = document.getElementById("voiceSelect");

  try {
    const response = await fetch("https://api.murf.ai/v1/speech/voices", {
      method: "GET",
      headers: {
        "api-key": "Your-API-key" // your working API key
      }
    });

    const data = await response.json();
    console.log("Sample voice object:", data[0]);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Voice list is empty or malformed.");
    }

    select.innerHTML = ""; // Clear existing options

    data.forEach((voice) => {
      const option = document.createElement("option");

      const id = voice.voiceId;
      const name = voice.displayName;
      const lang = voice.displayLanguage;
      const accent = voice.accent;

      if (!id || !name || !lang) return;

      option.value = id;
      option.textContent = `${name} — ${lang} (${accent})`;
      select.appendChild(option);
    });
    
   


  } catch (err) {
    console.error("⚠️ Voice fetch failed:", err);
    select.innerHTML = "<option>Error loading voices</option>";
  }
};

async function generateAudio() {
  const player = document.getElementById("audioPlayer");
  const inputText = document.getElementById("inputText").value.trim();
  const voiceId = document.getElementById("voiceSelect").value;



  if (!inputText) {
    alert("Please enter some text to generate audio.");
    return;
  }

  if (!voiceId) {
    alert("Please select a voice.");
    return;
  }

  try {
    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": "Your-API-key",   // your working API key
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: inputText,
        voiceId: voiceId,
        format: "mp3"
      })
    });

    const data = await response.json();
    console.log("🎧 Murf API Response:", data);

    if (data.audioFile) {
      player.src = data.audioFile;
      player.play();
    } else {
      alert("Error generating audio.");
    }

  } catch (err) {
    console.error("Audio generation failed:", err);
    alert("Failed to generate audio. See console.");
  }
}

async function generatePlaylist() {
  const inputText = document.getElementById("inputText").value.trim();
  const voiceId = document.getElementById("voiceSelect").value;

  const playlistDiv = document.getElementById("playlistContainer");

  if (!inputText || !voiceId) {
    alert("Please enter text and select a voice.");
    return;
  }

  //  Split text by ~150 words (roughly 1 min of TTS audio)
  const words = inputText.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += 150) {
    chunks.push(words.slice(i, i + 150).join(" "));
  }

  playlistDiv.innerHTML = "<h3>🎶 Playlist</h3>";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": "Your-API-Key",  // your working API key
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: chunk,
        voiceId: voiceId,
        format: "mp3"
      })
    });

    const data = await response.json();

    if (data.audioFile) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = data.audioFile;

      const downloadLink = document.createElement("a");
      downloadLink.href = data.audioFile;
      downloadLink.download = `clip${i + 1}.mp3`;
      downloadLink.textContent = "⬇️ Download";
      downloadLink.style.marginLeft = "10px";

      const item = document.createElement("div");
      item.className = "track";
      item.innerHTML = `<strong>Part ${i + 1}:</strong>`;
      item.appendChild(audio);
      // item.appendChild(downloadLink);   // add if you want download link

      playlistDiv.appendChild(item);
    } else {
      const errorItem = document.createElement("p");
      errorItem.textContent = `❌ Failed to generate Part ${i + 1}`;
      playlistDiv.appendChild(errorItem);
    }
  }
}

function playAll() {
  const audioTags = document.querySelectorAll("#playlistContainer audio");
  if (audioTags.length === 0) return;

  let index = 0;

  const playNext = () => {
    if (index >= audioTags.length) return;
    const current = audioTags[index];
    current.play();
    current.onended = () => {
      index++;
      playNext();
    };
  };

  playNext();
}


