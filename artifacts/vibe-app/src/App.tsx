import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { Categories } from "./components/Categories";
import { BannerSlider } from "./components/BannerSlider";
import { Features } from "./components/Features";
import { Products } from "./components/Products";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { Brands } from "./components/Brands";
import { BottomNav } from "./components/BottomNav";
import { NewArrivals } from "./components/NewArrivals";
import { TrendingSection } from "./components/TrendingSection";
import { CollectionBanners } from "./components/CollectionBanners";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AccountSheet } from "./components/AccountSheet";
import { AccountSheetProvider } from "./context/AccountSheetContext";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";

const RETURN_TO_KEY  = "nakhba_return_to";
const TOKEN_KEY      = "nakhba_token";

/* ── Lazy-load page chunks ──────────────────────────────────────── */
const CategoriesPage    = lazy(() => import("./pages/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const CartPage          = lazy(() => import("./pages/CartPage").then(m => ({ default: m.CartPage })));
const WishlistPage      = lazy(() => import("./pages/WishlistPage").then(m => ({ default: m.WishlistPage })));
const AccountPage       = lazy(() => import("./pages/AccountPage").then(m => ({ default: m.AccountPage })));
const SearchPage        = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage      = lazy(() => import("./pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage  = lazy(() => import("./pages/OrderSuccessPage").then(m => ({ default: m.OrderSuccessPage })));
const OrdersPage        = lazy(() => import("./pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const PriceAlertsPage   = lazy(() => import("./pages/PriceAlertsPage").then(m => ({ default: m.PriceAlertsPage })));
const NotFoundPage      = lazy(() => import("./pages/not-found").then(m => ({ default: m.NotFoundPage })));
const AddressBookPage   = lazy(() => import("./pages/AddressBookPage").then(m => ({ default: m.AddressBookPage })));
const EditProfilePage   = lazy(() => import("./pages/EditProfilePage").then(m => ({ default: m.EditProfilePage })));

function PageLoader() {
  return (
    <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-page)" }}>
      <div className="page-spinner" />
    </div>
  );
}

/** ProtectedRoute — saves current path before redirecting to login */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      try { sessionStorage.setItem(RETURN_TO_KEY, location); } catch { }
      navigate("/");
    }
  }, [user, loading, navigate, location]);

  if (loading) return <PageLoader />;
  if (!user) return null;
  return <Component />;
}

function FocusOnNavigation() {
  const [location] = useLocation();
  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    const handleBlur = () => main.removeAttribute("tabindex");
    main.addEventListener("blur", handleBlur, { once: true });
    return () => main.removeEventListener("blur", handleBlur);
  }, [location]);
  return null;
}

/** Capture OAuth token from query-param after social login redirect */
function OAuthCapture() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("oauth_token");
    const err    = params.get("oauth_error");

    if (token) {
      try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
      // Strip query params then reload so AuthContext picks up the new token
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
      window.location.reload();
    }

    if (err) {
      const msgs: Record<string, string> = {
        cancelled:    "تم إلغاء تسجيل الدخول",
        token_failed: "فشل التحقق من الحساب، حاول مجدداً",
        no_email:     "لم نتمكن من الوصول إلى بريدك الإلكتروني",
        server_error: "خطأ في الخادم، حاول مجدداً",
      };
      toast.error(msgs[err] ?? "تعذّر تسجيل الدخول");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return null;
}

function HomePage() {
  return (
    <div className="scroll-area">
      <h1 className="sr-only">نخبة — الرئيسية</h1>
      <Header />
      <SearchBar readOnly navigateTo="/search" />
      <Categories />
      <BannerSlider />
      <div className="px-3 py-2">
        <Features />
      </div>
      <div style={{ padding: "0 0 4px" }}>
        <Products />
      </div>
      <TrendingSection />
      <CollectionBanners />
      <NewArrivals />
      <div style={{ padding: "8px 0" }}>
        <Brands />
      </div>
      <FeaturedProducts />
    </div>
  );
}

function PageBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AccountSheetProvider>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">تخطى للمحتوى الرئيسي</a>
        <OAuthCapture />
        <FocusOnNavigation />
        <main
          id="main-content"
          style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <Switch>
            <Route path="/">
              <PageBoundary><HomePage /></PageBoundary>
            </Route>
            <Route path="/categories">
              <PageBoundary><CategoriesPage /></PageBoundary>
            </Route>
            <Route path="/cart">
              <PageBoundary><CartPage /></PageBoundary>
            </Route>
            <Route path="/wishlist">
              <PageBoundary><WishlistPage /></PageBoundary>
            </Route>
            <Route path="/search">
              <PageBoundary><SearchPage /></PageBoundary>
            </Route>
            <Route path="/product/:id">
              <PageBoundary><ProductDetailPage /></PageBoundary>
            </Route>
            <Route path="/notifications">
              <PageBoundary><NotificationsPage /></PageBoundary>
            </Route>
            <Route path="/checkout">
              <PageBoundary><ProtectedRoute component={CheckoutPage} /></PageBoundary>
            </Route>
            <Route path="/order/success">
              <PageBoundary><ProtectedRoute component={OrderSuccessPage} /></PageBoundary>
            </Route>
            <Route path="/orders">
              <PageBoundary><ProtectedRoute component={OrdersPage} /></PageBoundary>
            </Route>
            <Route path="/account">
              <PageBoundary><AccountPage /></PageBoundary>
            </Route>
            <Route path="/price-alerts">
              <PageBoundary><PriceAlertsPage /></PageBoundary>
            </Route>
            <Route path="/addresses">
              <PageBoundary><ProtectedRoute component={AddressBookPage} /></PageBoundary>
            </Route>
            <Route path="/edit-profile">
              <PageBoundary><ProtectedRoute component={EditProfilePage} /></PageBoundary>
            </Route>
            <Route>
              <PageBoundary><NotFoundPage /></PageBoundary>
            </Route>
          </Switch>
        </main>

        <div className="bottom-bar">
          <BottomNav />
        </div>

        <AccountSheet />
      </div>
    </AccountSheetProvider>
  );
}
