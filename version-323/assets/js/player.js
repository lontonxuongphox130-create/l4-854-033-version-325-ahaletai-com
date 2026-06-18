(() => {
  const video = document.querySelector("[data-player-video]");
  const overlay = document.querySelector("[data-player-overlay]");
  const button = document.querySelector("[data-player-button]");

  if (!video || !overlay) {
    return;
  }

  const mediaUrl = video.getAttribute("data-url");
  let ready = false;
  let hlsInstance = null;

  const prepare = () => {
    if (ready || !mediaUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = mediaUrl;
    ready = true;
  };

  const start = () => {
    prepare();
    overlay.classList.add("is-hidden");
    video.controls = true;
    const played = video.play();

    if (played && typeof played.catch === "function") {
      played.catch(() => {
        overlay.classList.remove("is-hidden");
      });
    }
  };

  overlay.addEventListener("click", start);

  if (button) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener("play", () => {
    overlay.classList.add("is-hidden");
  });

  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
