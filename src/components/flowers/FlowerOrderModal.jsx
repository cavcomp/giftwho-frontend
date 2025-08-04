import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Flower2, ExternalLink, MapPin, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { InvokeLLM } from "@/api/integrations";
import { AffiliateLink } from "@/api/entities";

export default function FlowerOrderModal({ contact, onClose }) {
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryDate: "",
    message: "",
    occasionType: "just_because"
  });
  const [flowerOptions, setFlowerOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState("50-75");

  useEffect(() => {
    findFlowerOptions();
  }, [selectedBudget]);

  const findFlowerOptions = async () => {
    setIsLoading(true);
    try {
      const affiliateLinks = await AffiliateLink.filter({ is_active: true });
      const flowerAffiliates = affiliateLinks.filter(link => 
        link.domain.toLowerCase().includes('flower') ||
        link.domain.toLowerCase().includes('1800flowers') ||
        link.domain.toLowerCase().includes('ftd') ||
        link.domain.toLowerCase().includes('teleflora') ||
        link.domain.toLowerCase().includes('proflowers')
      );

      const budgetRange = selectedBudget.split('-');
      const minBudget = parseInt(budgetRange[0]);
      const maxBudget = parseInt(budgetRange[1]) || minBudget + 25;

      const prompt = `
        Find the best flower arrangements for ${contact.name} with these requirements:
        
        - Budget range: $${minBudget} - $${maxBudget}
        - Relationship: ${contact.relationship}
        - Occasion: ${deliveryInfo.occasionType.replace('_', ' ')}
        - Favorite colors: ${contact.preferences?.favorite_colors?.join(', ') || 'any'}
        
        Search these major flower delivery services:
        - 1-800-Flowers
        - FTD
        - Teleflora  
        - ProFlowers
        - Local florists
        - The Bouqs Company
        - UrbanStems
        
        For each arrangement, find:
        - Current price within budget
        - Store with best price/value
        - Same-day/next-day delivery availability
        - Customer ratings
        - Color preferences match
        
        Return exactly 4 flower arrangements.
      `;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            arrangements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  original_price: { type: "number" },
                  store_name: { type: "string" },
                  store_url: { type: "string" },
                  image_url: { type: "string" },
                  rating: { type: "number" },
                  same_day_delivery: { type: "boolean" },
                  color_match: { type: "string" },
                  occasion_fit: { type: "string" }
                },
                required: ["name", "description", "price", "store_name", "store_url"]
              }
            }
          }
        }
      });

      if (response?.arrangements) {
        // Add affiliate URLs where applicable
        const enrichedArrangements = await Promise.all(
          response.arrangements.map(async (arrangement) => {
            const matchingAffiliate = flowerAffiliates.find(affiliate =>
              arrangement.store_url.toLowerCase().includes(affiliate.domain.toLowerCase())
            );

            let affiliateUrl = arrangement.store_url;
            if (matchingAffiliate) {
              try {
                const url = new URL(arrangement.store_url);
                url.searchParams.set(matchingAffiliate.tracking_id_param, matchingAffiliate.tracking_id_value);
                affiliateUrl = url.toString();
              } catch (error) {
                console.error('Error adding affiliate link:', error);
              }
            }

            return {
              ...arrangement,
              affiliate_url: affiliateUrl
            };
          })
        );

        setFlowerOptions(enrichedArrangements);
      }
    } catch (error) {
      console.error('Error finding flower options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetLabel = (range) => {
    const [min, max] = range.split('-');
    return max ? `$${min} - $${max}` : `$${min}+`;
  };

  const getOccasionLabel = (type) => {
    const labels = {
      'just_because': 'Just Because',
      'birthday': 'Birthday',
      'anniversary': 'Anniversary',
      'apology': 'Apology',
      'congratulations': 'Congratulations',
      'sympathy': 'Sympathy',
      'get_well': 'Get Well Soon',
      'thank_you': 'Thank You'
    };
    return labels[type] || type.replace('_', ' ');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Flower2 className="w-6 h-6" />
                  Send Flowers to {contact.name}
                </CardTitle>
                <p className="text-pink-100 mt-1">Beautiful flower arrangements with same-day delivery</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delivery & Occasion Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delivery Details</h3>
                
                <div>
                  <Label>Occasion</Label>
                  <Select 
                    value={deliveryInfo.occasionType} 
                    onValueChange={(value) => setDeliveryInfo({...deliveryInfo, occasionType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="just_because">Just Because</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="apology">Apology</SelectItem>
                      <SelectItem value="congratulations">Congratulations</SelectItem>
                      <SelectItem value="get_well">Get Well Soon</SelectItem>
                      <SelectItem value="thank_you">Thank You</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Budget Range</Label>
                  <Select 
                    value={selectedBudget} 
                    onValueChange={setSelectedBudget}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25-40">$25 - $40</SelectItem>
                      <SelectItem value="40-60">$40 - $60</SelectItem>
                      <SelectItem value="50-75">$50 - $75</SelectItem>
                      <SelectItem value="75-100">$75 - $100</SelectItem>
                      <SelectItem value="100-150">$100 - $150</SelectItem>
                      <SelectItem value="150">$150+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Delivery Date</Label>
                  <Input 
                    type="date" 
                    value={deliveryInfo.deliveryDate}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Personal Message</Label>
                  <Textarea 
                    value={deliveryInfo.message}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, message: e.target.value})}
                    placeholder="Add a personal message..."
                    className="h-20"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Most florists offer same-day delivery if ordered before 2 PM local time.
                  </p>
                </div>
              </div>

              {/* Flower Options */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Flower Arrangements ({getBudgetLabel(selectedBudget)})
                  </h3>
                  <Button 
                    size="sm" 
                    onClick={findFlowerOptions}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Searching...' : 'Refresh Options'}
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Finding the perfect flowers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flowerOptions.map((arrangement, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                          {arrangement.image_url ? (
                            <img 
                              src={arrangement.image_url} 
                              alt={arrangement.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Flower2 className="w-16 h-16 text-pink-400" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{arrangement.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{arrangement.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-700">${arrangement.price}</span>
                              {arrangement.original_price && arrangement.original_price > arrangement.price && (
                                <span className="text-sm text-gray-500 line-through">${arrangement.original_price}</span>
                              )}
                            </div>
                            {arrangement.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm">{arrangement.rating}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant="outline" className="text-xs">{arrangement.store_name}</Badge>
                            {arrangement.same_day_delivery && (
                              <Badge className="text-xs bg-green-100 text-green-800">Same Day</Badge>
                            )}
                            {arrangement.color_match && (
                              <Badge variant="outline" className="text-xs">Color Match</Badge>
                            )}
                          </div>

                          <Button 
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                            onClick={() => window.open(arrangement.affiliate_url || arrangement.store_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Order Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoading && flowerOptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Flower2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No flower arrangements found for this budget range.</p>
                    <p className="text-sm">Try adjusting your budget or search again.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}