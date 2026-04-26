<script lang="ts">
  interface PostData {
    slug: string;
    title: string;
    description: string;
    tag: string;
    tagSlug: string;
    date: string;
    dateFormatted: string;
  }

  export let posts: PostData[] = [];

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'nestjs', label: 'NestJS' },
    { value: 'react', label: 'React' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'devops', label: 'DevOps' },
  ];

  let activeFilter = 'all';

  $: filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter((p) => p.tagSlug.toLowerCase().includes(activeFilter));
</script>

<div class="blog-filters reveal">
  {#each filterOptions as opt}
    <button
      class="blog-filter-btn"
      class:active={activeFilter === opt.value}
      data-filter={opt.value}
      on:click={() => (activeFilter = opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<div class="blog-articles-grid reveal-stagger">
  {#each filteredPosts as post}
    <article class="blog-article-card">
      <div class="blog-article-meta">
        <span class="blog-tag">{post.tag}</span>
        <time datetime={post.date}>{post.dateFormatted}</time>
      </div>
      <h2><a href={`/blog/${post.slug}/`}>{post.title}</a></h2>
      <p>{post.description}</p>
      <a href={`/blog/${post.slug}/`} class="blog-read-more">Leer artículo</a>
    </article>
  {/each}

  {#if filteredPosts.length === 0}
    <p class="blog-empty">No hay artículos en esta categoría aún.</p>
  {/if}
</div>

<style>
  .blog-tag {
    display: inline-block;
    background: var(--gradient-primary, linear-gradient(135deg, #A0522D 0%, #7c3aed 100%));
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.28rem 0.72rem;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .blog-read-more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0.38rem 1rem;
    border-radius: 20px;
    border: 1.5px solid rgba(160, 82, 45, 0.45);
    background: rgba(160, 82, 45, 0.06);
    color: var(--primary-color, #A0522D);
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition:
      background 0.22s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1)),
      color 0.22s ease,
      border-color 0.22s ease,
      transform 0.22s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    will-change: transform;
  }

  .blog-read-more::after {
    content: '→';
    display: inline-block;
    transition: transform 0.22s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
  }

  .blog-read-more:hover {
    background: var(--gradient-primary, linear-gradient(135deg, #A0522D 0%, #7c3aed 100%));
    color: #fff;
    border-color: transparent;
    transform: translateY(-2px);
  }

  .blog-read-more:hover::after {
    transform: translateX(4px);
  }

  :global([data-theme="dark"]) .blog-read-more {
    border-color: rgba(160, 82, 45, 0.5);
    background: rgba(160, 82, 45, 0.1);
    color: #C17A4E;
  }

  :global([data-theme="dark"]) .blog-read-more:hover {
    background: var(--gradient-primary, linear-gradient(135deg, #A0522D 0%, #7c3aed 100%));
    color: #fff;
    border-color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .blog-read-more,
    .blog-read-more::after {
      transition-duration: 0.01ms !important;
    }
  }
</style>
