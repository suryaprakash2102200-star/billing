import { Suspense } from 'react';
import NewInvoiceForm from './NewInvoiceForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
            <NewInvoiceForm />
        </Suspense>
    );
}
