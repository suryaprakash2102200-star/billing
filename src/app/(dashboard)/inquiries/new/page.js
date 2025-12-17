import { Suspense } from 'react';
import NewInquiryForm from './NewInquiryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewInquiryPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
            <NewInquiryForm />
        </Suspense>
    );
}
