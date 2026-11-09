/**
 * DEVORAQ – Premium Wedding Invitation Website
 * Justin Davis ❤️ Ashley Thankachan
 * JavaScript Logic & Interactivity
 */

/* ==========================================================================
   CONFIGURABLE SETTINGS
   ========================================================================== */
const CONFIG = {
  // Couple & Wedding Information
  GROOM_NAME: "Justin Davis",
  BRIDE_NAME: "Ashley Thankachan",
  COUPLE_LABEL: "Justin & Ashley",
  
  // Wedding Date & Time: 21 August 2027, 10:00 AM IST (Indian Standard Time: UTC+5:30)
  WEDDING_TARGET_ISO: "2027-08-21T10:00:00+05:30",
  
  // Venue
  VENUE_NAME: "Wedding Auditorium, Angamaly",
  VENUE_MAPS_QUERY: "Wedding Auditorium Angamaly Kerala",

  // RSVP WhatsApp Configuration
  // Note: Replace with the actual groom or bride's WhatsApp number with country code (e.g. 91 for India)
  WHATSAPP_RSVP_NUMBER: "919876543210",

  // Get current page URL for sharing
  getShareUrl: function () {
    const url = window.location.href.split('#')[0];
    return url.startsWith('file://') ? 'https://devoraq.com/wedding/justin-ashley' : url;
  }
};

/* ==========================================================================
   DOCUMENT READY INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initMusicPlayer();
  initPetalsCanvas();
  initCountdownTimer();
  initGalleryLightbox();
  initRSVPForm();
  initShareButtons();
  initScrollAnimations();
  initBackToTop();
  initCalendarSaver();
});

/* ==========================================================================
   1. ROMANTIC BACKGROUND MUSIC (HTML5 Audio + Web Audio Synth Fallback)
   ========================================================================== */
let audioPlaying = false;
let audioInstance = null;
let synthEngine = null;

function initMusicPlayer() {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  audioInstance = document.getElementById("bg-audio");
  const openInviteBtn = document.getElementById("open-invitation-btn");

  if (!musicToggleBtn) return;

  // Set gentle volume
  if (audioInstance) {
    audioInstance.volume = 0.55;
  }

  // Toggle button event
  musicToggleBtn.addEventListener("click", () => {
    toggleAudio();
  });

  // Start music smoothly when clicking "OPEN INVITATION" if not playing
  if (openInviteBtn) {
    openInviteBtn.addEventListener("click", () => {
      if (!audioPlaying) {
        startAudio();
      }
      const targetSection = document.getElementById("invitation");
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

function startAudio() {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  if (!audioInstance) return;

  const playPromise = audioInstance.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        audioPlaying = true;
        updateAudioButtonUI(true);
      })
      .catch((err) => {
        console.log("Direct audio playback blocked or restricted; using procedural harp synth fallback:", err);
        // Fallback to Web Audio API soothing ambient harp melody
        startWebAudioSynth();
        audioPlaying = true;
        updateAudioButtonUI(true);
      });
  }
}

function toggleAudio() {
  if (audioPlaying) {
    if (audioInstance) audioInstance.pause();
    if (synthEngine) synthEngine.stop();
    audioPlaying = false;
    updateAudioButtonUI(false);
  } else {
    startAudio();
  }
}

function updateAudioButtonUI(isPlaying) {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  if (!musicToggleBtn) return;

  if (isPlaying) {
    musicToggleBtn.classList.add("playing");
    musicToggleBtn.setAttribute("title", "Pause Romantic Music");
    musicToggleBtn.setAttribute("aria-label", "Pause Romantic Music");
  } else {
    musicToggleBtn.classList.remove("playing");
    musicToggleBtn.setAttribute("title", "Play Romantic Music");
    musicToggleBtn.setAttribute("aria-label", "Play Romantic Music");
  }
}

// Procedural Ambient Harp Synthesizer via Web Audio API (Guaranteed offline fallback)
function startWebAudioSynth() {
  if (synthEngine && synthEngine.active) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 440.0, 392.0, 329.63]; // C, E, G, B, C5, A, G, E
    let noteIdx = 0;
    let timerId = null;

    function playNote(freq) {
      if (!ctx || ctx.state === "closed") return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.9);
    }

    timerId = setInterval(() => {
      playNote(notes[noteIdx]);
      noteIdx = (noteIdx + 1) % notes.length;
    }, 750);

    synthEngine = {
      active: true,
      stop: function () {
        clearInterval(timerId);
        try { ctx.close(); } catch (e) {}
        this.active = false;
      }
    };
  } catch (e) {
    console.warn("Synth error:", e);
  }
}

/* ==========================================================================
   2. WEDDING COUNTDOWN TIMER (IST - UTC+5:30)
   ========================================================================== */
function initCountdownTimer() {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");
  const countdownGrid = document.querySelector(".countdown-grid");
  const finishedMsg = document.getElementById("countdown-finished-msg");

  const targetDate = new Date(CONFIG.WEDDING_TARGET_ISO).getTime();

  function updateTimer() {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      // Event has arrived or passed
      if (countdownGrid) countdownGrid.style.display = "none";
      if (finishedMsg) finishedMsg.style.display = "block";
      return;
    }

    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. GALLERY LIGHTBOX & NAVIGATION
   ========================================================================== */
const galleryImages = [
  {
    src: "assets/images/photo1.jpg",
    caption: "The Journey Begins – Justin & Ashley",
    alt: "Justin and Ashley smiling together on their journey"
  },
  {
    src: "assets/images/photo2.jpg",
    caption: "Walking Together Hand in Hand",
    alt: "Couple walking together happily outdoors"
  },
  {
    src: "assets/images/photo3.jpg",
    caption: "Laughter, Love & Pure Joy",
    alt: "Featured portrait of Justin and Ashley smiling"
  },
  {
    src: "assets/images/photo4.jpg",
    caption: "Rooted in Tradition, Bound in Love",
    alt: "Traditional Kerala celebration of love"
  }
];

let currentLightboxIndex = 0;

function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!lightbox) return;

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.getAttribute("data-index"), 10) || 0;
      openLightbox(idx);
    });
  });

  function openLightbox(index) {
    currentLightboxIndex = (index + galleryImages.length) % galleryImages.length;
    const imgData = galleryImages[currentLightboxIndex];

    lightboxImg.src = imgData.src;
    lightboxImg.alt = imgData.alt;
    lightboxCaption.textContent = imgData.caption;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showNext() {
    openLightbox(currentLightboxIndex + 1);
  }

  function showPrev() {
    openLightbox(currentLightboxIndex - 1);
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", showPrev);
  if (nextBtn) nextBtn.addEventListener("click", showNext);

  // Close on clicking backdrop
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        showNext(); // Swipe left
      } else {
        showPrev(); // Swipe right
      }
    }
  }
}

/* ==========================================================================
   4. INTERACTIVE RSVP FORM (WHATSAPP INTEGRATION)
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById("wedding-rsvp-form");
  const attendanceLabels = document.querySelectorAll(".attendance-label");

  if (!form) return;

  // Toggle selected radio style
  attendanceLabels.forEach((label) => {
    const radio = label.querySelector("input[type='radio']");
    radio.addEventListener("change", () => {
      attendanceLabels.forEach((l) => l.classList.remove("selected"));
      if (radio.checked) {
        label.classList.add("selected");
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("rsvp-name");
    const countSelect = document.getElementById("rsvp-count");
    const attendRadio = document.querySelector("input[name='attendance']:checked");
    const wishesInput = document.getElementById("rsvp-wishes");

    const name = nameInput ? nameInput.value.trim() : "";
    const count = countSelect ? countSelect.value : "1";
    const attendance = attendRadio ? attendRadio.value : "Yes";
    const wishes = wishesInput ? wishesInput.value.trim() : "";

    if (!name) {
      alert("Please enter your name to send your RSVP.");
      if (nameInput) nameInput.focus();
      return;
    }

    const attendStatus = attendance === "Yes" ? "✅ Joyfully Accept" : "❌ Regretfully Decline";

    let message = `✨ *WEDDING RSVP – ${CONFIG.COUPLE_LABEL}* ✨\n\n`;
    message += `👤 *Guest Name:* ${name}\n`;
    message += `💌 *Attending:* ${attendStatus}\n`;
    if (attendance === "Yes") {
      message += `👥 *Number of Guests:* ${count}\n`;
    }
    if (wishes) {
      message += `💐 *Wishes for Couple:* "${wishes}"\n`;
    }
    message += `\n📍 *Wedding:* 21 August 2027 | Angamaly, Kerala`;

    // Encode for WhatsApp URL
    const cleanNumber = CONFIG.WHATSAPP_RSVP_NUMBER.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  });
}

/* ==========================================================================
   5. SOCIAL SHARING & COPY LINK
   ========================================================================== */
function initShareButtons() {
  const shareWhatsApp = document.getElementById("share-whatsapp");
  const shareFacebook = document.getElementById("share-facebook");
  const shareCopy = document.getElementById("share-copy");
  const shareNative = document.getElementById("share-native");
  const toast = document.getElementById("toast-msg");

  const shareUrl = CONFIG.getShareUrl();
  const shareTitle = `${CONFIG.COUPLE_NAMES} – Wedding Invitation`;
  const shareText = `Together with our beloved families, you are cordially invited to celebrate the wedding of ${CONFIG.COUPLE_NAMES} on Saturday, 21 August 2027 at Wedding Auditorium, Angamaly, Kerala. View the digital invitation here:`;

  // WhatsApp Share
  if (shareWhatsApp) {
    shareWhatsApp.addEventListener("click", () => {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
      window.open(waUrl, "_blank");
    });
  }

  // Facebook Share
  if (shareFacebook) {
    shareFacebook.addEventListener("click", () => {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(fbUrl, "_blank");
    });
  }

  // Copy Link
  if (shareCopy) {
    shareCopy.addEventListener("click", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast("Invitation link copied to clipboard! ✨");
        }).catch(() => {
          fallbackCopyText(shareUrl);
        });
      } else {
        fallbackCopyText(shareUrl);
      }
    });
  }

  // Native Web Share API (Mobile phones)
  if (shareNative) {
    if (navigator.share) {
      shareNative.style.display = "inline-flex";
      shareNative.addEventListener("click", () => {
        navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        }).catch((err) => console.log("Share cancelled or failed", err));
      });
    } else {
      // Hide or fallback
      shareNative.style.display = "none";
    }
  }

  function fallbackCopyText(text) {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      showToast("Invitation link copied to clipboard! ✨");
    } catch (e) {
      prompt("Copy this wedding link:", text);
    }
    document.body.removeChild(input);
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
}

/* ==========================================================================
   6. ADD TO CALENDAR (GOOGLE CALENDAR & ICAL / .ICS DOWNLOAD)
   ========================================================================== */
function initCalendarSaver() {
  const saveCalBtn = document.getElementById("add-calendar-btn");
  if (!saveCalBtn) return;

  saveCalBtn.addEventListener("click", () => {
    // 21 August 2027, 10:00 AM IST (10:00 AM IST = 04:30 AM UTC)
    // End: 21 August 2027, 02:00 PM IST = 08:30 AM UTC
    const startTimeUtc = "20270821T043000Z";
    const endTimeUtc = "20270821T083000Z";
    const title = encodeURIComponent("Justin Davis & Ashley Thankachan Wedding Ceremony");
    const details = encodeURIComponent("Wedding ceremony and celebration of Justin Davis & Ashley Thankachan at Wedding Auditorium, Angamaly, Kerala.");
    const location = encodeURIComponent("Wedding Auditorium, Angamaly, Kerala");

    // Google Calendar direct web URL
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeUtc}/${endTimeUtc}&details=${details}&location=${location}`;

    // Prompt user to choose or open directly
    window.open(gCalUrl, "_blank");
  });
}

/* ==========================================================================
   7. FLOATING FLORAL & GOLDEN PETALS CANVAS ANIMATION
   ========================================================================== */
function initPetalsCanvas() {
  const canvas = document.getElementById("petals-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle configuration (Petals & Kasavu gold sparkles)
  const particleCount = window.innerWidth < 768 ? 22 : 45;
  const particles = [];

  const petalColors = [
    "rgba(255, 250, 240, 0.75)", // Jasmine cream white
    "rgba(254, 237, 177, 0.7)",  // Soft warm gold
    "rgba(230, 202, 133, 0.65)", // Champagne shimmer
    "rgba(212, 175, 55, 0.6)"    // Kerala kasavu gold
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 7 + 4,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: Math.random() * 0.9 + 0.6,
      angle: Math.random() * 360,
      spinSpeed: (Math.random() - 0.5) * 1.5,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      sway: Math.random() * 2 + 1,
      swayOffset: Math.random() * Math.PI * 2
    });
  }

  let animationFrameId;
  let tick = 0;

  function render() {
    tick += 0.02;
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.y += p.speedY;
      p.x += Math.sin(tick + p.swayOffset) * p.sway + p.speedX;
      p.angle += p.spinSpeed;

      // Wrap around screen
      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);

      // Draw petal shape
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(0, 0, p.size * 0.5, p.size, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Pause when tab not visible to save battery
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      render();
    }
  });

  render();
}

/* ==========================================================================
   8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".fade-up");

  if (!("IntersectionObserver" in window)) {
    // Fallback if browser doesn't support IntersectionObserver
    animatedElements.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   9. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top-btn");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 450) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
