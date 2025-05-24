// src/app/services/page.tsx
import { adminDb } from '@/lib/firebase/admin'; // Use admin SDK for server-side
import ServiceCard from './book/components/ServiceCard';

// Define the Service type according to your Firestore document structure
type Service = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  // Add other fields as needed
};

async function getServices(): Promise<Service[]> {
  const servicesRef = adminDb.collection('services');
  const snapshot = await servicesRef.get();
  const services = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
  return services;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1>Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service: any) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}