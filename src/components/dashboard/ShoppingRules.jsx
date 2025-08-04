import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  Search,
  Link as LinkIcon,
  ShoppingCart
} from 'lucide-react';

export default function ShoppingRules() {
  const [isExpanded, setIsExpanded] = useState(false);

  const rules = [
    {
      category: "AI Responsibilities",
      icon: <Target className="w-5 h-5 text-blue-600" />,
      items: [
        {
          type: "do",
          text: "AI finds specific product ideas with brand, model, and features"
        },
        {
          type: "do", 
          text: "AI provides detailed search terms to help you find the product"
        },
        {
          type: "do",
          text: "AI matches products to the person's interests and hobbies"
        },
        {
          type: "dont",
          text: "AI does NOT provide direct product URLs (this was causing broken links)"
        },
        {
          type: "dont",
          text: "AI does NOT provide store names or prices (these change too frequently)"
        }
      ]
    },
    {
      category: "Your Control",
      icon: <ShoppingCart className="w-5 h-5 text-green-600" />,
      items: [
        {
          type: "do",
          text: "You choose which store to buy from (Amazon, Walmart, Target, etc.)"
        },
        {
          type: "do",
          text: "You verify the current price and availability"
        },
        {
          type: "do",
          text: "You paste the direct product URL into the system"
        },
        {
          type: "do",
          text: "You can compare prices across multiple stores"
        }
      ]
    },
    {
      category: "The Process",
      icon: <Search className="w-5 h-5 text-purple-600" />,
      items: [
        {
          type: "step",
          text: "1. AI suggests a specific product (e.g. 'Sony WH-1000XM4 Headphones')"
        },
        {
          type: "step",
          text: "2. You click 'Find & Link Product' - opens Google search + form"
        },
        {
          type: "step",
          text: "3. You find the product at your preferred store"
        },
        {
          type: "step",
          text: "4. You copy the URL, price, and store name into the form"
        },
        {
          type: "step",
          text: "5. System saves it and shows 'View Item' button with correct link"
        }
      ]
    },
    {
      category: "Quality Guarantees",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      items: [
        {
          type: "guarantee",
          text: "Every 'View Item' button will link directly to the product page you chose"
        },
        {
          type: "guarantee",
          text: "No more broken links or search result pages"
        },
        {
          type: "guarantee",
          text: "You see the exact price and store before clicking"
        },
        {
          type: "guarantee",
          text: "You can update links anytime if prices change"
        }
      ]
    }
  ];

  const getItemIcon = (type) => {
    switch(type) {
      case 'do': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dont': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'step': return <LinkIcon className="w-4 h-4 text-purple-600" />;
      case 'guarantee': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getItemStyle = (type) => {
    switch(type) {
      case 'do': return 'border-l-4 border-green-500 bg-green-50';
      case 'dont': return 'border-l-4 border-red-500 bg-red-50';
      case 'step': return 'border-l-4 border-purple-500 bg-purple-50';
      case 'guarantee': return 'border-l-4 border-emerald-500 bg-emerald-50';
      default: return 'border-l-4 border-yellow-500 bg-yellow-50';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-700" />
            <div>
              <CardTitle className="text-xl">Shopping System Rules</CardTitle>
              <p className="text-sm text-gray-600">
                How the AI + manual linking system works
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Hide Rules <ChevronUp className="w-4 h-4 ml-1" /></>
            ) : (
              <>Show Rules <ChevronDown className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-8">
            {rules.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <div className="flex items-center gap-2 mb-4">
                  {section.icon}
                  <h3 className="text-lg font-semibold text-gray-800">{section.category}</h3>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className={`flex items-start gap-3 p-3 rounded-r-lg ${getItemStyle(item.type)}`}
                    >
                      {getItemIcon(item.type)}
                      <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Why This Hybrid Approach?</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Previous versions tried to have the AI find direct product links automatically, but this led to broken links, 
                    search result pages, and outdated prices. The new system gives you the best of both worlds: 
                    creative AI suggestions with your final approval on the exact product and store.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}