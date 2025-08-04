import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users } from "lucide-react";

export default function SpendingByContact({ spendingData = [], total = 0 }) {
  const totalSpent = spendingData.reduce((acc, curr) => acc + curr.totalSpent, 0);

  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-blue-600" />
          Spending by Contact
        </CardTitle>
        <p className="text-sm text-gray-500">
            Total Spent: <span className="font-bold text-gray-700">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </CardHeader>
      <CardContent>
        {spendingData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No spending data yet.</p>
            <p className="text-sm">Purchase a gift to see stats!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {spendingData.map((item) => {
              const percentage = totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;
              return (
                <div key={item.contactId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{item.contactName}</span>
                    <span className="text-sm font-semibold text-blue-700">
                      ${item.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}