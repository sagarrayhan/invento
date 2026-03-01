import { Database, LayoutDashboard, Radio, Send, Users } from "lucide-react";
import { Logo } from "../components/Logo";

export const sideNave = [
    {
        title: "Dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Live Update",
        icon: Radio
    },
    {
        title: "Submits",
        icon: Send
    },
    {
        title: "Users",
        icon: Users
    },
    {
        title: "Resources",
        icon: Database
    }
]

export const company ={
    name : "Invento",
    motto : "All your Inventory Here",
    logo : Logo
}

// utils/mimeTypes.ts

export const MIME_TYPES = {
  EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PDF: "application/pdf",
  CSV: "text/csv",
  JSON: "application/json",
}
