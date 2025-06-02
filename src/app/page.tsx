import { ServiceRegistrationForm } from '@/components/service-registration-form';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-background to-secondary/30">
      <ServiceRegistrationForm />
    </main>
  );
}
