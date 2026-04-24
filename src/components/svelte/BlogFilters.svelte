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
      <a href={`/blog/${post.slug}/`} class="blog-read-more">Leer artículo →</a>
    </article>
  {/each}

  {#if filteredPosts.length === 0}
    <p class="blog-empty">No hay artículos en esta categoría aún.</p>
  {/if}
</div>
