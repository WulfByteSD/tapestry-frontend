type UnwovenEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UnwovenEntryPage({ params }: UnwovenEntryPageProps) {
  const { slug } = await params;

  return (
    <main aria-labelledby="unwoven-entry-title">
      <h1 id="unwoven-entry-title">Unwoven: {slug}</h1>
      <p>This unwoven detail route has been scaffolded. Full page content will be implemented later.</p>
    </main>
  );
}
