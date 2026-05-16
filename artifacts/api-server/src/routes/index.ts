import { Router, type IRouter } from "express";
import healthRouter        from "./health";
import productsRouter      from "./products";
import brandsRouter        from "./brands";
import cartRouter          from "./cart";
import wishlistRouter      from "./wishlist";
import authRouter          from "./auth";
import oauthRouter         from "./oauth";
import categoriesRouter    from "./categories";
import ordersRouter        from "./orders";
import notificationsRouter from "./notifications";
import couponsRouter       from "./coupons";
import priceAlertsRouter   from "./price-alerts";
import reviewsRouter       from "./reviews";
import addressesRouter     from "./addresses";
import { authRateLimiter } from "../middlewares/rate-limit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(brandsRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(categoriesRouter);
router.use("/auth/login",    authRateLimiter);
router.use("/auth/register", authRateLimiter);
router.use(authRouter);
router.use(oauthRouter);
router.use(ordersRouter);
router.use(notificationsRouter);
router.use(couponsRouter);
router.use(priceAlertsRouter);
router.use(reviewsRouter);
router.use(addressesRouter);

export default router;
