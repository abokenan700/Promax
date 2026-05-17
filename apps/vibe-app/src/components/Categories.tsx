import { useState } from "react";
import { l1Categories } from "../data/catalog";
import { useCategories } from "../hooks/useCategories";

interface CategoriesProps {
  showLabels?: boolean;
  bg?: string;
  value?: string;
  onChange?: (id: string) => void;
}

export function Categories({
  showLabels = true,
  bg = "var(--bg-card)",
  value,
  onChange,
}: CategoriesProps) {
  const [internalId, setInternalId] = useState(l1Categories[0].id);
  const activeId = value ?? internalId;
  const { categories } = useCategories();

  function handleSelect(id: string) {
    if (onChange) onChange(id);
    else setInternalId(id);
  }

  return (
    <div className="px-3 pt-3 pb-2" style={{ background: bg }}>
      <div className="flex items-start justify-between overflow-x-auto hide-scrollbar gap-1">
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              {/* THAWQ gradient border ring */}
              <div
                style={{
                  width: "clamp(48px, 13vw, 62px)",
                  height: "clamp(48px, 13vw, 62px)",
                  flexShrink: 0,
                  borderRadius: "50%",
                  padding: "1.5px",
                  background: isActive
                    ? "linear-gradient(135deg, #D4B99A, #A67C52, #6B4A00)"
                    : "linear-gradient(135deg, #C8A880, #8B6040)",
                  boxShadow: isActive ? "var(--shadow-glow)" : "none",
                  transition: "background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
                }}
              >
                <div
                  className="rounded-full overflow-hidden"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(145deg, #faf8f5 0%, #f2ebe0 100%)",
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                  />
                </div>
              </div>

              {showLabels && (
                <>
                  <span
                    className="text-center"
                    style={{
                      fontSize: "clamp(9px, 2.8vw, 11.5px)",
                      lineHeight: 1.5,
                      color: isActive ? "var(--text-brand)" : "var(--text-secondary)",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {cat.label}
                  </span>
                  <div
                    className="h-[2px] rounded-full"
                    style={{
                      width: 18,
                      background: "var(--gold)",
                      transform: `scaleX(${isActive ? 1 : 0})`,
                      transformOrigin: "center",
                      transition: "transform var(--duration-fast) var(--ease-standard)",
                    }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
