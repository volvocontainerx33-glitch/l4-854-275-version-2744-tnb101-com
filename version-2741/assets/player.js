function initVideoPlayer(streamUrl, elementId) {
  var root = document.getElementById(elementId);

  if (!root) {
    return;
  }

  var video = root.querySelector("video");
  var cover = root.querySelector(".player-cover");
  var button = root.querySelector(".player-button");
  var hls = null;

  function attach() {
    if (!video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      }
    }
  }

  function play() {
    attach();
    root.classList.add("is-playing");

    var started = video.play();

    if (started && typeof started.catch === "function") {
      started.catch(function () {
        root.classList.remove("is-playing");
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
}
