<script lang="ts">
  interface CarouselImage {
    src: string;
    webp: string;
    alt: string;
  }

  export let carouselId: string;
  export let images: CarouselImage[] = [];

  let currentIndex = 0;
  let isAnimating = false;

  function changeImage(direction: number) {
    if (isAnimating || images.length === 0) return;
    isAnimating = true;
    currentIndex = (currentIndex + direction + images.length) % images.length;
    setTimeout(() => { isAnimating = false; }, 500);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') changeImage(-1);
    else if (e.key === 'ArrowRight') changeImage(1);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="project-carousel"
  id="carousel-{carouselId}"
  on:keydown={handleKeydown}
  tabindex="0"
>
  <div class="carousel-container">
    {#each images as img, i}
      <picture>
        <source srcset={img.webp} type="image/webp" />
        <img
          src={img.src}
          alt={img.alt}
          class={i === currentIndex ? 'active' : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          width="1080"
          height="1080"
        />
      </picture>
    {/each}
  </div>
  <button class="carousel-btn prev" on:click={() => changeImage(-1)} aria-label="Imagen anterior">&#10094;</button>
  <button class="carousel-btn next" on:click={() => changeImage(1)} aria-label="Imagen siguiente">&#10095;</button>
</div>
