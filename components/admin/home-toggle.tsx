import { toggleFilmHome, toggleGalleryHome } from "@/app/admin/actions";

/**
 * ON = the item is featured on the public home page.
 * OFF = it only lives on the inside pages (/films, /gallery).
 */
export function HomeToggle({
  kind,
  id,
  on,
}: {
  kind: "film" | "gallery";
  id: number;
  on: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-2"
      title={on ? "Showing on the home page" : "Only on the inside pages"}
    >
      <form action={kind === "film" ? toggleFilmHome : toggleGalleryHome}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="value" value={on ? "0" : "1"} />
        <button
          type="submit"
          role="switch"
          aria-checked={on}
          aria-label="Show on home page"
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            on ? "bg-stone-900" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              on ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </form>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
          on ? "text-emerald-700" : "text-stone-400"
        }`}
      >
        {on ? "On home" : "Not on home"}
      </span>
    </span>
  );
}
