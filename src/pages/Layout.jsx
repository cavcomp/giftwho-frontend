
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Gift,
  Users,
  Calendar,
  LayoutDashboard,
  Heart,
  TrendingUp,
  Link as LinkIcon
} from "lucide-react";
import { User } from "@/api/entities";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Occasions",
    url: createPageUrl("Occasions"),
    icon: Calendar,
  },
  {
    title: "Gifts",
    url: createPageUrl("Gifts"),
    icon: Gift,
  },
];

const adminNavigationItems = [
    {
        title: "Analytics",
        url: createPageUrl("Analytics"),
        icon: TrendingUp
    },
    {
        title: "Affiliate Links",
        url: createPageUrl("AffiliateLinks"),
        icon: LinkIcon
    }
];

export default function Layout({ children }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
        try {
            const user = await User.me();
            setIsAdmin(user.role === 'admin');
        } catch(e) {
            setIsAdmin(false);
        }
    };
    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100 shadow-lg flex flex-col">
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                GiftWho
              </h1>
              <p className="text-xs text-gray-500">Gift Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.url
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
           {isAdmin && (
            <div className="mt-8">
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</h3>
                <ul className="space-y-2">
                    {adminNavigationItems.map((item) => (
                        <li key={item.title}>
                            <Link
                            to={item.url}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                location.pathname === item.url
                                ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                            }`}
                            >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
