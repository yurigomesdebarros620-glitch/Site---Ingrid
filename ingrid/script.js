(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intro = document.querySelector("#intro");
  const startButton = document.querySelector("#startButton");
  const topbar = document.querySelector("#topbar");
  const pageProgress = document.querySelector("#pageProgress");
  const petalField = document.querySelector("#petalField");
  const sparkleCanvas = document.querySelector("#sparkleCanvas");
  const ctx = sparkleCanvas.getContext("2d");
  let started = false;

  function startExperience() {
    if (started) return;
    started = true;
    document.body.classList.add("has-started");
    intro.classList.add("is-leaving");
    setTimeout(() => {
      document.body.classList.remove("is-locked");
      intro.hidden = true;
      document.querySelector("#inicio").focus({ preventScroll: true });
    }, reducedMotion ? 20 : 1350);
  }

  startButton.addEventListener("click", startExperience);

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.13, rootMargin: "0px 0px -6%" },
  );
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 75, 225)}ms`);
    revealObserver.observe(element);
  });

  const messageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".message__line").forEach((line, index) => {
          setTimeout(() => line.classList.add("is-visible"), index * 280);
        });
        messageObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );
  messageObserver.observe(document.querySelector(".message__frame"));

  function createPetals() {
    const amount = window.innerWidth < 640 ? 10 : 18;
    petalField.replaceChildren();
    for (let i = 0; i < amount; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
      petal.style.setProperty("--spin", `${240 + Math.random() * 600}deg`);
      petal.style.animationDuration = `${11 + Math.random() * 13}s`;
      petal.style.animationDelay = `${-Math.random() * 18}s`;
      petal.style.transform = `scale(${0.6 + Math.random() * 0.7})`;
      petalField.appendChild(petal);
    }
  }
  if (!reducedMotion) createPetals();

  let sparkles = [];
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    sparkleCanvas.width = window.innerWidth * ratio;
    sparkleCanvas.height = window.innerHeight * ratio;
    sparkleCanvas.style.width = `${window.innerWidth}px`;
    sparkleCanvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = window.innerWidth < 640 ? 22 : 45;
    sparkles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 0.4 + Math.random() * 1.3,
      alpha: 0.15 + Math.random() * 0.55,
      speed: 0.002 + Math.random() * 0.006,
      offset: Math.random() * Math.PI * 2,
    }));
  }

  function drawSparkles(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sparkles.forEach((sparkle) => {
      const pulse = (Math.sin(time * sparkle.speed + sparkle.offset) + 1) / 2;
      ctx.beginPath();
      ctx.fillStyle = `rgba(237,108,165,${sparkle.alpha * pulse})`;
      ctx.arc(sparkle.x, sparkle.y, sparkle.radius * (0.6 + pulse), 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(drawSparkles);
  }
  if (!reducedMotion) {
    resizeCanvas();
    requestAnimationFrame(drawSparkles);
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".chapter-nav a")];
  const parallaxElements = [...document.querySelectorAll(".parallax")];
  const timeline = document.querySelector("#memoryTimeline");
  const timelineProgress = document.querySelector("#timelineProgress");

  function handleScroll() {
    const scrollY = window.scrollY;
    topbar.classList.toggle("is-scrolled", scrollY > 40);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    pageProgress.style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;

    if (!reducedMotion) {
      parallaxElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const speed = Number(element.dataset.speed || 0.1);
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const movement = (rect.top - window.innerHeight / 2) * speed;
          element.style.translate = `0 ${movement}px`;
        }
      });
    }

    const current = sections.reduce((active, section) => {
      return scrollY >= section.offsetTop - window.innerHeight * 0.4 ? section : active;
    }, sections[0]);
    navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${current.id}`));

    const timelineRect = timeline.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.55 - timelineRect.top) / timelineRect.height));
    timelineProgress.style.height = `${progress * 100}%`;
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (reducedMotion || window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
    });
  });

  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    });
  });

  const cursorDot = document.querySelector(".cursor--dot");
  const cursorRing = document.querySelector(".cursor--ring");
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  }
  if (!reducedMotion) requestAnimationFrame(animateCursor);
  document.querySelectorAll("a, button, [role='button'], .tilt-card").forEach((target) => {
    target.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
    target.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (reducedMotion) return;
      const rect = element.getBoundingClientRect();
      element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.1}px, ${(event.clientY - rect.top - rect.height / 2) * 0.1}px)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });

  const secretFlower = document.querySelector("#secretFlower");
  const secretModal = document.querySelector("#secretModal");
  const closeSecret = document.querySelector(".secret-modal__close");
  let secretClicks = 0;
  let secretTimer;
  function registerSecretClick() {
    secretClicks += 1;
    secretFlower.animate(
      [{ transform: "rotate(0) scale(1)" }, { transform: `rotate(${secretClicks % 2 ? 18 : -18}deg) scale(1.08)` }, { transform: "rotate(0) scale(1)" }],
      { duration: 320 },
    );
    clearTimeout(secretTimer);
    secretTimer = setTimeout(() => { secretClicks = 0; }, 1800);
    if (secretClicks >= 5) {
      secretClicks = 0;
      secretModal.classList.add("is-open");
      secretModal.setAttribute("aria-hidden", "false");
      closeSecret.focus();
      burstPetals();
    }
  }
  function closeSecretModal() {
    secretModal.classList.remove("is-open");
    secretModal.setAttribute("aria-hidden", "true");
    secretFlower.focus();
  }
  secretFlower.addEventListener("click", registerSecretClick);
  secretFlower.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      registerSecretClick();
    }
  });
  closeSecret.addEventListener("click", closeSecretModal);
  document.querySelector(".secret-modal__backdrop").addEventListener("click", closeSecretModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && secretModal.classList.contains("is-open")) closeSecretModal();
  });

  function burstPetals() {
    for (let i = 0; i < 24; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${35 + Math.random() * 30}%`;
      petal.style.setProperty("--drift", `${-200 + Math.random() * 400}px`);
      petal.style.setProperty("--spin", `${400 + Math.random() * 800}deg`);
      petal.style.animationDuration = `${3 + Math.random() * 3}s`;
      petalField.appendChild(petal);
      setTimeout(() => petal.remove(), 6500);
    }
  }

  const ambienceToggle = document.querySelector("#ambienceToggle");
  let audioContext;
  let ambienceNodes = [];
  let ambienceTimer;
  let ambienceOutput;

  function playRomanticNote(frequency, delay, duration, volume = 0.12, type = "triangle") {
    const oscillator = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const overtoneGain = audioContext.createGain();
    const now = audioContext.currentTime + delay;
    oscillator.type = type;
    overtone.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    overtone.frequency.setValueAtTime(frequency * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(volume * 0.32, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.12, now + 0.04);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.72);
    oscillator.connect(gain).connect(ambienceOutput);
    overtone.connect(overtoneGain).connect(ambienceOutput);
    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + duration + 0.05);
    overtone.stop(now + duration + 0.05);
    ambienceNodes.push(oscillator, overtone, gain, overtoneGain);
  }

  function scheduleRomanticMusic() {
    const beat = 0.72;
    const chords = [
      [261.63, 329.63, 392],
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [196, 246.94, 293.66],
    ];
    const melody = [
      659.25, 783.99, 880, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 659.25, 523.25, 493.88,
      440, 523.25, 659.25, 698.46, 659.25, 523.25,
      587.33, 659.25, 783.99, 880, 783.99, 659.25,
    ];

    chords.forEach((chord, chordIndex) => {
      const chordStart = chordIndex * beat * 6;
      [0, 1, 2, 1, 2, 1].forEach((noteIndex, step) => {
        playRomanticNote(chord[noteIndex], chordStart + step * beat, beat * 2.25, 0.055, "sine");
      });
      playRomanticNote(chord[0] / 2, chordStart, beat * 5.8, 0.035, "sine");
    });

    melody.forEach((frequency, index) => {
      const isPhraseEnd = (index + 1) % 6 === 0;
      playRomanticNote(frequency, index * beat, beat * (isPhraseEnd ? 2.4 : 1.45), 0.075);
    });
  }

  async function toggleAmbience() {
    const turningOn = !ambienceToggle.classList.contains("is-on");
    ambienceToggle.classList.toggle("is-on", turningOn);
    ambienceToggle.setAttribute("aria-pressed", String(turningOn));
    ambienceToggle.setAttribute("aria-label", turningOn ? "Desativar trilha romântica" : "Ativar trilha romântica");
    if (turningOn) {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      const master = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const delay = audioContext.createDelay(1);
      const echo = audioContext.createGain();
      master.gain.setValueAtTime(0.0001, audioContext.currentTime);
      master.gain.exponentialRampToValueAtTime(0.42, audioContext.currentTime + 1.5);
      filter.type = "lowpass";
      filter.frequency.value = 2600;
      filter.Q.value = 0.7;
      delay.delayTime.value = 0.28;
      echo.gain.value = 0.16;
      ambienceOutput = filter;
      filter.connect(master);
      filter.connect(delay);
      delay.connect(echo).connect(master);
      master.connect(audioContext.destination);
      ambienceNodes.push(master, filter, delay, echo);
      scheduleRomanticMusic();
      ambienceTimer = window.setInterval(scheduleRomanticMusic, 17300);
    } else {
      window.clearInterval(ambienceTimer);
      ambienceNodes.forEach((node) => {
        try { node.stop?.(); } catch (_) { /* already stopped */ }
        try { node.disconnect(); } catch (_) { /* already disconnected */ }
      });
      ambienceNodes = [];
    }
  }
  ambienceToggle.addEventListener("click", toggleAmbience);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!reducedMotion) {
        createPetals();
        resizeCanvas();
      }
    }, 180);
  });
})();
