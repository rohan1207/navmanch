import CategoryPage from '@/src/pages/CategoryPage';

export default function CategoryPageRoute({ params }) {
  return <CategoryPage categoryId={params.categoryId} />;
}

