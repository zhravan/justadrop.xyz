'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Award,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';
import { LOCATIONS, VOLUNTEER_CAUSES } from '@/lib/constants';
import { LocationMapPreview } from '@/components/map/LocationMapPreview';
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  ChipGroup,
  FormActions,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const OPPORTUNITY_MODES = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const OPPORTUNITY_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'JustADrop/1.0' } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function buildFullAddress(form: {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}): string {
  return [form.address, form.city, form.state, form.country || 'India']
    .filter(Boolean)
    .join(', ');
}

function toDateStr(d: string | Date | null): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

export default function EditOpportunityPage() {
  const params = useParams<{ id: string; oppId: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { organizations } = useNgo();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    causeCategoryNames: [] as string[],
    requiredSkills: [] as string[],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    opportunityMode: 'onsite' as 'onsite' | 'remote' | 'hybrid',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    address: '',
    city: '',
    state: '',
    country: 'India',
    contactName: '',
    contactEmail: '',
    contactPhoneNumber: '',
    stipendAmount: '',
    stipendDuration: '',
    isCertificateOffered: false,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const ngoId = params.id;
  const oppId = params.oppId;
  const org = organizations.find((o) => o.id === ngoId);

  useEffect(() => {
    if (!oppId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/opportunities/${oppId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const opp = data?.opportunity ?? data;
        if (opp) {
          setForm({
            title: opp.title ?? '',
            description: opp.description ?? '',
            causeCategoryNames: opp.causeCategoryNames ?? [],
            requiredSkills: opp.requiredSkills ?? [],
            startDate: toDateStr(opp.startDate),
            endDate: toDateStr(opp.endDate),
            startTime: opp.startTime ?? '',
            endTime: opp.endTime ?? '',
            opportunityMode: opp.opportunityMode ?? 'onsite',
            status: opp.status ?? 'draft',
            address: opp.address ?? '',
            city: opp.city ?? '',
            state: opp.state ?? '',
            country: opp.country ?? 'India',
            contactName: opp.contactName ?? '',
            contactEmail: opp.contactEmail ?? '',
            contactPhoneNumber: opp.contactPhoneNumber ?? '',
            stipendAmount: opp.stipendInfo?.amount != null ? String(opp.stipendInfo.amount) : '',
            stipendDuration: opp.stipendInfo?.duration ?? '',
            isCertificateOffered: opp.isCertificateOffered ?? false,
            latitude: opp.latitude ?? null,
            longitude: opp.longitude ?? null,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [oppId]);

  const toggleCause = (value: string) =>
    setForm((f) => ({
      ...f,
      causeCategoryNames: f.causeCategoryNames.includes(value)
        ? f.causeCategoryNames.filter((x) => x !== value)
        : [...f.causeCategoryNames, value],
    }));

  const handlePreviewLocation = useCallback(async () => {
    const addr = buildFullAddress(form);
    if (!addr.trim()) {
      toast.error('Enter address details to preview location');
      return;
    }
    setGeocoding(true);
    try {
      const result = await geocodeAddress(addr);
      if (result) {
        setForm((f) => ({ ...f, latitude: result.lat, longitude: result.lon }));
        toast.success('Location found');
      } else {
        toast.error('Could not find location. Try a more specific address.');
      }
    } catch {
      toast.error('Geocoding failed');
    } finally {
      setGeocoding(false);
    }
  }, [form.address, form.city, form.state, form.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        causeCategoryNames: form.causeCategoryNames,
        requiredSkills: form.requiredSkills,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        opportunityMode: form.opportunityMode,
        status: form.status,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhoneNumber: form.contactPhoneNumber || undefined,
        stipendInfo:
          form.stipendAmount || form.stipendDuration
            ? {
                amount: form.stipendAmount ? parseFloat(form.stipendAmount) : undefined,
                duration: form.stipendDuration || undefined,
              }
            : undefined,
        isCertificateOffered: form.isCertificateOffered,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      };
      const res = await fetch(`/api/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      const payload = data?.data ?? data;
      if (!res.ok) throw new Error(payload?.error ?? payload?.message ?? 'Failed to update opportunity');
      toast.success('Opportunity updated');
      router.push(`/organisations/${ngoId}/opportunities`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    router.replace('/login');
    return null;
  }

  if (!org) {
    return (
      <div className="container max-w-2xl">
        <p className="text-foreground/70">Organization not found.</p>
        <Link href="/organisations" className="mt-4 inline-flex items-center gap-2 text-jad-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to My NGOs
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-2xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl">
      <Link
        href={`/organisations/${ngoId}/opportunities`}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to opportunities
      </Link>

      <h1 className="text-2xl font-bold text-jad-foreground sm:text-3xl">
        Edit opportunity
      </h1>
      <p className="mt-1 text-foreground/70">
        Update opportunity for {org.orgName}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <FormSection
          title="Basic information"
          description="Title and description for volunteers"
          icon={<Calendar className="h-5 w-5" />}
        >
          <FormField label="Title" htmlFor="title" required>
            <FormInput
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Beach cleanup drive"
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="description" required>
            <FormTextarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will volunteers do?"
              rows={4}
              maxLength={10000}
              showCount
              required
            />
          </FormField>
          <FormField label="Causes" htmlFor="causes">
            <ChipGroup
              options={VOLUNTEER_CAUSES}
              selected={form.causeCategoryNames}
              onChange={toggleCause}
            />
          </FormField>
          <FormField label="Required skills">
            <FormInput
              value={form.requiredSkills.join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  requiredSkills: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. Teaching, Event coordination"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Schedule"
          description="When does this opportunity take place?"
          icon={<Calendar className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start date" htmlFor="startDate">
              <FormInput
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="End date" htmlFor="endDate">
              <FormInput
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start time" htmlFor="startTime">
              <FormInput
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </FormField>
            <FormField label="End time" htmlFor="endTime">
              <FormInput
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Mode" htmlFor="opportunityMode">
            <FormSelect
              id="opportunityMode"
              value={form.opportunityMode}
              onChange={(e) =>
                setForm({ ...form, opportunityMode: e.target.value as 'onsite' | 'remote' | 'hybrid' })
              }
            >
              {OPPORTUNITY_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </FormSection>

        <FormSection
          title="Location"
          description="Where will volunteers go?"
          icon={<MapPin className="h-5 w-5" />}
        >
          <FormField label="Address" htmlFor="address">
            <FormInput
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
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
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="e.g. West Bengal"
              />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePreviewLocation}
              disabled={geocoding || !form.address?.trim()}
              className="rounded-xl border border-jad-primary px-4 py-2 text-sm font-medium text-jad-primary hover:bg-jad-mint/30 disabled:opacity-50"
            >
              {geocoding ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Finding...
                </>
              ) : (
                'Preview location on map'
              )}
            </button>
          </div>
          <LocationMapPreview
            latitude={form.latitude}
            longitude={form.longitude}
            address={buildFullAddress(form) || undefined}
            height={200}
            showControls
          />
        </FormSection>

        <FormSection
          title="Contact"
          description="Who should volunteers reach out to?"
          icon={<User className="h-5 w-5" />}
        >
          <FormField label="Contact name" htmlFor="contactName" required>
            <FormInput
              id="contactName"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
          </FormField>
          <FormField label="Contact email" htmlFor="contactEmail" required>
            <FormInput
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="contact@org.org"
              required
            />
          </FormField>
          <FormField label="Contact phone" htmlFor="contactPhoneNumber">
            <FormInput
              id="contactPhoneNumber"
              type="tel"
              value={form.contactPhoneNumber}
              onChange={(e) => setForm({ ...form, contactPhoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Additional"
          description="Stipend and certificate"
          icon={<DollarSign className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Stipend amount (₹)" htmlFor="stipendAmount">
              <FormInput
                id="stipendAmount"
                type="number"
                min={0}
                step={0.01}
                value={form.stipendAmount}
                onChange={(e) => setForm({ ...form, stipendAmount: e.target.value })}
                placeholder="0"
              />
            </FormField>
            <FormField label="Stipend duration" htmlFor="stipendDuration">
              <FormInput
                id="stipendDuration"
                value={form.stipendDuration}
                onChange={(e) => setForm({ ...form, stipendDuration: e.target.value })}
                placeholder="e.g. Per day"
              />
            </FormField>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCertificateOffered"
              checked={form.isCertificateOffered}
              onChange={(e) => setForm({ ...form, isCertificateOffered: e.target.checked })}
              className="h-4 w-4 rounded border-foreground/20 text-jad-primary focus:ring-jad-primary"
            />
            <label htmlFor="isCertificateOffered" className="text-sm text-foreground">
              Certificate of participation offered
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Status"
          description="Update opportunity status"
          icon={<Award className="h-5 w-5" />}
        >
          <FormField label="Status" htmlFor="status">
            <FormSelect
              id="status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'draft' | 'active' | 'completed' | 'cancelled' })
              }
            >
              {OPPORTUNITY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </FormSection>

        <FormActions
          submitLabel="Save changes"
          secondaryLabel="Cancel"
          secondaryHref={`/organisations/${ngoId}/opportunities`}
          loading={submitting}
          disabled={!form.title || !form.description || !form.contactName || !form.contactEmail}
        />
      </form>
    </div>
  );
}
