import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET, type JwtPayload } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/* ── helpers ─────────────────────────────────────────────────────── */

function getDevDomain(): string {
  return process.env.REPLIT_DEV_DOMAIN ?? "localhost:8080";
}

function apiBase(): string {
  const domain = getDevDomain();
  // In Replit, the API runs on port 8080 (external port 8080)
  const isLocalhost = domain.startsWith("localhost");
  return isLocalhost
    ? `http://${domain}`
    : `https://${domain}:8080`;
}

function frontendBase(): string {
  const domain = getDevDomain();
  const isLocalhost = domain.startsWith("localhost");
  return isLocalhost ? "http://localhost:24678" : `https://${domain}`;
}

function issueToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email } satisfies JwtPayload,
    JWT_SECRET,
    { expiresIn: "30d" },
  );
}

async function findOrCreateOAuthUser(opts: {
  email:    string;
  name:     string;
  avatar:   string | null;
  provider: string;
  id:       string;
}): Promise<typeof usersTable.$inferSelect> {
  const emailLower = opts.email.toLowerCase();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, emailLower))
    .limit(1);

  if (existing) {
    // Link provider if not yet linked
    if (!existing.oauth_id) {
      const [updated] = await db
        .update(usersTable)
        .set({ oauth_provider: opts.provider, oauth_id: opts.id })
        .where(eq(usersTable.id, existing.id))
        .returning();
      return updated;
    }
    return existing;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      name:           opts.name,
      email:          emailLower,
      password_hash:  null,
      avatar:         opts.avatar,
      oauth_provider: opts.provider,
      oauth_id:       opts.id,
    })
    .returning();

  return created;
}

/* ══════════════════════════════════════════════════════════════════
   GOOGLE
   ══════════════════════════════════════════════════════════════════ */

router.get("/auth/google", (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: "Google OAuth not configured — set GOOGLE_CLIENT_ID" });
    return;
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${apiBase()}/api/v1/auth/google/callback`,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/auth/google/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };
  const frontend = frontendBase();

  if (error || !code) {
    res.redirect(`${frontend}/?oauth_error=cancelled`);
    return;
  }

  try {
    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri  = `${apiBase()}/api/v1/auth/google/callback`;

    // Exchange code → tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      logger.warn({ err: tokenData.error }, "Google token exchange failed");
      res.redirect(`${frontend}/?oauth_error=token_failed`);
      return;
    }

    // Fetch user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json() as {
      id?:      string;
      email?:   string;
      name?:    string;
      picture?: string;
    };

    if (!profile.email || !profile.id) {
      res.redirect(`${frontend}/?oauth_error=no_email`);
      return;
    }

    const user = await findOrCreateOAuthUser({
      email:    profile.email,
      name:     profile.name ?? profile.email.split("@")[0],
      avatar:   profile.picture ?? null,
      provider: "google",
      id:       profile.id,
    });

    const token = issueToken(user.id, user.email);
    res.redirect(`${frontend}/?oauth_token=${encodeURIComponent(token)}`);
  } catch (err) {
    logger.error({ err }, "Google OAuth callback error");
    res.redirect(`${frontendBase()}/?oauth_error=server_error`);
  }
});

/* ══════════════════════════════════════════════════════════════════
   FACEBOOK  (stub — wires up when FACEBOOK_APP_ID is set)
   ══════════════════════════════════════════════════════════════════ */

router.get("/auth/facebook", (_req: Request, res: Response) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    res.status(503).json({ error: "Facebook OAuth not configured — set FACEBOOK_APP_ID" });
    return;
  }

  const params = new URLSearchParams({
    client_id:    appId,
    redirect_uri: `${apiBase()}/api/v1/auth/facebook/callback`,
    scope:        "email,public_profile",
    response_type: "code",
  });

  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

router.get("/auth/facebook/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };
  const frontend = frontendBase();

  if (error || !code) {
    res.redirect(`${frontend}/?oauth_error=cancelled`);
    return;
  }

  try {
    const appId       = process.env.FACEBOOK_APP_ID!;
    const appSecret   = process.env.FACEBOOK_APP_SECRET!;
    const redirectUri = `${apiBase()}/api/v1/auth/facebook/callback`;

    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }),
    );
    const tokenData = await tokenRes.json() as { access_token?: string };

    if (!tokenData.access_token) {
      res.redirect(`${frontend}/?oauth_error=token_failed`);
      return;
    }

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`,
    );
    const profile = await profileRes.json() as {
      id?: string; name?: string; email?: string;
      picture?: { data?: { url?: string } };
    };

    if (!profile.email || !profile.id) {
      res.redirect(`${frontend}/?oauth_error=no_email`);
      return;
    }

    const user = await findOrCreateOAuthUser({
      email:    profile.email,
      name:     profile.name ?? profile.email.split("@")[0],
      avatar:   profile.picture?.data?.url ?? null,
      provider: "facebook",
      id:       profile.id,
    });

    const token = issueToken(user.id, user.email);
    res.redirect(`${frontend}/?oauth_token=${encodeURIComponent(token)}`);
  } catch (err) {
    logger.error({ err }, "Facebook OAuth callback error");
    res.redirect(`${frontendBase()}/?oauth_error=server_error`);
  }
});

export default router;
