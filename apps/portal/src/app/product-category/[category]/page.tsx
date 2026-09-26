type ProductCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function ProductCategoryPage({ params }: ProductCategoryPageProps) {
  const { category } = await params;

  return (
    <main aria-labelledby="product-category-title">
      <h1 id="product-category-title">Product Category: {category}</h1>
      <p>This product category route has been scaffolded. Full page content will be implemented later.</p>
    </main>
  );
}
