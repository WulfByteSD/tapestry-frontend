type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <main aria-labelledby="product-title">
      <h1 id="product-title">Product: {slug}</h1>
      <p>This product detail route has been scaffolded. Full product content will be implemented later.</p>
    </main>
  );
}
