import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Gift, AffiliateLink } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  ExternalLink, 
  Calendar,
  ShoppingBag,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function Analytics() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [analyticsData, setAnalyticsData] = useState({
    monthlyPurchases: [],
    topStores: [],
    missingAffiliates: [],
    totalSpent: 0,
    totalPurchases: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
        } else {
          setIsCheckingAuth(false);
          await loadAnalytics();
        }
      } catch (error) {
        window.location.href = createPageUrl('Dashboard');
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadAnalytics();
    }
  }, [selectedMonth, selectedYear]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const allGifts = await Gift.list();
      const purchasedGifts = allGifts.filter(gift => 
        (gift.status === 'purchased' || gift.status === 'given') && 
        gift.vendor && 
        gift.price > 0
      );

      const existingAffiliates = await AffiliateLink.list();
      const existingDomains = existingAffiliates.map(link => link.domain.toLowerCase());

      const monthlyData = processMonthlyData(purchasedGifts, selectedMonth, selectedYear);
      const storeData = processStoreData(purchasedGifts, selectedMonth, selectedYear);
      const missingAffiliates = await findMissingAffiliates(storeData, existingDomains);

      setAnalyticsData({
        monthlyPurchases: monthlyData,
        topStores: storeData,
        missingAffiliates: missingAffiliates,
        totalSpent: purchasedGifts.reduce((sum, gift) => sum + (gift.price || 0), 0),
        totalPurchases: purchasedGifts.length
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (gifts, selectedMonth, selectedYear) => {
    const monthlyStats = {};
    
    gifts.forEach(gift => {
      if (!gift.purchase_date) return;
      
      const purchaseDate = new Date(gift.purchase_date);
      const monthKey = `${purchaseDate.getFullYear()}-${purchaseDate.getMonth()}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: purchaseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          purchases: 0,
          revenue: 0
        };
      }
      
      monthlyStats[monthKey].purchases += 1;
      monthlyStats[monthKey].revenue += gift.price || 0;
    });

    return Object.values(monthlyStats).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const processStoreData = (gifts, selectedMonth, selectedYear) => {
    const storeStats = {};
    
    gifts.forEach(gift => {
      if (!gift.vendor) return;
      
      if (gift.purchase_date) {
        const purchaseDate = new Date(gift.purchase_date);
        if (selectedMonth !== undefined && purchaseDate.getMonth() !== selectedMonth) return;
        if (selectedYear !== undefined && purchaseDate.getFullYear() !== selectedYear) return;
      }
      
      const storeName = gift.vendor.toLowerCase();
      
      if (!storeStats[storeName]) {
        storeStats[storeName] = {
          name: gift.vendor,
          purchases: 0,
          revenue: 0,
          domain: extractDomainFromStore(gift.vendor)
        };
      }
      
      storeStats[storeName].purchases += 1;
      storeStats[storeName].revenue += gift.price || 0;
    });

    return Object.values(storeStats)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 10);
  };

  const extractDomainFromStore = (storeName) => {
    const storeMap = {
      'amazon': 'amazon.com',
      'target': 'target.com',
      'walmart': 'walmart.com',
      'home depot': 'homedepot.com',
      'lowes': 'lowes.com',
      'best buy': 'bestbuy.com',
      'costco': 'costco.com',
      'ebay': 'ebay.com',
      'etsy': 'etsy.com',
      'wayfair': 'wayfair.com'
    };
    
    const normalized = storeName.toLowerCase();
    return storeMap[normalized] || `${normalized.replace(/\s+/g, '')}.com`;
  };

  const findMissingAffiliates = async (storeData, existingDomains) => {
    const missingStores = storeData.filter(store => 
      !existingDomains.some(domain => 
        store.domain.includes(domain) || domain.includes(store.domain.replace('.com', ''))
      )
    );

    if (missingStores.length === 0) return [];

    try {
      const affiliateSearchPrompt = `
For each of these stores, provide their affiliate program information if available:

${missingStores.map(store => `- ${store.name} (${store.domain})`).join('\n')}

Return ONLY a JSON object in this format:
{
  "affiliate_programs": [
    {
      "store_name": "Store Name",
      "domain": "store.com",
      "has_program": true,
      "program_name": "Store Affiliate Program",
      "signup_url": "https://affiliate.store.com/signup",
      "commission_rate": "3-8%",
      "notes": "Requirements or special info"
    }
  ]
}

Only include stores that actually have affiliate programs.
`;

      const affiliateResponse = await InvokeLLM({
        prompt: affiliateSearchPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            affiliate_programs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store_name: { type: "string" },
                  domain: { type: "string" },
                  has_program: { type: "boolean" },
                  program_name: { type: "string" },
                  signup_url: { type: "string" },
                  commission_rate: { type: "string" },
                  notes: { type: "string" }
                },
                required: ["store_name", "domain", "has_program"]
              }
            }
          }
        }
      });

      return affiliateResponse?.affiliate_programs?.map(program => ({
        ...program,
        purchases: missingStores.find(s => s.name.toLowerCase() === program.store_name.toLowerCase())?.purchases || 0,
        revenue: missingStores.find(s => s.name.toLowerCase() === program.store_name.toLowerCase())?.revenue || 0
      })) || [];

    } catch (error) {
      console.error('Error finding affiliate programs:', error);
      return missingStores.map(store => ({
        store_name: store.name,
        domain: store.domain,
        has_program: false,
        purchases: store.purchases,
        revenue: store.revenue
      }));
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-lg text-gray-700">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Purchase Analytics
            </h1>
            <p className="text-gray-600 text-lg">
              Track purchases and discover affiliate opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mr-3" />
            <span>Loading analytics...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Purchases</p>
                      <p className="text-2xl font-bold">{analyticsData.totalPurchases}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">${analyticsData.totalSpent.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Top Stores</p>
                      <p className="text-2xl font-bold">{analyticsData.topStores.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Missing Affiliates</p>
                      <p className="text-2xl font-bold">{analyticsData.missingAffiliates.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Monthly Purchase Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.monthlyPurchases}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="purchases" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Top Stores by Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.topStores.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="purchases"
                        nameKey="name"
                      >
                        {analyticsData.topStores.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Missing Affiliate Opportunities
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Stores where users are purchasing but you don't have affiliate links set up
                </p>
              </CardHeader>
              <CardContent>
                {analyticsData.missingAffiliates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Great! You have affiliate links for all active stores.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analyticsData.missingAffiliates.map((opportunity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{opportunity.store_name}</h4>
                            <p className="text-sm text-gray-600">
                              {opportunity.purchases} purchases • ${opportunity.revenue?.toFixed(2)} revenue
                            </p>
                            {opportunity.commission_rate && (
                              <Badge variant="outline" className="mt-1">
                                {opportunity.commission_rate} commission
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {opportunity.has_program && opportunity.signup_url && (
                              <Button
                                size="sm"
                                onClick={() => window.open(opportunity.signup_url, '_blank')}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join Program
                              </Button>
                            )}
                            {!opportunity.has_program && (
                              <Badge variant="secondary">No Program Available</Badge>
                            )}
                          </div>
                        </div>
                        {opportunity.notes && (
                          <p className="text-xs text-gray-500 mt-2">{opportunity.notes}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Store Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Store Name</th>
                        <th className="text-right p-3">Purchases</th>
                        <th className="text-right p-3">Revenue</th>
                        <th className="text-right p-3">Avg Order</th>
                        <th className="text-center p-3">Affiliate Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topStores.map((store, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{store.name}</td>
                          <td className="p-3 text-right">{store.purchases}</td>
                          <td className="p-3 text-right">${store.revenue.toFixed(2)}</td>
                          <td className="p-3 text-right">${(store.revenue / store.purchases).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Badge variant={analyticsData.missingAffiliates.some(m => m.store_name === store.name) ? "destructive" : "default"}>
                              {analyticsData.missingAffiliates.some(m => m.store_name === store.name) ? "Missing" : "Active"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}