import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "@/api/entities";
import { Occasion } from "@/api/entities";
import { X, DollarSign, Calendar, Package, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ContactSpendingModal({ contact, onClose }) {
  const [gifts, setGifts] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    loadSpendingData();
  }, [contact.id]);

  const loadSpendingData = async () => {
    try {
      const [giftsData, occasionsData] = await Promise.all([
        Gift.filter({ contact_id: contact.id }),
        Occasion.filter({ contact_id: contact.id })
      ]);

      setGifts(giftsData);
      setOccasions(occasionsData);

      // Group gifts by occasion
      const grouped = {};
      
      giftsData.forEach(gift => {
        const occasion = occasionsData.find(o => o.id === gift.occasion_id);
        const occasionKey = occasion ? occasion.id : 'no_occasion';
        const occasionTitle = occasion ? occasion.title : 'General Gifts';
        
        if (!grouped[occasionKey]) {
          grouped[occasionKey] = {
            occasion: occasion,
            title: occasionTitle,
            gifts: [],
            totalSpent: 0,
            totalBudget: 0
          };
        }
        
        grouped[occasionKey].gifts.push(gift);
        
        // Only count purchased/given gifts in spending
        if (gift.status === 'purchased' || gift.status === 'given') {
          grouped[occasionKey].totalSpent += (gift.price || 0);
        }
        
        grouped[occasionKey].totalBudget += (gift.budget || 0);
      });

      setGroupedData(grouped);
    } catch (error) {
      console.error('Error loading spending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSpentAllOccasions = () => {
    return Object.values(groupedData).reduce((sum, group) => sum + group.totalSpent, 0);
  };

  const getTotalBudgetAllOccasions = () => {
    return Object.values(groupedData).reduce((sum, group) => sum + group.totalBudget, 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'idea': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'purchased': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'given': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <p>Loading spending data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Spending Summary for {contact.name}</CardTitle>
                <p className="text-purple-100 mt-1">Complete gift spending breakdown</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-green-800">
                    ${getTotalSpentAllOccasions().toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-blue-700 font-medium">Total Budget</p>
                  <p className="text-2xl font-bold text-blue-800">
                    ${getTotalBudgetAllOccasions().toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-purple-700 font-medium">Total Gifts</p>
                  <p className="text-2xl font-bold text-purple-800">{gifts.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown by Occasion */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Spending by Occasion</h3>
              
              {Object.keys(groupedData).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No gifts found for {contact.name}</p>
                </div>
              ) : (
                Object.values(groupedData).map((group, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            {group.title}
                          </CardTitle>
                          {group.occasion && (
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(group.occasion.date), 'MMMM do, yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Spent</p>
                          <p className="text-xl font-bold text-green-700">
                            ${group.totalSpent.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Budget: ${group.totalBudget.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {group.gifts.map(gift => (
                          <div key={gift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{gift.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(gift.status)}>
                                  {gift.status}
                                </Badge>
                                {gift.vendor && (
                                  <span className="text-sm text-gray-600">from {gift.vendor}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {gift.price > 0 && (
                                <p className="font-bold text-green-700">
                                  ${gift.price.toFixed(2)}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Budget: ${(gift.budget || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}