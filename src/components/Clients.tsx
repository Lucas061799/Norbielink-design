"use client";

import { useState, Fragment } from "react";
import norbieface from "@/assets/norbieface.png";
import {
  Search, Plus, MoreVertical, Pencil, Building2, ChevronLeft, ChevronDown,
  Activity, FileText, ClipboardList, Shield, Star, Phone, Mail,
  Calendar, DollarSign, TrendingUp, FileStack, Upload, Download,
  MessageSquare, UserCircle, X, MapPin, Users, ChevronRight, RefreshCw,
  StickyNote, LayoutGrid, AlertTriangle, Trash2, FileArchive, FolderOpen, NotebookPen, CopyPlus, Video, Clock, Bell, Paperclip, Filter, Eye,
  Maximize2, Minimize2, Lock, Unlock, Copy, Archive, Type, Pin, List, Table2, CheckSquare, Check,
} from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";
const AGENCY_PHONE = "+1 (888) 555-0188"; // Fixed agency outbound number

/* ─── Types ─────────────────────────────────────────────────────────────── */
// ACORD-aligned contact roles. A client can have multiple contacts of each type.
type ClientContactType = "inspection" | "accounting" | "claims";
interface ClientContact {
  id: string; type: ClientContactType;
  firstName: string; lastName: string;
  phone?: string; email?: string;
}
const CONTACT_TYPE_PALETTE: Record<ClientContactType, { color: string; bg: string }> = {
  inspection: { color: "#A614C3", bg: "rgba(166,20,195,0.10)" },
  accounting: { color: "#73C9B7", bg: "rgba(115,201,183,0.14)" },
  claims:     { color: "#5C2ED4", bg: "rgba(92,46,212,0.10)" },
};
interface Client {
  id: string; type: "Individual" | "Corporation" | "LLC" | "Partnership";
  companyName?: string; dbaName?: string;
  firstName?: string; lastName?: string;
  contactFirstName?: string; contactLastName?: string;
  inspectionFirstName?: string; inspectionLastName?: string;
  contacts?: ClientContact[];
  email: string; phone: string;
  address: { street: string; city: string; state: string; zipCode: string };
  status: "Active" | "Inactive" | "Prospect";
  assignedAgent: string; agencyId: string;
  createdDate: string; lastActivity: string; isStarred?: boolean;
  totalPremium: number; activePolicies: number; pendingQuotes: number;
  notes?: string; tags?: string[]; industry?: string; website?: string;
  primaryClassCode?: string; federalId?: string; contractorLicense?: string;
  grossSales?: string; payroll?: string; owners?: string; employees?: string;
}
interface Quote { id: string; quoteId: string; policyType: string; status: "Pending"|"Approved"|"Declined"|"Expired"|"Sold/Issued"|"Incomplete"|"Pending/Action Req."|"Upcoming Renewals"; createdDate: string; premium: number; clientId: string; applicant: string; dba?: string; effectiveDate?: string; lob: string; producer: string; }
interface Policy { id: string; policyNumber: string; policyType: string; status: "Active"|"Expired"|"Cancelled"|"Upcoming Renewal"; effectiveDate: string; expirationDate: string; premium: number; clientId: string; applicant: string; dba?: string; lob: string; producer: string; createdDate: string; }
interface Document { id: string; name: string; type: string; uploadDate: string; size: string; clientId: string; category: string; policyNumber?: string; lob?: string; docType?: string; }
interface ActivityLog { id: string; action: string; description: string; timestamp: string; user: string; clientId: string; type: "policy"|"quote"|"document"|"email"|"call"|"note"; }
interface Note { id: string; title: string; content: string; author: string; timestamp: string; clientId: string; type: "General" | "Policy" | "Follow-up" | "Meeting" | "Task"; visibility?: "Private" | "Shared"; }

/* ─── Mock Data ──────────────────────────────────────────────────────────── */
const mockClients: Client[] = [
  { id:"1", type:"Corporation", companyName:"Tech Solutions Inc.", dbaName:"TechSol", contactFirstName:"David", contactLastName:"Chen", inspectionFirstName:"Lisa", inspectionLastName:"Wang", email:"contact@techsolutions.com", phone:"(555) 123-4567", address:{street:"123 Innovation Drive",city:"San Francisco",state:"CA",zipCode:"94105"}, status:"Active", assignedAgent:"Jane Smith", agencyId:"1", createdDate:"2024-01-15", lastActivity:"2026-06-18", isStarred:true, totalPremium:45000, activePolicies:3, pendingQuotes:1, industry:"Technology", website:"www.techsolutions.com", primaryClassCode:"8810 - Auto Repair Shops", federalId:"82-1234567", contractorLicense:"CA-789456", grossSales:"$12,500,000", payroll:"$3,200,000", owners:"2", employees:"85", contacts:[
    { id:"c1-1", type:"inspection", firstName:"Lisa",   lastName:"Wang",     phone:"(555) 123-4570", email:"lisa.wang@techsolutions.com" },
    { id:"c1-2", type:"accounting", firstName:"Marcus", lastName:"Reyes",    phone:"(555) 123-4571", email:"ap@techsolutions.com" },
    { id:"c1-3", type:"claims",     firstName:"Priya",  lastName:"Patel",    phone:"(555) 123-4572", email:"claims@techsolutions.com" },
  ] },
  { id:"2", type:"Individual", firstName:"John", lastName:"Anderson", email:"john.anderson@email.com", phone:"(555) 234-5678", address:{street:"456 Oak Street",city:"Los Angeles",state:"CA",zipCode:"90001"}, status:"Active", assignedAgent:"Mike Chen", agencyId:"1", createdDate:"2024-02-20", lastActivity:"2024-04-08", isStarred:false, totalPremium:12000, activePolicies:2, pendingQuotes:0 },
  { id:"3", type:"LLC", companyName:"Green Earth Logistics", dbaName:"GEL Transport", contactFirstName:"Tom", contactLastName:"Harris", inspectionFirstName:"Amy", inspectionLastName:"Lee", email:"info@greenearth.com", phone:"(555) 345-6789", address:{street:"789 Commerce Blvd",city:"Chicago",state:"IL",zipCode:"60601"}, status:"Prospect", assignedAgent:"Sarah Johnson", agencyId:"1", createdDate:"2024-03-10", lastActivity:"2026-05-12", isStarred:true, totalPremium:17500, activePolicies:1, pendingQuotes:2, industry:"Logistics", website:"www.greenearthlogistics.com", primaryClassCode:"7219 - Trucking", federalId:"36-9876543", grossSales:"$8,750,000", payroll:"$2,100,000", owners:"3", employees:"120" },
  { id:"4", type:"Partnership", companyName:"Metro Construction LLC", dbaName:"MetroBuild", contactFirstName:"James", contactLastName:"Wilson", inspectionFirstName:"Robert", inspectionLastName:"Kim", email:"contact@metroconstruction.com", phone:"(555) 456-7890", address:{street:"321 Builder Lane",city:"New York",state:"NY",zipCode:"10001"}, status:"Active", assignedAgent:"Jane Smith", agencyId:"1", createdDate:"2023-11-05", lastActivity:"2026-06-08", isStarred:true, totalPremium:78000, activePolicies:5, pendingQuotes:0, industry:"Construction", website:"www.metroconstruction.com", primaryClassCode:"5403 - Carpentry", federalId:"13-5678901", contractorLicense:"NY-654321", grossSales:"$25,000,000", payroll:"$6,800,000", owners:"2", employees:"210" },
  { id:"5", type:"Individual", firstName:"Maria", lastName:"Rodriguez", email:"maria.r@email.com", phone:"(555) 567-8901", address:{street:"654 Palm Avenue",city:"Miami",state:"FL",zipCode:"33101"}, status:"Inactive", assignedAgent:"Mike Chen", agencyId:"1", createdDate:"2023-08-15", lastActivity:"2024-01-20", isStarred:false, totalPremium:8500, activePolicies:1, pendingQuotes:0 },
  { id:"6", type:"Corporation", firstName:"Kevin", lastName:"Park", email:"kevin.park@email.com", phone:"(555) 678-9012", address:{street:"987 Maple Street",city:"Seattle",state:"WA",zipCode:"98101"}, status:"Active", assignedAgent:"Jane Smith", agencyId:"1", createdDate:"2024-01-08", lastActivity:"2024-04-05", isStarred:false, totalPremium:11200, activePolicies:2, pendingQuotes:1 },
  { id:"7", type:"LLC", companyName:"Sunrise Properties LLC", dbaName:"Sunrise RE", contactFirstName:"Diana", contactLastName:"Nguyen", inspectionFirstName:"Diana", inspectionLastName:"Nguyen", email:"diana@sunriseproperties.com", phone:"(555) 789-0123", address:{street:"222 Harbor View",city:"Boston",state:"MA",zipCode:"02101"}, status:"Prospect", assignedAgent:"Sarah Johnson", agencyId:"1", createdDate:"2024-02-14", lastActivity:"2026-04-15", isStarred:false, totalPremium:22000, activePolicies:0, pendingQuotes:3, industry:"Real Estate", website:"www.sunriseproperties.com", primaryClassCode:"6400 - Real Estate", federalId:"04-1234567", grossSales:"$5,000,000", payroll:"$800,000", owners:"1", employees:"12" },
];
const mockQuotes: Quote[] = [
  { id:"1", quoteId:"QMWC123456789", policyType:"Commercial Auto", status:"Sold/Issued", createdDate:"2024-05-01", premium:15000, clientId:"1", applicant:"Jane Smith", dba:"TechSol", effectiveDate:"2024-01-01", lob:"Worker's Comp", producer:"Jane Smith" },
  { id:"2", quoteId:"QMWC111222333", policyType:"General Liability", status:"Declined", createdDate:"2024-01-01", premium:8000, clientId:"1", applicant:"Joe Smith", dba:"Tech Solutions Inc.", effectiveDate:"2024-06-15", lob:"General Liability", producer:"Joe Smith" },
  { id:"3", quoteId:"QMWC111222333", policyType:"Workers Compensation", status:"Incomplete", createdDate:"2024-06-15", premium:12000, clientId:"1", applicant:"Elvis Prestley", dba:"TechSol", effectiveDate:"2024-07-01", lob:"Vacant Risks", producer:"Elvis Prestley" },
  { id:"4", quoteId:"QMWC111222333", policyType:"Property Insurance", status:"Incomplete", createdDate:"2024-07-01", premium:9500, clientId:"1", applicant:"Elvis Prestley", dba:"TechSol", effectiveDate:"2024-07-01", lob:"Worker's Comp", producer:"Elvis Prestley" },
  { id:"5", quoteId:"QAA987654321-1", policyType:"Cyber Liability", status:"Incomplete", createdDate:"2024-07-01", premium:6200, clientId:"1", applicant:"Joe Smith", dba:"Tech Solutions Inc.", effectiveDate:"2024-07-01", lob:"General Liability", producer:"Joe Smith" },
  { id:"6", quoteId:"QAA987654321-1", policyType:"Umbrella", status:"Pending", createdDate:"2025-03-01", premium:4800, clientId:"1", applicant:"Elvis Prestley", dba:"TechSol", effectiveDate:"2025-03-01", lob:"Vacant Risks", producer:"Elvis Prestley" },
  { id:"7",  quoteId:"Q-2024-015",    policyType:"General Liability",    status:"Approved",    createdDate:"2024-04-05", premium:8000,  clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport", effectiveDate:"2024-05-01", lob:"General Liability", producer:"Sarah Johnson" },
  { id:"8",  quoteId:"Q-2024-016",    policyType:"Workers Compensation", status:"Pending",     createdDate:"2024-04-08", premium:12000, clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport", effectiveDate:"2024-06-01", lob:"Worker's Comp",    producer:"Sarah Johnson" },
  { id:"9",  quoteId:"Q-2024-017",    policyType:"Commercial Auto",      status:"Incomplete",  createdDate:"2024-04-10", premium:9500,  clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport", effectiveDate:"2024-06-15", lob:"Commercial Auto",  producer:"Sarah Johnson" },
  { id:"10", quoteId:"Q-2024-018",    policyType:"Property Insurance",   status:"Declined",    createdDate:"2024-03-20", premium:7200,  clientId:"3", applicant:"Tom Harris",    dba:"GEL Transport", effectiveDate:"2024-05-01", lob:"Property",         producer:"Sarah Johnson" },
  // Client 2 — John Anderson
  { id:"11", quoteId:"Q-2023-JA-001", policyType:"Auto Insurance",       status:"Sold/Issued", createdDate:"2023-08-15", premium:7000,  clientId:"2", applicant:"John Anderson", effectiveDate:"2023-09-01", lob:"Auto Insurance", producer:"Mike Chen" },
  { id:"12", quoteId:"Q-2023-JA-002", policyType:"Homeowners",           status:"Sold/Issued", createdDate:"2023-09-01", premium:5000,  clientId:"2", applicant:"John Anderson", effectiveDate:"2023-10-01", lob:"Homeowners",    producer:"Mike Chen" },
  { id:"13", quoteId:"Q-2024-JA-003", policyType:"Umbrella",             status:"Pending",     createdDate:"2024-03-10", premium:2800,  clientId:"2", applicant:"John Anderson", effectiveDate:"2024-04-01", lob:"Umbrella",      producer:"Mike Chen" },
  { id:"14", quoteId:"Q-2024-JA-004", policyType:"Life Insurance",       status:"Incomplete",  createdDate:"2024-02-05", premium:3200,  clientId:"2", applicant:"John Anderson", effectiveDate:"2024-05-01", lob:"Life",          producer:"Mike Chen" },
  { id:"15", quoteId:"Q-2024-JA-005", policyType:"Cyber Liability",      status:"Declined",    createdDate:"2024-01-18", premium:1500,  clientId:"2", applicant:"John Anderson", effectiveDate:"2024-03-01", lob:"Cyber",         producer:"Mike Chen" },
  // Client 4 — Metro Construction LLC
  { id:"16", quoteId:"Q-2024-MC-001", policyType:"Commercial Auto",      status:"Sold/Issued", createdDate:"2024-03-01", premium:31000, clientId:"4", applicant:"James Wilson", dba:"MetroBuild", effectiveDate:"2024-04-01", lob:"Commercial Auto",  producer:"Jane Smith" },
  { id:"17", quoteId:"Q-2024-MC-002", policyType:"General Liability",    status:"Sold/Issued", createdDate:"2024-02-01", premium:15000, clientId:"4", applicant:"James Wilson", dba:"MetroBuild", effectiveDate:"2024-02-15", lob:"General Liability", producer:"Jane Smith" },
  { id:"18", quoteId:"Q-2024-MC-003", policyType:"Umbrella",             status:"Pending",     createdDate:"2024-04-05", premium:8500,  clientId:"4", applicant:"James Wilson", dba:"MetroBuild", effectiveDate:"2024-05-01", lob:"Umbrella",          producer:"Jane Smith" },
  { id:"19", quoteId:"Q-2024-MC-004", policyType:"Equipment Floater",    status:"Incomplete",  createdDate:"2024-04-10", premium:6200,  clientId:"4", applicant:"Robert Kim",   dba:"MetroBuild", effectiveDate:"2024-06-01", lob:"Equipment Floater", producer:"Jane Smith" },
  { id:"20", quoteId:"Q-2024-MC-005", policyType:"Builder's Risk",       status:"Approved",    createdDate:"2024-03-20", premium:18000, clientId:"4", applicant:"James Wilson", dba:"MetroBuild", effectiveDate:"2024-04-15", lob:"Builder's Risk",    producer:"Jane Smith" },
  // Client 5 — Maria Rodriguez
  { id:"21", quoteId:"Q-2023-MR-001", policyType:"Auto Insurance",       status:"Sold/Issued", createdDate:"2023-11-01", premium:8500,  clientId:"5", applicant:"Maria Rodriguez", effectiveDate:"2023-12-01", lob:"Auto Insurance", producer:"Mike Chen" },
  { id:"22", quoteId:"Q-2024-MR-002", policyType:"Renters Insurance",    status:"Sold/Issued", createdDate:"2024-01-10", premium:1200,  clientId:"5", applicant:"Maria Rodriguez", effectiveDate:"2024-02-01", lob:"Renters",        producer:"Mike Chen" },
  { id:"23", quoteId:"Q-2024-MR-003", policyType:"Life Insurance",       status:"Pending",     createdDate:"2024-01-15", premium:2400,  clientId:"5", applicant:"Maria Rodriguez", effectiveDate:"2024-03-01", lob:"Life",           producer:"Mike Chen" },
  { id:"24", quoteId:"Q-2024-MR-004", policyType:"Health Insurance",     status:"Incomplete",          createdDate:"2024-02-20", premium:4800,  clientId:"5", applicant:"Maria Rodriguez",                    effectiveDate:"2024-04-01", lob:"Health",           producer:"Mike Chen"    },
  // Upcoming Renewals & Pending/Action Req. quotes
  { id:"25", quoteId:"Q-2024-GE-005", policyType:"Umbrella",             status:"Pending/Action Req.", createdDate:"2024-04-12", premium:3500,  clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport",   effectiveDate:"2024-06-01", lob:"Umbrella",         producer:"Sarah Johnson" },
  { id:"26", quoteId:"Q-2024-GE-006", policyType:"General Liability",    status:"Upcoming Renewals",  createdDate:"2024-03-15", premium:8000,  clientId:"3", applicant:"Tom Harris",    dba:"GEL Transport",   effectiveDate:"2025-05-01", lob:"General Liability", producer:"Sarah Johnson" },
  { id:"27", quoteId:"Q-2024-MC-006", policyType:"Umbrella",             status:"Upcoming Renewals",  createdDate:"2024-04-01", premium:12000, clientId:"4", applicant:"James Wilson",  dba:"MetroBuild",      effectiveDate:"2025-04-01", lob:"Umbrella",         producer:"Jane Smith"    },
  { id:"28", quoteId:"Q-2024-MC-007", policyType:"General Liability",    status:"Pending/Action Req.", createdDate:"2024-04-08", premium:15000, clientId:"4", applicant:"Robert Kim",    dba:"MetroBuild",      effectiveDate:"2024-06-01", lob:"General Liability", producer:"Jane Smith"   },
  { id:"29", quoteId:"Q-2024-JA-006", policyType:"Auto Insurance",       status:"Upcoming Renewals",  createdDate:"2024-04-01", premium:7000,  clientId:"2", applicant:"John Anderson",                        effectiveDate:"2025-09-01", lob:"Auto Insurance",   producer:"Mike Chen"    },
  { id:"30", quoteId:"Q-2024-MR-005", policyType:"Auto Insurance",       status:"Upcoming Renewals",  createdDate:"2024-11-15", premium:8500,  clientId:"5", applicant:"Maria Rodriguez",                    effectiveDate:"2024-12-01", lob:"Auto Insurance",   producer:"Mike Chen"    },
  { id:"31", quoteId:"Q-2024-MR-006", policyType:"Life Insurance",       status:"Pending/Action Req.", createdDate:"2024-03-01", premium:2400,  clientId:"5", applicant:"Maria Rodriguez",                   effectiveDate:"2024-05-01", lob:"Life",             producer:"Mike Chen"    },
  { id:"32", quoteId:"QMWC999000111", policyType:"Cyber Liability",      status:"Upcoming Renewals",  createdDate:"2025-01-15", premium:6200,  clientId:"1", applicant:"Jane Smith",    dba:"TechSol",         effectiveDate:"2025-07-01", lob:"Cyber Liability",  producer:"Jane Smith"    },
  { id:"33", quoteId:"QMWC888777666", policyType:"Workers Compensation",  status:"Pending/Action Req.", createdDate:"2025-02-10", premium:12000, clientId:"1", applicant:"Joe Smith",    dba:"Tech Solutions Inc.", effectiveDate:"2025-03-01", lob:"Worker's Comp", producer:"Joe Smith"    },
];
const mockPolicies: Policy[] = [
  { id:"1", policyNumber:"POL-2024-1001", policyType:"General Liability", status:"Active", effectiveDate:"2024-01-01", expirationDate:"2025-01-01", premium:15000, clientId:"1", applicant:"Jane Smith", dba:"TechSol", lob:"General Liability", producer:"Jane Smith", createdDate:"2024-01-01" },
  { id:"2", policyNumber:"POL-2024-1002", policyType:"Commercial Auto", status:"Active", effectiveDate:"2024-02-01", expirationDate:"2025-02-01", premium:18000, clientId:"1", applicant:"Joe Smith", dba:"Tech Solutions Inc.", lob:"Commercial Auto", producer:"Joe Smith", createdDate:"2024-02-01" },
  { id:"3", policyNumber:"POL-2024-1003", policyType:"Property Insurance", status:"Active", effectiveDate:"2024-01-15", expirationDate:"2025-01-15", premium:12000, clientId:"1", applicant:"Jane Smith", dba:"TechSol", lob:"Property", producer:"Jane Smith", createdDate:"2024-01-15" },
  { id:"4", policyNumber:"POL-2023-0856", policyType:"Auto Insurance", status:"Upcoming Renewal", effectiveDate:"2023-09-01", expirationDate:"2024-09-01", premium:7000, clientId:"2", applicant:"John Anderson", lob:"Auto Insurance", producer:"Mike Chen", createdDate:"2023-09-01" },
  { id:"5", policyNumber:"POL-2023-0857", policyType:"Homeowners", status:"Expired", effectiveDate:"2023-10-01", expirationDate:"2024-10-01", premium:5000, clientId:"2", applicant:"John Anderson", lob:"Homeowners", producer:"Mike Chen", createdDate:"2023-10-01" },
  { id:"6",  policyNumber:"POL-2024-2201", policyType:"Workers Compensation", status:"Active",            effectiveDate:"2024-03-01", expirationDate:"2025-03-01", premium:22000, clientId:"4", applicant:"Mike Chen",     dba:"Metro LLC",    lob:"Worker's Comp",    producer:"Jane Smith",    createdDate:"2024-03-01" },
  // Client 3 — Green Earth Logistics
  { id:"7",  policyNumber:"POL-2024-3101", policyType:"General Liability",    status:"Active",            effectiveDate:"2024-05-01", expirationDate:"2025-05-01", premium:8000,  clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport", lob:"General Liability", producer:"Sarah Johnson", createdDate:"2024-05-01" },
  { id:"8",  policyNumber:"POL-2024-3102", policyType:"Commercial Auto",      status:"Upcoming Renewal",  effectiveDate:"2023-06-01", expirationDate:"2024-06-01", premium:9500,  clientId:"3", applicant:"Sarah Johnson", dba:"GEL Transport", lob:"Commercial Auto",  producer:"Sarah Johnson", createdDate:"2023-06-01" },
  // Client 4 — Metro Construction LLC (4 more to reach 5 total)
  { id:"9",  policyNumber:"POL-2024-4201", policyType:"Commercial Auto",      status:"Active",            effectiveDate:"2024-04-01", expirationDate:"2025-04-01", premium:31000, clientId:"4", applicant:"James Wilson",  dba:"MetroBuild",   lob:"Commercial Auto",  producer:"Jane Smith",    createdDate:"2024-04-01" },
  { id:"10", policyNumber:"POL-2024-4202", policyType:"General Liability",    status:"Active",            effectiveDate:"2024-02-15", expirationDate:"2025-02-15", premium:15000, clientId:"4", applicant:"James Wilson",  dba:"MetroBuild",   lob:"General Liability", producer:"Jane Smith",   createdDate:"2024-02-15" },
  { id:"11", policyNumber:"POL-2024-4203", policyType:"Builder's Risk",       status:"Active",            effectiveDate:"2024-04-15", expirationDate:"2025-04-15", premium:18000, clientId:"4", applicant:"James Wilson",  dba:"MetroBuild",   lob:"Builder's Risk",   producer:"Jane Smith",    createdDate:"2024-04-15" },
  { id:"12", policyNumber:"POL-2024-4204", policyType:"Equipment Floater",    status:"Upcoming Renewal",  effectiveDate:"2023-06-01", expirationDate:"2024-06-01", premium:6200,  clientId:"4", applicant:"Robert Kim",    dba:"MetroBuild",   lob:"Equipment Floater", producer:"Jane Smith",   createdDate:"2023-06-01" },
  // Client 5 — Maria Rodriguez
  { id:"13", policyNumber:"POL-2023-5101", policyType:"Auto Insurance",       status:"Active",            effectiveDate:"2023-12-01", expirationDate:"2024-12-01", premium:8500,  clientId:"5", applicant:"Maria Rodriguez",                   lob:"Auto Insurance",   producer:"Mike Chen",     createdDate:"2023-12-01" },
];
const mockDocuments: Document[] = [
  // Client 1 — Tech Solutions Inc.
  { id:"1", name:"Certificate of Insurance", type:"PDF", uploadDate:"2024-04-05", size:"2.3 MB", clientId:"1", category:"Certificate", policyNumber:"POL-2024-1001", lob:"General Liability", docType:"Certificate" },
  { id:"2", name:"Policy Application - GL Coverage", type:"PDF", uploadDate:"2024-03-20", size:"1.8 MB", clientId:"1", category:"Policy", policyNumber:"POL-2024-1001", lob:"General Liability", docType:"Application" },
  { id:"3", name:"Endorsement - Add Cyber Rider", type:"PDF", uploadDate:"2024-03-18", size:"0.6 MB", clientId:"1", category:"Endorsement", policyNumber:"POL-2024-1001", lob:"General Liability", docType:"Endorsement" },
  { id:"4", name:"Auto Policy Declarations", type:"PDF", uploadDate:"2024-02-12", size:"1.1 MB", clientId:"1", category:"Policy", policyNumber:"POL-2024-1002", lob:"Commercial Auto", docType:"Declarations" },
  { id:"5", name:"Loss Run Report 2023", type:"PDF", uploadDate:"2024-02-15", size:"3.5 MB", clientId:"1", category:"Loss Run" },
  { id:"6", name:"Commercial Auto Schedule", type:"XLSX", uploadDate:"2024-02-10", size:"0.9 MB", clientId:"1", category:"Schedule" },
  { id:"7", name:"Signed Broker of Record Letter", type:"PDF", uploadDate:"2024-01-18", size:"0.4 MB", clientId:"1", category:"Authorization" },
  { id:"8", name:"W-9 Form", type:"PDF", uploadDate:"2024-01-15", size:"0.2 MB", clientId:"1", category:"Tax" },
  // Client 3 — Green Earth Logistics (1 active policy, lighter doc set)
  { id:"9",  name:"Certificate of Insurance",        type:"PDF", uploadDate:"2024-04-12", size:"1.9 MB", clientId:"3", category:"Certificate", policyNumber:"POL-2024-3101", lob:"General Liability", docType:"Certificate" },
  { id:"10", name:"GL Policy Declarations",          type:"PDF", uploadDate:"2024-05-01", size:"2.1 MB", clientId:"3", category:"Policy",      policyNumber:"POL-2024-3101", lob:"General Liability", docType:"Declarations" },
  { id:"11", name:"Loss Run Report 2023",            type:"PDF", uploadDate:"2024-03-15", size:"1.4 MB", clientId:"3", category:"Loss Run" },
  { id:"12", name:"W-9 Form",                         type:"PDF", uploadDate:"2024-03-10", size:"0.2 MB", clientId:"3", category:"Tax" },
  // Client 4 — Metro Construction LLC (5 policies, fuller doc set)
  { id:"13", name:"Workers Comp Policy Declarations",         type:"PDF",  uploadDate:"2024-03-01", size:"2.4 MB", clientId:"4", category:"Policy",      policyNumber:"POL-2024-2201", lob:"Worker's Comp",     docType:"Declarations" },
  { id:"14", name:"Certificate of Insurance",                  type:"PDF",  uploadDate:"2024-04-08", size:"2.0 MB", clientId:"4", category:"Certificate", policyNumber:"POL-2024-2201", lob:"Worker's Comp",     docType:"Certificate" },
  { id:"15", name:"Commercial Auto Policy Application",        type:"PDF",  uploadDate:"2024-04-01", size:"1.7 MB", clientId:"4", category:"Policy",      policyNumber:"POL-2024-4201", lob:"Commercial Auto",   docType:"Application" },
  { id:"16", name:"Endorsement - Increase Liability Limits",   type:"PDF",  uploadDate:"2024-04-20", size:"0.5 MB", clientId:"4", category:"Endorsement", policyNumber:"POL-2024-4202", lob:"General Liability", docType:"Endorsement" },
  { id:"17", name:"Builder's Risk Policy Declarations",        type:"PDF",  uploadDate:"2024-04-15", size:"2.2 MB", clientId:"4", category:"Policy",      policyNumber:"POL-2024-4203", lob:"Builder's Risk",    docType:"Declarations" },
  { id:"18", name:"Premium Audit Worksheet 2023",              type:"XLSX", uploadDate:"2024-02-22", size:"1.3 MB", clientId:"4", category:"Schedule" },
  { id:"19", name:"Loss Run Report 2023",                       type:"PDF",  uploadDate:"2024-02-18", size:"4.1 MB", clientId:"4", category:"Loss Run" },
  { id:"20", name:"W-9 Form",                                   type:"PDF",  uploadDate:"2023-11-08", size:"0.2 MB", clientId:"4", category:"Tax" },
];
const mockActivity: ActivityLog[] = [
  { id:"1",  action:"Policy Renewed",       description:"Policy POL-2024-1001 (General Liability) renewed for another year at $15,000 premium", timestamp:"2024-04-10 10:30 AM", user:"Jane Smith", clientId:"1", type:"policy" },
  { id:"2",  action:"Quote Requested",      description:"New quote requested for Commercial Auto coverage — $15,000 estimated premium", timestamp:"2024-04-10 09:15 AM", user:"System", clientId:"1", type:"quote" },
  { id:"3",  action:"Note Added",           description:"Called to discuss new policy options. Principal mentioned interest in expanding into commercial auto insurance.", timestamp:"2024-04-08 03:00 PM", user:"Jane Smith", clientId:"1", type:"note" },
  { id:"4",  action:"Email Sent",           description:"Sent quote summary and coverage comparison to contact@techsolutions.com", timestamp:"2024-04-07 11:45 AM", user:"Jane Smith", clientId:"1", type:"email" },
  { id:"5",  action:"Document Uploaded",    description:"Certificate of Insurance (2024) uploaded and shared with client portal", timestamp:"2024-04-05 02:45 PM", user:"Jane Smith", clientId:"1", type:"document" },
  { id:"6",  action:"Phone Call",           description:"30-min call — discussed Q2 coverage review, client wants to add Cyber Liability rider", timestamp:"2024-04-03 03:30 PM", user:"Jane Smith", clientId:"1", type:"call" },
  { id:"7",  action:"Renewal Reminder Sent","description":"Automated renewal reminder emailed for 3 policies expiring within 90 days", timestamp:"2024-04-03 11:00 AM", user:"System", clientId:"1", type:"email" },
  { id:"8",  action:"Quote Approved",       description:"General Liability quote QMWC111222333 approved and converted to policy — $8,000 premium", timestamp:"2024-03-28 01:15 PM", user:"Mike Chen", clientId:"1", type:"quote" },
  { id:"9",  action:"Meeting Scheduled",    description:"Quarterly coverage review meeting booked for Apr 15 at 2:00 PM via Zoom", timestamp:"2024-03-25 09:00 AM", user:"Jane Smith", clientId:"1", type:"call" },
  { id:"10", action:"Document Uploaded",    description:"Loss Run Report 2023 uploaded for underwriting review", timestamp:"2024-03-20 10:00 AM", user:"Jane Smith", clientId:"1", type:"document" },
  { id:"11", action:"Note Added",           description:"Client confirmed they are happy with current coverage. No changes requested for Property policy at this time.", timestamp:"2024-03-15 04:00 PM", user:"Mike Chen", clientId:"1", type:"note" },
  { id:"12", action:"Email Sent",           description:"Sent updated schedule of values for Property Insurance renewal to underwriter", timestamp:"2024-03-10 02:30 PM", user:"Jane Smith", clientId:"1", type:"email" },
  { id:"13", action:"Quote Declined",       description:"Commercial Umbrella quote declined — client opted to revisit in Q3", timestamp:"2024-03-05 11:00 AM", user:"System", clientId:"1", type:"quote" },
  { id:"14", action:"Policy Issued",        description:"Property Insurance policy POL-2024-1003 issued and bound at $12,000 annual premium", timestamp:"2024-01-15 09:00 AM", user:"System", clientId:"1", type:"policy" },
  { id:"15", action:"Phone Call",           description:"Onboarding call — reviewed all three policy applications and confirmed coverage requirements", timestamp:"2024-01-10 10:00 AM", user:"Jane Smith", clientId:"1", type:"call" },
  { id:"16", action:"Document Uploaded",    description:"Signed Broker of Record Letter uploaded and filed", timestamp:"2024-01-08 03:15 PM", user:"Jane Smith", clientId:"1", type:"document" },
  { id:"17", action:"Policy Issued",        description:"Commercial Auto policy POL-2024-1002 issued and bound at $18,000 annual premium", timestamp:"2024-02-01 09:00 AM", user:"System", clientId:"1", type:"policy" },
  { id:"18", action:"Email Sent",           description:"Welcome email sent with agent contact info and client portal login credentials", timestamp:"2024-01-06 08:30 AM", user:"System", clientId:"1", type:"email" },
  // Client 2 — John Anderson
  { id:"19", action:"Policy Renewed",       description:"Auto Insurance policy POL-2023-0856 renewed — $7,000 annual premium confirmed", timestamp:"2024-04-08 09:00 AM", user:"Mike Chen", clientId:"2", type:"policy" },
  { id:"20", action:"Email Sent",           description:"Homeowners policy expiration notice sent — expires 2024-10-01", timestamp:"2024-04-06 10:30 AM", user:"System", clientId:"2", type:"email" },
  { id:"21", action:"Phone Call",           description:"Discussed adding umbrella coverage on top of existing auto and homeowners policies", timestamp:"2024-03-20 02:00 PM", user:"Mike Chen", clientId:"2", type:"call" },
  { id:"22", action:"Note Added",           description:"Client prefers to be contacted by phone, not email. Follow up in May for homeowners renewal.", timestamp:"2024-03-18 04:30 PM", user:"Mike Chen", clientId:"2", type:"note" },
  { id:"23", action:"Document Uploaded",    description:"W-9 Form uploaded and verified for records", timestamp:"2024-02-28 11:00 AM", user:"Mike Chen", clientId:"2", type:"document" },
  // Client 3 — Green Earth Logistics
  { id:"24", action:"Quote Requested",      description:"General Liability quote Q-2024-015 requested — $8,000 estimated premium", timestamp:"2024-04-08 08:45 AM", user:"Sarah Johnson", clientId:"3", type:"quote" },
  { id:"25", action:"Quote Requested",      description:"Workers Compensation quote Q-2024-016 requested — $12,000 estimated premium", timestamp:"2024-04-08 08:50 AM", user:"Sarah Johnson", clientId:"3", type:"quote" },
  { id:"26", action:"Email Sent",           description:"Proposal package with two quote options sent to info@greenearth.com", timestamp:"2024-04-09 09:00 AM", user:"Sarah Johnson", clientId:"3", type:"email" },
  { id:"27", action:"Phone Call",           description:"Intro call — prospect confirmed interest in GL and Workers Comp bundle. Decision expected by April 20.", timestamp:"2024-04-05 03:00 PM", user:"Sarah Johnson", clientId:"3", type:"call" },
  { id:"28", action:"Note Added",           description:"Decision maker is the CFO. They want to compare against current carrier before committing. Strong potential.", timestamp:"2024-04-05 03:45 PM", user:"Sarah Johnson", clientId:"3", type:"note" },
  { id:"29", action:"Document Uploaded",    description:"Prospect intake form and ACORD application uploaded for underwriting review", timestamp:"2024-04-03 02:00 PM", user:"Sarah Johnson", clientId:"3", type:"document" },
  // Client 4 — Metro Construction LLC
  { id:"30", action:"Policy Renewed",       description:"Workers Compensation policy POL-2024-2201 renewed at $22,000 — 3rd consecutive renewal", timestamp:"2024-04-11 10:00 AM", user:"Jane Smith", clientId:"4", type:"policy" },
  { id:"31", action:"Phone Call",           description:"Annual coverage review — client expanding to 2 new job sites in NJ, needs updated liability limits", timestamp:"2024-04-09 02:30 PM", user:"Jane Smith", clientId:"4", type:"call" },
  { id:"32", action:"Note Added",           description:"Metro is expanding. Owner wants to discuss adding Commercial Umbrella and Equipment Floater in Q3.", timestamp:"2024-04-09 03:00 PM", user:"Jane Smith", clientId:"4", type:"note" },
  { id:"33", action:"Email Sent",           description:"Sent updated certificate of insurance to Metro's general contractor as requested", timestamp:"2024-04-07 11:00 AM", user:"Jane Smith", clientId:"4", type:"email" },
  { id:"34", action:"Document Uploaded",    description:"2024 payroll summary uploaded for WC audit — $4.2M total payroll reported", timestamp:"2024-04-02 09:30 AM", user:"Jane Smith", clientId:"4", type:"document" },
  { id:"35", action:"Quote Approved",       description:"Commercial Auto fleet quote approved — 12 vehicles, $31,000 annual premium", timestamp:"2024-03-15 01:00 PM", user:"Jane Smith", clientId:"4", type:"quote" },
  { id:"36", action:"Email Sent",           description:"Renewal reminder sent for 5 policies expiring within 60 days", timestamp:"2024-03-01 08:00 AM", user:"System", clientId:"4", type:"email" },
  { id:"37", action:"Policy Issued",        description:"General Liability policy issued and bound — $1M/$2M limits, $15,000 premium", timestamp:"2024-02-15 09:00 AM", user:"System", clientId:"4", type:"policy" },
  // Client 5 — Maria Rodriguez
  { id:"38", action:"Note Added",           description:"Client went inactive after job change. May resume coverage when new employer's benefits are confirmed.", timestamp:"2024-01-20 02:00 PM", user:"Mike Chen", clientId:"5", type:"note" },
  { id:"39", action:"Email Sent",           description:"Re-engagement email sent with updated plan options for individual coverage", timestamp:"2024-01-18 10:00 AM", user:"Mike Chen", clientId:"5", type:"email" },
  { id:"40", action:"Phone Call",           description:"Follow-up call — client confirmed she's reviewing options, will decide within 30 days", timestamp:"2024-01-15 03:30 PM", user:"Mike Chen", clientId:"5", type:"call" },
  { id:"41", action:"Policy Renewed",       description:"Auto Insurance policy renewed at $8,500 for one more year pending status review", timestamp:"2023-12-01 09:00 AM", user:"Mike Chen", clientId:"5", type:"policy" },
];
const mockNotes: Note[] = [
  /* Client 1 — Tech Solutions Inc */
  { id:"n1",  title:"Q2 Policy Discussion",      content:"Called to discuss new policy options. Principal mentioned interest in expanding into commercial auto insurance. Follow up scheduled for next week.", author:"Sarah Johnson", timestamp:"2026-04-05T14:30:00", clientId:"1", type:"Follow-up", visibility:"Shared"  },
  { id:"n2",  title:"Renewal Documents Sent",    content:"Renewal documents sent via email. Waiting for signature on updated contract. Expected completion by end of week.", author:"Mike Chen", timestamp:"2026-04-03T10:15:00", clientId:"1", type:"Policy", visibility:"Shared"  },
  { id:"n3",  title:"Q1 Performance Review",     content:"Outstanding performance this quarter — 25% increase in new policies. Discussed expanding coverage scope for Q2.", author:"Sarah Johnson", timestamp:"2026-04-01T16:45:00", clientId:"1", type:"Meeting", visibility:"Private" },
  { id:"n4",  title:"Coverage Gap Identified",   content:"Identified two coverage gaps in current policy setup. Need to follow up with underwriter on cyber liability options before renewal.", author:"Sarah Johnson", timestamp:"2026-03-20T11:00:00", clientId:"1", type:"Policy", visibility:"Shared"  },
  { id:"n5",  title:"Task: Send Updated SOV",    content:"Send updated schedule of values to underwriter before end of month. Client expanding to new warehouse — need to update property limits.", author:"Mike Chen", timestamp:"2026-03-15T09:30:00", clientId:"1", type:"Task", visibility:"Shared"  },
  /* Client 2 — John Anderson */
  { id:"n6",  title:"Umbrella Coverage Interest",content:"Client expressed interest in adding umbrella coverage on top of existing auto and homeowners. Prefers phone contact. Follow up in May for homeowners renewal.", author:"Mike Chen", timestamp:"2026-04-08T09:30:00", clientId:"2", type:"Follow-up" },
  { id:"n7",  title:"Homeowners Renewal Review", content:"Discussed upcoming homeowners renewal expiring Oct 1. Client wants to review deductible options and possibly increase dwelling coverage.", author:"Mike Chen", timestamp:"2026-03-22T14:00:00", clientId:"2", type:"Policy" },
  { id:"n8",  title:"Annual Check-In Meeting",   content:"Annual review meeting completed. Client satisfied with current auto and homeowners policies. No immediate changes requested.", author:"Mike Chen", timestamp:"2026-02-15T10:00:00", clientId:"2", type:"Meeting" },
  { id:"n9",  title:"Task: Prepare Umbrella Quote", content:"Prepare umbrella liability quote for $1M coverage. Compare 3 carriers. Send by end of April.", author:"Mike Chen", timestamp:"2026-04-10T08:00:00", clientId:"2", type:"Task" },
  /* Client 3 — Green Earth Logistics */
  { id:"n10", title:"Initial Prospect Call",     content:"Prospect meeting completed. Client is interested in Workers Comp and General Liability bundle. Decision expected by April 20.", author:"Jane Smith", timestamp:"2026-04-05T15:00:00", clientId:"3", type:"Meeting" },
  { id:"n11", title:"CFO Decision Timeline",     content:"Decision maker is the CFO. They want to compare against current carrier before committing. Strong potential — priority prospect.", author:"Sarah Johnson", timestamp:"2026-04-05T15:45:00", clientId:"3", type:"General" },
  { id:"n12", title:"WC Quote Follow-Up",        content:"Follow up on Workers Comp quote Q-2024-016. Client hasn't responded in 3 days. Try calling CFO directly.", author:"Jane Smith", timestamp:"2026-04-10T09:00:00", clientId:"3", type:"Follow-up" },
  { id:"n13", title:"Task: Prepare GL Proposal", content:"Prepare a General Liability proposal with two coverage tier options — $1M and $2M limits — for comparison.", author:"Jane Smith", timestamp:"2026-04-08T11:00:00", clientId:"3", type:"Task" },
  /* Client 4 — Metro Contractors */
  { id:"n14", title:"Site Expansion Coverage",   content:"Owner wants to discuss adding Commercial Umbrella and Equipment Floater for 2 new job sites in NJ. Schedule meeting for Q3.", author:"Jane Smith", timestamp:"2026-04-09T15:00:00", clientId:"4", type:"Follow-up" },
  { id:"n15", title:"Annual Coverage Review",    content:"Comprehensive annual review completed. All 5 policies in good standing. Client growing — expanding to 2 new NJ job sites requires updated liability limits.", author:"Jane Smith", timestamp:"2026-04-09T14:00:00", clientId:"4", type:"Meeting" },
  { id:"n16", title:"WC Audit Completed",        content:"2024 payroll summary uploaded for WC audit — $4.2M total payroll reported. Audit should result in small return premium.", author:"Jane Smith", timestamp:"2026-04-02T09:30:00", clientId:"4", type:"Policy" },
  { id:"n17", title:"Task: NJ Site Endorsement", content:"Add NJ job sites to existing GL and WC policies via endorsement. Contact underwriter this week.", author:"Jane Smith", timestamp:"2026-04-11T08:00:00", clientId:"4", type:"Task" },
  /* Client 5 — Maria Rodriguez */
  { id:"n18", title:"Re-engagement Attempt",     content:"Client went inactive after job change. Sent re-engagement email with updated plan options. Awaiting response.", author:"Mike Chen", timestamp:"2026-01-18T10:30:00", clientId:"5", type:"Follow-up" },
  { id:"n19", title:"Coverage Decision Pending", content:"Follow-up call completed — client confirmed she's reviewing options and will decide within 30 days. New employer benefits still being evaluated.", author:"Mike Chen", timestamp:"2026-01-15T15:30:00", clientId:"5", type:"General" },
  { id:"n20", title:"Task: Send Plan Comparison", content:"Prepare side-by-side comparison of individual health and auto options vs employer plan. Send by Jan 25.", author:"Mike Chen", timestamp:"2026-01-20T09:00:00", clientId:"5", type:"Task" },
];

type ViewType = "list" | "detail";
type DetailTab = "overview" | "policies" | "quotes" | "policy-documents" | "file-cabinet" | "activity" | "notes";
type FilterStatus = "All" | "Active" | "Inactive" | "Prospect" | "Starred";
type SortKey = "name" | "status" | "lastActivity" | "activePolicies" | "assignedAgent" | "type" | null;
type SortDir = "asc" | "desc";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getClientName(c: Client) {
  return c.type !== "Individual" ? c.companyName || "Unnamed" : `${c.firstName} ${c.lastName}`;
}

/* ─── Tiny Dropdown ──────────────────────────────────────────────────────── */
function ActionMenu({ isDark, items, menuId, openMenuId, setOpenMenuId }: {
  isDark: boolean; items: string[];
  menuId: string; openMenuId: string | null; setOpenMenuId: (id: string | null) => void;
}) {
  const open = openMenuId === menuId;
  const bg = isDark ? "#1E2240" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const textColor = isDark ? "#F9FAFB" : "#374151";
  const hover = isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6";

  return (
    <div className="relative" style={{ fontFamily: FONT }}>
      <button
        onClick={e => { e.stopPropagation(); setOpenMenuId(open ? null : menuId); }}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: isDark ? "#8B8FA8" : "#9CA3AF" }}
        onMouseEnter={e => (e.currentTarget.style.background = hover)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 rounded-xl shadow-lg min-w-[180px] overflow-hidden"
          style={{ background: bg, border: `1px solid ${border}`, fontFamily: FONT }}
          onMouseDown={e => e.preventDefault()}>
          {items.map(item => (
            <button key={item} onClick={() => setOpenMenuId(null)}
              className="w-full text-left px-3.5 py-2.5 text-[12px] transition-colors"
              style={{ color: item.toLowerCase().includes("delete") ? "#EF4444" : textColor }}
              onMouseEnter={e => (e.currentTarget.style.background = hover)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const styles: Record<string, React.CSSProperties> = {
    Active:    { color: "#73C9B7", background: "rgba(115,201,183,0.10)" },
    Inactive:  { color: isDark ? "#8B8FA8" : "#9CA3AF", background: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" },
    Prospect:  { background: "rgba(147,51,234,0.05)" },
    Pending:   { color: "#F59E0B", background: "rgba(245,158,11,0.08)" },
    "Pending/Action Req.": { color: "#F59E0B", background: "rgba(245,158,11,0.08)" },
    Approved:  { color: "#73C9B7", background: "rgba(115,201,183,0.10)" },
    Declined:  { color: "#EF4444", background: "rgba(239,68,68,0.08)" },
    Cancelled: { color: "#EF4444", background: "rgba(239,68,68,0.08)" },
    Expired:   { color: isDark ? "#8B8FA8" : "#9CA3AF", background: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" },
    "Upcoming Renewals": { color: "#74C3B7", background: "rgba(116,195,183,0.10)" },
    "Upcoming Renewal":  { color: "#74C3B7", background: "rgba(116,195,183,0.10)" },
  };
  const s = styles[status] || { color: "#9CA3AF", background: "#F3F4F6" };
  if (status === "Prospect") {
    return (
      <span
        className="inline-flex items-center justify-center w-fit"
        style={{
          fontFamily: FONT,
          background: "linear-gradient(88.54deg, rgba(92,46,212,0.05) 0.1%, rgba(166,20,195,0.05) 63.88%)",
          borderRadius: 9999,
          padding: "3px 10px",
        }}
      >
        <span
          style={{
            backgroundImage: "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            fontSize: 11,
            fontWeight: 600,
            lineHeight: "16px",
          }}
        >
          {status}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-[3px] rounded-full text-[11px] font-semibold w-fit"
      style={{ fontFamily: FONT, ...s }}>{status}</span>
  );
}

/* ─── Add Client Modal ───────────────────────────────────────────────────── */
function AddClientModal({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) {
  const [clientType, setClientType] = useState("");
  const [clientTypeOpen, setClientTypeOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [contacts, setContacts] = useState<ClientContact[]>([
    { id: `c-${Date.now()}`, type: "inspection", firstName: "", lastName: "", phone: "", email: "" },
  ]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validators: Record<string, (v: string) => string | null> = {
    email: v => !v ? null : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email",
    phone: v => !v ? null : v.replace(/\D/g, "").length === 10 ? null : "Enter a 10-digit phone",
    zip: v => !v ? null : /^\d{5}(-\d{4})?$/.test(v) ? null : "Enter a valid ZIP (5 digits)",
    website: v => !v ? null : /^(https?:\/\/)?([\w-]+\.)+[\w-]+.*$/.test(v) ? null : "Enter a valid URL",
    number: v => !v ? null : /^\$?[\d,]+(\.\d+)?$/.test(v) ? null : "Enter a valid number",
    federalId: v => !v ? null : /^\d{2}-?\d{7}$/.test(v.replace(/\s/g, "")) ? null : "Enter a valid Federal ID (XX-XXXXXXX)",
  };

  const requiredFields = new Set([
    "companyName", "email", "phone", "primaryClassCode", "federalId",
    "grossSales", "payroll", "street", "city", "state", "zip",
  ]);

  const fieldValidators: Record<string, keyof typeof validators> = {
    email: "email",
    phone: "phone",
    zip: "zip",
    mailZip: "zip",
    website: "website",
    grossSales: "number",
    payroll: "number",
    owners: "number",
    employees: "number",
    federalId: "federalId",
  };

  const validateField = (key: string, val: string): string | null => {
    if (requiredFields.has(key) && !val.trim()) return "Required";
    const v = fieldValidators[key];
    if (v) return validators[v](val);
    return null;
  };

  const setField = (key: string, val: string) => {
    setFields(f => ({ ...f, [key]: val }));
    const hasFormatValidator = !!fieldValidators[key];
    if (submitted || errors[key] || (hasFormatValidator && val)) {
      const err = validateField(key, val);
      setErrors(e => {
        const n = { ...e };
        if (err && (err !== "Required" || submitted)) n[key] = err;
        else delete n[key];
        return n;
      });
    }
  };

  const handleSameAddress = (checked: boolean) => {
    setField("sameAddress", checked ? "true" : "false");
    if (checked) {
      setField("mailStreet", fields.street || "");
      setField("mailCity", fields.city || "");
      setField("mailState", fields.state || "");
      setField("mailZip", fields.zip || "");
    }
  };
  const sameAddress = fields.sameAddress === "true";
  const street = fields.street || "";
  const city = fields.city || "";
  const stateVal = fields.state || "";
  const zip = fields.zip || "";
  const mStreet = fields.mailStreet || "";
  const mCity = fields.mailCity || "";
  const mState = fields.mailState || "";
  const mZip = fields.mailZip || "";

  const setStreet = (v: string) => setField("street", v);
  const setCity = (v: string) => setField("city", v);
  const setStateVal = (v: string) => setField("state", v);
  const setZip = (v: string) => setField("zip", v);
  const setMStreet = (v: string) => setField("mailStreet", v);
  const setMCity = (v: string) => setField("mailCity", v);
  const setMState = (v: string) => setField("mailState", v);
  const setMZip = (v: string) => setField("mailZip", v);

  const handleSubmit = () => {
    const allKeys = [...requiredFields, ...Object.keys(fieldValidators), "companyName"];
    const newErrors: Record<string, string> = {};
    for (const k of allKeys) {
      const err = validateField(k, fields[k] || "");
      if (err) newErrors[k] = err;
    }
    if (!clientType) newErrors.clientType = "Required";
    setErrors(newErrors);
    setSubmitted(true);
    if (Object.keys(newErrors).length === 0) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const bg      = isDark ? "#191D35" : "#ffffff";
  const cardBg  = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const text    = isDark ? "#F9FAFB" : "#1F2937";
  const muted   = isDark ? "#8B8FA8" : "#6B7280";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "#E9EAEC";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const teal    = isDark ? "#A78BFA" : "#74C3B7";
  const tealBg  = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const lblSty: React.CSSProperties = { fontFamily: FONT, fontSize: 12, fontWeight: 600, color: text, marginBottom: 5, display: "block" };
  const reqStar = <span style={{ color: "#EF4444", marginLeft: 1 }}>*</span>;
  const inpSty: React.CSSProperties = { fontFamily: FONT, background: inputBg, border: `1px solid ${border}`, color: text, width: "100%", padding: "9px 12px", borderRadius: 7, fontSize: 13, outline: "none" };
  const secCard: React.CSSProperties = { paddingBottom: 8 };
  const secTitle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, fontWeight: 700, color: muted, marginBottom: 14, textTransform: "uppercase" as const, letterSpacing: "0.06em" };

  const errInpSty = (key: string): React.CSSProperties =>
    errors[key]
      ? { ...inpSty, border: `1px solid #EF4444`, background: isDark ? "rgba(239,68,68,0.06)" : "#FEF2F2" }
      : inpSty;

  const F = ({ label, placeholder, req, type = "text", cols = 1, fieldKey }: { label: string; placeholder?: string; req?: boolean; type?: string; cols?: number; fieldKey: string }) => (
    <div style={cols > 1 ? { gridColumn: `span ${cols}` } : {}}>
      <label style={lblSty}>{label}{req && reqStar}</label>
      <input type={type} placeholder={placeholder}
        value={fields[fieldKey] || ""}
        onChange={e => setField(fieldKey, e.target.value)}
        onBlur={e => { const err = validateField(fieldKey, e.target.value); setErrors(x => { const n = { ...x }; if (err) n[fieldKey] = err; else delete n[fieldKey]; return n; }); }}
        style={errInpSty(fieldKey)} className="outline-none w-full" />
      {errors[fieldKey] && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors[fieldKey]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-[680px] max-h-[92vh] flex flex-col rounded-2xl shadow-2xl"
        style={{ background: bg, border: `1px solid ${border}`, fontFamily: FONT }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-7 py-5 flex-shrink-0" style={{ borderBottom: `1px solid ${border}`, background: cardBg, borderRadius: "16px 16px 0 0" }}>
          <div>
            <h2 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: text, marginBottom: 2 }}>Add New Client</h2>
            <p style={{ fontFamily: FONT, fontSize: 12, color: muted }}>Create a new client account</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors mt-0.5" style={{ color: muted }}
            onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#E9EAEC")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form autoComplete="on" onSubmit={e => e.preventDefault()} className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

          {/* ── Account Information ── */}
          <div style={secCard}>
            <p style={secTitle}>Account Information</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <F label="Company Name"   placeholder="Enter company name" req fieldKey="companyName" />
              <div>
                <label style={lblSty}>Entity{reqStar}</label>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => setClientTypeOpen(o => !o)}
                    className="w-full flex items-center justify-between outline-none"
                    style={errors.clientType ? { ...inpSty, cursor: "pointer", border: `1px solid #EF4444`, background: isDark ? "rgba(239,68,68,0.06)" : "#FEF2F2" } : { ...inpSty, cursor: "pointer" }}>
                    <span style={{ color: clientType ? text : muted }}>{clientType || "Select..."}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${clientTypeOpen ? "rotate-180" : ""}`} style={{ color: muted }} />
                  </button>
                  {clientTypeOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg overflow-hidden"
                      style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                      {["Individual", "Corporation", "LLC", "Partnership"].map(opt => {
                        const active = clientType === opt;
                        return (
                          <button key={opt} type="button" onClick={() => { setClientType(opt); setClientTypeOpen(false); setErrors(e => { const n = { ...e }; delete n.clientType; return n; }); }}
                            className="w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors"
                            style={{ fontFamily: FONT, color: active ? "#A614C3" : text, background: active ? "rgba(168,85,247,0.08)" : "transparent" }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB"; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                            <span>{opt}</span>
                            {active && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {errors.clientType && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.clientType}</p>}
              </div>
              <F label="DBA Name or Operating Name" placeholder="Doing business as" fieldKey="dbaName" />
              <F label="Primary Class Code" placeholder="8810-Auto Repair Shops" req fieldKey="primaryClassCode" />
              <F label="Primary Contact First Name" placeholder="Enter first name" fieldKey="contactFirstName" />
              <F label="Primary Contact Last Name"  placeholder="Enter last name" fieldKey="contactLastName" />
              <F label="Email"           placeholder="email@example.com" type="email" req fieldKey="email" />
              <div>
                <label style={lblSty}>Phone{reqStar}</label>
                <input value={fields.phone || ""}
                  onChange={e => setField("phone", formatPhone(e.target.value))}
                  onBlur={e => { const err = validateField("phone", e.target.value); setErrors(x => { const n = { ...x }; if (err) n.phone = err; else delete n.phone; return n; }); }}
                  placeholder="(555) 123-4567" style={errInpSty("phone")} className="outline-none w-full" inputMode="tel" />
                {errors.phone && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.phone}</p>}
              </div>
              <F label="Website"         placeholder="www.example.com" fieldKey="website" />
              <div style={{ gridColumn: "span 2" }}>
                <label style={lblSty}>Description of Operations</label>
                <textarea rows={4} placeholder="Installation, maintenance, and repair of water, sewage, and drainage systems in residential and commercial properties..."
                  value={fields.descOps || ""}
                  onChange={e => setField("descOps", e.target.value)}
                  style={{ ...inpSty, resize: "none", height: "calc(100% - 22px)" }} className="outline-none w-full" />
              </div>
              <F label="Federal ID #" placeholder="12-3456789" req fieldKey="federalId" />
              <F label="Contractor License # (optional)" placeholder="987654321" fieldKey="contractorLicense" />
              <F label="Gross Sales" placeholder="$1000" req fieldKey="grossSales" />
              <F label="Payroll"     placeholder="$1000" req fieldKey="payroll" />
              <F label="# Owners"    placeholder="3" fieldKey="owners" />
              <F label="# Employees" placeholder="5000" fieldKey="employees" />
            </div>
          </div>

          {/* ── Contacts (ACORD: inspection / accounting / claims) ── */}
          <div style={secCard}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ ...secTitle, marginBottom: 0 }}>Contacts</p>
              <span className="text-[11px]" style={{ fontFamily: FONT, color: muted }}>
                {contacts.length} contact{contacts.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-3">
              {contacts.map((ct, idx) => {
                const palette = CONTACT_TYPE_PALETTE[ct.type];
                return (
                  <div key={ct.id} className="rounded-xl p-3"
                    style={{ background: cardBg, border: `1px solid ${border}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: palette.color }} />
                    <div className="flex items-center justify-between mb-2.5" style={{ paddingLeft: 4 }}>
                      <select value={ct.type}
                        onChange={e => setContacts(prev => prev.map((p,i) => i===idx ? { ...p, type: e.target.value as ClientContactType } : p))}
                        className="px-2.5 py-1 rounded-md outline-none text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: FONT, background: palette.bg, border: `1px solid ${palette.bg}`, color: palette.color, letterSpacing: "0.08em" }}>
                        <option value="inspection">Inspection</option>
                        <option value="accounting">Accounting</option>
                        <option value="claims">Claims</option>
                      </select>
                      {contacts.length > 1 && (
                        <button type="button" title="Remove contact"
                          onClick={() => setContacts(prev => prev.filter((_,i) => i !== idx))}
                          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                          style={{ color: muted }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; e.currentTarget.style.color = "#EF4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = muted; }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5" style={{ paddingLeft: 4 }}>
                      <input value={ct.firstName} placeholder="First name"
                        onChange={e => setContacts(prev => prev.map((p,i) => i===idx ? { ...p, firstName: e.target.value } : p))}
                        style={{ ...inpSty, padding: "7px 10px", fontSize: 12 }} className="outline-none" />
                      <input value={ct.lastName} placeholder="Last name"
                        onChange={e => setContacts(prev => prev.map((p,i) => i===idx ? { ...p, lastName: e.target.value } : p))}
                        style={{ ...inpSty, padding: "7px 10px", fontSize: 12 }} className="outline-none" />
                      <input value={ct.phone || ""} placeholder="(555) 123-4567" inputMode="tel"
                        onChange={e => setContacts(prev => prev.map((p,i) => i===idx ? { ...p, phone: formatPhone(e.target.value) } : p))}
                        style={{ ...inpSty, padding: "7px 10px", fontSize: 12 }} className="outline-none" />
                      <input value={ct.email || ""} placeholder="name@example.com" type="email"
                        onChange={e => setContacts(prev => prev.map((p,i) => i===idx ? { ...p, email: e.target.value } : p))}
                        style={{ ...inpSty, padding: "7px 10px", fontSize: 12 }} className="outline-none" />
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button"
              onClick={() => setContacts(prev => [...prev, { id: `c-${Date.now()}`, type: "inspection", firstName: "", lastName: "", phone: "", email: "" }])}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ fontFamily: FONT, border: `1px dashed ${border}`, color: text, background: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <Plus className="w-3.5 h-3.5" />Add another contact
            </button>
          </div>

          {/* ── Physical Address ── */}
          <div style={secCard}>
            <p style={secTitle}>Physical Address</p>
            <div className="grid gap-y-4">
              <div>
                <label style={lblSty}>Street Address{reqStar}</label>
                <AddressAutocomplete
                  value={street}
                  onChange={setStreet}
                  onSelect={a => {
                    setStreet(a.street);
                    if (a.city) setCity(a.city);
                    if (a.state) setStateVal(a.state);
                    if (a.zip) setZip(a.zip);
                  }}
                  placeholder="123 Main Street"
                  inputStyle={errInpSty("street")}
                  className="outline-none w-full"
                  dropdownBg={inputBg} dropdownText={text} dropdownBorder={border}
                />
                {errors.street && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.street}</p>}
              </div>
              <div className="grid grid-cols-3 gap-x-4">
                <div>
                  <label style={lblSty}>City{reqStar}</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="City"
                    autoComplete="address-level2" style={errInpSty("city")} className="outline-none w-full" />
                  {errors.city && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.city}</p>}
                </div>
                <div>
                  <label style={lblSty}>State{reqStar}</label>
                  <input value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="State"
                    autoComplete="address-level1" style={errInpSty("state")} className="outline-none w-full" />
                  {errors.state && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.state}</p>}
                </div>
                <div>
                  <label style={lblSty}>ZIP Code{reqStar}</label>
                  <input value={zip} onChange={e => setZip(e.target.value)}
                    onBlur={e => { const err = validateField("zip", e.target.value); setErrors(x => { const n = { ...x }; if (err) n.zip = err; else delete n.zip; return n; }); }}
                    placeholder="12345"
                    autoComplete="postal-code" style={errInpSty("zip")} className="outline-none w-full" />
                  {errors.zip && <p className="text-[11px] mt-1" style={{ color: "#EF4444", fontFamily: FONT }}>{errors.zip}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Mailing Address ── */}
          <div style={secCard}>
            <p style={{ ...secTitle, marginBottom: 12 }}>Mailing Address</p>
            <label className="flex items-center gap-2 cursor-pointer select-none mb-4" style={{ fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>
              <div onClick={() => handleSameAddress(!sameAddress)}
                className="w-[16px] h-[16px] rounded flex items-center justify-center flex-shrink-0"
                style={{ background: sameAddress ? "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)" : inputBg, border: sameAddress ? "none" : `1.5px solid ${border}` }}>
                {sameAddress && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              Same as Physical Address
            </label>
            <div className="grid gap-y-4">
              <div>
                <label style={lblSty}>Street Address</label>
                <AddressAutocomplete
                  value={sameAddress ? street : mStreet}
                  onChange={setMStreet}
                  onSelect={a => {
                    setMStreet(a.street);
                    if (a.city) setMCity(a.city);
                    if (a.state) setMState(a.state);
                    if (a.zip) setMZip(a.zip);
                  }}
                  placeholder="123 Main Street"
                  disabled={sameAddress}
                  containerStyle={{ opacity: sameAddress ? 0.6 : 1 }}
                  inputStyle={inpSty}
                  className="outline-none w-full"
                  dropdownBg={inputBg} dropdownText={text} dropdownBorder={border}
                />
              </div>
              <div className="grid grid-cols-3 gap-x-4">
                <div>
                  <label style={lblSty}>City</label>
                  <input value={sameAddress ? city : mCity} onChange={e => setMCity(e.target.value)}
                    placeholder="City" readOnly={sameAddress}
                    autoComplete="address-level2" style={{ ...inpSty, opacity: sameAddress ? 0.6 : 1 }} className="outline-none w-full" />
                </div>
                <div>
                  <label style={lblSty}>State</label>
                  <input value={sameAddress ? stateVal : mState} onChange={e => setMState(e.target.value)}
                    placeholder="State" readOnly={sameAddress}
                    autoComplete="address-level1" style={{ ...inpSty, opacity: sameAddress ? 0.6 : 1 }} className="outline-none w-full" />
                </div>
                <div>
                  <label style={lblSty}>ZIP Code</label>
                  <input value={sameAddress ? zip : mZip} onChange={e => setMZip(e.target.value)}
                    placeholder="12345" readOnly={sameAddress}
                    autoComplete="postal-code" style={{ ...inpSty, opacity: sameAddress ? 0.6 : 1 }} className="outline-none w-full" />
                </div>
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${border}`, background: cardBg, borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose}
            className="px-5 py-[8px] rounded-lg text-[12px] font-normal transition-colors"
            style={{ fontFamily: FONT, border: `1px solid ${border}`, color: text, background: "#FFFFFF" }}>
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-5 py-[8px] rounded-lg text-[12px] font-semibold text-white transition-all"
            style={{ fontFamily: FONT, background: tealBg }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
            Create Client
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Clients({ isDark = false }: { isDark?: boolean }) {
  const [view, setView] = useState<ViewType>("list");
  const [selected, setSelected] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [highlightFilter, setHighlightFilter] = useState<"incomplete-quotes" | "active-policies" | "renewals" | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  // Refresh — spins for 0.9s AND clears every user-applied filter, returning the
  // table to the unfiltered default. Acts as a one-tap "reset view" on top of the
  // refresh affordance. The actual data fetch is mocked.
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
    setFilterStatus("All");
    setSearch("");
    setDateRange("All Time");
    setHiddenCols(new Set());
    setSortKey(null);
    setSortDir("asc");
    setPage(1);
  };
  // Toolbar state — date scope dropdown + column-visibility "View" popover.
  // Defaults to "All Time" so the mock data (mostly 2024) isn't filtered out on page load.
  const [dateRange, setDateRange] = useState("All Time");
  const [dateOpen, setDateOpen]   = useState(false);
  const [viewOpen, setViewOpen]   = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const CLIENT_COLS: Array<{ key: string; label: string }> = [
    { key: "name",          label: "Client Name"   },
    { key: "type",          label: "Entity"        },
    { key: "contact",       label: "Contact"       },
    { key: "assignedAgent", label: "Agent"         },
    { key: "status",        label: "Status"        },
    { key: "activePolicies",label: "Policies"      },
    { key: "lastActivity",  label: "Last Activity" },
  ];
  const closeAllToolbarDropdowns = () => { setDateOpen(false); setViewOpen(false); setPageSizeOpen(false); };

  // Export preview modal state. Mirrors the Policies Export modal's scope + columns +
  // preview pattern; kept narrower (CSV only, no multi-format split button) since the
  // mock doesn't need TSV / XLSX / JSON yet.
  type ClientExportColKey = "name" | "type" | "email" | "phone" | "assignedAgent" | "status" | "activePolicies" | "lastActivity";
  const CLIENT_EXPORT_COLS: Array<{ key: ClientExportColKey; label: string; get: (cl: Client & { isStarred?: boolean }) => string }> = [
    { key: "name",           label: "Client Name",   get: cl => getClientName(cl) },
    { key: "type",           label: "Entity",        get: cl => cl.type },
    { key: "email",          label: "Email",         get: cl => cl.email },
    { key: "phone",          label: "Phone",         get: cl => cl.phone },
    { key: "assignedAgent",  label: "Agent",         get: cl => cl.assignedAgent },
    { key: "status",         label: "Status",        get: cl => cl.status },
    { key: "activePolicies", label: "Active Policies", get: cl => String(cl.activePolicies) },
    { key: "lastActivity",   label: "Last Activity", get: cl => new Date(cl.lastActivity).toLocaleDateString() },
  ];
  const [exportOpen, setExportOpen]     = useState(false);
  const [exportScope, setExportScope]   = useState<"filtered" | "all">("filtered");
  const [exportCols, setExportCols]     = useState<Set<ClientExportColKey>>(new Set(CLIENT_EXPORT_COLS.map(col => col.key)));
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [stars, setStars] = useState<Set<string>>(new Set(mockClients.filter(c => c.isStarred).map(c => c.id)));
  const [starLimitToast, setStarLimitToast] = useState(false);
  const [detailSearch, setDetailSearch] = useState("");
  // Quotes/Policies filter state (matches Agencies)
  const [applicantFilter, setApplicantFilter] = useState<Set<string>>(new Set());
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantOpen, setApplicantOpen] = useState(false);
  const [lobFilter, setLobFilter] = useState("All LOBs");
  const [lobOpen, setLobOpen] = useState(false);
  const [qpStatusFilter, setQpStatusFilter] = useState("All Statuses");
  const [qpStatusOpen, setQpStatusOpen] = useState(false);
  const [producerFilter, setProducerFilter] = useState<Set<string>>(new Set());
  const [producerSearch, setProducerSearch] = useState("");
  const [producerOpen, setProducerOpen] = useState(false);
  const [qpSortKey, setQpSortKey] = useState<"createdDate"|"submissionId"|"policyNumber"|"dba"|"effectiveDate">("createdDate");
  const [qpSortDir, setQpSortDir] = useState<"asc"|"desc">("desc");
  const [qpViewOpen, setQpViewOpen] = useState(false);
  const [qpHiddenCols, setQpHiddenCols] = useState<Set<string>>(new Set());
  const QP_COLUMNS: Array<{ key: string; label: string; width: string }> = [
    { key: "created",      label: "Created",       width: "1.1fr" },
    { key: "policyNumber", label: "Policy Number", width: "1.6fr" },
    { key: "applicant",    label: "Applicant",     width: "1.2fr" },
    { key: "dba",          label: "DBA",           width: "1fr"   },
    { key: "effective",    label: "Effective",     width: "1.1fr" },
    { key: "lob",          label: "LOB",           width: "1.1fr" },
    { key: "status",       label: "Status",        width: "1.2fr" },
    { key: "producer",     label: "Producer",      width: "1.2fr" },
  ];
  const qpVisibleCols = QP_COLUMNS.filter(col => !qpHiddenCols.has(col.key));
  const qpGridTemplate = qpVisibleCols.map(col => col.width).join(" ");
  const [docDragOver, setDocDragOver] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // File-cabinet right-click menu state.
  const [fileCtxMenu, setFileCtxMenu] = useState<{ x: number; y: number; docId: string } | null>(null);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  // Demo overrides for renamed/deleted file-cabinet docs (mockDocuments stays untouched).
  const [docNameOverrides, setDocNameOverrides] = useState<Record<string, string>>({});
  const [deletedDocIds, setDeletedDocIds] = useState<Set<string>>(new Set());
  const [archivedDocIds, setArchivedDocIds] = useState<Set<string>>(new Set());
  // Newly-uploaded docs appended at runtime (mockDocuments stays untouched).
  const [extraDocs, setExtraDocs] = useState<Document[]>([]);
  // Doc preview pane (shared between Policy Documents & File Cabinet — only one open at a time).
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  // Doc-tab toolbar state — separate per tab so filters don't bleed.
  type DocView = "all" | "byType" | "table";
  const [pdView, setPdView] = useState<DocView>("table");
  const [pdShowArchived, setPdShowArchived] = useState(false);
  const [pdShowTrashed, setPdShowTrashed] = useState(false);
  const [pdFilterCat, setPdFilterCat] = useState<string>("All");
  const [pdSortDir, setPdSortDir] = useState<"asc"|"desc">("desc");
  const [pdSearch, setPdSearch] = useState("");
  const [pdSearchOpen, setPdSearchOpen] = useState(false);
  const [pdFilterOpen, setPdFilterOpen] = useState(false);
  const [pdSortOpen, setPdSortOpen] = useState(false);
  const [pdUploadOpen, setPdUploadOpen] = useState(false);
  const [fcView, setFcView] = useState<DocView>("all");
  const [fcShowArchived, setFcShowArchived] = useState(false);
  const [fcShowTrashed, setFcShowTrashed] = useState(false);
  const [fcFilterCat, setFcFilterCat] = useState<string>("All");
  const [fcSortDir, setFcSortDir] = useState<"asc"|"desc">("desc");
  const [fcSearch, setFcSearch] = useState("");
  const [fcSearchOpen, setFcSearchOpen] = useState(false);
  const [fcFilterOpen, setFcFilterOpen] = useState(false);
  const [fcSortOpen, setFcSortOpen] = useState(false);
  const [fcUploadOpen, setFcUploadOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteType, setNewNoteType] = useState<Note["type"]>("General");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [noteView, setNoteView] = useState<"list" | "board" | "table">("list");
  const [noteSearch, setNoteSearch] = useState("");
  const [noteSearchOpen, setNoteSearchOpen] = useState(false);
  const [noteSortDir, setNoteSortDir] = useState<"asc" | "desc">("desc");
  const [noteFilterType, setNoteFilterType] = useState<"All" | Note["type"]>("All");
  const [noteFilterOpen, setNoteFilterOpen] = useState(false);
  const [noteSortOpen, setNoteSortOpen] = useState(false);
  const [noteNewOpen, setNoteNewOpen] = useState(false);
  const [noteAddOpen, setNoteAddOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteType, setEditingNoteType] = useState<Note["type"]>("General");
  const [editingNoteVisibility, setEditingNoteVisibility] = useState<NonNullable<Note["visibility"]>>("Shared");
  const [visibilityFilter, setVisibilityFilter] = useState<"All"|"Private"|"Shared">("All");
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [noteLocked, setNoteLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState("Sarah Johnson");
  const [archivedNoteIds, setArchivedNoteIds] = useState<Set<string>>(new Set());
  const [trashedNoteIds, setTrashedNoteIds] = useState<Set<string>>(new Set());
  const [pinnedNoteIds, setPinnedNoteIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [noteMoreOpen, setNoteMoreOpen] = useState(false);
  const [copyToast, setCopyToast] = useState("");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const CURRENT_USER = "Sarah Johnson";
  const [activityFilter, setActivityFilter] = useState<"all"|"policy"|"quote"|"document"|"email"|"call"|"note">("all");
  const [activityLogs, setActivityLogs] = useState(mockActivity);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [newActivityType, setNewActivityType] = useState<"policy"|"quote"|"document"|"email"|"call"|"note">("call");
  const [newActivityAction, setNewActivityAction] = useState("");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [zoomTopic, setZoomTopic] = useState("");
  const [zoomDate, setZoomDate] = useState("");
  const [zoomTime, setZoomTime] = useState("14:00");
  const [zoomDuration, setZoomDuration] = useState("30");
  const [zoomNotes, setZoomNotes] = useState("");
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingAddr, setEditingAddr] = useState(false);
  // Live, editable contacts list while in edit mode. Populated from `selected.contacts` on entering edit.
  const [contactsDraft, setContactsDraft] = useState<ClientContact[]>([]);
  // Per-client overrides applied after Save (so the new shape persists across detail re-opens for the demo).
  const [contactsOverrides, setContactsOverrides] = useState<Record<string, ClientContact[]>>({});
  const [editWarningOpen, setEditWarningOpen] = useState(false);
  const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(null);
  const [contactCardEditing, setContactCardEditing] = useState(false);
  const [contactDraftName, setContactDraftName] = useState("");
  const [contactDraftPhone, setContactDraftPhone] = useState("");
  const [contactDraftEmail, setContactDraftEmail] = useState("");
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editSelectOpen, setEditSelectOpen] = useState<string | null>(null);

  /* Colours */
  const c = {
    text:        isDark ? "#F9FAFB" : "#1F2937",
    muted:       isDark ? "#8B8FA8" : "#6B7280",
    sub:         isDark ? "#6B7280" : "#9CA3AF",
    cardBg:      isDark ? "#191D35" : "#fff",
    border:      isDark ? "rgba(255,255,255,0.08)" : "#E9EAEC",
    borderStrong: isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB",
    hoverBg:     isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB",
    mutedBg:     isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    inputBg:     isDark ? "rgba(255,255,255,0.05)" : "#fff",
    primary:     "#A614C3",
    primaryBg:   "rgba(166,20,195,0.10)",
    teal:        "#73C9B7",
    accentGrad:  isDark
      ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
      : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)",
    accentShadow: isDark ? "0 4px 14px rgba(92,46,212,0.4)" : "0 4px 10px rgba(116,195,183,0.35)",
  };

  const font = { fontFamily: FONT };

  /* Filter + search */
  const allClients = mockClients.map(cl => ({ ...cl, isStarred: stars.has(cl.id) }));
  // Date-scope cutoff — drop a client when its lastActivity is older than the window.
  // "All Time" disables the filter (cutoff = -Infinity matches every date).
  const dateCutoffMs = (() => {
    if (dateRange === "All Time") return -Infinity;
    const days = dateRange === "Last 30 days" ? 30 : dateRange === "Last 60 days" ? 60 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  })();
  const filtered = allClients.filter(cl => {
    if (filterStatus === "Starred" && !cl.isStarred) return false;
    if (filterStatus !== "All" && filterStatus !== "Starred" && cl.status !== filterStatus) return false;
    if (new Date(cl.lastActivity).getTime() < dateCutoffMs) return false;
    if (search) {
      const name = getClientName(cl).toLowerCase();
      return name.includes(search.toLowerCase()) || cl.email.toLowerCase().includes(search.toLowerCase()) || cl.phone.includes(search);
    }
    return true;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...filtered].sort((a, b) => {
    // stars always first when no sort key
    if (!sortKey) {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    }
    let valA: string | number = "";
    let valB: string | number = "";
    if (sortKey === "name") { valA = getClientName(a).toLowerCase(); valB = getClientName(b).toLowerCase(); }
    else if (sortKey === "status") { valA = a.status; valB = b.status; }
    else if (sortKey === "lastActivity") { valA = new Date(a.lastActivity).getTime(); valB = new Date(b.lastActivity).getTime(); }
    else if (sortKey === "activePolicies") { valA = a.activePolicies; valB = b.activePolicies; }
    else if (sortKey === "assignedAgent") { valA = a.assignedAgent.toLowerCase(); valB = b.assignedAgent.toLowerCase(); }
    else if (sortKey === "type") { valA = a.type; valB = b.type; }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const pageItems = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const starredClients = allClients.filter(cl => cl.isStarred);

  const toggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStars(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else if (n.size < 6) { n.add(id); } else { setStarLimitToast(true); setTimeout(() => setStarLimitToast(false), 3000); } return n; });
  };

  const openDetail = (cl: Client) => {
    setSelected({ ...cl, isStarred: stars.has(cl.id) });
    setView("detail");
    setDetailTab("overview");
    setDetailSearch("");
  };

  /* Section title */
  const sectionTitle = (
    <div className="flex flex-col justify-center flex-shrink-0 mb-12"
      style={{ height: 71, borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
      <h1 className="text-[22px] font-normal" style={{ ...font, color: c.text }}>Clients</h1>
    </div>
  );

  /* Sort arrow icon — rounded up/down arrows */
  const SortIcon = ({ col }: { col: SortKey }) => {
    const active = sortKey === col;
    const upColor   = active && sortDir === "asc"  ? c.text : c.sub;
    const downColor = active && sortDir === "desc" ? c.text : c.sub;
    return (
      <span className="inline-flex items-center ml-1 flex-shrink-0" style={{ verticalAlign: "middle", gap: 1 }}>
        {/* Up arrow */}
        <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
          <path d="M3.5 9V2M3.5 2L1.5 4M3.5 2L5.5 4" stroke={upColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Down arrow */}
        <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
          <path d="M3.5 1V8M3.5 8L1.5 6M3.5 8L5.5 6" stroke={downColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  };

  /* Sortable table header cell */
  const th = (label: string, col?: SortKey, align: "left" | "center" = "left") => (
    <button
      className={`flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider w-full ${align === "center" ? "justify-center text-center" : "text-left"}`}
      style={{ fontFamily: FONT, color: c.muted, cursor: col ? "pointer" : "default", background: "none", border: "none", padding: 0, minWidth: 0, overflow: "hidden" }}
      onClick={() => col && handleSort(col)}
    >
      {label}
      {col && <SortIcon col={col} />}
    </button>
  );

  /* Button gradient — dark: radial dark overlay + linear; light: plain linear */
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const initials = (n: string) => { const parts = n.trim().split(/\s+/); return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : n.slice(0, 2).toUpperCase(); };
  const avatarStyle: React.CSSProperties = { background: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.12)" };
  const avatarTextStyle: React.CSSProperties = { backgroundImage: "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
  /* Input style */
  const inputSty: React.CSSProperties = {
    fontFamily: FONT, background: c.inputBg, border: `1px solid ${c.border}`,
    color: c.text, padding: "8px 14px", borderRadius: 10, fontSize: 13, outline: "none",
  };

  /* ── DETAIL TAB BUTTON ── */
  const detailTabBtn = (tab: DetailTab, label: string, Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>) => (
    <button onClick={() => { setDetailTab(tab); setDetailSearch(""); setHighlightFilter(null); }}
      className="flex items-center gap-1.5 px-4 py-3 text-[13px] font-normal relative transition-colors"
      style={{ fontFamily: FONT, color: detailTab === tab ? (isDark ? "#fff" : "#A614C3") : c.muted, letterSpacing: "0.01em" }}
      onMouseEnter={e => { if (detailTab !== tab) e.currentTarget.style.color = c.text; }}
      onMouseLeave={e => { if (detailTab !== tab) e.currentTarget.style.color = c.muted; }}>
      <Icon className="w-[15px] h-[15px]" style={{ color: detailTab === tab ? "#A614C3" : undefined }} />
      {label}
      {detailTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }} />}
    </button>
  );

  /* ── DETAIL CLIENT DATA ── */
  const closeAllQpDropdowns = () => { setApplicantOpen(false); setLobOpen(false); setQpStatusOpen(false); setProducerOpen(false); };
  const toggleSetCl = (set: Set<string>, v: string, setter: (s: Set<string>) => void) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };
  const ALL_LOBS_CL = ["All LOBs","General Liability","Worker's Comp","Business Owners","Professional Liability","Excess","Bonds","Commercial Auto","Property","Cyber Liability","Builder's Risk","Equipment Floater","Auto Insurance","Homeowners","Umbrella"];
  const POLICY_STATUSES_CL = ["All Statuses","Active","Expired","Upcoming Renewal","Cancelled"];
  const QUOTE_STATUSES_CL  = ["All Statuses","Sold/Issued","Pending","Approved","Incomplete","Declined"];
  const sortQp = <T extends { createdDate?: string; effectiveDate?: string; dba?: string; quoteId?: string; policyNumber?: string }>(arr: T[]) => arr.slice().sort((a, b) => {
    let av: string | number = "", bv: string | number = "";
    if (qpSortKey === "createdDate")    { av = new Date(a.createdDate || "").getTime(); bv = new Date(b.createdDate || "").getTime(); }
    else if (qpSortKey === "effectiveDate") { av = new Date(a.effectiveDate || "").getTime(); bv = new Date(b.effectiveDate || "").getTime(); }
    else if (qpSortKey === "dba")           { av = a.dba || ""; bv = b.dba || ""; }
    else if (qpSortKey === "submissionId")  { av = a.quoteId || ""; bv = b.quoteId || ""; }
    else if (qpSortKey === "policyNumber")  { av = a.policyNumber || ""; bv = b.policyNumber || ""; }
    if (av < bv) return qpSortDir === "asc" ? -1 : 1;
    if (av > bv) return qpSortDir === "asc" ? 1 : -1;
    return 0;
  });
  const clientPoliciesRaw = selected ? mockPolicies.filter(p => p.clientId === selected.id && (!detailSearch || p.policyNumber.toLowerCase().includes(detailSearch.toLowerCase()) || p.policyType.toLowerCase().includes(detailSearch.toLowerCase())) && (highlightFilter !== "renewals" || p.status === "Upcoming Renewal") && (highlightFilter !== "active-policies" || p.status === "Active")) : [];
  const clientQuotesRaw   = selected ? mockQuotes.filter(q => q.clientId === selected.id && (!detailSearch || q.quoteId.toLowerCase().includes(detailSearch.toLowerCase()) || q.policyType.toLowerCase().includes(detailSearch.toLowerCase())) && (highlightFilter !== "renewals" || q.status === "Upcoming Renewals") && (highlightFilter !== "incomplete-quotes" || q.status === "Incomplete")) : [];
  const uniquePApplicants = Array.from(new Set(clientPoliciesRaw.map(p => p.applicant))).sort();
  const uniquePProducers  = Array.from(new Set(clientPoliciesRaw.map(p => p.producer))).sort();
  const uniqueQApplicants = Array.from(new Set(clientQuotesRaw.map(q => q.applicant))).sort();
  const uniqueQProducers  = Array.from(new Set(clientQuotesRaw.map(q => q.producer))).sort();
  const clientPolicies = sortQp(clientPoliciesRaw
    .filter(p => applicantFilter.size === 0 || applicantFilter.has(p.applicant))
    .filter(p => lobFilter === "All LOBs" || p.lob === lobFilter)
    .filter(p => qpStatusFilter === "All Statuses" || p.status === qpStatusFilter)
    .filter(p => producerFilter.size === 0 || producerFilter.has(p.producer)));
  const clientQuotes = sortQp(clientQuotesRaw
    .filter(q => applicantFilter.size === 0 || applicantFilter.has(q.applicant))
    .filter(q => lobFilter === "All LOBs" || q.lob === lobFilter)
    .filter(q => qpStatusFilter === "All Statuses" || q.status === qpStatusFilter)
    .filter(q => producerFilter.size === 0 || producerFilter.has(q.producer)));
  const incompleteQuotesCount = selected ? mockQuotes.filter(q => q.clientId === selected.id && q.status === "Incomplete").length : 0;
  const upcomingRenewalsCount = selected ? mockPolicies.filter(p => p.clientId === selected.id && p.status === "Upcoming Renewal").length : 0;
  const clientDocs     = selected ? mockDocuments
    .filter(d => !deletedDocIds.has(d.id))
    .map(d => docNameOverrides[d.id] ? { ...d, name: docNameOverrides[d.id] } : d)
    .filter(d => d.clientId === selected.id && (!detailSearch || d.name.toLowerCase().includes(detailSearch.toLowerCase()))) : [];
  // Includes archived + trashed — used by the Documents toolbar for Archive/Trash views.
  const allClientDocs = selected ? [...mockDocuments, ...extraDocs]
    .map(d => docNameOverrides[d.id] ? { ...d, name: docNameOverrides[d.id] } : d)
    .filter(d => d.clientId === selected.id) : [];
  const clientActivity = selected ? activityLogs.filter(a => a.clientId === selected.id) : [];
  const clientNotes    = selected ? notes.filter(n => n.clientId === selected.id) : [];

  /* ══════════════════════ LIST VIEW ══════════════════════ */
  if (view === "list") return (
    <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: FONT }} onClick={() => { setOpenMenuId(null); closeAllToolbarDropdowns(); }}>
      {starLimitToast && (
        <div className="fixed top-[68px] right-6 z-50 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
          style={{ background: isDark ? "#1E2240" : "#fff", color: c.text, border: `1px solid ${c.border}`, fontFamily: FONT, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          ⭐ You can only pin up to 6 clients
        </div>
      )}
      {/* Top section — title, then 4-card KPI strip, then toolbar.
          Same visual order as the Policies page (KPI above toolbar). */}
      <div>
        {sectionTitle}

        {/* KPI strip — gradient `Add Client` tile + 3 stat cards (Active / Inactive / Prospect).
            The primary action lives as the first tile (brand gradient + Plus icon), matching the
            Policies page's "Start a Quote" pattern. Status cards remain clickable quick-filters. */}
        {(() => {
          const activeCount   = allClients.filter(cl => cl.status === "Active").length;
          const inactiveCount = allClients.filter(cl => cl.status === "Inactive").length;
          const prospectCount = allClients.filter(cl => cl.status === "Prospect").length;
          // Card order: Prospect → Active → Inactive. Prospects sit first because they're
          // the most actionable bucket — new business in the pipeline that producers should
          // be working — so they earn the spot right after the Add Client primary action.
          const statusSummary: { key: FilterStatus; label: string; sub: string; count: number }[] = [
            { key: "Prospect", label: "Prospect", sub: "In pipeline",          count: prospectCount },
            { key: "Active",   label: "Active",   sub: "Currently insured",    count: activeCount   },
            { key: "Inactive", label: "Inactive", sub: "Lapsed or terminated", count: inactiveCount },
          ];
          return (
            <div className="grid gap-3 mb-5 flex-shrink-0"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
              onClick={e => e.stopPropagation()}>
              {/* Add Client — primary action tile, gradient + Plus icon. */}
              <button onClick={() => setModalOpen(true)}
                className="rounded-2xl px-5 py-4 text-left cursor-pointer flex flex-col justify-between"
                style={{ background: btnGrad, color: "#fff", border: "none", transition: "filter 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}>
                <div className="flex items-start justify-between gap-3 mb-0.5">
                  <div className="text-[15px] font-semibold">Add Client</div>
                  <div className="flex-shrink-0"><Plus className="w-6 h-6" strokeWidth={2.5} /></div>
                </div>
                <div className="text-[11px]" style={{ opacity: 0.9 }}>New client record</div>
              </button>
              {statusSummary.map(s => {
                const active = filterStatus === s.key;
                return (
                  <button key={s.key}
                    onClick={() => { setFilterStatus(active ? "All" : s.key); setPage(1); }}
                    className="rounded-2xl px-5 py-4 text-left cursor-pointer transition-all"
                    style={{
                      background: c.cardBg,
                      border: `1px solid ${active ? (isDark ? "#4ECDC4" : "#A614C3") : c.border}`,
                    }}
                    onMouseEnter={e => {
                      // Hover only nudges the border darker — no bg tint, so the
                      // transition into the active state (purple border, still cardBg
                      // background) is clean and doesn't leave a stuck gray fill.
                      if (!active) {
                        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.20)" : "#D1D5DB";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.borderColor = c.border;
                      }
                    }}>
                    <div className="flex items-start justify-between gap-3 mb-0.5">
                      <div className="text-[15px] font-semibold truncate" style={{ color: c.text }}>{s.label}</div>
                      <div className="text-[24px] font-semibold leading-none tracking-tight flex-shrink-0"
                        style={{ color: active ? (isDark ? "#4ECDC4" : "#A614C3") : c.text }}>
                        {s.count}
                      </div>
                    </div>
                    <div className="text-[11px]" style={{ color: c.muted }}>{s.sub}</div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-4 mb-3 flex-shrink-0 flex-wrap" onClick={e => e.stopPropagation()}>
          {/* Date scope dropdown — filters clients by `lastActivity` falling within the
              selected window (relative to today). "All Time" disables the filter. */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { closeAllToolbarDropdowns(); setDateOpen(o => !o); }}
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: c.muted }} />
              {dateRange}
              <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ opacity: 0.6, transform: dateOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {dateOpen && (
              <div className="absolute left-0 z-30 rounded-lg overflow-hidden py-1 min-w-[160px]"
                style={{ top: "calc(100% + 6px)", background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: "0 12px 28px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.04)" }}>
                {["Last 30 days", "Last 60 days", "Last 90 days", "All Time"].map(opt => {
                  const active = opt === dateRange;
                  return (
                    <button key={opt} onClick={() => { setDateRange(opt); setDateOpen(false); setPage(1); }}
                      className="w-full px-2.5 py-1.5 text-left text-[12px] flex items-center gap-2 cursor-pointer transition-colors"
                      style={{ color: active ? "#A614C3" : c.text, fontWeight: active ? 600 : 500 }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: "#A614C3" }} />
                      <span className="whitespace-nowrap">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View — column visibility popover. Sits right after the date filter so the
              two "scope" controls (which time window, which columns) cluster together. */}
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllToolbarDropdowns(); setViewOpen(o => !o); }}
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ fontFamily: FONT, background: viewOpen ? c.hoverBg : c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = viewOpen ? c.hoverBg : c.cardBg)}
              title="Show / hide columns">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.muted }}>
                <rect width="5" height="5" x="2" y="2" rx="1"/><rect width="5" height="5" x="9.5" y="2" rx="1"/><rect width="5" height="5" x="17" y="2" rx="1"/>
                <rect width="5" height="5" x="2" y="9.5" rx="1"/><rect width="5" height="5" x="9.5" y="9.5" rx="1"/><rect width="5" height="5" x="17" y="9.5" rx="1"/>
                <rect width="5" height="5" x="2" y="17" rx="1"/><rect width="5" height="5" x="9.5" y="17" rx="1"/><rect width="5" height="5" x="17" y="17" rx="1"/>
              </svg>
              View
            </button>
            {viewOpen && (
              <div className="absolute left-0 top-full mt-1 z-30 w-[220px] rounded-xl shadow-xl overflow-hidden"
                style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold"
                  style={{ fontFamily: FONT, color: c.muted, borderBottom: `1px solid ${c.border}`, letterSpacing: "0.06em" }}>
                  Show Columns
                </div>
                <div className="py-1.5 max-h-[280px] overflow-y-auto">
                  {CLIENT_COLS.map(col => {
                    const visible = !hiddenCols.has(col.key);
                    return (
                      <label key={col.key} className="flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setHiddenCols(prev => { const s = new Set(prev); s.has(col.key) ? s.delete(col.key) : s.add(col.key); return s; })}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                          style={{ border: `1.5px solid ${c.border}`, background: c.cardBg }}>
                          {visible && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{col.label}</span>
                      </label>
                    );
                  })}
                </div>
                <button onClick={() => setHiddenCols(new Set())}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <RefreshCw className="w-3.5 h-3.5" />Show All
                </button>
              </div>
            )}
          </div>

          {/* Search — leading icon, 360px so the full "Search clients by name, email, or phone…"
              placeholder fits without truncating. (Policies/Quotes get away with 300px because
              their placeholder is shorter.) */}
          <div className="flex items-center"
            style={{ width: 360, maxWidth: "100%", background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden", transition: "background 0.15s, border-color 0.15s" }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0 ml-3" style={{ color: c.muted }} />
            <input placeholder="Search clients by name, email, or phone..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 outline-none min-w-0"
              style={{ fontFamily: FONT, background: "transparent", color: c.text, padding: "6.5px 12px", fontSize: 12, border: "none" }} />
          </div>

          {/* Right-side action cluster: Refresh | Export — matches Policies / Quotes order
              (Refresh first, Export second) so the toolbar reads identically across the three
              list pages. */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {/* Refresh — spinner + clears every applied filter. Add Client lives in the KPI
                strip as the primary-action gradient tile, so there's no duplicate CTA here. */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh clients"
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text, opacity: refreshing ? 0.7 : 1 }}
              onMouseEnter={e => { if (!refreshing) e.currentTarget.style.background = c.hoverBg; }}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} style={{ color: c.muted }} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            {/* Export — opens a preview modal (scope / columns / preview / Download CSV). */}
            <button
              onClick={() => setExportOpen(true)}
              title="Export clients"
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
              <Download className="w-3.5 h-3.5" style={{ color: c.muted }} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table — wrapped in a card with the pagination, matching the live deck layout.
          Column widths + visibility derived from `hiddenCols`. Star + Action fixed at the ends. */}
      {(() => {
        const COL_WIDTHS: Record<string, string> = {
          name:           "1.5fr",
          type:           "1fr",
          contact:        "1.5fr",
          assignedAgent:  "1.1fr",
          status:         "1fr",
          activePolicies: "1fr",
          lastActivity:   "1.2fr",
        };
        const visibleCols = CLIENT_COLS.filter(col => !hiddenCols.has(col.key));
        const gridTemplate = `32px ${visibleCols.map(col => COL_WIDTHS[col.key]).join(" ")} 80px`;
        return (
      <div
        className="rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden"
        style={{ background: c.cardBg, border: `1px solid ${c.border}`, marginBottom: 16 }}
      >
        {/* Header + Rows share one overflow-y: scroll container so scrollbar never shifts column widths */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <div className="grid sticky top-0 z-10" style={{
            gridTemplateColumns: gridTemplate,
            borderBottom: `1px solid ${c.border}`,
            background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
            gap: "20px",
            padding: "12px 20px",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}>
            {/* Star column header — clickable filter: tap once to limit table to
                starred clients, tap again (or any KPI card) to clear. Mirrors the
                row star icon so the column reads as "the starred clients column". */}
            {(() => {
              const starActive = filterStatus === "Starred";
              return (
                <button
                  onClick={() => { setFilterStatus(starActive ? "All" : "Starred"); setPage(1); }}
                  title={starActive ? "Show all clients" : "Show only starred clients"}
                  className="flex items-center cursor-pointer"
                  style={{ background: "none", border: "none", padding: 0, justifySelf: "start" }}>
                  <Star className="w-4 h-4 transition-colors"
                    style={{
                      fill: starActive ? "#F59E0B" : "none",
                      color: starActive ? "#F59E0B" : c.muted,
                    }} />
                </button>
              );
            })()}
            {!hiddenCols.has("name")           && th("Client Name", "name")}
            {!hiddenCols.has("type")           && th("Entity", "type")}
            {!hiddenCols.has("contact")        && th("Contact")}
            {!hiddenCols.has("assignedAgent")  && th("Agent", "assignedAgent")}
            {!hiddenCols.has("status")         && th("Status", "status")}
            {/* `paddingRight: 40` shifts the centered POLICIES content 20px LEFT of the
                column's geometric center — cumulative 25px LEFT of the STATUS/LAST
                geometric midpoint, per the visual call. */}
            {!hiddenCols.has("activePolicies") && (
              <div style={{ width: "100%", paddingRight: 40 }}>
                {th("Policies", "activePolicies", "center")}
              </div>
            )}
            {!hiddenCols.has("lastActivity")   && th("Last Activity", "lastActivity")}
            {th("Action")}
          </div>

          {pageItems.length === 0 ? (
            // Empty state — stretches to fill the remaining card body height (the parent
            // scroll wrapper is `flex: 1`) so the icon + text land in the visual middle
            // instead of clinging to the top under the sticky header.
            <div className="flex flex-col items-center justify-center gap-3 py-20"
              style={{ minHeight: "calc(100% - 48px)" }}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#F3F4F6" }}>
                <Users className="w-6 h-6" style={{ color: c.muted }} />
              </div>
              <div className="text-center">
                <div className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>
                  No clients found
                </div>
                <div className="text-[12px] mt-0.5" style={{ fontFamily: FONT, color: c.muted }}>
                  Try widening the date range or clearing filters.
                </div>
              </div>
            </div>
          ) : pageItems.map((cl, i) => (
            <div key={cl.id} onClick={() => openDetail(cl)}
              className="grid items-center cursor-pointer transition-colors"
              style={{ gridTemplateColumns: gridTemplate, gap: "20px", borderBottom: i !== pageItems.length - 1 ? `1px solid ${c.border}` : "none", padding: "18px 20px" }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {/* Star */}
              <button onClick={e => toggleStar(cl.id, e)} className="transition-colors">
                <Star className="w-4 h-4" style={{ fill: cl.isStarred ? "#F59E0B" : "none", color: cl.isStarred ? "#F59E0B" : c.sub }} />
              </button>
              {/* Name */}
              {!hiddenCols.has("name") && (
                <div>
                  <div className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{getClientName(cl)}</div>
                  {cl.dbaName && <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>DBA: {cl.dbaName}</div>}
                </div>
              )}
              {/* Type */}
              {!hiddenCols.has("type") && (
                <div className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: isDark ? "#4ECDC4" : "#A614C3" }}>{cl.type}</div>
              )}
              {/* Contact */}
              {!hiddenCols.has("contact") && (
                <div>
                  <div className="text-[11px] mb-0.5 truncate" style={{ fontFamily: FONT, color: c.muted }}>{cl.email}</div>
                  <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{cl.phone}</div>
                </div>
              )}
              {/* Agent */}
              {!hiddenCols.has("assignedAgent") && (
                <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{cl.assignedAgent}</div>
              )}
              {/* Status */}
              {!hiddenCols.has("status") && (
                <div><StatusBadge status={cl.status} isDark={isDark} /></div>
              )}
              {/* Policies — same paddingRight as the header so the value stays vertically
                  aligned with the caption above. */}
              {!hiddenCols.has("activePolicies") && (
                <div className="text-[13px] font-semibold text-center" style={{ fontFamily: FONT, color: c.text, paddingRight: 40 }}>
                  {cl.activePolicies}
                </div>
              )}
              {/* Last activity */}
              {!hiddenCols.has("lastActivity") && (
                <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted, paddingLeft: 10 }}>{new Date(cl.lastActivity).toLocaleDateString()}</div>
              )}
              {/* Menu */}
              <div onClick={e => e.stopPropagation()}>
                <ActionMenu isDark={isDark} items={["Edit Client","New Quote","Send Email","Start an Endorsement"]} menuId={`client-${cl.id}`} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination — in-card footer, matches the live deck layout.
            Left: "1 – N of total clients". Right: page-size selector + Previous / Next. */}
        {(() => {
          const rangeStart = sorted.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
          const rangeEnd   = Math.min(page * itemsPerPage, sorted.length);
          const atFirst = page === 1;
          const atLast  = page === totalPages || totalPages === 0;
          return (
            <div className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap"
              style={{ borderTop: `1px solid ${c.border}` }}>
              <span className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted }}>
                {rangeStart} – {rangeEnd} of {sorted.length} {sorted.length === 1 ? "client" : "clients"}
              </span>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {/* Page-size selector — custom popover (matches Policies / Quotes) instead
                    of a native <select>, so the chip width + chevron + active-row Check icon
                    line up with the rest of the toolbar's dropdowns. */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllToolbarDropdowns(); setPageSizeOpen(o => !o); }}
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg cursor-pointer transition-colors text-[11.5px] font-medium"
                    style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                    1 – {itemsPerPage}
                    <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ opacity: 0.6, transform: pageSizeOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {pageSizeOpen && (
                    <div
                      className="absolute right-0 z-30 rounded-lg overflow-hidden py-1 min-w-[110px]"
                      style={{
                        bottom: "calc(100% + 6px)",
                        background: c.cardBg,
                        border: `1px solid ${c.border}`,
                        boxShadow: "0 12px 28px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.04)",
                      }}>
                      {[10, 20, 50].map(n => {
                        const active = itemsPerPage === n;
                        return (
                          <button
                            key={n}
                            onClick={() => { setItemsPerPage(n); setPage(1); setPageSizeOpen(false); }}
                            className="w-full px-2.5 py-1.5 text-left text-[11.5px] flex items-center gap-2 cursor-pointer transition-colors"
                            style={{ color: active ? "#A614C3" : c.text, fontWeight: active ? 600 : 500, background: "transparent" }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: "#A614C3" }} />
                            <span className="whitespace-nowrap">1 – {n}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={atFirst}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: c.cardBg, opacity: atFirst ? 0.5 : 1, cursor: atFirst ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!atFirst) e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                  Previous
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={atLast}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: c.cardBg, opacity: atLast ? 0.5 : 1, cursor: atLast ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!atLast) e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                  Next
                </button>
              </div>
            </div>
          );
        })()}
      </div>
      );
      })()}

      <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isDark={isDark} />

      {/* Export preview modal — scope + columns + 5-row preview + Download CSV. Slimmer
          than the Policies export (no multi-format split button); easy to extend later. */}
      {exportOpen && (() => {
        const exportRows = exportScope === "all" ? allClients : sorted;
        const selectedCols = CLIENT_EXPORT_COLS.filter(col => exportCols.has(col.key));
        const previewRows = exportRows.slice(0, 5);
        const triggerDownload = () => {
          if (selectedCols.length === 0) return;
          const headerRow = selectedCols.map(col => col.label);
          const dataRows  = exportRows.map(cl => selectedCols.map(col => col.get(cl)));
          const escape = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
          const text = [headerRow, ...dataRows].map(r => r.map(escape).join(",")).join("\n");
          const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
          const url  = URL.createObjectURL(blob);
          const fname = `clients-${new Date().toISOString().slice(0,10)}.csv`;
          const a    = document.createElement("a"); a.href = url; a.download = fname;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportOpen(false);
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setExportOpen(false)}>
            <div className="rounded-2xl shadow-2xl flex flex-col"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, width: 620, maxWidth: "92vw", maxHeight: "86vh", fontFamily: FONT }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <h2 className="text-[16px] font-bold" style={{ color: c.text }}>Export Clients</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: c.muted }}>Based on your current view</p>
                </div>
                <button onClick={() => setExportOpen(false)} className="p-1.5 rounded-md transition-colors"
                  style={{ color: c.muted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                {/* Scope */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: c.muted }}>Scope</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ["filtered", `Current view (${sorted.length})`],
                      ["all",      `All clients (${allClients.length})`],
                    ] as ["filtered"|"all", string][]).map(([key, label]) => {
                      const active = exportScope === key;
                      return (
                        <button key={key} onClick={() => setExportScope(key)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors"
                          style={{ background: active ? "rgba(166,20,195,0.06)" : "transparent", color: active ? "#A614C3" : c.text, border: `1px solid ${active ? "rgba(166,20,195,0.25)" : c.border}` }}>
                          <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ border: `1.5px solid ${active ? "#A614C3" : c.border}` }}>
                            {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#A614C3" }} />}
                          </span>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Columns */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.muted }}>Columns ({exportCols.size})</p>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <button onClick={() => setExportCols(new Set(CLIENT_EXPORT_COLS.map(col => col.key)))}
                        className="cursor-pointer transition-colors" style={{ color: "#A614C3" }}>All</button>
                      <span style={{ color: c.border }}>·</span>
                      <button onClick={() => setExportCols(new Set())}
                        className="cursor-pointer transition-colors" style={{ color: c.muted }}>None</button>
                    </div>
                  </div>
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    {CLIENT_EXPORT_COLS.map(col => {
                      const checked = exportCols.has(col.key);
                      return (
                        <label key={col.key}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none"
                          onClick={() => setExportCols(prev => { const s = new Set(prev); if (s.has(col.key)) s.delete(col.key); else s.add(col.key); return s; })}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                            style={{ border: `1.5px solid ${c.border}`, background: c.cardBg }}>
                            {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="text-[12px] truncate" style={{ color: c.text }}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Eye className="w-3.5 h-3.5" style={{ color: c.muted }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.muted }}>Preview</span>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                    {selectedCols.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: c.muted }} />
                        <span className="text-[12px]" style={{ color: c.muted }}>Select at least one column to preview.</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
                          <thead style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB" }}>
                            <tr>
                              {selectedCols.map(col => (
                                <th key={col.key} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap"
                                  style={{ color: c.text, fontSize: 11.5, borderBottom: `1px solid ${c.border}` }}>
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.map((cl, i) => (
                              <tr key={cl.id}>
                                {selectedCols.map(col => (
                                  <td key={col.key} className="px-4 py-2.5 whitespace-nowrap"
                                    style={{ color: c.text, borderBottom: i < previewRows.length - 1 ? `1px solid ${c.border}` : "none" }}>
                                    {col.get(cl) || <span style={{ color: c.muted }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {exportRows.length > previewRows.length && selectedCols.length > 0 && (
                      <div className="px-4 py-2.5 text-center text-[11px]"
                        style={{ color: c.muted, borderTop: `1px solid ${c.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB" }}>
                        + {exportRows.length - previewRows.length} more {exportRows.length - previewRows.length === 1 ? "row" : "rows"} included on download
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
                <button onClick={() => setExportOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ color: c.text, border: `1px solid ${c.border}`, background: c.cardBg }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                  Cancel
                </button>
                <button onClick={triggerDownload} disabled={selectedCols.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                  style={{ background: btnGrad, opacity: selectedCols.length === 0 ? 0.5 : 1, cursor: selectedCols.length === 0 ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (selectedCols.length > 0) e.currentTarget.style.filter = "brightness(1.08)"; }}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  <Download className="w-3.5 h-3.5" />Download CSV
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  /* ══════════════════════ DETAIL VIEW ══════════════════════ */
  if (!selected) return null;
  const isStarred = stars.has(selected.id);

  /* ── Documents tab renderer (shared between Policy Documents & File Cabinet) ── */
  type DocsCfg = {
    docPredicate: (d: Document) => boolean;
    categoryOptions: string[];
    emptyTitle: string;
    emptyHint: string;
    enableContextMenu: boolean;
    showPolicyCols: boolean;
    syncSource?: string; // shows a "Synced from X" banner above the list (Policy Docs only)
    view: DocView; setView: (v: DocView) => void;
    showArchived: boolean; setShowArchived: (v: boolean) => void;
    showTrashed: boolean; setShowTrashed: (v: boolean) => void;
    filterCat: string; setFilterCat: (v: string) => void;
    sortDir: "asc"|"desc"; setSortDir: (v: "asc"|"desc") => void;
    search: string; setSearch: (v: string) => void;
    searchOpen: boolean; setSearchOpen: (v: boolean) => void;
    filterOpen: boolean; setFilterOpen: (v: boolean) => void;
    sortOpen: boolean; setSortOpen: (v: boolean) => void;
    uploadOpen: boolean; setUploadOpen: (v: boolean) => void;
  };
  const renderDocsTab = (cfg: DocsCfg) => {
    const tabDocs = allClientDocs.filter(cfg.docPredicate);
    const isArchived = (d: Document) => archivedDocIds.has(d.id);
    const isTrashed  = (d: Document) => deletedDocIds.has(d.id);
    const archivedCount = tabDocs.filter(d => isArchived(d) && !isTrashed(d)).length;
    const trashedCount  = tabDocs.filter(d => isTrashed(d)).length;
    const base = cfg.showTrashed
      ? tabDocs.filter(isTrashed)
      : cfg.showArchived
        ? tabDocs.filter(d => isArchived(d) && !isTrashed(d))
        : tabDocs.filter(d => !isArchived(d) && !isTrashed(d));
    const visible = base
      .filter(d => cfg.filterCat === "All" || d.category === cfg.filterCat)
      .filter(d => !cfg.search || d.name.toLowerCase().includes(cfg.search.toLowerCase()) || d.category.toLowerCase().includes(cfg.search.toLowerCase()))
      .sort((a, b) => {
        const ta = Date.parse(a.uploadDate); const tb = Date.parse(b.uploadDate);
        return cfg.sortDir === "desc" ? tb - ta : ta - tb;
      });
    const closeAllDropdowns = () => { cfg.setFilterOpen(false); cfg.setSortOpen(false); cfg.setUploadOpen(false); };
    const handleUpload = (cat: string) => {
      const today = new Date().toISOString().slice(0, 10);
      const newDoc: Document = {
        id: `new-${Date.now()}`,
        name: `New ${cat}.pdf`,
        type: "PDF", uploadDate: today, size: "0.5 MB",
        clientId: selected!.id, category: cat,
      };
      setExtraDocs(prev => [newDoc, ...prev]);
      cfg.setUploadOpen(false);
    };
    const archive = (id: string) => setArchivedDocIds(p => { const s = new Set(p); s.add(id); return s; });
    const unarchive = (id: string) => setArchivedDocIds(p => { const s = new Set(p); s.delete(id); return s; });
    const trash = (id: string) => setDeletedDocIds(p => { const s = new Set(p); s.add(id); return s; });
    const restore = (id: string) => setDeletedDocIds(p => { const s = new Set(p); s.delete(id); return s; });
    const purge = (id: string) => {
      setExtraDocs(p => p.filter(d => d.id !== id));
      setDeletedDocIds(p => { const s = new Set(p); s.delete(id); return s; });
    };

    const Toolbar = (
      <div className="flex items-center justify-between mb-3 flex-shrink-0 min-w-0" onClick={closeAllDropdowns}>
        <div className="flex items-center gap-0.5 min-w-0">
          {([["all","All Documents",List],["byType","By Type",LayoutGrid],["table","Table",Table2]] as [DocView, string, React.ComponentType<{className?:string}>][]).map(([v, label, Icon]) => {
            const isActive = cfg.view === v && !cfg.showArchived && !cfg.showTrashed;
            return (
              <button key={v} title={label} onClick={e => { e.stopPropagation(); cfg.setView(v); cfg.setShowArchived(false); cfg.setShowTrashed(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all whitespace-nowrap"
                style={{ fontFamily: FONT, background: isActive ? (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6") : "transparent", color: isActive ? c.text : c.muted }}>
                <Icon className="w-3 h-3" />{label}
              </button>
            );
          })}
          <div className="mx-1.5" style={{ width: 1, height: 16, background: c.border }} />
          <button title="Archive" onClick={e => { e.stopPropagation(); cfg.setShowArchived(true); cfg.setShowTrashed(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all"
            style={{ fontFamily: FONT, background: cfg.showArchived ? "rgba(245,158,11,0.10)" : "transparent", color: cfg.showArchived ? "#F59E0B" : c.muted }}>
            <Archive className="w-3 h-3" />Archive
            {archivedCount > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: cfg.showArchived ? "rgba(245,158,11,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"), color: cfg.showArchived ? "#F59E0B" : c.muted }}>{archivedCount}</span>}
          </button>
          <button title="Trash" onClick={e => { e.stopPropagation(); cfg.setShowTrashed(true); cfg.setShowArchived(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all"
            style={{ fontFamily: FONT, background: cfg.showTrashed ? "rgba(239,68,68,0.10)" : "transparent", color: cfg.showTrashed ? "#EF4444" : c.muted }}>
            <Trash2 className="w-3 h-3" />Trash
            {trashedCount > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: cfg.showTrashed ? "rgba(239,68,68,0.20)" : (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"), color: cfg.showTrashed ? "#EF4444" : c.muted }}>{trashedCount}</span>}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {/* Filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { cfg.setFilterOpen(!cfg.filterOpen); cfg.setSortOpen(false); cfg.setUploadOpen(false); }}
              className="p-1.5 rounded-md transition-all"
              style={{ color: cfg.filterCat !== "All" ? "#A855F7" : c.muted, background: cfg.filterCat !== "All" ? "rgba(168,85,247,0.10)" : "transparent" }}>
              <Filter className="w-3.5 h-3.5" />
            </button>
            {cfg.filterOpen && (
              <div className="absolute right-0 top-8 z-30 w-52 rounded-xl shadow-xl py-1.5" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5" style={{ fontFamily: FONT, color: c.muted }}>Filter by Category</p>
                {(["All", ...cfg.categoryOptions]).map(t => (
                  <button key={t} onClick={() => { cfg.setFilterCat(t); cfg.setFilterOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between transition-colors"
                    style={{ fontFamily: FONT, color: cfg.filterCat === t ? "#A614C3" : c.text, background: cfg.filterCat === t ? "rgba(168,85,247,0.08)" : "transparent" }}>
                    {t === "All" ? "All Categories" : t}
                    {cfg.filterCat === t && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Sort */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { cfg.setSortOpen(!cfg.sortOpen); cfg.setFilterOpen(false); cfg.setUploadOpen(false); }}
              className="p-1.5 rounded-md transition-all" style={{ color: c.muted }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2V4zm2 3.5h8V9H4V7.5zm2 3.5h4v1.5H6V11z"/></svg>
            </button>
            {cfg.sortOpen && (
              <div className="absolute right-0 top-8 z-30 w-40 rounded-xl shadow-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide px-3 pt-2 pb-1.5" style={{ fontFamily: FONT, color: c.muted }}>Sort by Date</p>
                {([["desc","Newest first"],["asc","Oldest first"]] as const).map(([d, label]) => (
                  <button key={d} onClick={() => { cfg.setSortDir(d); cfg.setSortOpen(false); }}
                    className="w-full text-left px-3 py-2 text-[12px] flex items-center justify-between"
                    style={{ fontFamily: FONT, color: cfg.sortDir === d ? "#A614C3" : c.text, background: cfg.sortDir === d ? "rgba(168,85,247,0.08)" : "transparent" }}>
                    <span>{label}</span>{cfg.sortDir === d && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Search */}
          <div className="flex items-center transition-all overflow-hidden" style={{ width: cfg.searchOpen ? 160 : 28 }}>
            <button onClick={e => { e.stopPropagation(); cfg.setSearchOpen(!cfg.searchOpen); if (cfg.searchOpen) cfg.setSearch(""); }}
              className="p-1.5 rounded-md flex-shrink-0" style={{ color: cfg.search ? "#A855F7" : c.muted }}>
              <Search className="w-3.5 h-3.5" />
            </button>
            {cfg.searchOpen && (
              <input autoFocus value={cfg.search} onChange={e => cfg.setSearch(e.target.value)}
                onClick={e => e.stopPropagation()} placeholder="Search documents…"
                className="outline-none text-[12px] flex-1 min-w-0"
                style={{ fontFamily: FONT, color: c.text, background: "transparent", borderBottom: `1px solid ${c.border}` }} />
            )}
          </div>
          {/* Upload (split-button) — hidden in archive/trash */}
          {!cfg.showArchived && !cfg.showTrashed && (
            <div className="relative ml-1" onClick={e => e.stopPropagation()}>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ background: btnGrad }}>
                <button onClick={() => cfg.setUploadOpen(!cfg.uploadOpen)}
                  className="px-3 py-1.5 text-[12px] font-semibold text-white flex items-center gap-1.5"
                  style={{ fontFamily: FONT }}>
                  <Upload className="w-3 h-3" />Upload
                </button>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
                <button onClick={() => cfg.setUploadOpen(!cfg.uploadOpen)} className="px-2 py-1.5 text-white flex items-center">
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              {cfg.uploadOpen && (
                <div className="absolute right-0 top-9 z-30 w-44 rounded-xl shadow-xl py-1.5" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5" style={{ fontFamily: FONT, color: c.muted }}>Upload to</p>
                  {cfg.categoryOptions.map(cat => (
                    <button key={cat} onClick={() => handleUpload(cat)}
                      className="w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors"
                      style={{ fontFamily: FONT, color: c.text }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <FolderOpen className="w-3 h-3" style={{ color: "#A855F7" }} />{cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

    const RowActions = ({ d }: { d: Document }) => {
      if (cfg.showTrashed) {
        return (
          <div className="flex items-center gap-1">
            <button title="Restore" onClick={e => { e.stopPropagation(); restore(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button title="Delete forever" onClick={e => { e.stopPropagation(); purge(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
      if (cfg.showArchived) {
        return (
          <div className="flex items-center gap-1">
            <button title="Unarchive" onClick={e => { e.stopPropagation(); unarchive(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button title="Move to Trash" onClick={e => { e.stopPropagation(); trash(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1">
          <button title="Preview" onClick={e => { e.stopPropagation(); setPreviewDoc(previewDoc?.id === d.id ? null : d); }} className="p-1.5 rounded transition-colors"
            style={{ color: previewDoc?.id === d.id ? "#A855F7" : c.muted, background: previewDoc?.id === d.id ? "rgba(168,85,247,0.10)" : "transparent" }}
            onMouseEnter={e => { if (previewDoc?.id !== d.id) { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; } }}
            onMouseLeave={e => { if (previewDoc?.id !== d.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; } }}>
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button title="Download" onClick={e => e.stopPropagation()} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
            onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
            <Download className="w-3.5 h-3.5" />
          </button>
          <button title="Archive" onClick={e => { e.stopPropagation(); archive(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
            onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button title="Move to Trash" onClick={e => { e.stopPropagation(); trash(d.id); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    };

    const DocIcon = ({ d }: { d: Document }) => (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: d.type === "PDF" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)" }}>
        {d.type === "PDF"
          ? <FileText className="w-4 h-4" style={{ color: "#EF4444" }} />
          : <FileArchive className="w-4 h-4" style={{ color: "#22C55E" }} />}
      </div>
    );

    const NameCell = ({ d }: { d: Document }) => (
      cfg.enableContextMenu && renamingDocId === d.id ? (
        <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
          onBlur={() => { if (renameValue.trim()) setDocNameOverrides(prev => ({ ...prev, [d.id]: renameValue.trim() })); setRenamingDocId(null); }}
          onKeyDown={e => {
            if (e.key === "Enter") { if (renameValue.trim()) setDocNameOverrides(prev => ({ ...prev, [d.id]: renameValue.trim() })); setRenamingDocId(null); }
            if (e.key === "Escape") setRenamingDocId(null);
          }}
          className="flex-1 outline-none rounded px-2 py-1 text-[13px] font-medium"
          style={{ fontFamily: FONT, color: c.text, background: c.cardBg, border: `1px solid #A614C3` }} />
      ) : (
        <span className="text-[13px] font-medium truncate" style={{ fontFamily: FONT, color: c.text }}>{d.name}</span>
      )
    );

    /* ── Empty state ── */
    if (visible.length === 0) {
      return (
        <div className="flex flex-col flex-1 min-h-0">
          {Toolbar}
          <div className="flex-shrink-0 mb-3" style={{ height: 1, background: c.border }} />
          <div className="rounded-xl flex flex-col flex-1 min-h-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="flex flex-col items-center justify-center h-full min-h-[220px]">
              {cfg.showTrashed
                ? <Trash2 className="w-7 h-7 mb-3" style={{ color: c.muted }} />
                : cfg.showArchived
                  ? <Archive className="w-7 h-7 mb-3" style={{ color: c.muted }} />
                  : <FileText className="w-7 h-7 mb-3" style={{ color: c.muted }} />}
              <span className="text-[13px] font-medium" style={{ fontFamily: FONT, color: c.text }}>
                {cfg.showTrashed ? "Trash is empty" : cfg.showArchived ? "Nothing archived" : cfg.emptyTitle}
              </span>
              <span className="text-[11px] mt-1 max-w-[360px] text-center" style={{ fontFamily: FONT, color: c.muted }}>
                {cfg.showTrashed ? "Deleted documents will appear here." : cfg.showArchived ? "Archived documents will appear here." : cfg.emptyHint}
              </span>
            </div>
          </div>
        </div>
      );
    }

    /* ── Table view (default for Policy Docs) ── */
    const renderTable = () => {
      const tpl = cfg.showPolicyCols ? "1.3fr 1.3fr 1fr 2fr 1fr 110px" : "1.5fr 3fr 110px";
      const headers = cfg.showPolicyCols
        ? ["Policy #", "LOB", "Document Type", "Document Name", "Date", ""]
        : ["Upload Date", "Document Name", ""];
      return (
        <div className="rounded-xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
          <div className="grid px-5 py-3 gap-4" style={{ gridTemplateColumns: tpl, borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
            {headers.map((h, i) => (
              <div key={i} className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted }}>{h}</div>
            ))}
          </div>
          <div className="overflow-y-auto flex-1">
            {visible.map((d, i, arr) => (
              <div key={d.id} className="grid px-5 py-3.5 items-center gap-4 transition-colors"
                style={{ gridTemplateColumns: tpl, borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onContextMenu={cfg.enableContextMenu ? e => { e.preventDefault(); setFileCtxMenu({ x: e.clientX, y: e.clientY, docId: d.id }); } : undefined}>
                {cfg.showPolicyCols ? (
                  <>
                    <div className="text-[12px] font-medium" style={{ fontFamily: FONT, color: c.text }}>{d.policyNumber || "—"}</div>
                    <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{d.lob || "—"}</div>
                    <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{d.docType || d.category}</div>
                    <div className="flex items-center gap-2.5 min-w-0"><DocIcon d={d} /><NameCell d={d} /></div>
                    <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{new Date(d.uploadDate).toLocaleDateString()}</div>
                  </>
                ) : (
                  <>
                    <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{new Date(d.uploadDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2.5 min-w-0"><DocIcon d={d} /><NameCell d={d} /></div>
                  </>
                )}
                <RowActions d={d} />
              </div>
            ))}
          </div>
        </div>
      );
    };

    /* ── All Documents view (flat list with category chip) ── */
    const renderAll = () => (
      <div className="rounded-xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
        <div className="overflow-y-auto flex-1">
          {visible.map((d, i, arr) => (
            <div key={d.id} className="flex items-center gap-3 px-5 py-3 transition-colors"
              style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onContextMenu={cfg.enableContextMenu ? e => { e.preventDefault(); setFileCtxMenu({ x: e.clientX, y: e.clientY, docId: d.id }); } : undefined}>
              <DocIcon d={d} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <NameCell d={d} />
                  <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ fontFamily: FONT, color: "#A614C3", background: "rgba(168,85,247,0.10)" }}>{d.category}</span>
                  {archivedDocIds.has(d.id) && !deletedDocIds.has(d.id) && (
                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ fontFamily: FONT, color: c.muted, background: c.hoverBg }}>Archived</span>
                  )}
                </div>
                <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{new Date(d.uploadDate).toLocaleDateString()}{d.policyNumber ? ` · ${d.policyNumber}` : ""}</div>
              </div>
              <RowActions d={d} />
            </div>
          ))}
        </div>
      </div>
    );

    /* ── By Type view (grouped sections) ── */
    const renderByType = () => {
      const groups: Record<string, Document[]> = {};
      for (const d of visible) {
        (groups[d.category] ||= []).push(d);
      }
      const cats = Object.keys(groups);
      return (
        <div className="overflow-y-auto flex-1">
          {cats.map(cat => (
            <div key={cat} className="rounded-xl mb-3" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 px-5 py-2.5" style={{ borderBottom: `1px solid ${c.border}` }}>
                <FolderOpen className="w-4 h-4" style={{ color: "#A855F7" }} />
                <span className="text-[13px] font-bold" style={{ fontFamily: FONT, color: c.text }}>{cat}</span>
                <span className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>({groups[cat].length})</span>
              </div>
              {groups[cat].map((d, i, arr) => (
                <div key={d.id} className="flex items-center gap-3 px-5 py-2.5 transition-colors"
                  style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onContextMenu={cfg.enableContextMenu ? e => { e.preventDefault(); setFileCtxMenu({ x: e.clientX, y: e.clientY, docId: d.id }); } : undefined}>
                  <DocIcon d={d} />
                  <div className="flex-1 min-w-0">
                    <NameCell d={d} />
                    <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{new Date(d.uploadDate).toLocaleDateString()}{d.policyNumber ? ` · ${d.policyNumber}` : ""}</div>
                  </div>
                  <RowActions d={d} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    };

    const SyncBanner = cfg.syncSource && !cfg.showArchived && !cfg.showTrashed ? (
      <div className="flex items-center gap-2 px-5 py-2 mb-3 rounded-lg text-[12px] flex-shrink-0"
        style={{ fontFamily: FONT, color: c.muted, background: c.cardBg, border: `1px solid ${c.border}` }}>
        <RefreshCw className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
        <span>Synced from <strong style={{ background: "linear-gradient(88.54deg,#5C2ED4 0.1%,#A614C3 63.88%) text", WebkitTextFillColor: "transparent" }}>{cfg.syncSource}</strong> · 5 min ago</span>
        <button className="ml-auto font-semibold transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(88.54deg,#5C2ED4 0.1%,#A614C3 63.88%) text", WebkitTextFillColor: "transparent" }}>
          Sync now
        </button>
      </div>
    ) : null;

    const previewVisible = !!previewDoc && cfg.docPredicate(previewDoc);
    const PreviewPane = previewVisible ? (
      <div className="rounded-xl flex flex-col min-h-0 transition-all"
        style={{ flex: previewExpanded ? "1 1 100%" : "1 1 60%", background: c.cardBg, border: `1px solid ${c.border}` }}>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: previewDoc!.type === "PDF" ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)" }}>
              {previewDoc!.type === "PDF"
                ? <FileText className="w-4 h-4" style={{ color: "#EF4444" }} />
                : <FileArchive className="w-4 h-4" style={{ color: "#22C55E" }} />}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>{previewDoc!.name}</div>
              <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>
                {new Date(previewDoc!.uploadDate).toLocaleDateString()} · {previewDoc!.type} · {previewDoc!.size}{previewDoc!.policyNumber ? ` · ${previewDoc!.policyNumber}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button title="Download" className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <Download className="w-4 h-4" />
            </button>
            <button title={previewExpanded ? "Collapse" : "Expand"} onClick={() => setPreviewExpanded(p => !p)} className="p-1.5 rounded transition-colors"
              style={{ color: previewExpanded ? "#A855F7" : c.muted }}
              onMouseEnter={e => { if (!previewExpanded) { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; } }}
              onMouseLeave={e => { if (!previewExpanded) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; } }}>
              {previewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button title="Close" onClick={() => { setPreviewDoc(null); setPreviewExpanded(false); }} className="p-1.5 rounded transition-colors" style={{ color: c.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Faux preview body — mock rendering since we don't have real files. */}
        <div className="flex-1 overflow-auto p-6" style={{ background: isDark ? "rgba(0,0,0,0.18)" : "#F3F4F6" }}>
          <div className="mx-auto rounded-md shadow-sm p-10"
            style={{ background: "#FFFFFF", maxWidth: 560, minHeight: "100%", border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB"}` }}>
            <div className="text-[18px] font-bold mb-1" style={{ fontFamily: FONT, color: "#1F2937" }}>{previewDoc!.name}</div>
            <div className="text-[11px] uppercase tracking-wider mb-6" style={{ fontFamily: FONT, color: "#6B7280", letterSpacing: "0.06em" }}>{previewDoc!.category}{previewDoc!.lob ? ` · ${previewDoc!.lob}` : ""}</div>
            <div className="space-y-2.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="rounded" style={{ height: 8, background: "#E5E7EB", width: `${65 + ((i * 17) % 30)}%` }} />
              ))}
            </div>
            <div className="mt-8 pt-6 text-[11px]" style={{ fontFamily: FONT, color: "#9CA3AF", borderTop: "1px solid #F3F4F6" }}>
              Preview is a stub. In production, this pane would render the actual document via PDF/image viewer.
            </div>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div className="flex flex-1 min-h-0 gap-4">
        {!(previewVisible && previewExpanded) && (
          <div className="flex flex-col min-h-0 transition-all"
            style={{ flex: previewVisible ? "0 0 42%" : "1 1 100%", minWidth: 0 }}>
            {Toolbar}
            <div className="flex-shrink-0 mb-3" style={{ height: 1, background: c.border }} />
            {SyncBanner}
            {(cfg.showArchived || cfg.showTrashed) ? renderAll() : (
              cfg.view === "table" ? renderTable() : cfg.view === "byType" ? renderByType() : renderAll()
            )}
          </div>
        )}
        {PreviewPane}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: FONT }} onClick={() => setOpenMenuId(null)}>
      {sectionTitle}

      {/* Back + header */}
      <div className="pb-4 mb-5" style={{ borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => { setView("list"); setSelected(null); }}
          className="flex items-center gap-1.5 text-[12px] font-medium mb-3 transition-colors"
          style={{ fontFamily: FONT, color: c.muted }}
          onMouseEnter={e => (e.currentTarget.style.color = c.text)}
          onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
          <ChevronLeft className="w-4 h-4" />Back to Clients
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => toggleStar(selected.id)} className="flex-shrink-0">
                <Star className="w-5 h-5 transition-colors" style={{ fill: isStarred ? "#F59E0B" : "none", color: isStarred ? "#F59E0B" : c.sub }} />
              </button>
              <h1 className="text-[24px] font-bold" style={{ fontFamily: FONT, color: c.text }}>{getClientName(selected)}</h1>
              <StatusBadge status={selected.status} isDark={isDark} />
            </div>
            <p className="text-[13px]" style={{ fontFamily: FONT, color: c.muted }}>{selected.type} · Client ID: {selected.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { icon: <FileText className="w-3.5 h-3.5" />, label: "Create Quote" },
              { icon: <Mail className="w-3.5 h-3.5" />, label: "Send Email" },
              { icon: <Phone className="w-3.5 h-3.5" />, label: "Phone Call" },
            ].map(({ icon, label }, i) => (
              <button key={label}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all text-white"
                style={{ fontFamily: FONT, background: i === 0 ? btnGrad : "transparent", border: i === 0 ? "none" : `1px solid ${c.border}`, color: i === 0 ? "#fff" : c.muted }}
                onMouseEnter={e => { if (i === 0) e.currentTarget.style.filter = "brightness(1.12)"; else e.currentTarget.style.background = c.hoverBg; }}
                onMouseLeave={e => { if (i === 0) e.currentTarget.style.filter = "none"; else e.currentTarget.style.background = "transparent"; }}
                onClick={() => {
                  if (label === "Phone Call") { setCallModalOpen(true); }
                  if (label === "Send Email") { if (selected?.email) window.location.href = `mailto:${selected.email}`; }
                  if (label === "Create Quote") { setCreateQuoteOpen(true); }
                }}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="flex gap-4 mb-5 flex-shrink-0">
        {[
          { label: "Incomplete Quotes",  value: String(incompleteQuotesCount),   icon: <ClipboardList className="w-5 h-5" style={{ color: "#A855F7" }} />, onClick: () => { setDetailTab("quotes");   setHighlightFilter("incomplete-quotes"); setDetailSearch(""); }, highlight: incompleteQuotesCount > 0   },
          { label: "Active Policies",   value: String(selected.activePolicies), icon: <Shield className="w-5 h-5" style={{ color: "#A855F7" }} />,        onClick: () => { setDetailTab("policies"); setHighlightFilter("active-policies"); setDetailSearch(""); }, highlight: false },
          { label: "Upcoming Renewals", value: String(upcomingRenewalsCount),   icon: <Bell className="w-5 h-5" style={{ color: "#A855F7" }} />,           onClick: () => { setDetailTab("policies"); setHighlightFilter("renewals");        setDetailSearch(""); }, highlight: upcomingRenewalsCount > 0   },
        ].map((card, i) => (
          <button key={i} onClick={card.onClick}
            className="flex-1 min-w-0 rounded-2xl p-5 text-left relative flex flex-col items-stretch"
            style={{ background: card.highlight ? `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box` : c.cardBg, border: `1px solid ${card.highlight ? "transparent" : c.border}`, cursor: "pointer", justifyContent: "flex-start", transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box`; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(110,33,196,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = card.highlight ? `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box` : c.cardBg; e.currentTarget.style.border = `1px solid ${card.highlight ? "transparent" : c.border}`; e.currentTarget.style.boxShadow = "none"; }}>
            <div className="flex items-center gap-2 mb-3 pr-12">
              <p className="text-[12px] font-semibold whitespace-nowrap" style={{ fontFamily: FONT, color: c.muted }}>{card.label}</p>
              {card.highlight && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Action needed</span>}
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-lg" style={{ background: "rgba(168,85,247,0.10)" }}>{card.icon}</div>
            <p className="text-[18px] font-bold" style={{ fontFamily: FONT, color: c.text, paddingLeft: 4 }}>{card.value}</p>
          </button>
        ))}

        {/* Primary Contact — inline edit (matches Agency Contact card) */}
        {(() => {
          const fullName = selected.type === "Individual"
            ? `${selected.firstName ?? ""} ${selected.lastName ?? ""}`.trim()
            : `${selected.contactFirstName ?? ""} ${selected.contactLastName ?? ""}`.trim() || selected.assignedAgent;
          const startInlineEdit = () => {
            setContactDraftName(fullName);
            setContactDraftPhone(selected.phone);
            setContactDraftEmail(selected.email);
            setContactCardEditing(true);
          };
          return (
            <div className="flex-1 rounded-2xl p-5 relative min-w-0 group cursor-pointer"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { if (!contactCardEditing) { e.currentTarget.style.background = `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box`; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(110,33,196,0.18)"; }}}
              onMouseLeave={e => { if (!contactCardEditing) { e.currentTarget.style.background = c.cardBg; e.currentTarget.style.border = `1px solid ${c.border}`; e.currentTarget.style.boxShadow = "none"; }}}>
              <div className="flex items-center mb-3">
                <p className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: c.muted }}>Primary Contact</p>
              </div>
              <div className="absolute top-4 right-4 p-2 rounded-lg" style={{ background: "rgba(168,85,247,0.10)" }}>
                <UserCircle className="w-5 h-5" style={{ color: "#A855F7" }} />
              </div>
              <button onClick={startInlineEdit}
                className="absolute opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 rounded-lg text-[12px] font-semibold transition-all"
                style={{ top: "16px", right: "56px", height: 36, fontFamily: FONT, color: c.text, border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB"}`, background: isDark ? "rgba(255,255,255,0.05)" : c.cardBg }}
                onMouseEnter={e => e.currentTarget.style.background = c.hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : c.cardBg}>
                <Pencil className="w-3.5 h-3.5" />Edit
              </button>
              <p className="text-[13px] font-semibold mb-0.5" style={{ fontFamily: FONT, color: c.text }}>{fullName || "—"}</p>
              {selected.phone && <p className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{selected.phone}</p>}
              {selected.email && <p className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{selected.email}</p>}
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: `1px solid ${c.border}` }}>
        {detailTabBtn("overview",   "Overview",   ClipboardList)}
        {detailTabBtn("quotes",     "Quotes",     FileText)}
        {detailTabBtn("policies",   "Policies",   Shield)}
        {detailTabBtn("policy-documents", "Policy Documents", FileText)}
        {detailTabBtn("file-cabinet",     "File Cabinet",     FolderOpen)}
        {detailTabBtn("notes",      "Notes",      CopyPlus)}
        {detailTabBtn("activity",   "Activity",   Activity)}
      </div>

      {/* ── OVERVIEW ── */}
      {detailTab === "overview" && (() => {
        const inpSty: React.CSSProperties = { fontFamily: FONT, background: c.inputBg, border: `1px solid ${c.border}`, color: c.text, width: "100%", padding: "8px 12px", borderRadius: 7, fontSize: 13, outline: "none" };
        const lblSty: React.CSSProperties = { fontFamily: FONT, fontSize: 12, fontWeight: 600, color: c.muted, marginBottom: 4, display: "block" };
        const viewField = (label: string, value: string | undefined, tealColor?: boolean) => (
          <div>
            <div className="text-[12px] font-semibold mb-1" style={{ fontFamily: FONT, color: c.muted }}>{label}:</div>
            <div className="text-[13px]" style={{ fontFamily: FONT, color: tealColor ? c.teal : c.text }}>{value || "—"}</div>
          </div>
        );
        const editField = (label: string, key: string, placeholder?: string, id?: string) => (
          <div>
            <label style={lblSty}>{label}:</label>
            <input id={id} value={editFields[key] || ""} onChange={e => setEditFields(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inpSty} className="outline-none" />
          </div>
        );
        const editSelect = (label: string, key: string, options: string[]) => {
          const current = editFields[key] || options[0];
          const open = editSelectOpen === key;
          return (
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <label style={lblSty}>{label}:</label>
              <button type="button" onClick={() => setEditSelectOpen(open ? null : key)}
                className="w-full flex items-center justify-between outline-none"
                style={{ ...inpSty, cursor: "pointer" }}>
                <span style={{ color: current ? c.text : c.muted }}>{current}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: c.muted }} />
              </button>
              {open && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg overflow-hidden"
                  style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  {options.map(o => {
                    const active = current === o;
                    return (
                      <button key={o} type="button" onClick={() => { setEditFields(f => ({ ...f, [key]: o })); setEditSelectOpen(null); }}
                        className="w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors"
                        style={{ fontFamily: FONT, color: active ? "#A614C3" : c.text, background: active ? "rgba(168,85,247,0.08)" : "transparent" }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                        <span>{o}</span>
                        {active && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        };
        // Derive the effective contacts list: override (post-save) > seeded > one-off legacy fallback.
        const effectiveContacts: ClientContact[] = (contactsOverrides[selected.id]) || selected.contacts || (
          selected.inspectionFirstName && selected.inspectionLastName
            ? [{ id: `${selected.id}-legacy-insp`, type: "inspection", firstName: selected.inspectionFirstName, lastName: selected.inspectionLastName, phone: selected.phone, email: selected.email }]
            : []
        );
        const startEditInfo = () => {
          setEditFields({
            companyName: selected.companyName || "", dbaName: selected.dbaName || "", agencyType: selected.type,
            contactName: selected.type !== "Individual" ? "" : `${selected.firstName || ""} ${selected.lastName || ""}`.trim(),
            inspectionName: "", email: selected.email, phone: selected.phone, websiteUrl: selected.website || "",
            primaryClassCode: "", federalId: "", contractorLicense: "",
            grossSales: "", payroll: "", owners: "", employees: "",
            firstName: selected.firstName || "", lastName: selected.lastName || "",
          });
          setContactsDraft(effectiveContacts.map(c => ({ ...c })));
          setEditingInfo(true);
        };
        const startEditAddr = () => {
          setEditFields(f => ({
            ...f, street: selected.address.street, city: selected.address.city, state: selected.address.state, zipCode: selected.address.zipCode,
            mailStreet: selected.address.street, mailCity: selected.address.city, mailState: selected.address.state, mailZip: selected.address.zipCode,
            sameAddr: "true",
          }));
          setEditingAddr(true);
        };

        return (
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Client Information */}
          <div id="contact-info-section" className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Client Information</h3>
              {!editingInfo ? (
                <button onClick={() => { setPendingEditAction(() => startEditInfo); setEditWarningOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors" onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.muted }}>
                  <Pencil className="w-3.5 h-3.5" />Edit
                </button>
              ) : (
                <button onClick={() => setEditingInfo(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors" onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text }}>
                  <Pencil className="w-3.5 h-3.5" />Cancel Edit
                </button>
              )}
            </div>

            {!editingInfo ? (
              /* ── View Mode ── */
              <>
              <div className="grid gap-x-8 gap-y-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {selected.type !== "Individual" ? (<>
                  {viewField("Company Name", selected.companyName)}
                  {viewField("DBA Name or Operating Name", selected.dbaName)}
                  {viewField("Agency Type", selected.type, true)}
                </>) : (<>
                  {viewField("First Name", selected.firstName)}
                  {viewField("Last Name", selected.lastName)}
                  {viewField("Agency Type", selected.type, true)}
                </>)}
                {viewField("Email", selected.email)}
                {viewField("Phone Number", selected.phone)}
                {viewField("Website Url", selected.website)}
                {viewField("Primary Class Code", selected.primaryClassCode)}
                {viewField("Federal ID # (optional)", selected.federalId)}
                {viewField("Contractor License # (optional)", selected.contractorLicense)}
                {viewField("Gross Sales", selected.grossSales)}
                {viewField("Payroll", selected.payroll)}
                {viewField("# Owners", selected.owners)}
                {viewField("# Employees", selected.employees)}
              </div>
              {/* Contacts (ACORD: inspection / accounting / claims) */}
              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${c.border}` }}>
                <div className="text-[12px] font-semibold mb-3" style={{ fontFamily: FONT, color: c.muted }}>Contacts</div>
                {effectiveContacts.length === 0 ? (
                  <div className="text-[13px]" style={{ fontFamily: FONT, color: c.muted }}>No contacts on file. Click Edit to add one.</div>
                ) : (
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {effectiveContacts.map(ct => {
                      const palette = CONTACT_TYPE_PALETTE[ct.type];
                      const initials = `${ct.firstName?.[0] ?? ""}${ct.lastName?.[0] ?? ""}`.toUpperCase() || "—";
                      return (
                        <div key={ct.id} className="rounded-xl p-4 transition-all"
                          style={{ background: c.cardBg, border: `1px solid ${c.border}`, position: "relative", overflow: "hidden" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = palette.color; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.bg}`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                          {/* Left accent bar */}
                          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: palette.color }} />
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="flex items-center justify-center flex-shrink-0 rounded-full"
                              style={{ width: 30, height: 30, background: palette.bg, color: palette.color, fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ fontFamily: FONT, color: palette.color, letterSpacing: "0.08em" }}>{ct.type}</div>
                              <div className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>{ct.firstName} {ct.lastName}</div>
                            </div>
                          </div>
                          {ct.phone && (
                            <div className="flex items-center gap-1.5 text-[12px] mb-1" style={{ fontFamily: FONT, color: c.muted }}>
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{ct.phone}</span>
                            </div>
                          )}
                          {ct.email && (
                            <div className="flex items-center gap-1.5 text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <a href={`mailto:${ct.email}`} className="truncate hover:underline" onClick={e => e.stopPropagation()}>{ct.email}</a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </>
            ) : (
              /* ── Edit Mode ── */
              <>
                <div className="grid gap-x-6 gap-y-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {selected.type !== "Individual" ? (<>
                    {editField("Company Name", "companyName")}
                    {editField("DBA Name or Operating Name", "dbaName")}
                    {editSelect("Entity", "agencyType", ["Individual", "Corporation", "LLC", "Partnership"])}
                  </>) : (<>
                    {editField("First Name", "firstName")}
                    {editField("Last Name", "lastName")}
                    {editSelect("Entity", "agencyType", ["Individual", "Corporation", "LLC", "Partnership"])}
                  </>)}
                  {editField("Email", "email")}
                  {editField("Phone Number", "phone")}
                  {editField("Website Url", "websiteUrl")}
                  {editField("Primary Class Code", "primaryClassCode", "8810-Auto Repair Shops")}
                  {editField("Federal ID # (optional)", "federalId")}
                  {editField("Contractor License # (optional)", "contractorLicense")}
                  {editField("Gross Sales", "grossSales", "$1000")}
                  {editField("Payroll", "payroll", "$1000")}
                  {editField("# Owners", "owners", "3")}
                  {editField("# Employees", "employees", "$1000")}
                </div>
                {/* Editable contacts list */}
                <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${c.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: c.muted }}>Contacts</div>
                    <span className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{contactsDraft.length} contact{contactsDraft.length === 1 ? "" : "s"}</span>
                  </div>
                  {contactsDraft.length === 0 && (
                    <div className="text-[12px] mb-3 px-3 py-2 rounded-lg" style={{ fontFamily: FONT, color: c.muted, background: c.mutedBg, border: `1px dashed ${c.border}` }}>
                      No contacts yet. Add one below.
                    </div>
                  )}
                  <div className="space-y-3">
                    {contactsDraft.map((ct, idx) => (
                      <div key={ct.id} className="rounded-lg p-3" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                        <div className="grid gap-3 items-start" style={{ gridTemplateColumns: "120px 1fr 1fr 1fr 1fr 32px" }}>
                          <select value={ct.type}
                            onChange={e => setContactsDraft(prev => prev.map((p,i) => i===idx ? { ...p, type: e.target.value as ClientContactType } : p))}
                            className="px-2 py-1.5 rounded-md outline-none text-[12px] font-semibold uppercase"
                            style={{ fontFamily: FONT, background: "rgba(168,85,247,0.10)", border: `1px solid ${c.border}`, color: "#A614C3" }}>
                            <option value="inspection">Inspection</option>
                            <option value="accounting">Accounting</option>
                            <option value="claims">Claims</option>
                          </select>
                          <input value={ct.firstName} placeholder="First name"
                            onChange={e => setContactsDraft(prev => prev.map((p,i) => i===idx ? { ...p, firstName: e.target.value } : p))}
                            className="px-2 py-1.5 rounded-md outline-none text-[12px]"
                            style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }} />
                          <input value={ct.lastName} placeholder="Last name"
                            onChange={e => setContactsDraft(prev => prev.map((p,i) => i===idx ? { ...p, lastName: e.target.value } : p))}
                            className="px-2 py-1.5 rounded-md outline-none text-[12px]"
                            style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }} />
                          <input value={ct.phone || ""} placeholder="Phone"
                            onChange={e => setContactsDraft(prev => prev.map((p,i) => i===idx ? { ...p, phone: e.target.value } : p))}
                            className="px-2 py-1.5 rounded-md outline-none text-[12px]"
                            style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }} />
                          <input value={ct.email || ""} placeholder="Email"
                            onChange={e => setContactsDraft(prev => prev.map((p,i) => i===idx ? { ...p, email: e.target.value } : p))}
                            className="px-2 py-1.5 rounded-md outline-none text-[12px]"
                            style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }} />
                          <button title="Remove contact"
                            onClick={() => setContactsDraft(prev => prev.filter((_,i) => i !== idx))}
                            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
                            style={{ color: c.muted }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; e.currentTarget.style.color = "#EF4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setContactsDraft(prev => [...prev, { id: `new-${Date.now()}`, type: "inspection", firstName: "", lastName: "", phone: "", email: "" }])}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{ fontFamily: FONT, border: `1px dashed ${c.border}`, color: c.text, background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Plus className="w-3.5 h-3.5" />Add another contact
                  </button>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${c.border}` }}>
                  <button onClick={() => setEditingInfo(false)} className="px-4 py-[7px] rounded-lg text-[12px] font-normal"
                    style={{ fontFamily: FONT, border: `1px solid #E5E7EB`, color: c.text, background: "#FFFFFF" }}>Cancel</button>
                  <button onClick={() => {
                      setContactsOverrides(prev => ({ ...prev, [selected.id]: contactsDraft.filter(ct => ct.firstName.trim() || ct.lastName.trim()) }));
                      setEditingInfo(false);
                    }}
                    className="px-5 py-[7px] rounded-lg text-[12px] font-semibold text-white"
                    style={{ fontFamily: FONT, background: c.accentGrad }}>Save Changes</button>
                </div>
              </>
            )}
          </div>

          {/* Address Information */}
          <div className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Address Information</h3>
              {!editingAddr ? (
                <button onClick={() => { setPendingEditAction(() => startEditAddr); setEditWarningOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors" onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.muted }}>
                  <Pencil className="w-3.5 h-3.5" />Edit
                </button>
              ) : (
                <button onClick={() => setEditingAddr(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors" onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text }}>
                  <Pencil className="w-3.5 h-3.5" />Cancel Edit
                </button>
              )}
            </div>

            {!editingAddr ? (
              /* ── View Mode ── */
              <div className="grid gap-x-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div className="text-[12px] font-semibold mb-1" style={{ fontFamily: FONT, color: c.muted }}>Physical Address:</div>
                  <div className="text-[13px]" style={{ fontFamily: FONT, color: c.text }}>{selected.address.street}, {selected.address.city}, {selected.address.state}, {selected.address.zipCode}</div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold mb-1" style={{ fontFamily: FONT, color: c.muted }}>Mailing Address:</div>
                  <div className="text-[13px]" style={{ fontFamily: FONT, color: c.text }}>Same as Agency Address</div>
                </div>
              </div>
            ) : (
              /* ── Edit Mode ── */
              <>
                <div className="mb-5">
                  <div className="text-[12px] font-semibold mb-3" style={{ fontFamily: FONT, color: c.muted }}>Physical Address:</div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
                    <div style={{ position: "relative" }}>
                      <select value={editFields.country || "United States of America"} onChange={e => setEditFields(f => ({ ...f, country: e.target.value }))}
                        style={{ ...inpSty, appearance: "none" as const }} className="outline-none cursor-pointer">
                        <option>United States of America</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
                    </div>
                    <AddressAutocomplete
                      value={editFields.street || ""}
                      onChange={v => setEditFields(f => ({ ...f, street: v }))}
                      onSelect={a => setEditFields(f => ({
                        ...f,
                        street: a.street,
                        city: a.city || f.city,
                        state: a.state || f.state,
                        zipCode: a.zip || f.zipCode,
                        country: a.country || f.country,
                      }))}
                      placeholder="Street Address"
                      inputStyle={inpSty}
                      className="outline-none"
                      dropdownBg={c.cardBg} dropdownText={c.text} dropdownBorder={c.border}
                    />
                  </div>
                  <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <input value={editFields.city || ""} onChange={e => setEditFields(f => ({ ...f, city: e.target.value }))} placeholder="City" style={inpSty} className="outline-none" />
                    <div style={{ position: "relative" }}>
                      <select value={editFields.state || ""} onChange={e => setEditFields(f => ({ ...f, state: e.target.value }))}
                        style={{ ...inpSty, appearance: "none" as const }} className="outline-none cursor-pointer">
                        <option value="">State</option>
                        {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
                    </div>
                    <input value={editFields.zipCode || ""} onChange={e => setEditFields(f => ({ ...f, zipCode: e.target.value }))} placeholder="Zip Code" style={inpSty} className="outline-none" />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[12px] font-semibold mb-2" style={{ fontFamily: FONT, color: c.muted }}>Mailing Address:</div>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer select-none" style={{ fontFamily: FONT, fontSize: 12, color: c.text }}>
                    <div onClick={() => setEditFields(f => ({ ...f, sameAddr: f.sameAddr === "true" ? "false" : "true" }))}
                      className="w-[16px] h-[16px] rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: editFields.sameAddr === "true" ? "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)" : c.inputBg, border: editFields.sameAddr === "true" ? "none" : `1.5px solid ${c.border}` }}>
                      {editFields.sameAddr === "true" && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    Same as Agency Address
                  </label>
                  <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
                    <div style={{ position: "relative" }}>
                      <select value="United States of America" style={{ ...inpSty, appearance: "none" as const }} className="outline-none cursor-pointer">
                        <option>United States of America</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
                    </div>
                    <AddressAutocomplete
                      value={editFields.sameAddr === "true" ? editFields.street || "" : editFields.mailStreet || ""}
                      onChange={v => setEditFields(f => ({ ...f, mailStreet: v }))}
                      onSelect={a => setEditFields(f => ({
                        ...f,
                        mailStreet: a.street,
                        mailCity: a.city || f.mailCity,
                        mailState: a.state || f.mailState,
                        mailZip: a.zip || f.mailZip,
                      }))}
                      placeholder="Street Address"
                      disabled={editFields.sameAddr === "true"}
                      containerStyle={{ opacity: editFields.sameAddr === "true" ? 0.6 : 1 }}
                      inputStyle={inpSty}
                      className="outline-none"
                      dropdownBg={c.cardBg} dropdownText={c.text} dropdownBorder={c.border}
                    />
                  </div>
                  <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <input value={editFields.sameAddr === "true" ? editFields.city || "" : editFields.mailCity || ""} readOnly={editFields.sameAddr === "true"}
                      onChange={e => setEditFields(f => ({ ...f, mailCity: e.target.value }))} placeholder="City" style={{ ...inpSty, opacity: editFields.sameAddr === "true" ? 0.6 : 1 }} className="outline-none" />
                    <div style={{ position: "relative" }}>
                      <select value={editFields.sameAddr === "true" ? editFields.state || "" : editFields.mailState || ""}
                        onChange={e => setEditFields(f => ({ ...f, mailState: e.target.value }))} disabled={editFields.sameAddr === "true"}
                        style={{ ...inpSty, appearance: "none" as const, opacity: editFields.sameAddr === "true" ? 0.6 : 1 }} className="outline-none cursor-pointer">
                        <option value="">State</option>
                        {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
                    </div>
                    <input value={editFields.sameAddr === "true" ? editFields.zipCode || "" : editFields.mailZip || ""} readOnly={editFields.sameAddr === "true"}
                      onChange={e => setEditFields(f => ({ ...f, mailZip: e.target.value }))} placeholder="Zip Code" style={{ ...inpSty, opacity: editFields.sameAddr === "true" ? 0.6 : 1 }} className="outline-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${c.border}` }}>
                  <button onClick={() => setEditingAddr(false)} className="px-4 py-[7px] rounded-lg text-[12px] font-normal"
                    style={{ fontFamily: FONT, border: `1px solid #E5E7EB`, color: c.text, background: "#FFFFFF" }}>Cancel</button>
                  <button onClick={() => setEditingAddr(false)} className="px-5 py-[7px] rounded-lg text-[12px] font-semibold text-white"
                    style={{ fontFamily: FONT, background: c.accentGrad }}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        </div>
        );
      })()}

      {/* ── POLICIES ── */}
      {detailTab === "policies" && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-stretch overflow-hidden transition-all" style={{ background: c.cardBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB"}`, borderRadius: 10 }} onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")} onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
              <input placeholder="Search Policies" value={detailSearch} onChange={e => setDetailSearch(e.target.value)}
                className="outline-none px-4 py-2 text-[13px]"
                style={{ fontFamily: FONT, background: "transparent", color: c.text, width: 200, borderRadius: "10px 0 0 10px" }} />
              <button className="px-5 text-[12px] font-semibold text-white flex-shrink-0"
                style={{ background: btnGrad, fontFamily: FONT, borderRadius: "0 7px 7px 0" }}>Submit</button>
            </div>
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 outline-none cursor-pointer"
                style={{ fontFamily: FONT, background: `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box`, border: "1px solid transparent", color: c.text, fontSize: 11, fontWeight: 500, borderRadius: 7 }}>
                <option>Past 20 Days</option><option>Past 60 Days</option><option>Past 90 Days</option><option>All Time</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
            </div>
            <div className="flex items-center gap-1 ml-1" style={{ borderLeft: `1px solid ${c.border}`, paddingLeft: 10 }}>
              <button title="Reset filters" onClick={() => { setQpStatusFilter("All Statuses"); setApplicantFilter(new Set()); setProducerFilter(new Set()); setQpSortKey("createdDate"); setQpSortDir("desc"); }}
                className="p-2 rounded-lg transition-colors" style={{ color: "#A614C3" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <RefreshCw className="w-4 h-4" /></button>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button title="View columns" onClick={() => setQpViewOpen(o => !o)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#A614C3", background: qpViewOpen ? c.hoverBg : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = qpViewOpen ? c.hoverBg : "transparent")}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="2" y="2" rx="1"/><rect width="5" height="5" x="9.5" y="2" rx="1"/><rect width="5" height="5" x="17" y="2" rx="1"/><rect width="5" height="5" x="2" y="9.5" rx="1"/><rect width="5" height="5" x="9.5" y="9.5" rx="1"/><rect width="5" height="5" x="17" y="9.5" rx="1"/><rect width="5" height="5" x="2" y="17" rx="1"/><rect width="5" height="5" x="9.5" y="17" rx="1"/><rect width="5" height="5" x="17" y="17" rx="1"/></svg>
                </button>
                {qpViewOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-[220px] rounded-xl shadow-xl overflow-hidden"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                    <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold"
                      style={{ fontFamily: FONT, color: c.muted, borderBottom: `1px solid ${c.border}`, letterSpacing: "0.06em" }}>
                      Show Columns
                    </div>
                    <div className="py-1.5 max-h-[280px] overflow-y-auto">
                      {QP_COLUMNS.map(col => {
                        const visible = !qpHiddenCols.has(col.key);
                        return (
                          <label key={col.key} className="flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            onClick={() => setQpHiddenCols(prev => { const s = new Set(prev); s.has(col.key) ? s.delete(col.key) : s.add(col.key); return s; })}>
                            <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                              style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                              {visible && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <button onClick={() => setQpHiddenCols(new Set())}
                      className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                      style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <RefreshCw className="w-3.5 h-3.5" />Show All
                    </button>
                  </div>
                )}
              </div>
              <button title="Export" className="p-2 rounded-lg transition-colors" style={{ color: "#A614C3" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Download className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="grid px-5 py-3 gap-4" style={{ gridTemplateColumns:qpGridTemplate, borderBottom:`1px solid ${c.border}`, background:c.mutedBg }}>
              {/* Created */}
              {!qpHiddenCols.has("created") && (
              <button onClick={()=>{if(qpSortKey==="createdDate")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("createdDate");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Created<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="createdDate"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="createdDate"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Policy Number (sortable) */}
              {!qpHiddenCols.has("policyNumber") && (
              <button onClick={()=>{if(qpSortKey==="policyNumber")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("policyNumber");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Policy Number<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="policyNumber"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="policyNumber"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Applicant filter */}
              {!qpHiddenCols.has("applicant") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setApplicantOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:applicantFilter.size>0?"#A614C3":c.muted}}>
                  Applicant<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={applicantFilter.size>0?"#A614C3":c.sub}/></svg></span>
                </button>
                {applicantOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setApplicantOpen(false)}/>
                  <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]" style={{background:c.cardBg,border:`1px solid ${c.border}`,left:-50}}>
                    <div className="p-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.05)":"#F9FAFB",border:`1px solid ${c.border}`}}>
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{color:c.muted}}/><input value={applicantSearch} onChange={e=>setApplicantSearch(e.target.value)} placeholder="Search Agent" className="outline-none text-[12px] flex-1 bg-transparent" style={{fontFamily:FONT,color:c.text}}/>
                      </div>
                    </div>
                    <div className="px-3 py-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{fontFamily:FONT,color:c.text}} onClick={()=>{const all=uniquePApplicants;setApplicantFilter(applicantFilter.size===all.length?new Set():new Set(all));}}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{applicantFilter.size===uniquePApplicants.length&&uniquePApplicants.length>0&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                        Select All
                      </button>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto py-1">
                      {uniquePApplicants.filter(a=>!applicantSearch||a.toLowerCase().includes(applicantSearch.toLowerCase())).map(applicant=>(
                        <button key={applicant} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors" style={{fontFamily:FONT,color:c.text}} onMouseEnter={e=>e.currentTarget.style.background=c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>toggleSetCl(applicantFilter,applicant,setApplicantFilter)}>
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{applicantFilter.has(applicant)&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                          {applicant}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setApplicantFilter(new Set());setApplicantSearch("");}} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors" style={{fontFamily:FONT,color:"#A614C3",borderTop:`1px solid ${c.border}`}} onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><RefreshCw className="w-3.5 h-3.5"/>Reset Filter</button>
                  </div>
                </>)}
              </div>
              )}
              {/* DBA (sortable) */}
              {!qpHiddenCols.has("dba") && (
              <button onClick={()=>{if(qpSortKey==="dba")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("dba");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                DBA<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="dba"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="dba"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Effective (sortable) */}
              {!qpHiddenCols.has("effective") && (
              <button onClick={()=>{if(qpSortKey==="effectiveDate")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("effectiveDate");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Effective<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="effectiveDate"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="effectiveDate"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* LOB filter */}
              {!qpHiddenCols.has("lob") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setLobOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:lobFilter!=="All LOBs"?"#A614C3":c.muted}}>
                  LOB<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={lobFilter!=="All LOBs"?"#A614C3":c.sub}/></svg></span>
                </button>
                {lobOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setLobOpen(false)}/>
                  <div className="absolute left-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto" style={{background:c.cardBg,border:`1px solid ${c.border}`}}>
                    {ALL_LOBS_CL.map(lob=>(
                      <button key={lob} onClick={()=>{setLobFilter(lob);setLobOpen(false);}} className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between gap-2" style={{fontFamily:FONT,color:lobFilter===lob?"#A614C3":c.text,fontWeight:lobFilter===lob?600:400,background:lobFilter===lob?"rgba(168,85,247,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=lobFilter===lob?"rgba(168,85,247,0.12)":c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background=lobFilter===lob?"rgba(168,85,247,0.08)":"transparent"}>
                        <span>{lob}</span>
                        {lobFilter===lob && <svg width="11" height="9" viewBox="0 0 9 7" fill="none" className="flex-shrink-0"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
              )}
              {/* Status filter */}
              {!qpHiddenCols.has("status") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setQpStatusOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:qpStatusFilter!=="All Statuses"?"#A614C3":c.muted}}>
                  Status<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={qpStatusFilter!=="All Statuses"?"#A614C3":c.sub}/></svg></span>
                </button>
                {qpStatusOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setQpStatusOpen(false)}/>
                  <div className="absolute left-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden min-w-[170px]" style={{background:c.cardBg,border:`1px solid ${c.border}`}}>
                    {POLICY_STATUSES_CL.map(status=>(
                      <button key={status} onClick={()=>{setQpStatusFilter(status);setQpStatusOpen(false);}} className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between gap-2" style={{fontFamily:FONT,color:qpStatusFilter===status?"#A614C3":c.text,fontWeight:qpStatusFilter===status?600:400,background:qpStatusFilter===status?"rgba(168,85,247,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=qpStatusFilter===status?"rgba(168,85,247,0.12)":c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background=qpStatusFilter===status?"rgba(168,85,247,0.08)":"transparent"}>
                        <span>{status}</span>
                        {qpStatusFilter===status && <svg width="11" height="9" viewBox="0 0 9 7" fill="none" className="flex-shrink-0"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
              )}
              {/* Producer filter */}
              {!qpHiddenCols.has("producer") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setProducerOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:producerFilter.size>0?"#A614C3":c.muted}}>
                  Producer<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={producerFilter.size>0?"#A614C3":c.sub}/></svg></span>
                </button>
                {producerOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setProducerOpen(false)}/>
                  <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]" style={{background:c.cardBg,border:`1px solid ${c.border}`,left:-50}}>
                    <div className="p-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.05)":"#F9FAFB",border:`1px solid ${c.border}`}}>
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{color:c.muted}}/><input value={producerSearch} onChange={e=>setProducerSearch(e.target.value)} placeholder="Search Agent" className="outline-none text-[12px] flex-1 bg-transparent" style={{fontFamily:FONT,color:c.text}}/>
                      </div>
                    </div>
                    <div className="px-3 py-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{fontFamily:FONT,color:c.text}} onClick={()=>{const all=uniquePProducers;setProducerFilter(producerFilter.size===all.length?new Set():new Set(all));}}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{producerFilter.size===uniquePProducers.length&&uniquePProducers.length>0&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                        Select All
                      </button>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto py-1">
                      {uniquePProducers.filter(p=>!producerSearch||p.toLowerCase().includes(producerSearch.toLowerCase())).map(producer=>(
                        <button key={producer} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors" style={{fontFamily:FONT,color:c.text}} onMouseEnter={e=>e.currentTarget.style.background=c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>toggleSetCl(producerFilter,producer,setProducerFilter)}>
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{producerFilter.has(producer)&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                          {producer}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setProducerFilter(new Set());setProducerSearch("");}} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors" style={{fontFamily:FONT,color:"#A614C3",borderTop:`1px solid ${c.border}`}} onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><RefreshCw className="w-3.5 h-3.5"/>Reset Filter</button>
                  </div>
                </>)}
              </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {clientPolicies.map((p,i,arr) => {
                const isRenewal = p.status === "Upcoming Renewal";
                const isHighlighted = highlightFilter === "renewals" && isRenewal;
                return (
                <div key={p.id} className="grid px-5 py-3.5 items-center gap-4 transition-colors cursor-pointer"
                  style={{ gridTemplateColumns:qpGridTemplate, borderBottom:i!==arr.length-1?`1px solid ${c.border}`:"none", background: isHighlighted ? "rgba(116,195,183,0.08)" : "transparent", borderLeft: isHighlighted ? "3px solid #74C3B7" : "3px solid transparent" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=isHighlighted?"rgba(116,195,183,0.14)":c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background=isHighlighted?"rgba(116,195,183,0.08)":"transparent")}>
                  {!qpHiddenCols.has("created")      && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{new Date(p.createdDate).toLocaleDateString()}</div>}
                  {!qpHiddenCols.has("policyNumber") && <div className="text-[12px] font-semibold" style={{ fontFamily:FONT, color: isDark ? "#4ECDC4" : "#A614C3" }}>{p.policyNumber}</div>}
                  {!qpHiddenCols.has("applicant")    && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{p.applicant}</div>}
                  {!qpHiddenCols.has("dba")          && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{p.dba || "—"}</div>}
                  {!qpHiddenCols.has("effective")    && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{new Date(p.effectiveDate).toLocaleDateString()}</div>}
                  {!qpHiddenCols.has("lob")          && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{p.lob}</div>}
                  {!qpHiddenCols.has("status")       && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{p.status}</div>}
                  {!qpHiddenCols.has("producer")     && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{p.producer}</div>}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── QUOTES ── */}
      {detailTab === "quotes" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-stretch overflow-hidden transition-all" style={{ background: c.cardBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB"}`, borderRadius: 10 }} onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")} onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
              <input placeholder="Search Quotes" value={detailSearch} onChange={e => setDetailSearch(e.target.value)}
                className="outline-none px-4 py-2 text-[13px]"
                style={{ fontFamily: FONT, background: "transparent", color: c.text, width: 200, borderRadius: "10px 0 0 10px" }} />
              <button className="px-5 text-[12px] font-semibold text-white flex-shrink-0"
                style={{ background: btnGrad, fontFamily: FONT, borderRadius: "0 7px 7px 0" }}>Submit</button>
            </div>
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 outline-none cursor-pointer"
                style={{ fontFamily: FONT, background: `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box`, border: "1px solid transparent", color: c.text, fontSize: 11, fontWeight: 500, borderRadius: 7 }}>
                <option>Past 20 Days</option><option>Past 60 Days</option><option>Past 90 Days</option><option>All Time</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} />
            </div>
            <div className="flex items-center gap-1 ml-1" style={{ borderLeft: `1px solid ${c.border}`, paddingLeft: 10 }}>
              <button title="Reset filters" onClick={() => { setQpStatusFilter("All Statuses"); setApplicantFilter(new Set()); setProducerFilter(new Set()); setQpSortKey("createdDate"); setQpSortDir("desc"); }}
                className="p-2 rounded-lg transition-colors" style={{ color: "#A614C3" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button title="View columns" onClick={() => setQpViewOpen(o => !o)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#A614C3", background: qpViewOpen ? c.hoverBg : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = qpViewOpen ? c.hoverBg : "transparent")}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="2" y="2" rx="1"/><rect width="5" height="5" x="9.5" y="2" rx="1"/><rect width="5" height="5" x="17" y="2" rx="1"/><rect width="5" height="5" x="2" y="9.5" rx="1"/><rect width="5" height="5" x="9.5" y="9.5" rx="1"/><rect width="5" height="5" x="17" y="9.5" rx="1"/><rect width="5" height="5" x="2" y="17" rx="1"/><rect width="5" height="5" x="9.5" y="17" rx="1"/><rect width="5" height="5" x="17" y="17" rx="1"/></svg>
                </button>
                {qpViewOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-[220px] rounded-xl shadow-xl overflow-hidden"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                    <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold"
                      style={{ fontFamily: FONT, color: c.muted, borderBottom: `1px solid ${c.border}`, letterSpacing: "0.06em" }}>
                      Show Columns
                    </div>
                    <div className="py-1.5 max-h-[280px] overflow-y-auto">
                      {QP_COLUMNS.map(col => {
                        const visible = !qpHiddenCols.has(col.key);
                        return (
                          <label key={col.key} className="flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            onClick={() => setQpHiddenCols(prev => { const s = new Set(prev); s.has(col.key) ? s.delete(col.key) : s.add(col.key); return s; })}>
                            <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                              style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                              {visible && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <button onClick={() => setQpHiddenCols(new Set())}
                      className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                      style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <RefreshCw className="w-3.5 h-3.5" />Show All
                    </button>
                  </div>
                )}
              </div>
              <button title="Export" className="p-2 rounded-lg transition-colors" style={{ color: "#A614C3" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="grid px-5 py-3 gap-4" style={{ gridTemplateColumns:qpGridTemplate, borderBottom:`1px solid ${c.border}`, background:c.mutedBg }}>
              {/* Created */}
              {!qpHiddenCols.has("created") && (
              <button onClick={()=>{if(qpSortKey==="createdDate")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("createdDate");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Created<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="createdDate"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="createdDate"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Submission ID */}
              {!qpHiddenCols.has("policyNumber") && (
              <button onClick={()=>{if(qpSortKey==="submissionId")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("submissionId");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Submission ID<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="submissionId"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="submissionId"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Applicant filter */}
              {!qpHiddenCols.has("applicant") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setApplicantOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:applicantFilter.size>0?"#A614C3":c.muted}}>
                  Applicant<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={applicantFilter.size>0?"#A614C3":c.sub}/></svg></span>
                </button>
                {applicantOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setApplicantOpen(false)}/>
                  <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]" style={{background:c.cardBg,border:`1px solid ${c.border}`,left:-50}}>
                    <div className="p-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.05)":"#F9FAFB",border:`1px solid ${c.border}`}}>
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{color:c.muted}}/><input value={applicantSearch} onChange={e=>setApplicantSearch(e.target.value)} placeholder="Search Agent" className="outline-none text-[12px] flex-1 bg-transparent" style={{fontFamily:FONT,color:c.text}}/>
                      </div>
                    </div>
                    <div className="px-3 py-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{fontFamily:FONT,color:c.text}} onClick={()=>{const all=uniqueQApplicants;setApplicantFilter(applicantFilter.size===all.length?new Set():new Set(all));}}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{applicantFilter.size===uniqueQApplicants.length&&uniqueQApplicants.length>0&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                        Select All
                      </button>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto py-1">
                      {uniqueQApplicants.filter(a=>!applicantSearch||a.toLowerCase().includes(applicantSearch.toLowerCase())).map(applicant=>(
                        <button key={applicant} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors" style={{fontFamily:FONT,color:c.text}} onMouseEnter={e=>e.currentTarget.style.background=c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>toggleSetCl(applicantFilter,applicant,setApplicantFilter)}>
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{applicantFilter.has(applicant)&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                          {applicant}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setApplicantFilter(new Set());setApplicantSearch("");}} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors" style={{fontFamily:FONT,color:"#A614C3",borderTop:`1px solid ${c.border}`}} onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><RefreshCw className="w-3.5 h-3.5"/>Reset Filter</button>
                  </div>
                </>)}
              </div>
              )}
              {/* DBA */}
              {!qpHiddenCols.has("dba") && (
              <button onClick={()=>{if(qpSortKey==="dba")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("dba");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                DBA<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="dba"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="dba"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* Effective */}
              {!qpHiddenCols.has("effective") && (
              <button onClick={()=>{if(qpSortKey==="effectiveDate")setQpSortDir(d=>d==="asc"?"desc":"asc");else{setQpSortKey("effectiveDate");setQpSortDir("asc");}}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left" style={{fontFamily:FONT,color:c.muted}}>
                Effective<span className="inline-flex ml-0.5"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={qpSortKey==="effectiveDate"&&qpSortDir==="asc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={qpSortKey==="effectiveDate"&&qpSortDir==="desc"?(isDark?"#fff":"#374151"):c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </button>
              )}
              {/* LOB filter */}
              {!qpHiddenCols.has("lob") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setLobOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:lobFilter!=="All LOBs"?"#A614C3":c.muted}}>
                  LOB<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={lobFilter!=="All LOBs"?"#A614C3":c.sub}/></svg></span>
                </button>
                {lobOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setLobOpen(false)}/>
                  <div className="absolute left-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto" style={{background:c.cardBg,border:`1px solid ${c.border}`}}>
                    {ALL_LOBS_CL.map(lob=>(
                      <button key={lob} onClick={()=>{setLobFilter(lob);setLobOpen(false);}} className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between gap-2" style={{fontFamily:FONT,color:lobFilter===lob?"#A614C3":c.text,fontWeight:lobFilter===lob?600:400,background:lobFilter===lob?"rgba(168,85,247,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=lobFilter===lob?"rgba(168,85,247,0.12)":c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background=lobFilter===lob?"rgba(168,85,247,0.08)":"transparent"}>
                        <span>{lob}</span>
                        {lobFilter===lob && <svg width="11" height="9" viewBox="0 0 9 7" fill="none" className="flex-shrink-0"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
              )}
              {/* Status filter */}
              {!qpHiddenCols.has("status") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setQpStatusOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:qpStatusFilter!=="All Statuses"?"#A614C3":c.muted}}>
                  Status<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={qpStatusFilter!=="All Statuses"?"#A614C3":c.sub}/></svg></span>
                </button>
                {qpStatusOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setQpStatusOpen(false)}/>
                  <div className="absolute left-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden min-w-[170px]" style={{background:c.cardBg,border:`1px solid ${c.border}`}}>
                    {QUOTE_STATUSES_CL.map(status=>(
                      <button key={status} onClick={()=>{setQpStatusFilter(status);setQpStatusOpen(false);}} className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between gap-2" style={{fontFamily:FONT,color:qpStatusFilter===status?"#A614C3":c.text,fontWeight:qpStatusFilter===status?600:400,background:qpStatusFilter===status?"rgba(168,85,247,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=qpStatusFilter===status?"rgba(168,85,247,0.12)":c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background=qpStatusFilter===status?"rgba(168,85,247,0.08)":"transparent"}>
                        <span>{status}</span>
                        {qpStatusFilter===status && <svg width="11" height="9" viewBox="0 0 9 7" fill="none" className="flex-shrink-0"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
              )}
              {/* Producer filter */}
              {!qpHiddenCols.has("producer") && (
              <div className="relative">
                <button onClick={()=>{closeAllQpDropdowns();setProducerOpen(o=>!o);}} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none" style={{fontFamily:FONT,color:producerFilter.size>0?"#A614C3":c.muted}}>
                  Producer<span className="inline-flex ml-1"><svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={producerFilter.size>0?"#A614C3":c.sub}/></svg></span>
                </button>
                {producerOpen&&(<>
                  <div className="fixed inset-0 z-10" onClick={()=>setProducerOpen(false)}/>
                  <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]" style={{background:c.cardBg,border:`1px solid ${c.border}`,left:-50}}>
                    <div className="p-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.05)":"#F9FAFB",border:`1px solid ${c.border}`}}>
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{color:c.muted}}/><input value={producerSearch} onChange={e=>setProducerSearch(e.target.value)} placeholder="Search Agent" className="outline-none text-[12px] flex-1 bg-transparent" style={{fontFamily:FONT,color:c.text}}/>
                      </div>
                    </div>
                    <div className="px-3 py-2" style={{borderBottom:`1px solid ${c.border}`}}>
                      <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{fontFamily:FONT,color:c.text}} onClick={()=>{const all=uniqueQProducers;setProducerFilter(producerFilter.size===all.length?new Set():new Set(all));}}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{producerFilter.size===uniqueQProducers.length&&uniqueQProducers.length>0&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                        Select All
                      </button>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto py-1">
                      {uniqueQProducers.filter(p=>!producerSearch||p.toLowerCase().includes(producerSearch.toLowerCase())).map(producer=>(
                        <button key={producer} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors" style={{fontFamily:FONT,color:c.text}} onMouseEnter={e=>e.currentTarget.style.background=c.hoverBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>toggleSetCl(producerFilter,producer,setProducerFilter)}>
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0" style={{border:`1.5px solid ${c.borderStrong}`,background:c.cardBg}}>{producerFilter.has(producer)&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                          {producer}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setProducerFilter(new Set());setProducerSearch("");}} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors" style={{fontFamily:FONT,color:"#A614C3",borderTop:`1px solid ${c.border}`}} onMouseEnter={e=>(e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><RefreshCw className="w-3.5 h-3.5"/>Reset Filter</button>
                  </div>
                </>)}
              </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {clientQuotes.map((q,i,arr) => {
                const isPending = q.status === "Pending" || q.status === "Pending/Action Req.";
                const isHighlighted = highlightFilter === "incomplete-quotes" && q.status === "Incomplete";
                return (
                <div key={q.id} className="grid px-5 py-3.5 items-center gap-4 transition-colors cursor-pointer"
                  style={{ gridTemplateColumns:qpGridTemplate, borderBottom:i!==arr.length-1?`1px solid ${c.border}`:"none", background: isHighlighted ? "rgba(245,158,11,0.06)" : "transparent", borderLeft: isHighlighted ? "3px solid #F59E0B" : "3px solid transparent" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=isHighlighted?"rgba(245,158,11,0.10)":c.hoverBg)} onMouseLeave={e=>(e.currentTarget.style.background=isHighlighted?"rgba(245,158,11,0.06)":"transparent")}>
                  {!qpHiddenCols.has("created")      && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{new Date(q.createdDate).toLocaleDateString()}</div>}
                  {!qpHiddenCols.has("policyNumber") && <div className="text-[12px] font-semibold" style={{ fontFamily:FONT, color: isDark ? "#4ECDC4" : "#A614C3" }}>{q.quoteId}</div>}
                  {!qpHiddenCols.has("applicant")    && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.applicant}</div>}
                  {!qpHiddenCols.has("dba")          && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.dba || "—"}</div>}
                  {!qpHiddenCols.has("effective")    && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.effectiveDate ? new Date(q.effectiveDate).toLocaleDateString() : "—"}</div>}
                  {!qpHiddenCols.has("lob")          && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.lob}</div>}
                  {!qpHiddenCols.has("status")       && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.status}</div>}
                  {!qpHiddenCols.has("producer")     && <div className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>{q.producer}</div>}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── POLICY DOCUMENTS (auto-extracted from issued policies) ── */}
      {detailTab === "policy-documents" && renderDocsTab({
        docPredicate: d => d.category === "Policy" || d.category === "Endorsement" || d.category === "Certificate",
        categoryOptions: ["Policy", "Endorsement", "Certificate"],
        emptyTitle: "No policy documents yet",
        emptyHint: "Documents will appear here automatically when policies are issued.",
        enableContextMenu: false,
        showPolicyCols: true,
        syncSource: "AMS360",
        view: pdView, setView: setPdView,
        showArchived: pdShowArchived, setShowArchived: setPdShowArchived,
        showTrashed: pdShowTrashed, setShowTrashed: setPdShowTrashed,
        filterCat: pdFilterCat, setFilterCat: setPdFilterCat,
        sortDir: pdSortDir, setSortDir: setPdSortDir,
        search: pdSearch, setSearch: setPdSearch,
        searchOpen: pdSearchOpen, setSearchOpen: setPdSearchOpen,
        filterOpen: pdFilterOpen, setFilterOpen: setPdFilterOpen,
        sortOpen: pdSortOpen, setSortOpen: setPdSortOpen,
        uploadOpen: pdUploadOpen, setUploadOpen: setPdUploadOpen,
      })}

      {/* ── FILE CABINET (user-uploaded misc docs) ── */}
      {detailTab === "file-cabinet" && renderDocsTab({
        docPredicate: d => d.category !== "Policy" && d.category !== "Endorsement" && d.category !== "Certificate",
        categoryOptions: ["Loss Run", "Schedule", "Authorization", "Tax", "Other"],
        emptyTitle: "File cabinet is empty",
        emptyHint: "Upload loss runs, schedules, W-9 forms, BOR letters, or other client documents.",
        enableContextMenu: true,
        showPolicyCols: false,
        view: fcView, setView: setFcView,
        showArchived: fcShowArchived, setShowArchived: setFcShowArchived,
        showTrashed: fcShowTrashed, setShowTrashed: setFcShowTrashed,
        filterCat: fcFilterCat, setFilterCat: setFcFilterCat,
        sortDir: fcSortDir, setSortDir: setFcSortDir,
        search: fcSearch, setSearch: setFcSearch,
        searchOpen: fcSearchOpen, setSearchOpen: setFcSearchOpen,
        filterOpen: fcFilterOpen, setFilterOpen: setFcFilterOpen,
        sortOpen: fcSortOpen, setSortOpen: setFcSortOpen,
        uploadOpen: fcUploadOpen, setUploadOpen: setFcUploadOpen,
      })}
      {/* Right-click context menu (File Cabinet only) */}
      {fileCtxMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setFileCtxMenu(null)} onContextMenu={e => { e.preventDefault(); setFileCtxMenu(null); }} />
          <div className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: fileCtxMenu.x, top: fileCtxMenu.y, background: c.cardBg, border: `1px solid ${c.border}`, fontFamily: FONT }}>
            {(() => {
              const doc = allClientDocs.find(d => d.id === fileCtxMenu.docId);
              const items: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }[] = [
                { label: "View",   icon: <Eye className="w-3.5 h-3.5" />,  onClick: () => { if (doc) setPreviewDoc(doc); setFileCtxMenu(null); } },
                { label: "Rename", icon: <Pencil   className="w-3.5 h-3.5" />,  onClick: () => { setRenamingDocId(fileCtxMenu.docId); setRenameValue(doc?.name || ""); setFileCtxMenu(null); } },
                { label: "Delete", icon: <Trash2   className="w-3.5 h-3.5" />, danger: true, onClick: () => { setDeletedDocIds(prev => { const s = new Set(prev); s.add(fileCtxMenu.docId); return s; }); setFileCtxMenu(null); } },
              ];
              return items.map(it => (
                <button key={it.label} onClick={it.onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors"
                  style={{ color: it.danger ? "#EF4444" : c.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {it.icon}{it.label}
                </button>
              ));
            })()}
          </div>
        </>
      )}

      {/* ── ACTIVITY ── */}
      {detailTab === "activity" && (() => {
        // Icons matching the tab icons exactly
        const iconMap: Record<string, React.ReactNode> = {
          policy:   <Shield className="w-3.5 h-3.5" style={{ color:"#74C3B7" }} />,
          quote:    <FileText className="w-3.5 h-3.5" style={{ color:"#A78BFA" }} />,
          document: <FolderOpen className="w-3.5 h-3.5" style={{ color:"#60A5FA" }} />,
          email:    <Mail className="w-3.5 h-3.5" style={{ color:"#F59E0B" }} />,
          call:     <Phone className="w-3.5 h-3.5" style={{ color:"#34D399" }} />,
          note:     <CopyPlus className="w-3.5 h-3.5" style={{ color:"#F97316" }} />,
        };
        const bgMap: Record<string, string> = {
          policy:"rgba(116,195,183,0.12)", quote:"rgba(167,139,250,0.12)",
          document:"rgba(96,165,250,0.12)", email:"rgba(245,158,11,0.12)",
          call:"rgba(52,211,153,0.12)", note:"rgba(249,115,22,0.12)",
        };
        const colorMap: Record<string, string> = {
          all: c.teal, policy:"#74C3B7", quote:"#A78BFA",
          document:"#60A5FA", email:"#F59E0B", call:"#34D399", note:"#F97316",
        };
        const labelMap: Record<string, string> = {
          all:"All", policy:"Policy", quote:"Quote",
          document:"Document", email:"Email", call:"Call", note:"Note",
        };
        const filteredActivity = activityFilter === "all"
          ? clientActivity
          : clientActivity.filter(a => a.type === activityFilter);
        return (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Filter pills + Add button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {(["all","policy","quote","document","email","call","note"] as const).map(f => {
                  const active = activityFilter === f;
                  const count = f === "all" ? clientActivity.length : clientActivity.filter(a => a.type === f).length;
                  return (
                    <button key={f} onClick={() => setActivityFilter(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-normal transition-all"
                      style={{
                        fontFamily: FONT,
                        background: active ? `${colorMap[f]}15` : c.mutedBg,
                        border: `1px solid ${active ? colorMap[f] : c.border}`,
                        color: active ? colorMap[f] : c.muted,
                      }}>
                      {f !== "all" && iconMap[f]}
                      {labelMap[f]}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-0.5"
                        style={{ background: active ? `${colorMap[f]}20` : isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB", color: active ? colorMap[f] : c.sub }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setAddActivityOpen(true)}
                className="flex items-center gap-2 px-[17px] py-[9px] rounded-lg text-[12px] font-semibold text-white flex-shrink-0"
                style={{ fontFamily: FONT, background: c.accentGrad }}>
                <Plus className="w-3.5 h-3.5" />Add Activity
              </button>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto rounded-xl p-5" style={{ background:c.cardBg, border:`1px solid ${c.border}` }}>
              {filteredActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Activity className="w-8 h-8" style={{ color:c.sub }} />
                  <span className="text-[13px]" style={{ fontFamily:FONT, color:c.muted }}>No activity found</span>
                </div>
              ) : filteredActivity.map((a,i) => (
                <div key={a.id} className="flex gap-4">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: bgMap[a.type] || "rgba(116,195,183,0.12)" }}>
                      {iconMap[a.type]}
                    </div>
                    {i !== filteredActivity.length-1 && <div className="w-px flex-1 my-2" style={{ background:c.border }} />}
                  </div>
                  <div className="flex-1 pb-5">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-[13px] font-semibold" style={{ fontFamily:FONT, color:c.text }}>{a.action}</h4>
                      <span className="text-[11px] flex-shrink-0 ml-4" style={{ fontFamily:FONT, color:c.muted }}>{a.timestamp}</span>
                    </div>
                    <p className="text-[12px] mb-1" style={{ fontFamily:FONT, color:c.muted }}>{a.description}</p>
                    <p className="text-[11px]" style={{ fontFamily:FONT, color:c.sub }}>by {a.user}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Activity Modal */}
            {addActivityOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.4)" }}
                onClick={() => setAddActivityOpen(false)}>
                <div className="w-[480px] rounded-2xl shadow-2xl p-6" style={{ background:c.cardBg, border:`1px solid ${c.border}` }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[16px] font-bold" style={{ fontFamily:FONT, color:c.text }}>Add Activity</h3>
                    <button onClick={() => setAddActivityOpen(false)} style={{ color:c.muted }}><X className="w-4 h-4" /></button>
                  </div>
                  {/* Type selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(["call","email","note","policy","quote","document"] as const).map(t => {
                      const active = newActivityType === t;
                      return (
                        <button key={t} onClick={() => setNewActivityType(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-normal transition-all capitalize"
                          style={{
                            fontFamily: FONT,
                            background: active ? `${colorMap[t]}15` : c.mutedBg,
                            border: `1px solid ${active ? colorMap[t] : c.border}`,
                            color: active ? colorMap[t] : c.muted,
                          }}>
                          {iconMap[t]}{labelMap[t]}
                        </button>
                      );
                    })}
                  </div>
                  {/* Action title */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily:FONT, color:c.muted }}>Title</label>
                    <input value={newActivityAction} onChange={e => setNewActivityAction(e.target.value)}
                      placeholder="e.g. Phone call with client"
                      className="w-full outline-none rounded-xl px-3 py-2.5 text-[13px]"
                      style={{ fontFamily:FONT, background:c.inputBg, border:`1px solid ${c.border}`, color:c.text }} />
                  </div>
                  {/* Description */}
                  <div className="mb-5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily:FONT, color:c.muted }}>Description</label>
                    <textarea value={newActivityDesc} onChange={e => setNewActivityDesc(e.target.value)}
                      placeholder="Describe what happened..."
                      rows={3}
                      className="w-full outline-none resize-none rounded-xl px-3 py-2.5 text-[13px]"
                      style={{ fontFamily:FONT, background:c.inputBg, border:`1px solid ${c.border}`, color:c.text }} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setAddActivityOpen(false)}
                      className="px-[17px] py-[9px] rounded-lg text-[12px] font-normal transition-colors"
                      style={{ fontFamily:FONT, border:`1px solid #E5E7EB`, color: c.text, background:"#FFFFFF" }}>Cancel</button>
                    <button onClick={() => {
                      if (!newActivityAction.trim() || !selected) return;
                      const now = new Date();
                      const ts = `${now.toLocaleDateString()} ${now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`;
                      const entry: ActivityLog = {
                        id: Date.now().toString(),
                        action: newActivityAction.trim(),
                        description: newActivityDesc.trim() || "",
                        timestamp: ts,
                        user: "Jane Smith",
                        clientId: selected.id,
                        type: newActivityType,
                      };
                      setActivityLogs(prev => [entry, ...prev]);
                      setNewActivityAction(""); setNewActivityDesc(""); setAddActivityOpen(false);
                    }}
                      className="px-[17px] py-[9px] rounded-lg text-[12px] font-semibold text-white"
                      style={{ fontFamily:FONT, background:c.accentGrad }}>
                      Add Activity
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── NOTES ── */}
      {detailTab === "notes" && (() => {
        const NOTE_TYPES: Note["type"][] = ["General","Policy","Follow-up","Meeting","Task"];
        const typeColor: Record<string, { bg: string; text: string }> = {
          "General":   { bg: isDark ? "rgba(156,163,175,0.15)" : "#F3F4F6",                text: isDark ? "#9CA3AF" : "#6B7280" },
          "Policy":    { bg: isDark ? "rgba(166,20,195,0.18)"  : "rgba(166,20,195,0.10)",  text: isDark ? "#C87BE0" : "#A614C3" },
          "Follow-up": { bg: isDark ? "rgba(255,164,124,0.18)" : "rgba(255,164,124,0.20)", text: isDark ? "#FFA47C" : "#D96B3E" },
          "Meeting":   { bg: isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.20)", text: "#73C9B7" },
          "Task":      { bg: isDark ? "rgba(239,68,68,0.15)"   : "rgba(239,68,68,0.10)",   text: "#EF4444" },
        };
        const TypeBadge = ({ type }: { type: string }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap"
            style={{ fontFamily: FONT, background: typeColor[type]?.bg, color: typeColor[type]?.text }}>
            {type}
          </span>
        );
        const fmtDate = (ts: string) => {
          const d = new Date(ts);
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " +
            d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        };
        const visibleNotes = clientNotes
          .filter(n => showTrashed ? trashedNoteIds.has(n.id) : showArchived ? archivedNoteIds.has(n.id) : (!trashedNoteIds.has(n.id) && !archivedNoteIds.has(n.id)))
          .filter(n => (n.visibility ?? "Shared") !== "Private" || n.author === CURRENT_USER)
          .filter(n => noteFilterType === "All" || n.type === noteFilterType)
          .filter(n => visibilityFilter === "All" || (n.visibility ?? "Shared") === visibilityFilter)
          .filter(n => !noteSearch || n.title.toLowerCase().includes(noteSearch.toLowerCase()) || n.content.toLowerCase().includes(noteSearch.toLowerCase()))
          .sort((a, b) => {
            const pa = pinnedNoteIds.has(a.id) ? 1 : 0, pb = pinnedNoteIds.has(b.id) ? 1 : 0;
            if (pa !== pb) return pb - pa;
            return noteSortDir === "desc"
              ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });

        const openNote = (n: Note) => { setSelectedNote(n); setEditingNoteTitle(n.title); setEditingNoteContent(n.content); setEditingNoteType(n.type); setEditingNoteVisibility(n.visibility || "Shared"); };
        const saveNote = () => { if (!selectedNote) return; setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: editingNoteTitle, content: editingNoteContent, type: editingNoteType, visibility: editingNoteVisibility } : n)); setSelectedNote(s => s ? { ...s, title: editingNoteTitle, content: editingNoteContent, type: editingNoteType, visibility: editingNoteVisibility } : s); };

        return (
          <div className="flex flex-1 min-h-0 gap-4" onClick={() => { setNoteFilterOpen(false); setNoteSortOpen(false); setNoteNewOpen(false); setNoteMoreOpen(false); }}>

          {/* ── LEFT PANEL (list / board / table) ── */}
          <div className="flex flex-col min-h-0 transition-all"
            style={{ flex: selectedNote && !noteExpanded ? "0 0 30%" : "1 1 100%", minWidth: 0 }}>

            {/* ── Notion-style toolbar ── */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              {/* Left: view switcher */}
              <div className="flex items-center gap-0.5">
                {(() => { const collapsed = !!selectedNote && !noteExpanded; return (<>
                {([["list","All Notes",List],["board","By Type",LayoutGrid],["table","Table",Table2]] as [typeof noteView, string, ({className}:{className?:string})=>React.ReactElement][]).map(([v, label, Icon]) => {
                  const isActive = noteView === v && !showArchived && !showTrashed;
                  return (
                    <button key={v} title={label} onClick={e => { e.stopPropagation(); setNoteView(v); setShowArchived(false); setShowTrashed(false); setIsSelectMode(false); setSelectedNoteIds(new Set()); }}
                      className={`flex items-center ${collapsed ? "px-1.5" : "gap-1.5 px-3"} py-1.5 rounded-md text-[12px] font-medium transition-all whitespace-nowrap`}
                      style={{ fontFamily: FONT, background: isActive ? (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6") : "transparent", color: isActive ? c.text : c.muted }}>
                      <Icon className="w-3 h-3" />{!collapsed && label}
                    </button>
                  );
                })}
                {/* Divider */}
                <div className="mx-1.5" style={{ width: 1, height: 16, background: c.border }} />
                {/* Archived tab */}
                {(() => { const n = clientNotes.filter(x => archivedNoteIds.has(x.id)).length; return (
                  <button title="Archive" onClick={e => { e.stopPropagation(); setShowArchived(true); setShowTrashed(false); }}
                    className={`flex items-center ${collapsed ? "px-1.5" : "gap-1.5 px-2.5"} py-1.5 rounded-md text-[12px] font-medium transition-all`}
                    style={{ fontFamily: FONT, background: showArchived ? "rgba(245,158,11,0.10)" : "transparent", color: showArchived ? "#F59E0B" : c.muted }}>
                    <Archive className="w-3 h-3" />{!collapsed && "Archive"}
                    {!collapsed && n > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: showArchived ? "rgba(245,158,11,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"), color: showArchived ? "#F59E0B" : c.muted }}>{n}</span>}
                  </button>
                ); })()}
                {/* Trash tab */}
                {(() => { const n = clientNotes.filter(x => trashedNoteIds.has(x.id)).length; return (
                  <button title="Trash" onClick={e => { e.stopPropagation(); setShowTrashed(true); setShowArchived(false); }}
                    className={`flex items-center ${collapsed ? "px-1.5" : "gap-1.5 px-2.5"} py-1.5 rounded-md text-[12px] font-medium transition-all`}
                    style={{ fontFamily: FONT, background: showTrashed ? "rgba(239,68,68,0.10)" : "transparent", color: showTrashed ? "#EF4444" : c.muted }}>
                    <Trash2 className="w-3 h-3" />{!collapsed && "Trash"}
                    {!collapsed && n > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: showTrashed ? "rgba(239,68,68,0.20)" : (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"), color: showTrashed ? "#EF4444" : c.muted }}>{n}</span>}
                  </button>
                ); })()}
                </>); })()}
              </div>

              {/* Right: action icons + New */}
              <div className="flex items-center gap-1">
                {/* Filter */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setNoteFilterOpen(p => !p); setNoteSortOpen(false); setNoteNewOpen(false); }}
                    className="p-1.5 rounded-md transition-all"
                    style={{ color: (noteFilterType !== "All" || visibilityFilter !== "All") ? "#A855F7" : c.muted, background: (noteFilterType !== "All" || visibilityFilter !== "All") ? "rgba(168,85,247,0.10)" : "transparent" }}
                    title="Filter">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14v1.5L9.5 10v5l-3-1.5V10L1 4.5V3z"/></svg>
                  </button>
                  {noteFilterOpen && (
                    <div className="absolute right-0 top-8 z-30 w-52 rounded-xl shadow-xl py-1.5" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5" style={{ fontFamily: FONT, color: c.muted }}>Filter by Type</p>
                      {(["All", ...NOTE_TYPES] as const).map(t => (
                        <button key={t} onClick={() => { setNoteFilterType(t as typeof noteFilterType); }}
                          className="w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between transition-colors"
                          style={{ fontFamily: FONT, color: noteFilterType === t ? "#A614C3" : c.text, background: noteFilterType === t ? "rgba(168,85,247,0.08)" : "transparent" }}>
                          {t === "All" ? "All Types" : t}
                          {noteFilterType === t && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </button>
                      ))}
                      <div style={{ height: 1, background: c.border, margin: "6px 0" }} />
                      <p className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5" style={{ fontFamily: FONT, color: c.muted }}>Filter by Visibility</p>
                      {([
                        ["All", null],
                        ["Private", Lock],
                        ["Shared", Users],
                      ] as const).map(([v, Ic]) => (
                        <button key={v} onClick={() => { setVisibilityFilter(v as typeof visibilityFilter); }}
                          className="w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between transition-colors"
                          style={{ fontFamily: FONT, color: visibilityFilter === v ? "#A614C3" : c.text, background: visibilityFilter === v ? "rgba(168,85,247,0.08)" : "transparent" }}>
                          <span className="flex items-center gap-2">{Ic && <Ic className="w-3 h-3" />}{v === "All" ? "All Visibility" : v}</span>
                          {visibilityFilter === v && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </button>
                      ))}
                      <div style={{ height: 1, background: c.border, margin: "4px 0" }} />
                      <button onClick={() => { setShowArchived(true); setShowTrashed(false); setNoteFilterOpen(false); setSelectedNote(null); setNoteExpanded(false); }}
                        className="w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between"
                        style={{ fontFamily: FONT, color: showArchived ? "#F59E0B" : c.text, background: showArchived ? "rgba(245,158,11,0.08)" : "transparent" }}>
                        <span className="flex items-center gap-1.5"><Archive className="w-3 h-3" />Archived</span>
                        {showArchived && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                      <button onClick={() => { setShowTrashed(true); setShowArchived(false); setNoteFilterOpen(false); setSelectedNote(null); setNoteExpanded(false); }}
                        className="w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between"
                        style={{ fontFamily: FONT, color: showTrashed ? "#EF4444" : c.text, background: showTrashed ? "rgba(239,68,68,0.08)" : "transparent" }}>
                        <span className="flex items-center gap-1.5"><Trash2 className="w-3 h-3" />Trash</span>
                        {showTrashed && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sort */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setNoteSortOpen(p => !p); setNoteFilterOpen(false); setNoteNewOpen(false); }}
                    className="p-1.5 rounded-md transition-all"
                    style={{ color: c.muted }}
                    title="Sort">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2V4zm2 3.5h8V9H4V7.5zm2 3.5h4v1.5H6V11z"/></svg>
                  </button>
                  {noteSortOpen && (
                    <div className="absolute right-0 top-8 z-30 w-40 rounded-xl shadow-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide px-3 pt-2 pb-1.5" style={{ fontFamily: FONT, color: c.muted }}>Sort by Date</p>
                      {([["desc","Newest first"],["asc","Oldest first"]] as const).map(([d, label]) => (
                        <button key={d} onClick={() => { setNoteSortDir(d); setNoteSortOpen(false); }}
                          className="w-full text-left px-3 py-2 text-[12px] flex items-center justify-between"
                          style={{ fontFamily: FONT, color: noteSortDir === d ? "#A614C3" : c.text, background: noteSortDir === d ? "rgba(168,85,247,0.08)" : "transparent" }}>
                          <span>{label}</span>{noteSortDir === d && <svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="flex items-center transition-all overflow-hidden" style={{ width: noteSearchOpen ? 160 : 28 }}>
                  <button onClick={e => { e.stopPropagation(); setNoteSearchOpen(p => !p); if (noteSearchOpen) setNoteSearch(""); }}
                    className="p-1.5 rounded-md flex-shrink-0" style={{ color: noteSearch ? "#A855F7" : c.muted }}>
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  {noteSearchOpen && (
                    <input autoFocus value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      placeholder="Search notes…"
                      className="outline-none text-[12px] flex-1 min-w-0"
                      style={{ fontFamily: FONT, color: c.text, background: "transparent", borderBottom: `1px solid ${c.border}` }} />
                  )}
                </div>

                {/* Select toggle */}
                <button onClick={e => { e.stopPropagation(); setIsSelectMode(p => { if (p) setSelectedNoteIds(new Set()); return !p; }); }}
                  className="p-1.5 rounded-md transition-all"
                  title="Select notes"
                  style={{ color: isSelectMode ? "#A855F7" : c.muted, background: isSelectMode ? "rgba(168,85,247,0.10)" : "transparent" }}>
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>

                {/* New button — hidden in archive/trash */}
                {!showArchived && !showTrashed && <div className="relative ml-1" onClick={e => e.stopPropagation()}>
                  {selectedNote ? (
                    /* Compact icon-only when detail panel is open */
                    <button onClick={() => setNoteAddOpen(true)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white transition-all"
                      style={{ background: btnGrad }} title="New note">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ background: btnGrad }}>
                    <button onClick={() => setNoteAddOpen(true)}
                      className="px-3 py-1.5 text-[12px] font-semibold text-white"
                      style={{ fontFamily: FONT }}>New</button>
                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
                    <button onClick={() => setNoteNewOpen(p => !p)}
                      className="px-2 py-1.5 text-white flex items-center">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  )}
                  {noteNewOpen && (
                    <div className="absolute right-0 top-9 z-30 w-44 rounded-xl shadow-xl py-1.5" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5" style={{ fontFamily: FONT, color: c.muted }}>Create new</p>
                      {NOTE_TYPES.map(t => (
                        <button key={t} onClick={() => { setNewNoteType(t); setNoteNewOpen(false); setNoteAddOpen(true); }}
                          className="w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors"
                          style={{ fontFamily: FONT, color: c.text }}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeColor[t]?.text }} />
                          {t} Note
                        </button>
                      ))}
                    </div>
                  )}
                </div>}
              </div>
            </div>

            {/* Thin divider */}
            <div className="flex-shrink-0 mb-3" style={{ height: 1, background: c.border }} />

            {/* ── Batch action bar ── */}
            {isSelectMode && selectedNoteIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2.5 rounded-xl flex-shrink-0"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${c.border}` }}>
                {/* Select-all checkbox */}
                {(() => {
                  const allSelected = visibleNotes.length > 0 && visibleNotes.every(n => selectedNoteIds.has(n.id));
                  const someSelected = !allSelected && selectedNoteIds.size > 0;
                  return (
                    <button onClick={() => {
                      if (allSelected) { setSelectedNoteIds(new Set()); }
                      else { setSelectedNoteIds(new Set(visibleNotes.map(n => n.id))); }
                    }} className="flex items-center gap-2 transition-all">
                      <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                        style={{ border: `1.5px solid ${allSelected ? "#A855F7" : (isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.13)")}`, background: allSelected ? "#A855F7" : (isDark ? "rgba(255,255,255,0.08)" : "#ffffff") }}>
                        {allSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        {someSelected && <div className="w-2 h-0.5 rounded-full" style={{ background: "#A855F7" }} />}
                      </div>
                      <span className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{selectedNoteIds.size} selected</span>
                    </button>
                  );
                })()}
                <div className="flex-1" />
                {/* Pin */}
                <button onClick={() => {
                  setPinnedNoteIds(prev => {
                    const s = new Set(prev);
                    const allPinned = [...selectedNoteIds].every(id => s.has(id));
                    selectedNoteIds.forEach(id => allPinned ? s.delete(id) : s.add(id));
                    return s;
                  });
                }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all"
                  style={{ fontFamily: FONT, color: c.text, background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "#F3F4F6")}
                  onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "#F3F4F6")}>
                  <Pin className="w-3 h-3" style={{ color: "#F59E0B" }} />Pin
                </button>
                {/* Archive */}
                <button onClick={() => {
                  setArchivedNoteIds(prev => { const s = new Set(prev); selectedNoteIds.forEach(id => s.add(id)); return s; });
                  setSelectedNoteIds(new Set()); setIsSelectMode(false);
                }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all"
                  style={{ fontFamily: FONT, color: c.text, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.40)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.18)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,158,11,0.10)")}>
                  <Archive className="w-3 h-3" style={{ color: "#F59E0B" }} />Archive
                </button>
                {/* Trash */}
                <button onClick={() => {
                  setTrashedNoteIds(prev => { const s = new Set(prev); selectedNoteIds.forEach(id => s.add(id)); return s; });
                  setSelectedNoteIds(new Set()); setIsSelectMode(false);
                }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all"
                  style={{ fontFamily: FONT, color: c.text, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.10)")}>
                  <Trash2 className="w-3 h-3" style={{ color: "#EF4444" }} />Trash
                </button>
                {/* Clear selection */}
                <button onClick={() => setSelectedNoteIds(new Set())}
                  className="p-1 rounded-md ml-1 transition-all" style={{ color: c.muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ── LIST VIEW ── */}
            {noteView === "list" && (
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
                {visibleNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <StickyNote className="w-8 h-8" style={{ color: c.muted, opacity: 0.4 }} />
                    <p className="text-[13px]" style={{ fontFamily: FONT, color: c.muted }}>No notes found</p>
                  </div>
                ) : visibleNotes.map(n => {
                  const isChecked = selectedNoteIds.has(n.id);
                  const isPinned = pinnedNoteIds.has(n.id);
                  return (
                  <div key={n.id} className="rounded-xl p-4 transition-all cursor-pointer"
                    style={{ background: isChecked ? (isDark ? "rgba(168,85,247,0.12)" : "rgba(92,46,212,0.07)") : selectedNote?.id === n.id ? (isDark ? "rgba(168,85,247,0.07)" : "rgba(92,46,212,0.04)") : c.cardBg, border: `1px solid ${isChecked ? (isDark ? "rgba(168,85,247,0.45)" : "rgba(92,46,212,0.35)") : selectedNote?.id === n.id ? (isDark ? "rgba(168,85,247,0.35)" : "rgba(92,46,212,0.30)") : c.border}` }}
                    onClick={e => { e.stopPropagation(); if (isSelectMode) { setSelectedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); } else { openNote(n); } }}
                    onMouseEnter={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.borderColor = isDark ? "rgba(168,85,247,0.25)" : "rgba(92,46,212,0.20)"; }}
                    onMouseLeave={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.borderColor = c.border; }}>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {isSelectMode && (
                          <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                            style={{ border: `1.5px solid ${isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.13)")}`, background: isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") }}>
                            {isChecked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        )}
                        {/* Pin button before title */}
                        <button onClick={e => { e.stopPropagation(); setPinnedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); }}
                          className="p-0.5 rounded flex-shrink-0 transition-all"
                          style={{ color: isPinned ? "#F59E0B" : c.muted, opacity: isPinned ? 1 : (isDark ? 0.6 : 0.3) }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#F59E0B"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isPinned ? "1" : (isDark ? "0.6" : "0.3"); (e.currentTarget as HTMLElement).style.color = isPinned ? "#F59E0B" : c.muted; }}>
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        {noteLocked && selectedNote?.id === n.id && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "#A855F7" }} />}
                        <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{n.title}</span>
                        <TypeBadge type={n.type} />
                      </div>
                      {!isSelectMode && (
                        <button onClick={e => { e.stopPropagation(); if (showTrashed) { setDeleteNoteId(n.id); } else { setTrashedNoteIds(prev => { const s = new Set(prev); s.add(n.id); return s; }); } }} className="p-1 rounded-md flex-shrink-0"
                          style={{ color: "#EF4444", opacity: 0.6 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed mb-2" style={{ fontFamily: FONT, color: isDark ? "rgba(255,255,255,0.72)" : c.muted }}>{n.content}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{ background: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.10)", color: "#A855F7" }}>{n.author.charAt(0)}</div>
                      <span className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{n.author} · {fmtDate(n.timestamp)}</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* ── BOARD VIEW ── */}
            {noteView === "board" && (
              <div className="flex gap-3 flex-1 pb-2 overflow-y-auto">
                {NOTE_TYPES.map(type => {
                  const col = visibleNotes.filter(n => n.type === type);
                  return (
                    <div key={type} className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: typeColor[type]?.text }} />
                        <span className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: typeColor[type]?.text }}>{type}</span>
                        <span className="text-[11px] ml-auto" style={{ fontFamily: FONT, color: c.muted }}>{col.length}</span>
                      </div>
                      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                        {col.map(n => {
                          const isChecked = selectedNoteIds.has(n.id);
                          const isPinned = pinnedNoteIds.has(n.id);
                          return (
                          <div key={n.id} className="rounded-xl transition-all cursor-pointer"
                            style={{ padding: selectedNote ? "8px 10px" : "14px", background: isChecked ? (isDark ? "rgba(168,85,247,0.12)" : "rgba(92,46,212,0.07)") : selectedNote?.id === n.id ? (isDark ? "rgba(168,85,247,0.07)" : "rgba(92,46,212,0.04)") : c.cardBg, border: `1px solid ${isChecked ? "rgba(168,85,247,0.45)" : selectedNote?.id === n.id ? typeColor[type]?.text + "66" : c.border}` }}
                            onClick={e => { e.stopPropagation(); if (isSelectMode) { setSelectedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); } else { openNote(n); } }}
                            onMouseEnter={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.borderColor = typeColor[type]?.text + "55"; }}
                            onMouseLeave={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.borderColor = c.border; }}>
                            <div className="flex items-start justify-between gap-1" style={{ marginBottom: selectedNote ? 0 : 4 }}>
                              <div className="flex items-center gap-1.5 min-w-0">
                                {isSelectMode && (
                                  <div className="w-3.5 h-3.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                                    style={{ border: `1.5px solid ${isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.13)")}`, background: isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") }}>
                                    {isChecked && <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M0.5 2.5L2.5 4.5L6.5 0.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                  </div>
                                )}
                                <button onClick={e => { e.stopPropagation(); setPinnedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); }}
                                  className="p-0.5 rounded flex-shrink-0 transition-all"
                                  style={{ color: isPinned ? "#F59E0B" : c.muted, opacity: isPinned ? 1 : (isDark ? 0.6 : 0.3) }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#F59E0B"; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isPinned ? "1" : (isDark ? "0.6" : "0.3"); (e.currentTarget as HTMLElement).style.color = isPinned ? "#F59E0B" : c.muted; }}>
                                  <Pin className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-[11px] font-semibold leading-snug truncate" style={{ fontFamily: FONT, color: c.text }}>{n.title}</span>
                              </div>
                              {!isSelectMode && (
                                <button onClick={e => { e.stopPropagation(); if (showTrashed) { setDeleteNoteId(n.id); } else { setTrashedNoteIds(prev => { const s = new Set(prev); s.add(n.id); return s; }); } }} className="p-0.5 rounded flex-shrink-0" style={{ color: c.muted, opacity: 0.5 }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; (e.currentTarget as HTMLElement).style.color = c.muted; }}>
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {/* Content preview + author — hidden in compact mode */}
                            {!selectedNote && <>
                              <p className="text-[11px] leading-relaxed mb-2.5 line-clamp-3" style={{ fontFamily: FONT, color: isDark ? "rgba(255,255,255,0.72)" : c.muted }}>{n.content}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                  style={{ background: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.10)", color: "#A855F7" }}>{n.author.charAt(0)}</div>
                                <span className="text-[10px]" style={{ fontFamily: FONT, color: c.muted }}>{fmtDate(n.timestamp).split(" ").slice(0,3).join(" ")}</span>
                              </div>
                            </>}
                          </div>
                          );
                        })}
                        {col.length === 0 && (
                          <div className="rounded-xl p-4 text-center" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#FAFAFA", border: `1px dashed ${c.border}` }}>
                            <p className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>No {type} notes</p>
                          </div>
                        )}
                        {!showArchived && !showTrashed && (
                          <button onClick={() => { setNewNoteType(type); setNoteAddOpen(true); }}
                            className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] transition-all w-full"
                            style={{ fontFamily: FONT, color: c.muted, border: `1px dashed ${c.border}` }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = typeColor[type]?.text + "66")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
                            <Plus className="w-3 h-3" />New {type}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TABLE VIEW ── */}
            {noteView === "table" && (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {isSelectMode && <th className="pb-2 w-8" />}
                      {(!!selectedNote && !noteExpanded ? ["Title","Created"] : ["Title","Created","Created By","Type"]).map(h => (
                        <th key={h} className="text-[11px] font-semibold pb-2 pr-6" style={{ fontFamily: FONT, color: c.muted }}>{h}</th>
                      ))}
                      <th className="text-[11px] font-semibold pb-2 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNotes.map((n, i) => {
                      const isChecked = selectedNoteIds.has(n.id);
                      const isPinned = pinnedNoteIds.has(n.id);
                      return (
                      <tr key={n.id} className="cursor-pointer"
                        style={{ borderBottom: `1px solid ${c.border}`, background: isChecked ? (isDark ? "rgba(168,85,247,0.10)" : "rgba(92,46,212,0.06)") : selectedNote?.id === n.id ? (isDark ? "rgba(168,85,247,0.07)" : "rgba(92,46,212,0.04)") : (i % 2 === 0 ? "transparent" : (isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)")) }}
                        onClick={e => { e.stopPropagation(); if (isSelectMode) { setSelectedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); } else { openNote(n); } }}
                        onMouseEnter={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB"; }}
                        onMouseLeave={e => { if (!isChecked && selectedNote?.id !== n.id) e.currentTarget.style.background = i % 2 === 0 ? "transparent" : (isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"); }}>
                        {isSelectMode && (
                          <td className="py-2.5 pr-2 w-8">
                            <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all"
                              style={{ border: `1.5px solid ${isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.13)")}`, background: isChecked ? "#A855F7" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") }}>
                              {isChecked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </td>
                        )}
                        <td className="py-2.5 pr-6">
                          <div className="flex items-center gap-1.5">
                            {/* Pin button before title */}
                            <button onClick={e => { e.stopPropagation(); setPinnedNoteIds(prev => { const s = new Set(prev); s.has(n.id) ? s.delete(n.id) : s.add(n.id); return s; }); }}
                              className="p-0.5 rounded flex-shrink-0 transition-all"
                              style={{ color: isPinned ? "#F59E0B" : c.muted, opacity: isPinned ? 1 : (isDark ? 0.6 : 0.3) }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#F59E0B"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isPinned ? "1" : (isDark ? "0.6" : "0.3"); (e.currentTarget as HTMLElement).style.color = isPinned ? "#F59E0B" : c.muted; }}>
                              <Pin className="w-3 h-3" />
                            </button>
                            <div>
                              <span className="text-[12px] font-medium" style={{ fontFamily: FONT, color: c.text }}>{n.title}</span>
                              <p className="text-[11px] truncate max-w-[200px]" style={{ fontFamily: FONT, color: isDark ? "rgba(255,255,255,0.72)" : c.muted }}>{n.content}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-6 text-[12px] whitespace-nowrap" style={{ fontFamily: FONT, color: c.muted }}>{fmtDate(n.timestamp)}</td>
                        {!(!!selectedNote && !noteExpanded) && <td className="py-2.5 pr-6 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                              style={{ background: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.10)", color: "#A855F7" }}>{n.author.charAt(0)}</div>
                            <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{n.author}</span>
                          </div>
                        </td>}
                        {!(!!selectedNote && !noteExpanded) && <td className="py-2.5 pr-6 whitespace-nowrap"><TypeBadge type={n.type} /></td>}
                        <td className="py-2.5">
                          {!isSelectMode && (
                            <button onClick={e => { e.stopPropagation(); if (showTrashed) { setDeleteNoteId(n.id); } else { setTrashedNoteIds(prev => { const s = new Set(prev); s.add(n.id); return s; }); } }} className="p-1 rounded" style={{ color: c.muted, opacity: 0.5 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; (e.currentTarget as HTMLElement).style.color = c.muted; }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                    {visibleNotes.length === 0 && (
                      <tr><td colSpan={isSelectMode ? 6 : 5} className="py-12 text-center text-[13px]" style={{ fontFamily: FONT, color: c.muted }}>No notes found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}


            {/* ── Add Note Modal ── */}
            {noteAddOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
                onClick={() => setNoteAddOpen(false)}>
                <div className="w-[480px] rounded-2xl shadow-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}`, fontFamily: FONT }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <h2 className="text-[15px] font-bold" style={{ fontFamily: FONT, color: c.text }}>New Note</h2>
                    <button onClick={() => setNoteAddOpen(false)} style={{ color: c.muted }}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ fontFamily: FONT, color: c.muted }}>Title</label>
                      <input value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Note title…"
                        className="outline-none w-full text-[13px]"
                        style={{ fontFamily: FONT, background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}`, color: c.text, padding: "9px 12px", borderRadius: 8 }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ fontFamily: FONT, color: c.muted }}>Type</label>
                      <div className="flex flex-wrap gap-2">
                        {NOTE_TYPES.map(t => (
                          <button key={t} onClick={() => setNewNoteType(t)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                            style={{ fontFamily: FONT, background: newNoteType === t ? typeColor[t]?.bg : "transparent", color: newNoteType === t ? typeColor[t]?.text : c.muted, border: `1px solid ${newNoteType === t ? typeColor[t]?.text + "44" : c.border}` }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ fontFamily: FONT, color: c.muted }}>Content</label>
                      <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Write your note here…" rows={4}
                        className="w-full outline-none resize-none text-[13px]"
                        style={{ fontFamily: FONT, background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}`, color: c.text, padding: "9px 12px", borderRadius: 8 }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
                    <button onClick={() => setNoteAddOpen(false)} className="px-4 py-[7px] rounded-lg text-[12px]"
                      style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: "transparent" }}>Cancel</button>
                    <button onClick={() => {
                      if (!selected) return;
                      const titleFinal = newNoteTitle.trim() || (newNote.trim() ? newNote.trim().slice(0, 40) + (newNote.trim().length > 40 ? "…" : "") : "Untitled Note");
                      if (!titleFinal) return;
                      setNotes(prev => [{ id: Date.now().toString(), title: titleFinal, content: newNote.trim(), author: "Sarah Johnson", timestamp: new Date().toISOString(), clientId: selected.id, type: newNoteType }, ...prev]);
                      setNewNoteTitle(""); setNewNote(""); setNoteAddOpen(false);
                    }} className="px-5 py-[7px] rounded-lg text-[12px] font-semibold text-white"
                      style={{ fontFamily: FONT, background: btnGrad }}>
                      Create Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: Note Detail (inline or fixed overlay) ── */}
          {selectedNote && !noteExpanded && (
            <div className="flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden transition-all"
              style={{ background: c.cardBg, border: `1px solid ${c.border}` }}
              onClick={e => { e.stopPropagation(); setNoteMoreOpen(false); }}>

              {/* ── Shared top-bar + body (reused in both inline & expanded) ── */}
              {(() => {
                const isLockedByOther = noteLocked && lockedBy !== CURRENT_USER;
                const NoteTopBar = ({ expanded }: { expanded: boolean }) => (
                  <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
                    style={{ borderBottom: `1px solid ${c.border}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(249,250,251,0.80)" }}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <StickyNote className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                      <span className="text-[11px] flex-shrink-0" style={{ fontFamily: FONT, color: c.muted }}>Notes</span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: c.muted }} />
                      <span className="text-[11px] font-medium truncate" style={{ fontFamily: FONT, color: c.text }}>{selectedNote.title}</span>
                      {noteLocked && <Lock className="w-3 h-3 flex-shrink-0 ml-0.5" style={{ color: "#A855F7" }} />}
                      {pinnedNoteIds.has(selectedNote.id) && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: "#F59E0B" }} />}
                      {showArchived && <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", fontFamily: FONT }}>Archived</span>}
                      {showTrashed && <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(239,68,68,0.10)", color: "#EF4444", fontFamily: FONT }}>Trash</span>}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {/* Pin */}
                      {!showTrashed && <button onClick={e => { e.stopPropagation(); setPinnedNoteIds(prev => { const s = new Set(prev); s.has(selectedNote.id) ? s.delete(selectedNote.id) : s.add(selectedNote.id); return s; }); }}
                        className="p-1.5 rounded-md transition-colors" title={pinnedNoteIds.has(selectedNote.id) ? "Unpin" : "Pin note"}
                        style={{ color: pinnedNoteIds.has(selectedNote.id) ? "#F59E0B" : c.muted, background: pinnedNoteIds.has(selectedNote.id) ? "rgba(245,158,11,0.10)" : "transparent" }}>
                        <Pin className="w-3.5 h-3.5" />
                      </button>}
                      {/* Lock */}
                      {!showTrashed && <button onClick={e => {
                        e.stopPropagation();
                        if (noteLocked && isLockedByOther) return;
                        setNoteLocked(p => !p);
                        if (!noteLocked) setLockedBy(CURRENT_USER);
                      }} className="p-1.5 rounded-md transition-colors" title={noteLocked ? "Unlock" : "Lock note"}
                        style={{ color: noteLocked ? "#A855F7" : c.muted, background: noteLocked ? "rgba(168,85,247,0.10)" : "transparent" }}>
                        {noteLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>}
                      {/* Expand toggle */}
                      <button onClick={e => { e.stopPropagation(); setNoteExpanded(p => !p); }}
                        className="p-1.5 rounded-md transition-colors" title={expanded ? "Collapse" : "Open full panel"}>
                        {expanded ? <Minimize2 className="w-3.5 h-3.5" style={{ color: "#A855F7" }} /> : <Maximize2 className="w-3.5 h-3.5" style={{ color: c.muted }} />}
                      </button>
                      {/* ··· More */}
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setNoteMoreOpen(p => !p); }}
                          className="p-1.5 rounded-md transition-colors" style={{ color: c.muted }}>
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {noteMoreOpen && (
                          <div className="absolute right-0 top-9 z-50 w-52 rounded-xl shadow-2xl py-1.5"
                            style={{ background: c.cardBg, border: `1px solid ${c.border}` }} onClick={e => e.stopPropagation()}>
                            {!showTrashed && <>
                              <button onClick={() => { navigator.clipboard.writeText(`${editingNoteTitle}\n\n${editingNoteContent}`); setCopyToast("Copied!"); setTimeout(() => setCopyToast(""), 2000); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: c.text }} onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <Copy className="w-3.5 h-3.5" style={{ color: c.muted }} />Copy content
                              </button>
                              <button onClick={() => { const txt = `# ${editingNoteTitle}\nType: ${editingNoteType} | Client: ${selected ? getClientName(selected) : "—"}\n\n${editingNoteContent}`; navigator.clipboard.writeText(txt); setCopyToast("Exported!"); setTimeout(() => setCopyToast(""), 2000); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: c.text }} onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <FileText className="w-3.5 h-3.5" style={{ color: c.muted }} />Export as text
                              </button>
                              <button onClick={() => { if (!selected) return; setNotes(prev => [{ ...selectedNote, id: Date.now().toString(), title: `Copy of ${editingNoteTitle}`, content: editingNoteContent, timestamp: new Date().toISOString() }, ...prev]); setCopyToast("Duplicated!"); setTimeout(() => setCopyToast(""), 2000); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: c.text }} onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <CopyPlus className="w-3.5 h-3.5" style={{ color: c.muted }} />Duplicate
                              </button>
                              <div style={{ height: 1, background: c.border, margin: "4px 0" }} />
                              <button onClick={() => { const id = selectedNote.id; setArchivedNoteIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: "#F59E0B" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <Archive className="w-3.5 h-3.5" />{archivedNoteIds.has(selectedNote.id) ? "Unarchive" : "Archive"}
                              </button>
                              <div style={{ height: 1, background: c.border, margin: "4px 0" }} />
                              <button onClick={() => { setTrashedNoteIds(prev => { const s = new Set(prev); s.add(selectedNote.id); return s; }); setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: "#EF4444" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <Trash2 className="w-3.5 h-3.5" />Move to Trash
                              </button>
                            </>}
                            {showTrashed && <>
                              <button onClick={() => { setTrashedNoteIds(prev => { const s = new Set(prev); s.delete(selectedNote.id); return s; }); setSelectedNote(null); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: "#10B981" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.08)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <RefreshCw className="w-3.5 h-3.5" />Restore note
                              </button>
                              <button onClick={() => { setDeleteNoteId(selectedNote.id); setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5"
                                style={{ fontFamily: FONT, color: "#EF4444" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <Trash2 className="w-3.5 h-3.5" />Delete permanently
                              </button>
                            </>}
                            <div className="px-3 pt-1.5 pb-1" style={{ borderTop: `1px solid ${c.border}`, marginTop: 4 }}>
                              <p className="text-[10px]" style={{ fontFamily: FONT, color: c.muted }}>Last edited {fmtDate(selectedNote.timestamp)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Save */}
                      {!noteLocked && !showTrashed && (
                        <button onClick={saveNote} className="ml-1 px-3 py-1 rounded-lg text-[11px] font-semibold text-white transition-all"
                          style={{ fontFamily: FONT, background: btnGrad }}
                          onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
                          onMouseLeave={e => (e.currentTarget.style.filter = "none")}>Save</button>
                      )}
                      <button onClick={() => { setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }}
                        className="p-1.5 rounded-md transition-colors" style={{ color: c.muted }}
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
                const NoteBody = ({ expanded }: { expanded: boolean }) => (
                  <div className="flex-1 overflow-y-auto py-6 relative" style={{ paddingLeft: expanded ? 72 : 28, paddingRight: expanded ? 72 : 28 }}>
                    {/* Toast */}
                    {copyToast && <div className="absolute top-3 right-4 z-50 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white shadow-lg" style={{ background: btnGrad, fontFamily: FONT }}>{copyToast}</div>}

                    {/* Lock banner (other user locked) */}
                    {noteLocked && isLockedByOther && (
                      <div className="mb-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.20)" }}>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" style={{ color: "#A855F7" }} />
                          <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>Locked by <strong>{lockedBy}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <input value={editingNoteTitle} onChange={e => setEditingNoteTitle(e.target.value)}
                      readOnly={noteLocked || showTrashed}
                      className="w-full outline-none font-bold bg-transparent mb-5"
                      style={{ fontFamily: FONT, color: c.text, fontSize: expanded ? 26 : 22, border: "none", cursor: (noteLocked || showTrashed) ? "default" : "text" }} />

                    {/* Properties */}
                    <div className="mb-6 rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                      {[
                        { icon: <Calendar className="w-3.5 h-3.5" />, label: "Created", value: <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{fmtDate(selectedNote.timestamp)}</span> },
                        { icon: <UserCircle className="w-3.5 h-3.5" />, label: "Created By", value: (<div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.10)", color: "#A855F7" }}>{selectedNote.author.charAt(0)}</div><span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{selectedNote.author}</span></div>) },
                        { icon: <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>, label: "Type", value: (<div className="flex flex-wrap gap-1.5">{NOTE_TYPES.map(t => (<button key={t} onClick={() => (!noteLocked && !showTrashed) && setEditingNoteType(t)} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all" style={{ fontFamily: FONT, background: editingNoteType === t ? typeColor[t]?.bg : "transparent", color: editingNoteType === t ? typeColor[t]?.text : c.muted, border: `1px solid ${editingNoteType === t ? typeColor[t]?.text + "44" : c.border}`, cursor: (noteLocked || showTrashed) ? "default" : "pointer" }}>{t}</button>))}</div>) },
                        { icon: <Lock className="w-3.5 h-3.5" />, label: "Visibility", value: (
                          <div className="flex flex-col gap-2 min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                              {([["Private",Lock,"Only you can see this note"],["Shared",Users,"Visible to everyone in your team"]] as const).map(([v,Ic,tip]) => (
                                <button key={v} title={tip} onClick={() => (!noteLocked&&!showTrashed)&&setEditingNoteVisibility(v)}
                                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5"
                                  style={{ fontFamily:FONT, background:editingNoteVisibility===v?"rgba(168,85,247,0.10)":"transparent", color:editingNoteVisibility===v?"#A855F7":c.muted, border:`1px solid ${editingNoteVisibility===v?"rgba(168,85,247,0.35)":c.border}`, cursor:(noteLocked||showTrashed)?"default":"pointer" }}>
                                  <Ic className="w-3 h-3" />{v}
                                </button>
                              ))}
                            </div>
                            <div className="text-[11px] flex items-center gap-1.5 flex-wrap" style={{ fontFamily:FONT, color: c.muted }}>
                              {editingNoteVisibility === "Private" && <span>Only you can see this note</span>}
                              {editingNoteVisibility === "Shared" && <span>Visible to everyone in the team</span>}
                            </div>
                          </div>
                        ) },
                        { icon: <Users className="w-3.5 h-3.5" />, label: "Client", value: <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{selected ? getClientName(selected) : "—"}</span> },
                      ].map(({ icon, label, value }, idx, arr) => (
                        <div key={label} className="flex items-center px-4 py-2.5" style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${c.border}` : undefined }}>
                          <div className="flex items-center gap-2 flex-shrink-0" style={{ width: 130, color: c.muted }}>{icon}<span className="text-[12px]" style={{ fontFamily: FONT }}>{label}</span></div>
                          {value}
                        </div>
                      ))}
                    </div>

                    <div className="mb-4" style={{ height: 1, background: c.border }} />
                    <textarea value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)}
                      readOnly={noteLocked || showTrashed}
                      placeholder={(noteLocked || showTrashed) ? "" : "Start writing your note here…"}
                      className="w-full outline-none resize-none leading-relaxed bg-transparent"
                      rows={expanded ? 22 : 12}
                      style={{ fontFamily: FONT, fontSize: 13, color: c.text, border: "none", cursor: (noteLocked || showTrashed) ? "default" : "text" }} />
                  </div>
                );
                const NoteFooter = () => (
                  <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{editingNoteContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                      {noteLocked && <span className="text-[11px] flex items-center gap-1.5" style={{ fontFamily: FONT, color: "#A855F7" }}><Lock className="w-3 h-3" />{lockedBy === CURRENT_USER ? "Locked by you · Read-only for others" : `Locked by ${lockedBy} · Read-only`}</span>}
                      {pinnedNoteIds.has(selectedNote.id) && <span className="text-[11px] flex items-center gap-1" style={{ fontFamily: FONT, color: "#F59E0B" }}><Pin className="w-3 h-3" />Pinned</span>}
                    </div>
                    <span className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>{fmtDate(selectedNote.timestamp)}</span>
                  </div>
                );
                return (<><NoteTopBar expanded={false} /><NoteBody expanded={false} /><NoteFooter /></>);
              })()}
            </div>
          )}

          {/* ── EXPANDED: fixed full-height side panel ── */}
          {selectedNote && noteExpanded && (
            <div className="fixed inset-y-0 right-0 z-50 flex" style={{ width: "58vw" }}
              onClick={e => { e.stopPropagation(); setNoteMoreOpen(false); }}>
              {/* Backdrop strip */}
              <div className="flex-1 cursor-pointer" onClick={() => setNoteExpanded(false)}
                style={{ background: "rgba(0,0,0,0.25)" }} />
              {/* Panel */}
              <div className="flex flex-col h-full shadow-2xl" style={{ width: "100%", background: c.cardBg, borderLeft: `1px solid ${c.border}` }}>
                {(() => {
                  const isLockedByOther = noteLocked && lockedBy !== CURRENT_USER;
                  const NOTE_TYPES: Note["type"][] = ["General","Policy","Follow-up","Meeting","Task"];
                  const typeColor: Record<string, { bg: string; text: string }> = {
                    "General":   { bg: isDark ? "rgba(156,163,175,0.15)" : "#F3F4F6",                text: isDark ? "#9CA3AF" : "#6B7280" },
                    "Policy":    { bg: isDark ? "rgba(166,20,195,0.18)"  : "rgba(166,20,195,0.10)",  text: isDark ? "#C87BE0" : "#A614C3" },
                    "Follow-up": { bg: isDark ? "rgba(255,164,124,0.18)" : "rgba(255,164,124,0.20)", text: isDark ? "#FFA47C" : "#D96B3E" },
                    "Meeting":   { bg: isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.20)", text: "#73C9B7" },
                    "Task":      { bg: isDark ? "rgba(239,68,68,0.15)"   : "rgba(239,68,68,0.10)",   text: "#EF4444" },
                  };
                  const fmtDate2 = (ts: string) => { const d = new Date(ts); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}); };
                  return (<>
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(249,250,251,0.8)" }}>
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-3.5 h-3.5" style={{ color: c.muted }} />
                        <span className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>Notes</span>
                        <ChevronRight className="w-3 h-3" style={{ color: c.muted }} />
                        <span className="text-[12px] font-semibold truncate max-w-[280px]" style={{ fontFamily: FONT, color: c.text }}>{selectedNote.title}</span>
                        {noteLocked && <Lock className="w-3 h-3" style={{ color: "#A855F7" }} />}
                        {pinnedNoteIds.has(selectedNote.id) && <Pin className="w-3 h-3" style={{ color: "#F59E0B" }} />}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); setPinnedNoteIds(prev => { const s = new Set(prev); s.has(selectedNote.id) ? s.delete(selectedNote.id) : s.add(selectedNote.id); return s; }); }} className="p-1.5 rounded-md" style={{ color: pinnedNoteIds.has(selectedNote.id) ? "#F59E0B" : c.muted }}><Pin className="w-3.5 h-3.5" /></button>
                        <button onClick={e => { e.stopPropagation(); if (!(noteLocked && isLockedByOther)) { setNoteLocked(p => !p); if (!noteLocked) setLockedBy(CURRENT_USER); } }} className="p-1.5 rounded-md" style={{ color: noteLocked ? "#A855F7" : c.muted }}>{noteLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                        <button onClick={() => setNoteExpanded(false)} className="p-1.5 rounded-md" style={{ color: "#A855F7" }} title="Collapse"><Minimize2 className="w-3.5 h-3.5" /></button>
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setNoteMoreOpen(p => !p)} className="p-1.5 rounded-md" style={{ color: c.muted }}><MoreVertical className="w-3.5 h-3.5" /></button>
                          {noteMoreOpen && (
                            <div className="absolute right-0 top-9 z-50 w-52 rounded-xl shadow-2xl py-1.5" style={{ background: c.cardBg, border: `1px solid ${c.border}` }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => { navigator.clipboard.writeText(`${editingNoteTitle}\n\n${editingNoteContent}`); setCopyToast("Copied!"); setTimeout(() => setCopyToast(""),2000); setNoteMoreOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5" style={{ fontFamily: FONT, color: c.text }} onMouseEnter={e => (e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background="transparent")}><Copy className="w-3.5 h-3.5" style={{ color: c.muted }}/>Copy content</button>
                              <button onClick={() => { if(!selected)return; setNotes(prev=>[{...selectedNote,id:Date.now().toString(),title:`Copy of ${editingNoteTitle}`,content:editingNoteContent,timestamp:new Date().toISOString()},...prev]); setCopyToast("Duplicated!"); setTimeout(()=>setCopyToast(""),2000); setNoteMoreOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5" style={{ fontFamily: FONT, color: c.text }} onMouseEnter={e => (e.currentTarget.style.background=c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background="transparent")}><CopyPlus className="w-3.5 h-3.5" style={{ color: c.muted }}/>Duplicate</button>
                              <div style={{ height:1, background:c.border, margin:"4px 0" }} />
                              <button onClick={() => { setArchivedNoteIds(prev=>{const s=new Set(prev);s.has(selectedNote.id)?s.delete(selectedNote.id):s.add(selectedNote.id);return s;}); setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5" style={{ fontFamily: FONT, color: "#F59E0B" }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(245,158,11,0.08)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><Archive className="w-3.5 h-3.5"/>Archive</button>
                              <button onClick={() => { setTrashedNoteIds(prev=>{const s=new Set(prev);s.add(selectedNote.id);return s;}); setSelectedNote(null); setNoteExpanded(false); setNoteMoreOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2.5" style={{ fontFamily: FONT, color: "#EF4444" }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(239,68,68,0.08)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><Trash2 className="w-3.5 h-3.5"/>Move to Trash</button>
                            </div>
                          )}
                        </div>
                        {!noteLocked && <button onClick={saveNote} className="ml-1 px-3 py-1 rounded-lg text-[11px] font-semibold text-white" style={{ fontFamily: FONT, background: btnGrad }}>Save</button>}
                        <button onClick={() => { setSelectedNote(null); setNoteExpanded(false); }} className="p-1.5 rounded-md" style={{ color: c.muted }}><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-16 py-8 relative">
                      {copyToast && <div className="absolute top-4 right-6 z-50 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white shadow-lg" style={{ background: btnGrad, fontFamily: FONT }}>{copyToast}</div>}
                      {noteLocked && isLockedByOther && (
                        <div className="mb-5 flex items-center justify-between px-4 py-3 rounded-xl" style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.20)" }}>
                          <div className="flex items-center gap-2"><Lock className="w-4 h-4" style={{ color:"#A855F7" }}/><span className="text-[12px]" style={{ fontFamily:FONT, color:c.text }}>Locked by <strong>{lockedBy}</strong></span></div>
                        </div>
                      )}
                      <input value={editingNoteTitle} onChange={e => setEditingNoteTitle(e.target.value)} readOnly={noteLocked}
                        className="w-full outline-none font-bold bg-transparent mb-6"
                        style={{ fontFamily:FONT, color:c.text, fontSize:28, border:"none", cursor:noteLocked?"default":"text" }} />
                      <div className="mb-6 rounded-xl overflow-hidden" style={{ border:`1px solid ${c.border}` }}>
                        {[
                          {icon:<Calendar className="w-3.5 h-3.5"/>, label:"Created", value:<span className="text-[12px]" style={{fontFamily:FONT,color:c.text}}>{fmtDate2(selectedNote.timestamp)}</span>},
                          {icon:<UserCircle className="w-3.5 h-3.5"/>, label:"Created By", value:(<div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={avatarStyle}><span style={avatarTextStyle}>{initials(selectedNote.author)}</span></div><span className="text-[12px]" style={{fontFamily:FONT,color:c.text}}>{selectedNote.author}</span></div>)},
                          {icon:<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>, label:"Type", value:(<div className="flex flex-wrap gap-1.5">{NOTE_TYPES.map(t=>(<button key={t} onClick={()=>!noteLocked&&setEditingNoteType(t)} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium" style={{fontFamily:FONT,background:editingNoteType===t?typeColor[t]?.bg:"transparent",color:editingNoteType===t?typeColor[t]?.text:c.muted,border:`1px solid ${editingNoteType===t?typeColor[t]?.text+"44":c.border}`}}>{t}</button>))}</div>)},
                          {icon:<Lock className="w-3.5 h-3.5"/>, label:"Visibility", value:(
                            <div className="flex flex-col gap-2 min-w-0">
                              <div className="flex flex-wrap gap-1.5">
                                {([["Private",Lock,"Only you can see this note"],["Shared",Users,"Visible to everyone in your team"]] as const).map(([v,Ic,tip]) => (
                                  <button key={v} title={tip} onClick={() => !noteLocked && setEditingNoteVisibility(v)}
                                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5"
                                    style={{ fontFamily:FONT, background:editingNoteVisibility===v?"rgba(168,85,247,0.10)":"transparent", color:editingNoteVisibility===v?"#A855F7":c.muted, border:`1px solid ${editingNoteVisibility===v?"rgba(168,85,247,0.35)":c.border}`, cursor:noteLocked?"default":"pointer" }}>
                                    <Ic className="w-3 h-3" />{v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )},
                          {icon:<Users className="w-3.5 h-3.5"/>, label:"Client", value:<span className="text-[12px]" style={{fontFamily:FONT,color:c.text}}>{selected?getClientName(selected):"—"}</span>},
                        ].map(({icon,label,value},idx,arr)=>(
                          <div key={label} className="flex items-center px-4 py-2.5" style={{borderBottom:idx<arr.length-1?`1px solid ${c.border}`:undefined}}>
                            <div className="flex items-center gap-2 flex-shrink-0" style={{width:140,color:c.muted}}>{icon}<span className="text-[12px]" style={{fontFamily:FONT}}>{label}</span></div>
                            {value}
                          </div>
                        ))}
                      </div>
                      <div className="mb-5" style={{ height:1, background:c.border }} />
                      <textarea value={editingNoteContent} onChange={e=>setEditingNoteContent(e.target.value)} readOnly={noteLocked}
                        placeholder={noteLocked?"":"Write something…"}
                        className="w-full outline-none resize-none leading-relaxed bg-transparent"
                        rows={22} style={{ fontFamily:FONT, fontSize:14, color:c.text, border:"none", cursor:noteLocked?"default":"text", lineHeight:1.8 }} />
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderTop:`1px solid ${c.border}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px]" style={{ fontFamily:FONT, color:c.muted }}>{editingNoteContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                        {noteLocked && <span className="text-[11px] flex items-center gap-1.5" style={{ fontFamily:FONT, color:"#A855F7" }}><Lock className="w-3 h-3"/>{lockedBy === CURRENT_USER ? "Locked by you · Read-only for others" : `Locked by ${lockedBy} · Read-only`}</span>}
                        {pinnedNoteIds.has(selectedNote.id) && <span className="text-[11px] flex items-center gap-1" style={{ fontFamily:FONT, color:"#F59E0B" }}><Pin className="w-3 h-3" />Pinned</span>}
                      </div>
                      <span className="text-[11px]" style={{ fontFamily:FONT, color:c.muted }}>{fmtDate2(selectedNote.timestamp)}</span>
                    </div>
                  </>);
                })()}
              </div>
            </div>
          )}

          </div>
        );
      })()}

      {/* ── EDIT PRIMARY CONTACT MODAL ── */}
      {contactCardEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setContactCardEditing(false)}>
          <div className="rounded-2xl w-[440px] max-w-[95vw] overflow-hidden"
            style={{ background: c.cardBg, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${c.border}` }}>
              <h3 className="text-[16px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Edit Primary Contact</h3>
              <button onClick={() => setContactCardEditing(false)} className="p-1 rounded-md transition-colors" style={{ color: c.muted }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ fontFamily: FONT, color: c.text }}>Contact Name</label>
                <input value={contactDraftName} onChange={e => setContactDraftName(e.target.value)} placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: FONT, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${c.border}`, color: c.text }}
                  onFocus={e => e.currentTarget.style.borderColor = "#A855F7"}
                  onBlur={e => e.currentTarget.style.borderColor = c.border} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ fontFamily: FONT, color: c.text }}>Phone</label>
                <input value={contactDraftPhone} onChange={e => setContactDraftPhone(e.target.value)} placeholder="(000) 000-0000"
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: FONT, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${c.border}`, color: c.text }}
                  onFocus={e => e.currentTarget.style.borderColor = "#A855F7"}
                  onBlur={e => e.currentTarget.style.borderColor = c.border} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ fontFamily: FONT, color: c.text }}>Email</label>
                <input value={contactDraftEmail} onChange={e => setContactDraftEmail(e.target.value)} placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: FONT, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${c.border}`, color: c.text }}
                  onFocus={e => e.currentTarget.style.borderColor = "#A855F7"}
                  onBlur={e => e.currentTarget.style.borderColor = c.border} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
              <button onClick={() => setContactCardEditing(false)}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-normal transition-colors"
                style={{ fontFamily: FONT, border: `1px solid #E5E7EB`, color: c.text, background: "#FFFFFF" }}>
                Cancel
              </button>
              <button onClick={() => setContactCardEditing(false)}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-semibold text-white transition-all"
                style={{ fontFamily: FONT, background: btnGrad }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT WARNING (Client Information / Address) ── */}
      {editWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => { setEditWarningOpen(false); setPendingEditAction(null); }}>
          <div className="rounded-2xl w-[460px] max-w-[95vw] overflow-hidden"
            style={{ background: c.cardBg, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-5 px-7 pt-7 pb-5">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)" }}>
                <AlertTriangle className="w-[22px] h-[22px]" style={{ color: "#F59E0B" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold mb-1" style={{ fontFamily: FONT, color: c.text }}>Heads up before editing</h3>
                <p className="text-[12px] leading-[1.55]" style={{ fontFamily: FONT, color: c.muted }}>
                  Any changes made here <strong style={{ color: c.text }}>will not</strong> be applied to the policy via an endorsement. To update an active policy, please request an endorsement instead.
                </p>
              </div>
              <button onClick={() => { setEditWarningOpen(false); setPendingEditAction(null); }} className="p-1 rounded-md transition-colors flex-shrink-0 -mt-1" style={{ color: c.muted }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
              <button onClick={() => { pendingEditAction?.(); setEditWarningOpen(false); setPendingEditAction(null); }}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-normal transition-colors"
                style={{ fontFamily: FONT, border: `1px solid #E5E7EB`, color: c.text, background: "#FFFFFF" }}>
                Continue Editing
              </button>
              <button onClick={() => { setEditWarningOpen(false); setPendingEditAction(null); /* TODO: navigate to endorsement flow */ }}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-semibold text-white transition-all"
                style={{ fontFamily: FONT, background: btnGrad }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                Request Endorsement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE NOTE CONFIRM ── */}
      {deleteNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.4)" }}
          onClick={() => setDeleteNoteId(null)}>
          <div className="rounded-2xl p-6 w-[400px] shadow-2xl" style={{ background:c.cardBg }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:"rgba(239,68,68,0.10)" }}>
                <AlertTriangle className="w-6 h-6" style={{ color:"#EF4444" }} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold mb-1" style={{ fontFamily:FONT, color:c.text }}>Delete Note</h3>
                <p className="text-[13px] leading-relaxed" style={{ fontFamily:FONT, color:c.muted }}>Are you sure you want to delete this note? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteNoteId(null)}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-normal transition-colors"
                style={{ fontFamily:FONT, border:`1px solid #E5E7EB`, color: c.text, background:"#FFFFFF" }}>
                Cancel
              </button>
              <button onClick={() => { setNotes(prev => prev.filter(n => n.id !== deleteNoteId)); setDeleteNoteId(null); }}
                className="px-[17px] py-[9px] rounded-lg text-[12px] font-semibold text-white"
                style={{ fontFamily:FONT, background:"#EF4444" }}>
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isDark={isDark} />

      {/* ── Phone Call Modal ── */}
      {callModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setCallModalOpen(false)}>
          <div className="w-[420px] rounded-2xl shadow-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}`, fontFamily: FONT }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 rounded-t-2xl" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(243,244,246,0.30)", borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(92,46,212,0.15) 0%,rgba(166,20,195,0.15) 100%)" }}>
                  <Phone className="w-5 h-5" style={{ color: "#A855F7" }} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Call {getClientName(selected)}</h2>
                  <p className="text-[11px] mt-0.5" style={{ fontFamily: FONT, color: c.muted }}>Outbound call from your agency line</p>
                </div>
              </div>
              <button onClick={() => setCallModalOpen(false)} className="p-1 rounded-lg" style={{ color: c.muted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* From → To call route */}
              <div className="rounded-xl p-4 space-y-3" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                {/* Agency number (from) */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,rgba(92,46,212,0.15) 0%,rgba(166,20,195,0.15) 100%)" }}>
                    <Phone className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ fontFamily: FONT, color: c.muted }}>From (Your Agency Line)</p>
                    <p className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{AGENCY_PHONE}</p>
                  </div>
                </div>

                {/* Divider arrow */}
                <div className="flex items-center gap-2 pl-4">
                  <div className="w-px h-4 ml-3.5" style={{ background: c.border }} />
                </div>

                {/* Client number (to) */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-white"
                    style={{ background: c.accentGrad }}>
                    {getClientName(selected).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ fontFamily: FONT, color: c.muted }}>To (Client)</p>
                    <p className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{selected.phone || "No number on file"}</p>
                    <p className="text-[11px] mt-0.5" style={{ fontFamily: FONT, color: c.muted }}>{getClientName(selected)}</p>
                  </div>
                </div>
              </div>

              {/* Desktop note */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg" style={{ background: isDark ? "rgba(168,85,247,0.06)" : "rgba(92,46,212,0.04)", border: `1px solid ${isDark ? "rgba(168,85,247,0.15)" : "rgba(92,46,212,0.10)"}` }}>
                <Bell className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#A855F7" }} />
                <p className="text-[11px] leading-relaxed" style={{ fontFamily: FONT, color: c.muted }}>
                  Clicking <span style={{ color: c.text, fontWeight: 600 }}>Call Now</span> will open your default phone dialer. On desktop this may launch software like FaceTime, Skype, or your VoIP app.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
              <button onClick={() => setCallModalOpen(false)}
                className="px-5 py-[9px] rounded-lg text-[12px] font-normal"
                style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: "transparent" }}>
                Cancel
              </button>
              <a href={`tel:${selected.phone?.replace(/\D/g, "")}`}
                onClick={() => {
                  setActivityLogs(prev => [{
                    id: String(Date.now()), action: "Phone Call", clientId: selected.id,
                    description: `Called ${getClientName(selected)} at ${selected.phone} from ${AGENCY_PHONE}`,
                    timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                    user: selected.assignedAgent, type: "call" as const,
                  }, ...prev]);
                  setCallModalOpen(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-[9px] rounded-lg text-[12px] font-semibold text-white no-underline"
                style={{ fontFamily: FONT, background: c.accentGrad }}>
                <Phone className="w-3.5 h-3.5" />Call Now
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ── Create Quote / Cross-Sell Modal ── */}
      {createQuoteOpen && selected && (() => {
        const existingLobs = new Set(mockQuotes.filter(q => q.clientId === selected.id).map(q => q.lob).concat(mockPolicies.filter(p => p.clientId === selected.id).map(p => p.lob)));
        const img = (name: string) => {
          const dark = isDark ? ` Dark` : ``;
          const darkPath = `/insurance-icons/${name}${dark}.png`;
          const lightPath = `/insurance-icons/${name}.png`;
          return <img src={isDark ? darkPath : lightPath} onError={(e) => { (e.target as HTMLImageElement).src = lightPath; }} alt={name} className="w-10 h-10 object-contain" />;
        };
        const allProducts = [
          { id:"gl",  name:"General Liability",       desc:"Third-party bodily injury & property damage claims",          price:"$450",  tag:"BEST VALUE",  tagColor:"#74C3B7", imgKey:"General Liability",      features:["Legal defense costs included","Premises & operations coverage","Products & completed ops"] },
          { id:"wc",  name:"Worker's Comp",            desc:"Required coverage for work-related employee injuries",         price:"$1,450",tag:"TOP PICK",    tagColor:"#9333EA", imgKey:"Workers Comp",            features:["Medical expense coverage","Lost wage replacement","Employer liability protection"] },
          { id:"bo",  name:"Business Owners",          desc:"GL, property & business interruption in one package",          price:"$2,230",tag:"RECOMMENDED", tagColor:"#74C3B7", imgKey:"Business Owners",         features:["General liability included","Commercial property","Business interruption"] },
          { id:"pro", name:"Professional Liability",   desc:"E&O coverage for professional services & advice",              price:"$890",  tag:"",            tagColor:"",        imgKey:"Professional Liability",  features:["Errors & omissions","Defense costs covered","Claims-made policy"] },
          { id:"ex",  name:"Excess",                   desc:"Additional liability limits on top of existing policies",      price:"$380",  tag:"",            tagColor:"",        imgKey:"Excess",                  features:["Extends underlying limits","Broad coverage scope","Cost-effective protection"] },
          { id:"bd",  name:"Bonds",                    desc:"Surety bonds for contractors and businesses",                  price:"$300",  tag:"",            tagColor:"",        imgKey:"Bonds",                   features:["Contract & commercial bonds","License & permit bonds","Court & judicial bonds"] },
          { id:"ca",  name:"Commercial Auto",          desc:"Coverage for vehicles used for business purposes",             price:"$1,200",tag:"",            tagColor:"",        imgKey:"Commercial Auto",         features:["Collision & comprehensive","Uninsured motorist","Medical payments coverage"] },
          { id:"br",  name:"Builders Risk",            desc:"Protects buildings under construction from damage",            price:"$600",  tag:"",            tagColor:"",        imgKey:"Builders Risk",           features:["Structure & materials","Equipment breakdown","Soft costs coverage"] },
          { id:"can", name:"Cannabis",                 desc:"Specialized coverage for cannabis businesses",                 price:"$2,500",tag:"",            tagColor:"",        imgKey:"Cannabis",                features:["Product liability","Crop & inventory","Premises coverage"] },
          { id:"cy",  name:"Cyber",                    desc:"Protection against data breaches and cyber attacks",           price:"$650",  tag:"",            tagColor:"",        imgKey:"Cyber",                   features:["Data breach response","Ransomware coverage","Business interruption"] },
          { id:"hbb", name:"Home Based Business",      desc:"Coverage for businesses operated from home",                   price:"$350",  tag:"",            tagColor:"",        imgKey:"Home Based Business",     features:["Business property","Liability coverage","Business income"] },
          { id:"im",  name:"Inland Marine",            desc:"Coverage for goods & equipment in transit",                    price:"$450",  tag:"",            tagColor:"",        imgKey:"Inland Marine",           features:["Equipment floater","Installation floater","Fine arts coverage"] },
          { id:"lr",  name:"Lessor's Risk",            desc:"Property & liability for commercial landlords",                price:"$800",  tag:"",            tagColor:"",        imgKey:"Lessor's Risk",           features:["Building coverage","Liability protection","Loss of rents"] },
          { id:"np",  name:"Non-Profit",               desc:"Tailored coverage for non-profit organizations",               price:"$500",  tag:"",            tagColor:"",        imgKey:"Non-Profit",              features:["D&O liability","General liability","Professional liability"] },
          { id:"pl",  name:"Pollution Liability",      desc:"Coverage for pollution-related claims & cleanup",              price:"$1,100",tag:"",            tagColor:"",        imgKey:"Pollution",               features:["Cleanup costs","Third-party claims","Legal defense"] },
          { id:"se",  name:"Special Events",           desc:"One-time coverage for events & gatherings",                    price:"$250",  tag:"",            tagColor:"",        imgKey:"Special Events",          features:["Event cancellation","Liability coverage","Liquor liability"] },
          { id:"tg",  name:"Truckers GL",              desc:"General liability for trucking operations",                    price:"$1,800",tag:"",            tagColor:"",        imgKey:"Truckers GL",             features:["Primary liability","Physical damage","Cargo coverage"] },
          { id:"vr",  name:"Vacant Risks",             desc:"Coverage for unoccupied or vacant properties",                 price:"$700",  tag:"",            tagColor:"",        imgKey:"Vacant Risks",            features:["Vandalism protection","Fire & lightning","Liability coverage"] },
          { id:"mc",  name:"Boats/Marine Contractors GL", desc:"GL for marine contractors & watercraft operations",         price:"$950",  tag:"",            tagColor:"",        imgKey:"Marine Contractors",      features:["Marine liability","Watercraft coverage","Pollution liability"] },
        ];
        const recommended = allProducts.filter(p => !existingLobs.has(p.name)).slice(0, 3);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setCreateQuoteOpen(false)}>
            <div className="w-[920px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ background: c.cardBg, fontFamily: FONT }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="relative px-8 py-5 overflow-hidden" style={{ borderBottom: `1px solid ${c.border}`, background: c.cardBg }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-bold leading-tight" style={{ color: c.text }}>We Already Have {getClientName(selected)}'s Info—Get Quotes Faster!</h2>
                    <p className="text-[12px] mt-1" style={{ color: c.muted }}>Business info is already saved. Select a coverage type to start a quote in minutes.</p>
                  </div>
                  <button onClick={() => setCreateQuoteOpen(false)} className="p-1.5 rounded-lg transition-colors flex-shrink-0 mt-1" style={{ color: c.muted }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 px-8 py-6">
                {/* Recommended */}
                {recommended.length > 0 && (
                  <div className="mb-7">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "linear-gradient(90deg,rgba(92,46,212,0.55) 0%,rgba(166,20,195,0.55) 65%)" }}>
                        <img src={norbieface.src} alt="Norbie" className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span style={{ color: "#fff" }}>Norbie's Pick</span>
                      </span>
                      <span className="text-[13px] font-bold" style={{ color: c.text }}>Recommended for {getClientName(selected)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {recommended.map(p => (
                        <div key={p.id} className="rounded-2xl p-5 relative flex flex-col transition-all cursor-pointer"
                          style={{ background: isDark ? "linear-gradient(#1A1E38,#1A1E38) padding-box, linear-gradient(90deg,#272B44,#272B44) border-box" : "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#E5E7EB,#E5E7EB) border-box", border: "1.1px solid transparent", boxShadow: "0 0 14.9px 0 rgba(110,33,196,0.15)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = isDark ? "linear-gradient(#1A1E38,#1A1E38) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box" : "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box"; e.currentTarget.style.boxShadow = "0 0 22px 0 rgba(110,33,196,0.30)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isDark ? "linear-gradient(#1A1E38,#1A1E38) padding-box, linear-gradient(90deg,#272B44,#272B44) border-box" : "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#E5E7EB,#E5E7EB) border-box"; e.currentTarget.style.boxShadow = "0 0 14.9px 0 rgba(110,33,196,0.15)"; }}>
                          {p.tag && (
                            <span className="absolute top-3 right-3 text-[9px] font-bold px-2.5 py-1 rounded-lg text-white"
                              style={{ background: p.tag === "BEST VALUE" ? "#74C3B7" : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }}>{p.tag}</span>
                          )}
                          <div className="p-3 rounded-xl mb-3 w-fit" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#fff", boxShadow: isDark ? "0 0 0 1.5px rgba(92,46,212,0.5)" : "0 1px 4px rgba(0,0,0,0.08)", transform: "scale(0.9)", transformOrigin: "center" }}>{img(p.imgKey)}</div>
                          <div className="text-[14px] font-bold mb-0.5" style={{ color: c.text }}>{p.name}</div>
                          <div className="text-[11px] mb-3" style={{ color: c.muted }}>{p.desc}</div>
                          <div className="text-[22px] font-bold mb-0.5" style={{ background: "linear-gradient(135deg,#9333EA,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{p.price}</div>
                          <div className="text-[10px] mb-3" style={{ color: c.muted }}>per year (estimated)</div>
                          <div style={{ borderTop: `1px solid ${c.border}`, marginBottom: 10 }} />
                          <div className="flex flex-col gap-1.5 mb-4 flex-1">
                            {p.features.map((f, fi) => (
                              <div key={fi} className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(116,195,183,0.15)" }}>
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#74C3B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <span className="text-[11px]" style={{ color: c.muted }}>{f}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] mb-3" style={{ color: c.muted }}>
                            <Calendar className="w-3 h-3" /><span>Takes only 5 minutes</span>
                          </div>
                          <button className="w-full py-2.5 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                            style={{ background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                            Get Quote Now →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Products */}
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[13px] font-bold" style={{ color: c.text }}>All Available Coverages</span>
                    <span className="text-[11px]" style={{ color: c.muted }}>
                      Coverages not listed here aren't suited for this client.&nbsp;
                      <span className="font-semibold cursor-pointer" style={{ color: c.teal }}>Visit Marketplace →</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {allProducts.filter(p => !recommended.includes(p) && !existingLobs.has(p.name)).map(p => {
                      return (
                        <button key={p.id}
                          className="rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all"
                          style={{ background: c.cardBg, border: `1px solid ${c.border}`, cursor: "pointer" }}
                          onMouseEnter={e => {
                            if (isDark) {
                              e.currentTarget.style.background = "radial-gradient(ellipse 165% 165% at 50% 5%, #282550 0%, #22204A 20%, #191735 48%, rgba(15,10,40,0.40) 68%, rgba(0,0,0,0.12) 84%, rgba(0,0,0,0) 100%) padding-box, linear-gradient(90deg, rgba(92,46,212,0.92) 0%, rgba(130,20,195,0.80) 50%, rgba(166,20,195,0.70) 100%) padding-box, linear-gradient(90deg, #5C2ED4 0%, #A614C3 65%) border-box";
                              e.currentTarget.style.border = "1px solid transparent";
                              e.currentTarget.style.boxShadow = "0 0 14.9px 0 rgba(110,33,196,0.25)";
                            } else {
                              e.currentTarget.style.background = "linear-gradient(white,white) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box";
                              e.currentTarget.style.border = "1px solid transparent";
                              e.currentTarget.style.boxShadow = "0 2px 12px rgba(92,46,212,0.18)";
                            }
                          }}
                          onMouseLeave={e => { e.currentTarget.style.background = c.cardBg; e.currentTarget.style.border = `1px solid ${c.border}`; e.currentTarget.style.boxShadow = "none"; }}>
                          <div className="icon-ring w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#EFEFEF" }}>
                            <div style={{ transform: `scale(0.8)${p.id === "ca" ? " translateY(5px)" : p.id === "br" ? " translateY(-5px)" : ""}` }}>{img(p.imgKey)}</div>
                          </div>
                          <div className="text-[12px] font-bold leading-tight" style={{ color: c.text }}>{p.name}</div>
                          <div className="text-[11px] font-semibold" style={{ background: "linear-gradient(135deg,#9333EA,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{p.price}<span className="text-[10px] font-normal" style={{ color: c.muted, WebkitTextFillColor: c.muted }}>/yr</span></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-8 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
                <span className="text-[11px]" style={{ color: c.muted }}>Prices are estimated. Final premium subject to underwriting.</span>
                <button onClick={() => setCreateQuoteOpen(false)} className="px-5 py-[9px] rounded-lg text-[12px] font-normal"
                  style={{ border: `1px solid ${c.border}`, color: c.muted, fontFamily: FONT }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
