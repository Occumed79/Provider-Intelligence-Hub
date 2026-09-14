import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import evidenceRouter from "./evidence";
import providersRouter from "./providers";
import reviewRouter from "./review";
import searchRouter from "./search";
import uploadRouter from "./upload_auto";
import analyticsRouter from "./analytics";
import networkDevelopmentAnalyticsRouter from "./network_development_analytics";
import outreachMgmtRouter from "./outreach_mgmt";
import procurementRouter from "./procurement";
import secureCommsRouter from "./secure_comms";
import settingsRouter from "./settings";
import currencyFeeSchedulesRouter from "./currency_fee_schedules";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(evidenceRouter);
router.use(providersRouter);
router.use(reviewRouter);
router.use(searchRouter);
router.use(uploadRouter);
router.use(analyticsRouter);
router.use(networkDevelopmentAnalyticsRouter);
router.use(outreachMgmtRouter);
router.use(procurementRouter);
router.use(secureCommsRouter);
router.use(settingsRouter);
router.use(currencyFeeSchedulesRouter);

export default router;
