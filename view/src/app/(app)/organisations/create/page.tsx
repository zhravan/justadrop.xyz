'use client';

import { useRouter } from 'next/navigation';
import { Building2, Upload, FileText, MapPin, Mail, User, Globe, FileCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { LOCATIONS, VOLUNTEER_CAUSES } from '@/lib/constants';
import { cn } from '@/lib/common';
import { FormPageSkeleton } from '@/components/skeletons';
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  ChipGroup,
  FormActions,
} from '@/components/ui/form';
import { useCreateOrganization } from '@/hooks';

const ORG_TYPES = ['NGO', 'NPO', 'Trust', 'Foundation', 'Society'] as const;

export default function CreateOrganisationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isReady } = useAuth();
  const { form, submitting, toggleCause, handleFileChange, handleSubmit, setForm } =
    useCreateOrganization();

  if (!isReady || isLoading || !user) {
    return <FormPageSkeleton />;
  }

  if (!isAuthenticated) {
    router.replace('/login?redirect=/organisations/create');
    return null;
  }

  return (
    <div className="container max-w-2xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jad-mint text-jad-primary shadow-lg shadow-jad-primary/10">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-jad-foreground sm:text-3xl">
            Register your organisation
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            We&apos;ll verify your details before you can post opportunities.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection
          title="Basic information"
          description="Your organisation's legal and identity details"
          icon={<Building2 className="h-5 w-5" />}
        >
          <FormField label="Organisation name" htmlFor="orgName" required>
            <FormInput
              id="orgName"
              type="text"
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              placeholder="e.g. Ocean Guardians"
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Organisation type" htmlFor="type">
              <FormSelect
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Select type</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Registration number" htmlFor="registrationNumber">
              <FormInput
                id="registrationNumber"
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder="e.g. 80G/12345"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Focus causes"
          description="Which causes does your organisation work towards?"
          icon={<Globe className="h-5 w-5" />}
        >
          <ChipGroup options={VOLUNTEER_CAUSES} selected={form.causes} onChange={toggleCause} />
        </FormSection>

        <FormSection
          title="Address"
          description="Where is your organisation located?"
          icon={<MapPin className="h-5 w-5" />}
        >
          <FormField label="Street address" htmlFor="address" required>
            <FormInput
              id="address"
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="City" htmlFor="city">
              <FormSelect
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                <option value="">Select city</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="State" htmlFor="state">
              <FormInput
                id="state"
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="e.g. West Bengal"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Contact person"
          description="Primary contact for the organisation"
          icon={<User className="h-5 w-5" />}
        >
          <FormField label="Contact person" htmlFor="contactPersonName" required>
            <FormInput
              id="contactPersonName"
              type="text"
              value={form.contactPersonName}
              onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
          </FormField>
          <FormField label="Organisation email" htmlFor="contactPersonEmail" required>
            <FormInput
              id="contactPersonEmail"
              type="email"
              value={form.contactPersonEmail}
              onChange={(e) => setForm({ ...form, contactPersonEmail: e.target.value })}
              placeholder="contact@org.org"
              icon={<Mail className="h-5 w-5" />}
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="contactPersonNumber">
            <FormInput
              id="contactPersonNumber"
              type="tel"
              value={form.contactPersonNumber}
              onChange={(e) => setForm({ ...form, contactPersonNumber: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="About your organisation"
          description="Share your mission and impact"
          icon={<FileText className="h-5 w-5" />}
        >
          <FormField label="Website" htmlFor="website">
            <FormInput
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
            />
          </FormField>
          <FormField label="About" htmlFor="description">
            <FormTextarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Your mission, focus areas, and impact..."
              rows={4}
              maxLength={10000}
              showCount
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Documents"
          description="Verification documents (optional, max 1 MB each)"
          icon={<FileCheck className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Registration certificate">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-foreground/15 bg-white px-4 py-4 transition-all hover:border-jad-primary/30 hover:bg-jad-mint/20',
                  form.registrationDoc && 'border-jad-primary/40 bg-jad-mint/30'
                )}
              >
                <Upload className="h-5 w-5 text-jad-primary shrink-0" />
                <span className="text-sm text-foreground/80 truncate">
                  {form.registrationDoc?.name ?? 'Choose PDF (max 1 MB)'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange('registrationDoc')}
                  className="hidden"
                />
              </label>
            </FormField>
            <FormField label="Proof of address">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-foreground/15 bg-white px-4 py-4 transition-all hover:border-jad-primary/30 hover:bg-jad-mint/20',
                  form.proofDoc && 'border-jad-primary/40 bg-jad-mint/30'
                )}
              >
                <Upload className="h-5 w-5 text-jad-primary shrink-0" />
                <span className="text-sm text-foreground/80 truncate">
                  {form.proofDoc?.name ?? 'Choose PDF or image (max 1 MB)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange('proofDoc')}
                  className="hidden"
                />
              </label>
            </FormField>
          </div>
        </FormSection>

        <FormActions
          submitLabel="Submit for verification"
          secondaryLabel="Save draft"
          secondaryHref="/dashboard"
          loading={submitting}
          disabled={!form.orgName || !form.contactPersonName || !form.contactPersonEmail}
        />
      </form>
    </div>
  );
}
