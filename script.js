document.addEventListener("DOMContentLoaded", function () {
  // Inicializar todos los carruseles
  document.querySelectorAll(".project-carousel").forEach((carousel) => {
    const carouselId = carousel.id.replace("carousel-", "");
    const container = carousel.querySelector(".carousel-container");
    const images = carousel.querySelectorAll(".carousel-container img");
    const prevBtn = carousel.querySelector(
      `.prev[data-carousel="${carouselId}"]`
    );
    const nextBtn = carousel.querySelector(
      `.next[data-carousel="${carouselId}"]`
    );
    let currentIndex = 0;
    let isAnimating = false;

    // Mostrar la primera imagen
    images[currentIndex].classList.add("active");

    // Función para cambiar de imagen
    function changeImage(direction) {
      if (isAnimating) return;

      isAnimating = true;

      // Ocultar imagen actual
      images[currentIndex].classList.remove("active");

      // Calcular nuevo índice
      currentIndex = (currentIndex + direction + images.length) % images.length;

      // Mostrar nueva imagen
      images[currentIndex].classList.add("active");

      // Resetear flag de animación
      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }

    // Event listeners para los botones
    prevBtn.addEventListener("click", () => changeImage(-1));
    nextBtn.addEventListener("click", () => changeImage(1));

    // Navegación con teclado (solo para el carrusel que tiene el foco)
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        changeImage(-1);
      } else if (e.key === "ArrowRight") {
        changeImage(1);
      }
    });
  });
  
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 45,
          density: {
            enable: true,
            value_area: 1000,
          },
        },
        color: {
          value: "#A0522D",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 0.8,
            opacity_min: 0.08,
            sync: false,
          },
        },
        size: {
          value: 2,
          random: true,
          anim: {
            enable: true,
            speed: 1.5,
            size_min: 0.3,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 180,
          color: "#C5B08D",
          opacity: 0.2,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1,
            },
          },
          push: {
            particles_nb: 4,
          },
        },
      },
      retina_detect: true,
    });
  }

  // Selección de elementos con verificación
  const elements = {
    darkModeToggle: document.getElementById("darkModeToggle"),
    menuToggle: document.querySelector(".menu-toggle"),
    navbar: document.querySelector(".navbar"),
    fabButton: document.querySelector(".fab-button"),
    contactForm: document.getElementById("contactForm"),
    yearElement: document.getElementById("year"),
  };

  // ==================== DARK MODE ====================
  if (elements.darkModeToggle) {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let currentTheme =
      localStorage.getItem("theme") ||
      (prefersDarkScheme.matches ? "dark" : "light");

    if (currentTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    }

    elements.darkModeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");

      if (currentTheme === "dark") {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }

      // Animación del botón
      elements.darkModeToggle.style.transform = "scale(0.9)";
      setTimeout(() => {
        elements.darkModeToggle.style.transform = "scale(1.1)";
      }, 100);
    });

    prefersDarkScheme.addListener((e) => {
      if (!localStorage.getItem("theme")) {
        document.body.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    });
  }

  // ==================== MENÚ MÓVIL ====================
  const menuToggle = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");

  if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navbar.classList.toggle("active");
    });

    document.querySelectorAll(".navbar a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navbar.classList.remove("active");
      });
    });
  }

  // ==================== SCROLL SUAVE ====================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        history.pushState(null, null, targetId);
      }
    });
  });

  // ==================== FLOATING ACTION BUTTON ====================
  if (elements.fabButton) {
    function toggleFab() {
      if (window.scrollY > 300) {
        elements.fabButton.classList.add("visible");
      } else {
        elements.fabButton.classList.remove("visible");
      }
    }

    toggleFab();
    window.addEventListener("scroll", toggleFab);
  }

  // ==================== ANIMACIONES AL SCROLL ====================
  function checkScroll() {
    const triggerBottom = (window.innerHeight / 5) * 4;

    document.querySelectorAll(".timeline-item").forEach((item) => {
      if (item.getBoundingClientRect().top < triggerBottom) {
        item.classList.add("visible");
      }
    });

    document.querySelectorAll(".project-card").forEach((card) => {
      if (card.getBoundingClientRect().top < triggerBottom) {
        card.classList.add("visible");
      }
    });
  }

  window.addEventListener("load", checkScroll);
  window.addEventListener("scroll", checkScroll);

  // ==================== REVEAL ON SCROLL (Intersection Observer) ====================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

  document
    .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-stagger")
    .forEach((el) => revealObserver.observe(el));

  // ==================== FORMULARIO DE CONTACTO ====================
  if (elements.contactForm) {
    elements.contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Gracias por tu mensaje. Me pondré en contacto contigo pronto.");
      this.reset();
    });
  }

  // ==================== SEO: TÍTULO DINÁMICO ====================
  let originalTitle = document.title;
  let isTabActive = true;

  window.addEventListener("blur", () => {
    isTabActive = false;
    document.title = "¡Contrátame! | Mauricio González";
  });

  window.addEventListener("focus", () => {
    isTabActive = true;
    document.title = originalTitle;
  });

  // ==================== ACTUALIZAR AÑO FOOTER ====================
  if (elements.yearElement) {
    elements.yearElement.textContent = new Date().getFullYear();
  }

  // ==================== DETECCIÓN DE ERRORES ====================
  console.log("Portafolio cargado correctamente");
});
