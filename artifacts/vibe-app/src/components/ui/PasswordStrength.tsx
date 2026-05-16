interface PasswordStrengthProps {
  password: string;
}

function getStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: "ضعيفة جداً", color: "#EF4444" };
  if (score === 2) return { score: 2, label: "ضعيفة", color: "#F97316" };
  if (score === 3) return { score: 3, label: "متوسطة", color: "#EAB308" };
  if (score === 4) return { score: 4, label: "جيدة", color: "#22C55E" };
  return { score: 5, label: "قوية جداً", color: "#16A34A" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  const segments = 5;

  return (
    <div dir="rtl" style={{ marginTop: -6, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < score ? color : "#E8E4DE",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 11, color, fontFamily: "var(--font-main)", fontWeight: 600, margin: 0 }}>
        قوة كلمة المرور: {label}
      </p>
    </div>
  );
}
