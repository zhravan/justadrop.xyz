import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNgo } from '@/contexts/NgoContext';
import { toast } from 'sonner';
import { uploadToStorage } from '@/lib/storage';

interface CreateOrganizationForm {
  orgName: string;
  type: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonNumber: string;
  description: string;
  website: string;
  causes: string[];
  registrationDoc: File | null;
  proofDoc: File | null;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

export function useCreateOrganization() {
  const router = useRouter();
  const { refetchOrgs } = useNgo();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateOrganizationForm>({
    orgName: '',
    type: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonNumber: '',
    description: '',
    website: '',
    causes: [],
    registrationDoc: null,
    proofDoc: null,
  });

  const toggleCause = (value: string) =>
    setForm((f) => ({
      ...f,
      causes: f.causes.includes(value) ? f.causes.filter((x) => x !== value) : [...f.causes, value],
    }));

  const getFormatFromFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg'].includes(ext)) return ext;
    if (ext === 'png') return 'png';
    return ext || 'bin';
  };

  const handleFileChange =
    (field: 'registrationDoc' | 'proofDoc') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            `File must be under 1 MB. ${file.name} is ${(file.size / 1024).toFixed(0)} KB.`
          );
          e.target.value = '';
          return;
        }
        setForm((f) => ({ ...f, [field]: file }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const documents: Array<{ documentType: string; documentAssetUrl: string; format: string }> =
        [];

      if (form.registrationDoc) {
        const { assetKey } = await uploadToStorage(form.registrationDoc, 'documents');
        documents.push({
          documentType: 'registration_certificate',
          documentAssetUrl: assetKey,
          format: getFormatFromFile(form.registrationDoc),
        });
      }
      if (form.proofDoc) {
        const { assetKey } = await uploadToStorage(form.proofDoc, 'documents');
        documents.push({
          documentType: 'proof_of_address',
          documentAssetUrl: assetKey,
          format: getFormatFromFile(form.proofDoc),
        });
      }

      const res = await fetch('/api/organizations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: form.orgName,
          description: form.description || undefined,
          causes: form.causes,
          website: form.website || undefined,
          registrationNumber: form.registrationNumber || undefined,
          contactPersonName: form.contactPersonName,
          contactPersonEmail: form.contactPersonEmail,
          contactPersonNumber: form.contactPersonNumber || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          country: 'India',
          ...(documents.length > 0 && { documents }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to create organization');
      toast.success('Organization created successfully');
      await refetchOrgs();
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    toggleCause,
    handleFileChange,
    handleSubmit,
    setForm,
  };
}
