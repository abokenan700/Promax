import { useState, useEffect } from "react";

/**
 * T10: useCountdown يقبل الآن targetMs (Unix timestamp بالمللي ثانية)
 * بدلاً من قيم ثابتة {h,m,s} التي لا تعكس وقت انتهاء حقيقياً.
 *
 * الاستخدام:
 *   const endTime = Date.now() + 3 * 3600_000 + 44 * 60_000 + 17_000;
 *   const display = useCountdown(endTime);
 *   // يُعيد: "03 : 44 : 16"
 */
export function useCountdown(targetMs: number): string {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, targetMs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const totalSecs = Math.floor(remaining / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
}
