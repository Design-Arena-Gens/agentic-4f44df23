import dynamic from 'next/dynamic';

const TomatoExperience = dynamic(() => import('../components/TomatoExperience'), {
  ssr: false,
});

export default function Page() {
  return (
    <main className="page">
      <TomatoExperience />
    </main>
  );
}
