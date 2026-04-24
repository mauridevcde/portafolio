<script lang="ts">
  import type { Project } from '../../data/projects';

  export let projects: Project[] = [];

  let activeIndex = 0;
  let dragStartX = 0;
  let hasDragged = false;

  function goTo(index: number) {
    activeIndex = ((index % projects.length) + projects.length) % projects.length;
  }
  function prev() { goTo(activeIndex - 1); }
  function next() { goTo(activeIndex + 1); }

  function handleWrapperKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  }

  function onTrackDown(e: PointerEvent) {
    dragStartX = e.clientX;
    hasDragged = false;
  }

  function onTrackMove(e: PointerEvent) {
    if (dragStartX === 0) return;
    if (Math.abs(e.clientX - dragStartX) > 8) hasDragged = true;
  }

  function onTrackUp(e: PointerEvent) {
    if (dragStartX === 0) return;
    const dx = e.clientX - dragStartX;
    if (hasDragged && Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
    dragStartX = 0;
  }

  function onTrackLeave() {
    dragStartX = 0;
  }

  function onCardClick(e: MouseEvent) {
    if (hasDragged) {
      e.preventDefault();
      hasDragged = false;
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  class="showcase-outer"
  role="region"
  aria-label="Proyectos"
  tabindex="0"
  on:keydown={handleWrapperKey}
>
  <!-- Cards track — drag zone only, excludes nav buttons -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="cards-track"
    on:pointerdown={onTrackDown}
    on:pointermove={onTrackMove}
    on:pointerup={onTrackUp}
    on:pointerleave={onTrackLeave}
    on:pointercancel={onTrackLeave}
  >
    {#each projects as project, i}
      {@const n = projects.length}
      {@const d = ((i - activeIndex) % n + n) % n}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <a
        href="/proyectos/{project.slug}/"
        class="showcase-card"
        class:active={d === 0}
        class:adjacent={d === 1 || d === n - 1}
        class:adj-left={d === n - 1}
        class:adj-right={d === 1}
        on:click={onCardClick}
        style="--card-gradient: {project.gradient}"
        aria-label="Ver proyecto {project.title}"
        draggable="false"
      >
        <div class="card-gradient-bar"></div>
        <div class="card-header">
          <span class="cat-badge">{project.category}</span>
          <span class="status-chip" class:is-live={project.status === 'live'}>
            {project.status === 'live' ? '● Live' : '◌ En desarrollo'}
          </span>
        </div>
        <h3 class="card-title">{project.title}</h3>
        <p class="card-desc">{project.description}</p>
        <div class="card-tags">
          {#each project.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
        <div class="card-footer">
          <span class="footer-label">Ver Proyecto</span>
          <span class="footer-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </a>
    {/each}
  </div>

  <!-- Nav buttons are OUTSIDE the drag zone -->
  <button class="nav-btn prev-btn" on:click={prev} aria-label="Proyecto anterior" type="button">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <button class="nav-btn next-btn" on:click={next} aria-label="Siguiente proyecto" type="button">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
</div>

<!-- Dots -->
<div class="dots-row" role="tablist" aria-label="Seleccionar proyecto">
  {#each projects as project, i}
    <button
      class="dot"
      class:active={i === activeIndex}
      on:click={() => goTo(i)}
      role="tab"
      aria-selected={i === activeIndex}
      aria-label={project.title}
      type="button"
    ></button>
  {/each}
</div>

<style>
  /* ── Outer wrapper ──────────────────────────────── */
  .showcase-outer {
    position: relative;
    width: 100%;
    overflow: hidden;
    outline: none;
  }

  /* ── Drag track (full width, fixed height) ──────── */
  .cards-track {
    position: relative;
    width: 100%;
    height: 500px;
    cursor: grab;
    user-select: none;
  }
  .cards-track:active { cursor: grabbing; }

  /* ── Base card ──────────────────────────────────── */
  .showcase-card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 340px;
    height: 430px;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    overflow: hidden;

    background: var(--glass-bg, rgba(255, 255, 255, 0.65));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border, rgba(197, 176, 141, 0.25));

    /* Default: hidden/far */
    transform: translateX(-50%) translateY(-50%) scale(0.7);
    opacity: 0;
    pointer-events: none;
    z-index: 1;

    transition:
      transform 370ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 370ms ease,
      box-shadow 370ms ease,
      border-color 370ms ease;
  }

  /* ── Active card ────────────────────────────────── */
  .showcase-card.active {
    transform: translateX(-50%) translateY(-50%) scale(1);
    opacity: 1;
    pointer-events: auto;
    z-index: 3;
    border-color: rgba(160, 82, 45, 0.65);
    box-shadow:
      0 0 0 1px rgba(160, 82, 45, 0.3),
      0 0 48px rgba(160, 82, 45, 0.2),
      0 24px 64px rgba(0, 0, 0, 0.3);
  }

  /* ── Adjacent cards ─────────────────────────────── */
  .showcase-card.adjacent {
    opacity: 0.55;
    pointer-events: auto;
    z-index: 2;
  }

  .showcase-card.adj-left {
    transform: translateX(calc(-50% - 380px)) translateY(-50%) scale(0.85);
  }

  .showcase-card.adj-right {
    transform: translateX(calc(-50% + 380px)) translateY(-50%) scale(0.85);
  }

  /* ── Gradient accent bar ────────────────────────── */
  .card-gradient-bar {
    height: 4px;
    flex-shrink: 0;
    background: var(--card-gradient);
  }

  /* ── Card header ────────────────────────────────── */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px 10px;
    gap: 8px;
  }

  .cat-badge {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary-color);
    background: rgba(160, 82, 45, 0.1);
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid rgba(160, 82, 45, 0.22);
  }

  .status-chip {
    font-size: 0.67rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 20px;
    color: var(--text-light);
    background: rgba(100, 100, 100, 0.08);
    border: 1px solid rgba(100, 100, 100, 0.18);
  }

  .status-chip.is-live {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.28);
  }

  /* ── Card body ──────────────────────────────────── */
  .card-title {
    font-size: 1.55rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 10px;
    padding: 0 22px;
    color: var(--text-color);
  }

  .card-desc {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-light);
    padding: 0 22px;
    margin: 0 0 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding: 0 22px;
    margin-bottom: 18px;
  }

  .tag {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--primary-color);
    background: rgba(160, 82, 45, 0.07);
    border: 1px solid rgba(160, 82, 45, 0.18);
    padding: 3px 9px;
    border-radius: 20px;
  }

  /* ── Card footer / CTA ──────────────────────────── */
  .card-footer {
    margin-top: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 22px;
    border-top: 1px solid var(--glass-border, rgba(197, 176, 141, 0.15));
  }

  .footer-label {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--primary-color);
  }

  .footer-arrow {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(160, 82, 45, 0.08);
    border: 1px solid rgba(160, 82, 45, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    flex-shrink: 0;
    transition: background 200ms ease, transform 200ms ease, border-color 200ms ease;
  }

  .showcase-card:hover .footer-arrow {
    background: rgba(160, 82, 45, 0.18);
    border-color: rgba(160, 82, 45, 0.4);
    transform: translateX(3px);
  }

  .showcase-card.active .footer-arrow {
    background: rgba(160, 82, 45, 0.12);
  }

  /* ── Nav buttons ────────────────────────────────── */
  .nav-btn {
    position: absolute;
    top: 228px; /* (cards-track height 500px / 2) - (btn height 44px / 2) = 228 */
    z-index: 10;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--glass-border, rgba(197, 176, 141, 0.25));
    background: var(--glass-bg, rgba(255, 255, 255, 0.65));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 200ms ease, border-color 200ms ease, transform 150ms ease;
  }

  .nav-btn:hover {
    background: rgba(160, 82, 45, 0.14);
    border-color: rgba(160, 82, 45, 0.45);
    transform: scale(1.08);
  }

  .nav-btn:active { transform: scale(0.95); }

  .prev-btn { left: 10px; }
  .next-btn { right: 10px; }

  /* ── Dots ───────────────────────────────────────── */
  .dots-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 16px 0 4px;
  }

  .dot {
    height: 8px;
    width: 8px;
    border-radius: 4px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: var(--glass-border, rgba(197, 176, 141, 0.35));
    transition: width 260ms cubic-bezier(0.4, 0, 0.2, 1), background 260ms ease;
  }

  .dot.active {
    width: 28px;
    background: var(--primary-color);
  }

  /* ── Mobile ─────────────────────────────────────── */
  @media (max-width: 767px) {
    .cards-track { height: 450px; }

    .showcase-card {
      width: min(300px, 82vw);
      height: 400px;
    }

    .showcase-card.adjacent {
      opacity: 0;
      pointer-events: none;
    }

    .nav-btn { width: 38px; height: 38px; }
    .prev-btn { left: 4px; }
    .next-btn { right: 4px; }
  }

  /* ── Reduced motion ─────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .showcase-card,
    .footer-arrow,
    .nav-btn,
    .dot { transition: none; }
  }
</style>
