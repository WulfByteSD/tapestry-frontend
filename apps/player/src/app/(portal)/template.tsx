import PageTransition from "@/components/pageTransition/PageTransition.component";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
