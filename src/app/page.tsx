import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = { title: "Your day, in balance" };
export const dynamic = "force-dynamic";

export default LandingPage;
