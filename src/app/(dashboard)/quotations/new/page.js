import { Suspense } from 'react';
import NewQuotationForm from './NewQuotationForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewQuotationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
            <NewQuotationForm />
        </Suspense>
    );
}
