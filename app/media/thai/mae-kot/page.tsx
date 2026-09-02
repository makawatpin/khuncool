import FinalConsonantFamilyPage, { getFamilyMetadata } from "../final-consonants/FinalConsonantFamilyPage";

export const metadata = getFamilyMetadata("kot");

export default function MaeKotPage() {
  return <FinalConsonantFamilyPage familyId="kot" />;
}
