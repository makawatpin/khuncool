import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FinalConsonantFamilyPage, { getFamilyMetadata } from "../final-consonants/FinalConsonantFamilyPage";
import { READY_FAMILY_ROUTES } from "../final-consonants/familyData";
import type { FamilyId } from "../final-consonants/types";

export const dynamicParams = false;

const familyIds = new Set<FamilyId>(READY_FAMILY_ROUTES.map((item) => item.id));

function resolveFamily(slug: string): FamilyId | undefined {
  if (!slug.startsWith("mae-")) return undefined;
  const id = slug.slice(4) as FamilyId;
  return familyIds.has(id) ? id : undefined;
}

export function generateStaticParams() {
  return READY_FAMILY_ROUTES.filter((item) => item.id !== "kot").map((item) => ({ family: `mae-${item.id}` }));
}

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }): Promise<Metadata> {
  const familyId = resolveFamily((await params).family);
  return familyId ? getFamilyMetadata(familyId) : {};
}

export default async function FamilyPage({ params }: { params: Promise<{ family: string }> }) {
  const familyId = resolveFamily((await params).family);
  if (!familyId || familyId === "kot") notFound();
  return <FinalConsonantFamilyPage familyId={familyId} />;
}
