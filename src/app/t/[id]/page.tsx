import { AppHeader } from '@/components/AppHeader';
import { IntakeForm } from '@/components/IntakeForm';

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl w-full px-4 py-10">
        <IntakeForm templateId={id} />
      </main>
    </>
  );
}
