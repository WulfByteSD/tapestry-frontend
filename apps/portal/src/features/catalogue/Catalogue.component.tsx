import Link from 'next/link';
import { CatalogueArt, CatalogueBackdrop } from './CatalogueArt.component';
import { CatalogueGallery } from './CatalogueGallery.component';
import { catalogueHref, catalogueKinds, kindLabel, productClassification, productPrice, type CataloguePage, type CatalogueProduct } from './Catalogue.api';
import styles from './Catalogue.module.scss';

export function Catalogue({ products, page, pages, total, query }: CataloguePage) {
  const filtered = Boolean(query.q || query.kind);
  return <main className={styles.page}><div className={styles.inner}>
    <header className={styles.intro}><p className={styles.kicker}>The Tapestry catalogue</p><h1>Find your<br /><em>next story.</em></h1>
      <p>Books, adventures and tools for your table. Explore what each title brings to your game.</p>
      <Link href="/resources#collection">Explore the current public downloads <span aria-hidden="true">↗</span></Link></header>
    <form action="/shop" method="get" role="search" aria-label="Search the catalogue" className={styles.search} key={query.q + ':' + query.kind}>
      <div><label htmlFor="catalogue-search">Search titles, descriptions and tags</label><input id="catalogue-search" name="q" type="search" maxLength={120} defaultValue={query.q} placeholder="Find a book, map or something for your table…" /></div>
      <div><label htmlFor="catalogue-kind">Category</label><select id="catalogue-kind" name="kind" defaultValue={query.kind}><option value="">All categories</option>{catalogueKinds.map(kind => <option key={kind} value={kind}>{kindLabel(kind)}</option>)}</select></div>
      <button type="submit">Search catalogue</button>
    </form>
    <div className={styles.results}><p id="catalogue-list" role="status">{total} {total === 1 ? 'product' : 'products'}{query.kind ? ' · ' + kindLabel(query.kind) : ''}{query.q ? ' matching “' + query.q + '”' : ''}</p>{filtered ? <Link href="/shop">Clear search and filters</Link> : null}</div>
    {products.length ? <ol className={styles.list} aria-labelledby="catalogue-list">{products.map(product => <li key={product.id} className={styles.row}>
      <CatalogueArt title={product.title} src={product.primaryImage} variant={product.productType === 'book' ? 'cover' : 'product'} /><div className={styles.copy}><p className={styles.kicker}>{productClassification(product)}</p>
        <h2><Link href={'/product/' + product.slug} title={product.title}>{product.title}</Link></h2>{product.subtitle ? <p className={styles.subtitle}>{product.subtitle}</p> : null}
        {product.summary ? <p>{product.summary}</p> : null}<p className={styles.price}>{productPrice(product)} <span className={styles.account}>· Account required for acquisition</span></p>
        <Link className={styles.textLink} href={'/product/' + product.slug} aria-label={'Explore ' + product.title}>Explore product <span aria-hidden="true">↗</span></Link></div>
    </li>)}</ol> : <section className={styles.empty} aria-labelledby="catalogue-empty"><span className={styles.shelfMark} aria-hidden="true">T</span><div><h2 id="catalogue-empty">{filtered ? 'No matching products.' : 'The catalogue is waiting for its first titles.'}</h2>
      <p>{filtered ? 'Try another search or category. The public download shelf is also open to explore.' : 'No products are listed here yet. Explore the current public downloads for your next Tapestry session.'}</p>
      <Link className={styles.textLink} href="/resources#collection">Explore the free downloads <span aria-hidden="true">↗</span></Link></div></section>}
    {pages > 1 ? <nav className={styles.pagination} aria-label="Catalogue pages">{page > 1 ? <Link href={catalogueHref(query, page - 1)}>Previous page</Link> : <span />}
      <span aria-current="page">Page {page} of {pages}</span>{page < pages ? <Link href={catalogueHref(query, page + 1)}>Next page</Link> : null}</nav> : null}
  </div></main>;
}
export function ProductShowcase({ product }: { product: CatalogueProduct }) {
  const immersive = product.productType === 'book' && Boolean(product.banner?.trim());
  return <main className={immersive ? `${styles.page} ${styles.immersive}` : styles.page}>
    {immersive ? <CatalogueBackdrop key={product.banner} src={product.banner!} /> : null}
    <div className={immersive ? `${styles.inner} ${styles.readingSurface}` : styles.inner}><Link className={styles.back} href="/shop">← Back to the catalogue</Link>
    <article>{product.banner && !immersive ? <div className={styles.marketing}><CatalogueArt variant="marketing" title={product.title} src={product.banner} alt={product.title + ' promotional artwork'} /></div> : null}
      <div className={product.productType === 'book' ? styles.detail : `${styles.detail} ${styles.productDetail}`}><CatalogueArt title={product.title} src={product.primaryImage} variant={product.productType === 'book' ? 'cover' : 'product'} /><div className={styles.copy}>
      <p className={styles.kicker}>{productClassification(product)}</p><h1>{product.title}</h1>
      {product.subtitle ? <p className={styles.subtitle}>{product.subtitle}</p> : null}{product.summary ? <p>{product.summary}</p> : null}<p className={styles.price}>{productPrice(product)}</p>
      <section className={styles.acquisition} aria-labelledby="acquisition-title"><h2 id="acquisition-title">{product.format === 'digital' ? 'For your library' : 'For your table'}</h2>
        <p>Acquisition is not available from this catalogue yet. An account will be required.</p>
        {product.format !== 'digital' ? <p>This product includes a physical item. Ordering and delivery details are not available here yet.</p> : null}
        <Link href="/resources#collection">Explore the current public downloads</Link></section></div></div>
      {product.description ? <section className={styles.description} aria-labelledby="about-book"><p className={styles.kicker}>A closer look</p><h2 id="about-book">About {product.title}</h2><p>{product.description}</p></section> : null}
      {product.gallery.length ? <CatalogueGallery key={product.id} title={product.title} images={product.gallery} /> : null}
    </article></div></main>;
}
export function CatalogueLoading() { return <main className={styles.page}><div className={styles.inner}><p className={styles.kicker}>The Tapestry catalogue</p><h1>Opening the catalogue.</h1><p role="status">Finding the published products.</p></div></main>; }
export function ProductUnavailable() { return <main className={styles.page}><div className={styles.inner}><p className={styles.kicker}>The Tapestry catalogue</p><h1>This title is not available.</h1><p>It may not be published, or its catalogue address may have changed.</p><Link className={styles.textLink} href="/shop">Explore the catalogue</Link></div></main>; }
