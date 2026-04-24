<script lang="ts">
  import { onMount } from 'svelte';

  const PARTICLES_CONFIG = {
    particles: {
      number: { value: 45, density: { enable: true, value_area: 1000 } },
      color: { value: '#A0522D' },
      shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
      opacity: {
        value: 0.3,
        random: true,
        anim: { enable: true, speed: 0.8, opacity_min: 0.08, sync: false },
      },
      size: {
        value: 2,
        random: true,
        anim: { enable: true, speed: 1.5, size_min: 0.3, sync: false },
      },
      line_linked: {
        enable: true,
        distance: 180,
        color: '#C5B08D',
        opacity: 0.2,
        width: 0.5,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: { enable: true, rotateX: 600, rotateY: 1200 },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  };

  onMount(() => {
    function init() {
      if (typeof window !== 'undefined' && (window as any).particlesJS) {
        (window as any).particlesJS('particles-js', PARTICLES_CONFIG);
      } else {
        setTimeout(init, 100);
      }
    }
    init();
  });
</script>

<div id="particles-js"></div>
