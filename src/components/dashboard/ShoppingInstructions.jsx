import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Search, Link as LinkIcon, Edit, Save, CheckCircle } from 'lucide-react';

export default function ShoppingInstructions() {
  const steps = [
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: "1. AI Finds Ideas",
      description: "The AI provides high-quality gift ideas with specific details to help you search.",
    },
    {
      icon: <LinkIcon className="w-6 h-6 text-orange-600" />,
      title: "2. Find & Link",
      description: "Click 'Find & Link'. This opens a Google search and a simple form to add details.",
    },
    {
      icon: <Edit className="w-6 h-6 text-purple-600" />,
      title: "3. Copy & Paste",
      description: "Find the best product online. Copy its URL, store name, and exact price.",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "4. Save & Confirm",
      description: "Paste the details into the form and save. The card updates with your correct link!",
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-white mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Info className="w-6 h-6 text-blue-700" />
          How to Use Your Gift Ideas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Follow these simple steps to turn AI suggestions into ready-to-buy gifts.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center text-center hover:bg-white hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 border">
                {step.icon}
              </div>
              <h4 className="font-semibold mb-1 text-gray-800">{step.title}</h4>
              <p className="text-xs text-gray-500 leading-snug">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}