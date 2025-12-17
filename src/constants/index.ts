import { Baby, CarIcon, Gem, ShieldCheck } from "lucide-react-native";

export type DocumentType =
  | 'NIC'
  | 'Passport'
  | 'Bank Card'
  | 'Birth Certificate'
  | 'Driving License'
  | 'Gem License'
  | 'Gem Certificate';


interface DocTypeOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  docType: DocumentType;
}

export const DOC_TYPES: DocTypeOption[] = [
  {
    id: "birth_certificate",
    label: "Birth Certificate",
    description: "Official birth record",
    icon: Baby,
    accent: "#FFB703",
    docType: "Birth Certificate",
  },
  {
    id: "driving_license",
    label: "Driving License",
    description: "Card & paper license",
    icon: CarIcon,
    accent: "#2196F3",
    docType: "Driving License",
  },
  {
    id: "gem_license",
    label: "Gem License",
    description: "Trading authorization",
    icon: ShieldCheck,
    accent: "#6C5CE7",
    docType: "Gem License",
  },
  {
    id: "gem_certificate",
    label: "Gem Certificate",
    description: "Quality & grading cert",
    icon: Gem,
    accent: "#FF6B81",
    docType: "Gem Certificate",
  },
];