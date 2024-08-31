const audio = document.getElementById("background-music");
const playPauseButton = document.getElementById("play-pause-button");
const playIcon = document.getElementById("play-music");
const pauseIcon = document.getElementById("pause-music");

let isPlaying = false;

function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
  } else {
    audio.play();
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
  }
  isPlaying = !isPlaying;
}

playPauseButton.addEventListener("click", togglePlayPause);

audio.addEventListener("ended", function () {
  audio.currentTime = 0;
  audio.play();
});

var swiper = new Swiper(".swiper", {
  direction: 'horizontal', // Ensure the slides move horizontally
  loop: true, // Enable looping for continuous sliding
  autoplay: {
    delay: 3000, // Delay between slides (in milliseconds)
    disableOnInteraction: false, // Keep autoplay even when user interacts with the slides
  },
  centeredSlides: true,
  slidesPerView: 'auto',
  spaceBetween: 10,
  speed: 1000,
  freeMode: false,
  grabCursor: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

particlesJS("particles-js", {
  particles: {
    number: {
      value: 180,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#fff",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: {
        enable: false,
        speed: 4,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 4,
      random: true,
      anim: {
        enable: true,
        speed: 2,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: false,
    },
    move: {
      enable: true,
      speed: 0.4,
      direction: "left", // Move particles from right to left
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  retina_detect: true,
});
