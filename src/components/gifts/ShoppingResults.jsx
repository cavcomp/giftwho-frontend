<![CDATA[import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Star,
  Trash2,
  ExternalLink,
  Edit,
  Save,
  X,
  Search,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { ShoppingOption } from "@/api/entities";

// This component is now simplified as editing is handled on the dashboard.
// It can be further refactored later, but for now, we'll just adjust the rendering.

export default function ShoppingResults({ 
  options, 
  onDeleteOption, 
  onToggleSelection, 
  selectedOptions = new Set(),
  showGiftListFeatures = false
}) {

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <motion.div
          key={option.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {showGiftListFeatures && onToggleSelection && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`select-${option.id}`}
                      checked={selectedOptions.has(option.id)}
                      onChange={() => onToggleSelection(option.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                      disabled={option.needs_manual_link}
                    />
                     <Label htmlFor={`select-${option.id}`} className={`ml-2 text-sm ${option.needs_manual_link ? 'text-gray-400' : 'text-gray-700'}`}>
                        Select for Bulk Purchase {option.needs_manual_link && '(Link Required)'}
                     </Label>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {option.title}
                    </h4>
                    {showGiftListFeatures && onDeleteOption && (
                      <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteOption(option.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                    )}
                  </div>

                  {option.needs_manual_link && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          AI Recommendation - Link Required
                        </span>
                      </div>
                      <p className="text-xs text-amber-700">
                        This is an AI suggestion. Go to the Dashboard to find and add a direct product link.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-700">
                        ${option.current_price?.toFixed(2)}
                      </span>
                    </div>
                    {option.store_name && <Badge variant="outline">{option.store_name}</Badge>}
                    {option.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{option.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {option.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {option.description}
                    </p>
                  )}

                  {option.target_interest && (
                    <div className="mb-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        💡 Matches interest in: {option.target_interest}
                      </Badge>
                    </div>
                  )}
                  
                  {!option.needs_manual_link && option.store_url && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(option.store_url, '_blank')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on {option.store_name}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}]]>