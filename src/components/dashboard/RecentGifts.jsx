import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Package, CheckCircle, ShoppingCart, User } from "lucide-react";
import {format} from "date-fns";

export default function RecentGifts({ gifts = [], contacts = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'idea': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'purchased': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'given': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'idea': return <Gift className="w-4 h-4" />;
      case 'planned': return <ShoppingCart className="w-4 h-4" />;
      case 'purchased': return <Package className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'given': return <CheckCircle className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown';
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-pink-600" />
          Recently Added Gifts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No gifts planned yet</p>
            <p className="text-sm">Start planning some thoughtful gifts!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div key={gift.id} className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <div className='min-w-0'>
                    <h4 className="font-semibold text-gray-900 truncate">{gift.title}</h4>
                     <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User className="w-3 h-3"/>
                      For: {getContactName(gift.contact_id)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(gift.status)}>
                    {getStatusIcon(gift.status)}
                    <span className="ml-1 capitalize">{gift.status}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                   <p>
                    Budget: ${gift.budget?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added on {format(new Date(gift.created_date), "MMM d")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}