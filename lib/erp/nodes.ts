import type { L } from "./i18n";

/**
 * The ERP map: eighteen modules in four bands. Each chapter proves some of
 * them with a real system and lights them up as the reader scrolls.
 */
export type NodeId =
  | "identity"
  | "tenancy"
  | "audit"
  | "documents"
  | "jobs"
  | "ledger"
  | "tax"
  | "arap"
  | "payroll"
  | "contracts"
  | "inventory"
  | "procurement"
  | "orders"
  | "field"
  | "maintenance"
  | "crm"
  | "portal"
  | "comms";

export type BandId = "reach" | "ops" | "finance" | "core";

export interface ErpNode {
  id: NodeId;
  band: BandId;
  code: string;
  label: L;
}

export const BANDS: { id: BandId; label: L; code: string }[] = [
  { id: "reach", code: "R", label: { en: "Relationships", fr: "Relations", ar: "العلاقات" } },
  { id: "ops", code: "O", label: { en: "Operations", fr: "Opérations", ar: "العمليات" } },
  { id: "finance", code: "F", label: { en: "Finance", fr: "Finance", ar: "المالية" } },
  { id: "core", code: "C", label: { en: "Platform core", fr: "Socle", ar: "النواة" } },
];

export const NODES: ErpNode[] = [
  { id: "crm", band: "reach", code: "R1", label: { en: "CRM & pipeline", fr: "CRM & pipeline", ar: "إدارة العلاقات" } },
  { id: "portal", band: "reach", code: "R2", label: { en: "External portals", fr: "Portails externes", ar: "البوابات الخارجية" } },
  { id: "comms", band: "reach", code: "R3", label: { en: "Real-time messaging", fr: "Messagerie temps réel", ar: "المراسلة الآنية" } },

  { id: "procurement", band: "ops", code: "O1", label: { en: "Procurement", fr: "Achats", ar: "المشتريات" } },
  { id: "inventory", band: "ops", code: "O2", label: { en: "Inventory & warehouses", fr: "Stocks & entrepôts", ar: "المخزون والمستودعات" } },
  { id: "orders", band: "ops", code: "O3", label: { en: "Orders & logistics", fr: "Commandes & logistique", ar: "الطلبيات واللوجستيك" } },
  { id: "field", band: "ops", code: "O4", label: { en: "Field operations", fr: "Opérations terrain", ar: "العمليات الميدانية" } },
  { id: "maintenance", band: "ops", code: "O5", label: { en: "Maintenance & tickets", fr: "Maintenance & tickets", ar: "الصيانة والتذاكر" } },

  { id: "contracts", band: "finance", code: "F1", label: { en: "Contracts & schedules", fr: "Contrats & échéanciers", ar: "العقود والجداول" } },
  { id: "arap", band: "finance", code: "F2", label: { en: "Receivables & payables", fr: "Créances & dettes", ar: "الذمم المدينة والدائنة" } },
  { id: "ledger", band: "finance", code: "F3", label: { en: "Accounting journals", fr: "Journaux comptables", ar: "اليوميات المحاسبية" } },
  { id: "tax", band: "finance", code: "F4", label: { en: "Tax & compliance", fr: "Fiscalité & conformité", ar: "الجباية والامتثال" } },
  { id: "payroll", band: "finance", code: "F5", label: { en: "Payroll & commissions", fr: "Paie & commissions", ar: "الأجور والعمولات" } },

  { id: "identity", band: "core", code: "C1", label: { en: "Identity & roles", fr: "Identités & rôles", ar: "الهويات والصلاحيات" } },
  { id: "tenancy", band: "core", code: "C2", label: { en: "Multi-entity isolation", fr: "Isolation multi-entités", ar: "عزل الكيانات" } },
  { id: "audit", band: "core", code: "C3", label: { en: "Audit trail", fr: "Piste d'audit", ar: "سجل التدقيق" } },
  { id: "documents", band: "core", code: "C4", label: { en: "Documents & numbering", fr: "Documents & numérotation", ar: "الوثائق والترقيم" } },
  { id: "jobs", band: "core", code: "C5", label: { en: "Jobs & notifications", fr: "Tâches & notifications", ar: "المهام والإشعارات" } },
];

export const NODE_BY_ID: Record<NodeId, ErpNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n])
) as Record<NodeId, ErpNode>;

/** Data flows drawn between modules on the schematic. */
export const EDGES: [NodeId, NodeId][] = [
  ["crm", "contracts"],
  ["portal", "orders"],
  ["comms", "portal"],
  ["procurement", "inventory"],
  ["orders", "inventory"],
  ["maintenance", "field"],
  ["field", "payroll"],
  ["inventory", "ledger"],
  ["contracts", "arap"],
  ["arap", "ledger"],
  ["ledger", "tax"],
  ["payroll", "ledger"],
];

export interface ChapterMeta {
  id: string;
  n: number;
  title: L;
  product: string | L;
  nodes: NodeId[];
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: "immo",
    n: 1,
    title: { en: "The platform", fr: "La plateforme", ar: "المنصّة" },
    product: "Sayroura Immo",
    nodes: ["tenancy", "identity", "documents", "jobs", "contracts", "crm", "maintenance"],
  },
  {
    id: "pos",
    n: 2,
    title: { en: "The ledger", fr: "Le grand livre", ar: "الدفتر" },
    product: "SayrouraPOS",
    nodes: ["ledger", "tax", "arap", "payroll", "inventory", "procurement"],
  },
  {
    id: "wash",
    n: 3,
    title: { en: "The field", fr: "Le terrain", ar: "الميدان" },
    product: "SayrouraWash",
    nodes: ["field", "audit"],
  },
  {
    id: "dapper",
    n: 4,
    title: { en: "The back office & the portal", fr: "Le back-office & le portail", ar: "المكتب الخلفي والبوابة" },
    product: "Dapper",
    nodes: ["orders", "portal"],
  },
  {
    id: "chat",
    n: 5,
    title: { en: "The wire", fr: "Le fil", ar: "السلك" },
    product: { en: "Messaging layer", fr: "Couche messagerie", ar: "طبقة المراسلة" },
    nodes: ["comms"],
  },
];
