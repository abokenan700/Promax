import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const mockBrands = [
  { id: "chanel",   label: "CHANEL",   icon: null },
  { id: "dior",     label: "DIOR",     icon: null },
  { id: "gucci",    label: "GUCCI",    icon: null },
  { id: "lv",       label: "LV",       icon: null },
  { id: "versace",  label: "VERSACE",  icon: null },
];

router.get("/brands", (_req: Request, res: Response) => {
  res.json(mockBrands);
});

export default router;
