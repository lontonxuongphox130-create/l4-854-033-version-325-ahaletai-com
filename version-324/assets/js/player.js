(function () {
    window.setupPlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var box = document.querySelector("[data-player-box]");
        var button = document.querySelector("[data-player-button]");
        var ready = false;
        var hls = null;

        if (!video || !box || !button || !source) {
            return;
        }

        function playVideo() {
            box.classList.add("is-playing");

            if (ready) {
                video.play().catch(function () {});
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                ready = true;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                ready = true;
                video.play().catch(function () {});
                return;
            }

            video.src = source;
            ready = true;
            video.play().catch(function () {});
        }

        button.addEventListener("click", playVideo);
        box.addEventListener("click", function (event) {
            if (event.target === video && !ready) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
