(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var open = mobilePanel.hasAttribute("hidden");
                if (open) {
                    mobilePanel.removeAttribute("hidden");
                } else {
                    mobilePanel.setAttribute("hidden", "");
                }
                menuButton.setAttribute("aria-expanded", String(open));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function resetHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            startHero();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-target") || 0));
                resetHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                resetHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                resetHero();
            });
        }

        startHero();

        var searchInput = document.getElementById("site-search-input");
        var searchCards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
        var quickButtons = Array.prototype.slice.call(document.querySelectorAll("[data-quick]"));

        function applySearch(value) {
            var query = String(value || "").trim().toLowerCase();
            searchCards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                card.classList.toggle("is-hidden", Boolean(query) && haystack.indexOf(query) === -1);
            });
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            searchInput.value = q;
            applySearch(q);
            searchInput.addEventListener("input", function () {
                applySearch(searchInput.value);
            });
        }

        quickButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = button.getAttribute("data-quick") || "";
                    applySearch(searchInput.value);
                    searchInput.focus();
                }
            });
        });

        Array.prototype.slice.call(document.querySelectorAll(".video-box")).forEach(function (box) {
            var video = box.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var overlay = box.querySelector(".video-overlay");
            var src = source ? source.getAttribute("src") : "";
            var playerReady = false;

            function setupVideo() {
                if (!video || !src || playerReady) {
                    return;
                }
                playerReady = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else {
                    video.src = src;
                }
            }

            function playVideo() {
                if (!video) {
                    return;
                }
                setupVideo();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                });
            }
        });
    });
})();
