'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, SearchX, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ListingCard } from '@/components/listing/listing-card';
import { CategoryChips, FilterDrawer } from '@/components/listing/filters';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { toggleSave } from '@/lib/actions/listings';
import { useAction, useQuery } from '@/lib/hooks';
import { searchListings } from '@/lib/queries/listings';
import type { Category, ListingCardView, ListingSearch, SortOption } from '@/lib/types';
import { errorMessage } from '@/lib/errorMessages';
import { useCampus } from '@/lib/campus';

const countActive = (f: ListingSearch) =>
  [f.minCents || f.maxCents, f.conditions?.length, f.fits?.length, f.source, f.freeOnly].filter(Boolean)
    .length;

function BrowseScreen() {
  const campus = useCampus();
  const params = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<ListingSearch>({
    q: params.get('q') ?? undefined,
    category: (params.get('category') as Category | null) ?? undefined,
    sort: 'newest',
  });
  const [qDraft, setQDraft] = useState(filters.q ?? '');
  const { state, retry, setData } = useQuery(() => searchListings(filters), [JSON.stringify(filters)]);
  const [more, setMore] = useState<{ pending: boolean; error: string | null }>({
    pending: false,
    error: null,
  });
  const save = useAction(toggleSave);

  const loadMore = async () => {
    if (state.status !== 'data' || !state.data.nextCursor || more.pending) return;
    setMore({ pending: true, error: null });
    const r = await searchListings({ ...filters, cursor: state.data.nextCursor });
    if (r.ok) {
      setData({ items: [...state.data.items, ...r.data.items], nextCursor: r.data.nextCursor });
      setMore({ pending: false, error: null });
    } else setMore({ pending: false, error: errorMessage(r.error) });
  };

  const onSave = async (listingId: string, next: boolean) => {
    const r = await save.run(listingId, next);
    if (!r) return;
    if (!r.ok) {
      if (r.error.code === 'NOT_SIGNED_IN') router.push(`/verify?next=${encodeURIComponent('/browse')}`);
      else toast.error(errorMessage(r.error, {}));
      return;
    }
    if (state.status === 'data') {
      setData({
        ...state.data,
        items: state.data.items.map(
          (v): ListingCardView => (v.listing.id === listingId ? { ...v, saved: r.data.saved } : v),
        ),
      });
    }
    toast.success(r.data.saved ? 'Saved' : 'Removed from saved');
  };

  const clearAll = () => {
    setFilters({ sort: filters.sort });
    setQDraft('');
  };

  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <PageHeader
        title={campus ? `Browse ${campus.name}` : 'Browse'}
        subtitle="Every seller is a verified student at your campus, and Dibs Goods are checked by our team."
      />
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ ...filters, q: qDraft.trim() || undefined });
        }}
      >
        <label htmlFor="q" className="sr-only">
          Search listings
        </label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            id="q"
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="Search lamps, bikes, textbooks…"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <CategoryChips value={filters.category} onChange={(category) => setFilters({ ...filters, category })} />
      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          value={filters}
          onChange={setFilters}
          onClear={clearAll}
          activeCount={countActive(filters)}
        />
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
          Sort
          <NativeSelect
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortOption })}
            className="w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
          </NativeSelect>
        </label>
        {countActive(filters) || filters.q || filters.category ? (
          <Button variant="link" onClick={clearAll}>
            <X className="h-4 w-4" aria-hidden /> Clear all
          </Button>
        ) : null}
      </div>

      {state.status === 'loading' ? (
        <CardGridSkeleton />
      ) : state.status === 'error' ? (
        <ErrorState message={errorMessage(state.error)} onRetry={retry} />
      ) : state.data.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          text="Nothing matches those filters yet."
          actionLabel="Clear filters"
          onAction={clearAll}
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
            {state.data.items.map((v) => (
              <li key={v.listing.id}>
                <ListingCard view={v} onToggleSave={onSave} savePending={save.pending} />
              </li>
            ))}
          </ul>
          {more.error ? <ErrorState message={more.error} onRetry={loadMore} /> : null}
          {state.data.nextCursor ? (
            <Button
              variant="secondary"
              size="lg"
              className="mx-auto"
              onClick={loadMore}
              disabled={more.pending}
            >
              {more.pending ? 'Loading…' : 'Load more'}
            </Button>
          ) : (
            <p className="text-center text-sm text-muted">That&apos;s everything for now.</p>
          )}
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseScreen />
    </Suspense>
  );
}
